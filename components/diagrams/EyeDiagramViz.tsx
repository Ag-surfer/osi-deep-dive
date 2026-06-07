"use client";

import { useId, useMemo, useState } from "react";
import { SKETCH } from "./RoughFigure";
import { eyeTraces } from "@/lib/algorithms/eyeDiagram";

const SIGNAL = SKETCH.l4!; // overlaid signal traces
const MARGIN = SKETCH.l3!; // eye-opening markers (green)
const SAMPLE = SKETCH.l2!; // sampling instant (amber)

const UI = 150;
const AMP = 130;
const RISE = 0.32;
const M = { l: 70, r: 24, t: 20, b: 30 };
const MAX_NOISE = 55;
const MAX_JITTER = 50;

/** The overlaid eye for a given noise/jitter, with margin markers. */
function Eye({ noise, jitter }: { noise: number; jitter: number }) {
  const { traces, centerX, eyeHeight, eyeWidth } = useMemo(
    () => eyeTraces({ ui: UI, amplitude: AMP, riseFrac: RISE, jitter, noise }),
    [jitter, noise],
  );

  const width = M.l + 2 * UI + M.r;
  const height = M.t + AMP + M.b;
  const cx = M.l + centerX;
  const midY = M.t + AMP / 2;
  const eyeTop = midY - eyeHeight / 2;
  const eyeBot = midY + eyeHeight / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, color: "var(--fg)" }}
      role="img"
      aria-label={`Eye diagram at noise ${Math.round(noise)} and jitter ${Math.round(
        jitter,
      )}: voltage margin ${Math.round((eyeHeight / AMP) * 100)} percent, timing margin ${Math.round(
        (eyeWidth / (UI - RISE * UI)) * 100,
      )} percent.`}
    >
      {/* High/low rails */}
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

      {/* Overlaid signal traces */}
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
          <line x1={cx - eyeWidth / 2} y1={midY} x2={cx + eyeWidth / 2} y2={midY} strokeWidth={2} />
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
        <text x={cx} y={midY - 10} textAnchor="middle" fontSize={11} fill={SKETCH.l1} stroke="none">
          eye closed → bit errors
        </text>
      )}
    </svg>
  );
}

function Slider({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = Math.round((value / max) * 100);
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-sm">
      <span className="w-28 shrink-0" style={{ color: "var(--fg-muted)" }}>
        {label}
      </span>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
        aria-valuetext={`${pct}%`}
      />
      <span
        className="w-10 shrink-0 text-right font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        {pct}%
      </span>
    </label>
  );
}

/**
 * A fully interactive eye diagram: drag the noise and jitter sliders and watch
 * the "eye" open and close in real time. The eye's height is the voltage (noise)
 * margin and its width is the timing (jitter) margin; close either and the
 * receiver can no longer separate ones from zeros. Deterministic (no randomness),
 * so SSR-safe.
 */
export function EyeDiagramViz({
  title = "Eye diagram — drag the impairments and watch the eye close",
  caption,
}: {
  title?: string;
  caption?: string;
}) {
  const [noise, setNoise] = useState(10);
  const [jitter, setJitter] = useState(8);

  const { eyeHeight, eyeWidth } = useMemo(
    () => eyeTraces({ ui: UI, amplitude: AMP, riseFrac: RISE, jitter, noise }),
    [jitter, noise],
  );
  const vMargin = Math.round((eyeHeight / AMP) * 100);
  const tMargin = Math.round((eyeWidth / (UI - RISE * UI)) * 100);

  return (
    <figure className="my-8">
      <div
        className="rounded-lg border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
      >
        <p
          className="border-b px-4 py-2 font-serif text-sm font-semibold"
          style={{ borderColor: "var(--border)" }}
        >
          {title}
        </p>
        <div className="overflow-x-auto p-4">
          <Eye noise={noise} jitter={jitter} />
        </div>
        <div className="space-y-3 border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <Slider label="Amplitude noise" value={noise} max={MAX_NOISE} onChange={setNoise} />
          <Slider label="Timing jitter" value={jitter} max={MAX_JITTER} onChange={setJitter} />
          <p className="text-sm" role="status" aria-live="polite">
            <span style={{ color: MARGIN, fontWeight: 600 }}>Voltage margin {vMargin}%</span>
            {"  ·  "}
            <span style={{ color: MARGIN, fontWeight: 600 }}>Timing margin {tMargin}%</span>
            {vMargin === 0 || tMargin === 0 ? (
              <span style={{ color: SKETCH.l1 }}> — eye closed, the sampler fails.</span>
            ) : null}
          </p>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
        {caption ??
          "Drag noise to shrink the eye vertically (voltage margin) and jitter to shrink it horizontally (timing margin). When either margin hits zero, the eye is closed and bits flip."}
      </figcaption>
    </figure>
  );
}
