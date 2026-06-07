"use client";

import { useId, useMemo, useState } from "react";
import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";
import { ENCODINGS, encode, type Encoding } from "@/lib/algorithms/lineCoding";

const RED = SKETCH.l1!; // Physical-layer accent

const GUTTER = 132;
const BIT_W = 48;
const HALF_W = BIT_W / 2;
const HEADER_H = 28;
const ROW_H = 66;
const Y_HI = 12; // offset within a row band for a high level
const Y_LO = 44; // offset within a row band for a low level

/** The stacked waveforms, revealed up to the current bit. */
function Waveforms({
  bits,
  encodings,
  series,
  reveal,
  index,
  total,
  narration,
}: {
  bits: string;
  encodings: Encoding[];
  series: Record<string, number[]>;
  reveal: number; // number of bits revealed (1-based)
  index: number;
  total: number;
  narration: string;
}) {
  const n = bits.length;
  const width = GUTTER + n * BIT_W;
  const height = HEADER_H + encodings.length * ROW_H;
  const samplesShown = reveal * 2;

  return (
    <div className="overflow-x-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, color: "var(--fg)" }}
        role="img"
        aria-label={`Step ${index + 1} of ${total}: ${narration}`}
      >
        {/* Bit-boundary grid + bit labels */}
        {Array.from({ length: n }, (_, j) => {
          const x = GUTTER + j * BIT_W;
          const revealed = j < reveal;
          return (
            <g key={`grid-${j}`}>
              <line
                x1={x}
                y1={HEADER_H - 6}
                x2={x}
                y2={height}
                stroke="currentColor"
                strokeOpacity={0.12}
              />
              {/* mid-bit guide */}
              <line
                x1={x + HALF_W}
                y1={HEADER_H - 6}
                x2={x + HALF_W}
                y2={height}
                stroke="currentColor"
                strokeOpacity={0.05}
                strokeDasharray="3 3"
              />
              <text
                x={x + HALF_W}
                y={18}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={revealed ? RED : "currentColor"}
                fillOpacity={revealed ? 1 : 0.3}
              >
                {bits[j] ?? ""}
              </text>
            </g>
          );
        })}
        {/* closing boundary */}
        <line
          x1={GUTTER + n * BIT_W}
          y1={HEADER_H - 6}
          x2={GUTTER + n * BIT_W}
          y2={height}
          stroke="currentColor"
          strokeOpacity={0.12}
        />

        {encodings.map((enc, r) => {
          const rowTop = HEADER_H + r * ROW_H;
          const yHi = rowTop + Y_HI;
          const yLo = rowTop + Y_LO;
          const samples = series[enc] ?? [];
          const yOf = (lvl: number) => (lvl === 1 ? yHi : yLo);

          // Build the step polyline through the revealed half-bit samples.
          const pts: string[] = [];
          for (let k = 0; k < Math.min(samplesShown, samples.length); k++) {
            const x0 = GUTTER + k * HALF_W;
            const x1 = GUTTER + (k + 1) * HALF_W;
            const y = yOf(samples[k] ?? 0);
            pts.push(`${x0},${y}`, `${x1},${y}`);
          }

          return (
            <g key={enc}>
              {/* high/low rails */}
              <line
                x1={GUTTER}
                y1={yHi}
                x2={width}
                y2={yHi}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
              <line
                x1={GUTTER}
                y1={yLo}
                x2={width}
                y2={yLo}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
              {/* label */}
              <text
                x={10}
                y={rowTop + 22}
                fontSize={13}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                fill="currentColor"
              >
                {enc}
              </text>
              {/* hi/lo markers aligned with their rails */}
              <text x={GUTTER - 16} y={yHi + 3} fontSize={10} fillOpacity={0.5} fill="currentColor">
                hi
              </text>
              <text x={GUTTER - 16} y={yLo + 3} fontSize={10} fillOpacity={0.5} fill="currentColor">
                lo
              </text>
              {/* waveform */}
              {pts.length > 0 ? (
                <polyline points={pts.join(" ")} fill="none" stroke={RED} strokeWidth={2.2} />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Interactive line-coding waveform builder: declare a bit string and watch how
 * each scheme (NRZ-L, NRZI, Manchester, Differential Manchester) drives it onto
 * the wire, one bit at a time. Manchester's guaranteed mid-bit transitions make
 * its self-clocking property visible against NRZ's long flat runs.
 */
export function LineCodingViz({
  bits: initialBits,
  encodings = ENCODINGS,
  title = "Line coding — type a bit pattern and compare the schemes",
  caption,
}: {
  bits: string;
  encodings?: Encoding[];
  title?: string;
  caption?: string;
}) {
  const inputId = useId();
  const [text, setText] = useState(initialBits);
  const bits = text.length > 0 ? text : "0"; // always a valid (non-empty) pattern to encode

  const series = useMemo(() => {
    const s: Record<string, number[]> = {};
    for (const e of encodings) s[e] = encode(bits, e);
    return s;
  }, [bits, encodings]);

  const narrate = (i: number) => {
    const b = bits[i] ?? "";
    return `Bit ${i + 1} = ${b}. NRZ-L holds the line ${
      b === "1" ? "high" : "low"
    }; Manchester uses a mid-bit ${
      b === "1" ? "low→high" : "high→low"
    } transition (self-clocking); NRZI ${
      b === "1" ? "inverts" : "holds"
    } the level; Differential Manchester ${
      b === "0" ? "transitions at the bit start" : "has no start transition"
    }, plus the usual mid-bit clock.`;
  };

  const summary = `Interactive line-coding diagram for the bit string ${bits}, drawn as stacked waveforms for ${encodings.join(
    ", ",
  )}. Step through one bit at a time to compare how each scheme drives the line and where it places clocking transitions.`;

  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={
        caption ??
        "Edit the bit pattern, then step one bit at a time. Notice Manchester and Differential Manchester guarantee a transition every bit (a recoverable clock), while NRZ-L can sit flat through a long run of identical bits."
      }
      controls={
        <label htmlFor={inputId} className="flex flex-wrap items-center gap-3 text-sm">
          <span className="shrink-0" style={{ color: "var(--fg-muted)" }}>
            Bit pattern
          </span>
          <input
            id={inputId}
            value={text}
            spellCheck={false}
            autoComplete="off"
            inputMode="numeric"
            onChange={(e) => setText(e.target.value.replace(/[^01]/g, "").slice(0, 12))}
            className="w-40 rounded-md border px-3 py-1.5 font-mono text-sm tracking-widest"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg)",
              color: "var(--fg)",
            }}
            placeholder="0111110"
          />
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
            0s and 1s, up to 12 bits
          </span>
        </label>
      }
      stepCount={bits.length}
      narration={narrate}
      renderStep={(i) => (
        <Waveforms
          bits={bits}
          encodings={encodings}
          series={series}
          reveal={i + 1}
          index={i}
          total={bits.length}
          narration={narrate(i)}
        />
      )}
    />
  );
}
