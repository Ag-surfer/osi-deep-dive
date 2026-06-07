"use client";

import { useMemo } from "react";
import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";
import { eyeTraces } from "@/lib/algorithms/eyeDiagram";

const SIGNAL = SKETCH.l4!; // overlaid signal traces
const MARGIN = SKETCH.l3!; // eye-opening markers (green)
const SAMPLE = SKETCH.l2!; // sampling instant (amber)

const UI = 150;
const AMP = 130;
const RISE = 0.32;
const M = { l: 70, r: 24, t: 20, b: 30 };

// The impairment story, step by step.
const STEPS = [
  {
    jitter: 0,
    noise: 0,
    text: "Ideal signal: overlaying every bit-transition pattern leaves a wide-open eye. Sample at the center (dashed line) — the opening is all margin.",
  },
  {
    jitter: 22,
    noise: 0,
    text: "Add timing jitter: the edges spread sideways, so the eye narrows horizontally. The width is your timing margin — how much clock error you can tolerate.",
  },
  {
    jitter: 22,
    noise: 30,
    text: "Add amplitude noise: the levels spread vertically, shrinking the eye's height. The height is your voltage margin — how much noise before a 1 looks like a 0.",
  },
  {
    jitter: 40,
    noise: 45,
    text: "Heavy noise and jitter: the eye is nearly closed. A closed eye means the sampler can no longer reliably separate 1 from 0 — bit errors.",
  },
];

function Eye({ stepIndex, total }: { stepIndex: number; total: number }) {
  const cfg = STEPS[stepIndex]!;
  const { traces, centerX, eyeHeight, eyeWidth } = useMemo(
    () =>
      eyeTraces({ ui: UI, amplitude: AMP, riseFrac: RISE, jitter: cfg.jitter, noise: cfg.noise }),
    [cfg.jitter, cfg.noise],
  );

  const width = M.l + 2 * UI + M.r;
  const height = M.t + AMP + M.b;
  const cx = M.l + centerX;
  const midY = M.t + AMP / 2;
  const eyeTop = midY - eyeHeight / 2;
  const eyeBot = midY + eyeHeight / 2;

  return (
    <div className="overflow-x-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, color: "var(--fg)" }}
        role="img"
        aria-label={`Step ${stepIndex + 1} of ${total}: ${cfg.text}`}
      >
        {/* High/low rails + labels */}
        {[0, AMP].map((y, i) => (
          <g key={i}>
            <line
              x1={M.l}
              y1={M.t + y}
              x2={width - M.r}
              y2={M.t + y}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
            <text
              x={M.l - 10}
              y={M.t + y + 4}
              textAnchor="end"
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="currentColor"
              fillOpacity={0.6}
            >
              {i === 0 ? "1" : "0"}
            </text>
          </g>
        ))}

        {/* Overlaid signal traces (offset into the plot area) */}
        <g transform={`translate(${M.l} ${M.t})`}>
          {traces.map((pts, i) => (
            <polyline
              key={i}
              points={pts}
              fill="none"
              stroke={SIGNAL}
              strokeWidth={1.6}
              strokeOpacity={0.5}
            />
          ))}
        </g>

        {/* Sampling instant */}
        <line
          x1={cx}
          y1={M.t}
          x2={cx}
          y2={M.t + AMP}
          stroke={SAMPLE}
          strokeWidth={1.4}
          strokeDasharray="5 4"
        />
        <text x={cx} y={M.t - 6} textAnchor="middle" fontSize={10} fill={SAMPLE}>
          sample
        </text>

        {/* Eye-height marker (voltage margin) */}
        {eyeHeight > 4 ? (
          <g stroke={MARGIN} fill={MARGIN}>
            <line x1={cx} y1={eyeTop} x2={cx} y2={eyeBot} strokeWidth={2} />
            <line x1={cx - 5} y1={eyeTop} x2={cx + 5} y2={eyeTop} strokeWidth={2} />
            <line x1={cx - 5} y1={eyeBot} x2={cx + 5} y2={eyeBot} strokeWidth={2} />
            <text x={cx + 10} y={midY + 3} fontSize={10} stroke="none">
              height
            </text>
          </g>
        ) : null}

        {/* Eye-width marker (timing margin) */}
        {eyeWidth > 4 ? (
          <g stroke={MARGIN} fill={MARGIN}>
            <line
              x1={cx - eyeWidth / 2}
              y1={midY}
              x2={cx + eyeWidth / 2}
              y2={midY}
              strokeWidth={2}
            />
            <line
              x1={cx - eyeWidth / 2}
              y1={midY - 5}
              x2={cx - eyeWidth / 2}
              y2={midY + 5}
              strokeWidth={2}
            />
            <line
              x1={cx + eyeWidth / 2}
              y1={midY - 5}
              x2={cx + eyeWidth / 2}
              y2={midY + 5}
              strokeWidth={2}
            />
            <text x={cx} y={midY - 10} textAnchor="middle" fontSize={10} stroke="none">
              width
            </text>
          </g>
        ) : (
          <text
            x={cx}
            y={midY - 10}
            textAnchor="middle"
            fontSize={11}
            fill={SKETCH.l1}
            stroke="none"
          >
            eye closed
          </text>
        )}
      </svg>
    </div>
  );
}

/**
 * Interactive eye diagram: overlaid signal traces with the "eye" progressively
 * closing as timing jitter and amplitude noise grow. The eye's height is the
 * voltage (noise) margin and its width is the timing (jitter) margin — the
 * receiver samples in the middle, and a closed eye means bit errors. The whole
 * sequence is deterministic (fixed per-pattern offsets), so it is SSR-safe.
 */
export function EyeDiagramViz({
  title = "Eye diagram — the margin a receiver has to sample correctly",
  caption,
}: {
  title?: string;
  caption?: string;
}) {
  const summary =
    "Interactive eye diagram. Step through increasing timing jitter and amplitude noise and watch the open 'eye' close: its height is the receiver's voltage margin and its width is its timing margin. A closed eye means the sampler can no longer separate ones from zeros.";

  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={
        caption ??
        "The eye is the clear region where a 1 and a 0 are easy to tell apart. Its green height/width are the noise and timing margins; as impairments grow the eye closes toward bit errors."
      }
      stepCount={STEPS.length}
      narration={(i) => STEPS[i]?.text ?? ""}
      renderStep={(i) => <Eye stepIndex={i} total={STEPS.length} />}
    />
  );
}
