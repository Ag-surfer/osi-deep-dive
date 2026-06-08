"use client";

import { useMemo } from "react";
import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";
import { huffmanSteps, type HuffmanResult, type SymbolFreq } from "@/lib/algorithms/huffman";

const PURPLE = SKETCH.l6!; // leaves / tree accent
const AMBER = SKETCH.l2!; // active merge

const PAD_L = 36;
const PAD_T = 30;

function TreeStep({
  result,
  stepIndex,
  total,
}: {
  result: HuffmanResult;
  stepIndex: number;
  total: number;
}) {
  const step = result.steps[stepIndex]!;
  const visible = new Set(step.visible);
  const hot = new Set(step.highlight);
  const pos = new Map(result.nodes.map((n) => [n.id, n]));

  const maxX = Math.max(...result.nodes.map((n) => n.x));
  const maxY = Math.max(...result.nodes.map((n) => n.y));
  const width = PAD_L * 2 + maxX + 40;
  const height = PAD_T * 2 + maxY + 20;

  const visibleEdges = result.edges.filter((e) => visible.has(e.parent) && visible.has(e.child));

  return (
    <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width, color: "var(--fg)" }}
          role="img"
          aria-label={`Step ${stepIndex + 1} of ${total}: ${step.narration}`}
        >
          {/* Edges */}
          {visibleEdges.map((e) => {
            const p = pos.get(e.parent)!;
            const c = pos.get(e.child)!;
            const x1 = PAD_L + p.x;
            const y1 = PAD_T + p.y;
            const x2 = PAD_L + c.x;
            const y2 = PAD_T + c.y;
            const active = hot.has(e.parent) && hot.has(e.child);
            return (
              <g key={`${e.parent}-${e.child}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={active ? AMBER : "currentColor"}
                  strokeOpacity={active ? 1 : 0.4}
                  strokeWidth={active ? 2.4 : 1.5}
                />
                {step.showCodes ? (
                  <text
                    x={(x1 + x2) / 2 + (e.bit === "0" ? -9 : 9)}
                    y={(y1 + y2) / 2}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={700}
                    fontFamily="var(--font-mono)"
                    fill={PURPLE}
                  >
                    {e.bit}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Nodes */}
          {result.nodes
            .filter((n) => visible.has(n.id))
            .map((n) => {
              const nx = PAD_L + n.x;
              const ny = PAD_T + n.y;
              const isLeaf = n.char !== undefined;
              const active = hot.has(n.id);
              if (isLeaf) {
                return (
                  <g key={n.id}>
                    <rect
                      x={nx - 22}
                      y={ny - 17}
                      width={44}
                      height={34}
                      rx={6}
                      fill={PURPLE}
                      stroke={active ? AMBER : "none"}
                      strokeWidth={active ? 3 : 0}
                    />
                    <text
                      x={nx}
                      y={ny - 2}
                      textAnchor="middle"
                      fontSize={14}
                      fontWeight={700}
                      fill="#fff"
                    >
                      {n.char === " " ? "␠" : n.char}
                    </text>
                    <text
                      x={nx}
                      y={ny + 12}
                      textAnchor="middle"
                      fontSize={10}
                      fontFamily="var(--font-mono)"
                      fill="#fff"
                      fillOpacity={0.85}
                    >
                      {n.freq}
                    </text>
                  </g>
                );
              }
              return (
                <g key={n.id}>
                  <circle
                    cx={nx}
                    cy={ny}
                    r={18}
                    fill="var(--bg-soft)"
                    stroke={active ? AMBER : PURPLE}
                    strokeWidth={active ? 3 : 1.8}
                  />
                  <text
                    x={nx}
                    y={ny + 4}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={700}
                    fontFamily="var(--font-mono)"
                    fill="currentColor"
                  >
                    {n.freq}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Code table (final step only) */}
      {step.showCodes ? (
        <table className="h-min text-sm" style={{ minWidth: 180 }}>
          <thead>
            <tr>
              {["Symbol", "Freq", "Code"].map((h) => (
                <th
                  key={h}
                  className="border-b px-2 py-1 text-left text-xs font-semibold tracking-wide uppercase"
                  style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.codes
              .slice()
              .sort((a, b) => b.freq - a.freq)
              .map((c) => (
                <tr key={c.char}>
                  <td className="px-2 py-1 font-mono">{c.char === " " ? "␠" : c.char}</td>
                  <td className="px-2 py-1 font-mono">{c.freq}</td>
                  <td className="px-2 py-1 font-mono" style={{ color: PURPLE, fontWeight: 600 }}>
                    {c.code}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

/**
 * Interactive Huffman coding tree builder: declare symbol frequencies and step
 * through the merges that build the optimal prefix code, then reveal the 0/1 edge
 * labels and the resulting code table. Frequent symbols end up shallow (short
 * codes), rare ones deep — the whole idea of entropy coding made visible.
 */
export function HuffmanViz({
  symbols,
  title = "Huffman coding — building the optimal prefix code",
  caption,
}: {
  symbols: SymbolFreq[];
  title?: string;
  caption?: string;
}) {
  const result = useMemo(() => huffmanSteps(symbols), [symbols]);

  const summary = `Interactive Huffman coding over ${symbols.length} symbols. Step through the merges of the two lowest-frequency nodes to build the tree, then see each symbol's prefix-free code — frequent symbols get short codes, rare ones long, averaging ${result.avgBits.toFixed(
    2,
  )} bits/symbol versus ${result.fixedBits} for fixed-length.`;

  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={
        caption ??
        "Each step merges the two lowest-frequency roots (amber). On the last step, left branches are 0 and right branches are 1 — each leaf's path is its code."
      }
      stepCount={result.steps.length}
      narration={(i) => result.steps[i]?.narration ?? ""}
      renderStep={(i) => <TreeStep result={result} stepIndex={i} total={result.steps.length} />}
    />
  );
}
