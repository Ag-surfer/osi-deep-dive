"use client";

import { useMemo } from "react";
import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";
import type { AlgoStep, GraphEdge, GraphNode, NodeState } from "@/lib/algorithms/dijkstra";

const GREEN = SKETCH.l3!; // settled / on-tree
const AMBER = SKETCH.l2!; // edge being relaxed this step

const samePair = (e: GraphEdge, p: [string, string]) =>
  (e.a === p[0] && e.b === p[1]) || (e.a === p[1] && e.b === p[0]);

/** Fill/stroke/text colors for a node given its algorithm state. */
function nodeStyle(state: NodeState): {
  fill: string;
  stroke: string;
  text: string;
  useVarFill?: boolean;
} {
  switch (state) {
    case "source":
    case "settled":
      return { fill: GREEN, stroke: GREEN, text: "#fff" };
    case "frontier":
      return { fill: "var(--bg-soft)", stroke: GREEN, text: GREEN, useVarFill: true };
    default:
      return { fill: "transparent", stroke: "currentColor", text: "currentColor" };
  }
}

/** The graph + live table for one algorithm step. */
function GraphStep({
  step,
  nodes,
  edges,
  pos,
  columns,
  width,
  height,
  index,
  total,
}: {
  step: AlgoStep;
  nodes: GraphNode[];
  edges: GraphEdge[];
  pos: Map<string, GraphNode>;
  columns: string[];
  width: number;
  height: number;
  index: number;
  total: number;
}) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
      {/* Graph */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width, color: "var(--fg)" }}
          role="img"
          aria-label={`Step ${index + 1} of ${total}: ${step.narration}`}
        >
          {/* Edges */}
          {edges.map((e) => {
            const a = pos.get(e.a);
            const b = pos.get(e.b);
            if (!a || !b) return null;
            const tree = step.treeEdges.some((p) => samePair(e, p));
            const considered = !tree && step.consideredEdges.some((p) => samePair(e, p));
            const stroke = tree ? GREEN : considered ? AMBER : "currentColor";
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const label = String(e.cost);
            return (
              <g key={`${e.a}-${e.b}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={stroke}
                  strokeWidth={tree ? 3.5 : considered ? 3 : 1.5}
                  strokeDasharray={considered ? "6 4" : undefined}
                  opacity={tree || considered ? 1 : 0.3}
                />
                <rect
                  x={mx - (label.length * 4 + 5)}
                  y={my - 9}
                  width={label.length * 8 + 10}
                  height={18}
                  rx={4}
                  style={{ fill: "var(--bg-soft)" }}
                  stroke="currentColor"
                  strokeOpacity={0.2}
                />
                <text
                  x={mx}
                  y={my + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontFamily="var(--font-mono)"
                  fill="currentColor"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const st = step.nodeState[n.id] ?? "unvisited";
            const s = nodeStyle(st);
            const dist = step.table.find((r) => r.id === n.id)?.cells[1] ?? "∞";
            return (
              <g key={n.id}>
                {st === "source" ? (
                  <circle cx={n.x} cy={n.y} r={26} fill="none" stroke={GREEN} strokeWidth={1.5} />
                ) : null}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={21}
                  stroke={s.stroke}
                  strokeWidth={2}
                  strokeOpacity={st === "unvisited" ? 0.4 : 1}
                  {...(s.useVarFill ? { style: { fill: s.fill } } : { fill: s.fill })}
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill={s.text}
                  fillOpacity={st === "unvisited" ? 0.6 : 1}
                >
                  {n.label ?? n.id}
                </text>
                {/* Tentative-cost badge above the node */}
                <text
                  x={n.x}
                  y={n.y - 28}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill={st === "unvisited" ? "currentColor" : GREEN}
                  fillOpacity={st === "unvisited" ? 0.5 : 1}
                >
                  {dist}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live table */}
      <table className="h-min text-sm" style={{ minWidth: 200 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="border-b px-2 py-1 text-left text-xs font-semibold tracking-wide uppercase"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {step.table.map((row) => {
            const st = step.nodeState[row.id] ?? "unvisited";
            const onTree = st === "settled" || st === "source";
            return (
              <tr key={row.id} style={onTree ? { fontWeight: 600 } : undefined}>
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-2 py-1"
                    style={{
                      fontFamily: ci === 0 ? undefined : "var(--font-mono)",
                      color: st === "unvisited" ? "var(--fg-muted)" : "var(--fg)",
                    }}
                  >
                    {ci === 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className="inline-block h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: onTree
                              ? GREEN
                              : st === "frontier"
                                ? AMBER
                                : "var(--fg-muted)",
                          }}
                        />
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Step-driven player for *graph* algorithms (SPF/Dijkstra; later DUAL). It draws
 * the topology and plays back a precomputed `steps` array — highlighting the
 * shortest-path tree, the edge relaxed this step, and a live cost table. All the
 * controls/narration/keyboard/a11y chrome lives in the shared `StepPlayer`.
 */
export function RoutingAlgoViz({
  title,
  nodes,
  edges,
  steps,
  columns,
  width = 620,
  height = 320,
  caption,
  summary,
}: {
  title?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  steps: AlgoStep[];
  /** Table header labels, aligned to each step's row cells. */
  columns: string[];
  width?: number;
  height?: number;
  caption?: string;
  /** Screen-reader description of the whole figure. */
  summary: string;
}) {
  const pos = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={caption}
      stepCount={steps.length}
      narration={(i) => steps[i]?.narration ?? ""}
      renderStep={(i) => (
        <GraphStep
          step={steps[i]!}
          nodes={nodes}
          edges={edges}
          pos={pos}
          columns={columns}
          width={width}
          height={height}
          index={i}
          total={steps.length}
        />
      )}
    />
  );
}
