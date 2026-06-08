"use client";

import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";

const AMBER = SKETCH.l2!;
const GREEN = SKETCH.l3!;

export interface WalkActor {
  id: string;
  label: string;
  /** Smaller secondary line under the label. */
  sub: string;
}

export interface WalkStep {
  from: string;
  to: string;
  /** Short label drawn on the arrow. */
  label: string;
  narration: string;
  /** Arrow color intent: neutral (a request), warn (a referral), good (an answer/grant). */
  accent?: "neutral" | "warn" | "good";
  dashed?: boolean;
}

const PAD = 62;
const GAP = 154;
const HEADER_H = 56;
const ROW_H = 44;

const accentColor = (a: WalkStep["accent"]) =>
  a === "warn" ? AMBER : a === "good" ? GREEN : "currentColor";

function Diagram({
  actors,
  steps,
  stepIndex,
  headerColor,
}: {
  actors: WalkActor[];
  steps: WalkStep[];
  stepIndex: number;
  headerColor: string;
}) {
  const n = actors.length;
  // Self-message labels are drawn to the right of a self-loop, so reserve extra
  // horizontal room when any step is a self-message to keep them from clipping.
  const hasSelf = steps.some((s) => s.from === s.to);
  const width = 2 * PAD + (n - 1) * GAP + (hasSelf ? 210 : 0);
  const xOf = (id: string) => {
    const i = actors.findIndex((a) => a.id === id);
    return PAD + i * GAP;
  };
  const height = HEADER_H + steps.length * ROW_H + 16;

  return (
    <div className="overflow-x-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, color: "var(--fg)" }}
        role="img"
        aria-label={`Step ${stepIndex + 1} of ${steps.length}: ${steps[stepIndex]?.narration ?? ""}`}
      >
        {/* Actor headers + lifelines */}
        {actors.map((a) => {
          const x = xOf(a.id);
          return (
            <g key={a.id}>
              <rect
                x={x - 60}
                y={8}
                width={120}
                height={38}
                rx={6}
                fill="var(--bg-soft)"
                stroke={headerColor}
                strokeWidth={1.4}
              />
              <text
                x={x}
                y={a.sub ? 24 : 31}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill="currentColor"
              >
                {a.label}
              </text>
              {a.sub ? (
                <text
                  x={x}
                  y={38}
                  textAnchor="middle"
                  fontSize={9}
                  fill="currentColor"
                  fillOpacity={0.6}
                >
                  {a.sub}
                </text>
              ) : null}
              <line
                x1={x}
                y1={HEADER_H}
                x2={x}
                y2={height - 8}
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeDasharray="3 4"
              />
            </g>
          );
        })}

        {/* Messages, revealed up to the current step */}
        {steps.slice(0, stepIndex + 1).map((s, i) => {
          const y = HEADER_H + (i + 1) * ROW_H;
          const x1 = xOf(s.from);
          const x2 = xOf(s.to);
          const current = i === stepIndex;
          const color = accentColor(s.accent);
          const sw = current ? 2.4 : 1.5;

          // Self-message (from === to): draw a small loop on the actor's lifeline.
          if (s.from === s.to) {
            return (
              <g key={i} opacity={current ? 1 : 0.4}>
                <path
                  d={`M ${x1} ${y - 7} h 18 v 14 h -18`}
                  fill="none"
                  stroke={color}
                  strokeWidth={sw}
                  strokeDasharray={s.dashed ? "6 3" : undefined}
                />
                <line x1={x1} y1={y + 7} x2={x1 + 7} y2={y + 3} stroke={color} strokeWidth={sw} />
                <line x1={x1} y1={y + 7} x2={x1 + 7} y2={y + 11} stroke={color} strokeWidth={sw} />
                <text
                  x={x1 + 26}
                  y={y + 4}
                  textAnchor="start"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                  fontWeight={current ? 700 : 400}
                  fill={color}
                >
                  {s.label}
                </text>
              </g>
            );
          }

          const dir = x2 > x1 ? 1 : -1;
          return (
            <g key={i} opacity={current ? 1 : 0.4}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke={color}
                strokeWidth={sw}
                strokeDasharray={s.dashed ? "6 3" : undefined}
              />
              <line x1={x2} y1={y} x2={x2 - dir * 9} y2={y - 5} stroke={color} strokeWidth={sw} />
              <line x1={x2} y1={y} x2={x2 - dir * 9} y2={y + 5} stroke={color} strokeWidth={sw} />
              <text
                x={(x1 + x2) / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fontWeight={current ? 700 : 400}
                fill={color}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * A generic, step-driven sequence diagram: actors are columns with lifelines, and
 * messages are revealed one per step (current highlighted), colored by intent —
 * neutral request, amber referral, green answer/grant. Used for DNS resolution
 * and the Kerberos ticket exchange; reusable for any message-walk.
 */
export function SequenceWalkViz({
  title,
  summary,
  caption,
  actors,
  steps,
  headerColor = SKETCH.l7!,
}: {
  title?: string;
  summary: string;
  caption?: string;
  actors: WalkActor[];
  steps: WalkStep[];
  headerColor?: string;
}) {
  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={caption}
      stepCount={steps.length}
      narration={(i) => steps[i]?.narration ?? ""}
      renderStep={(i) => (
        <Diagram actors={actors} steps={steps} stepIndex={i} headerColor={headerColor} />
      )}
    />
  );
}
