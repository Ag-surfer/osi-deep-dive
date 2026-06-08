"use client";

import { useMemo } from "react";
import { SKETCH } from "./RoughFigure";
import { StepPlayer } from "./StepPlayer";
import { congestionRun, type CcPhase, type CwndPoint } from "@/lib/algorithms/congestion";

const TEAL = SKETCH.l4!;
const PHASE_COLOR: Record<CcPhase, string> = {
  "slow-start": SKETCH.l3!,
  "congestion-avoidance": SKETCH.l4!,
  "fast-recovery": SKETCH.l2!,
  timeout: SKETCH.l1!,
};
const PHASE_LABEL: Record<CcPhase, string> = {
  "slow-start": "Slow start — cwnd doubles each RTT (exponential)",
  "congestion-avoidance": "Congestion avoidance — +1 MSS per RTT (additive increase)",
  "fast-recovery": "Fast recovery",
  timeout: "Timeout",
};

/** Color a point by its loss event if it carries one, else by its phase — so the
 *  fast-recovery (amber) and timeout (red) markers actually show on the curve. */
function dotColor(p: CwndPoint): string {
  if (p.event?.includes("timeout")) return PHASE_COLOR.timeout;
  if (p.event?.includes("duplicate ACKs")) return PHASE_COLOR["fast-recovery"];
  return PHASE_COLOR[p.phase];
}

/** The cwnd-over-time chart revealed up to the current round. */
function Chart({
  points,
  index,
  total,
  width,
  height,
}: {
  points: CwndPoint[];
  index: number;
  total: number;
  width: number;
  height: number;
}) {
  const m = { l: 46, r: 16, t: 18, b: 34 };
  const plotW = width - m.l - m.r;
  const plotH = height - m.t - m.b;
  const baseline = height - m.b;
  const xMax = points.length;
  const yMax = Math.max(...points.map((p) => p.cwnd)) + 2;

  const xPlot = (round: number) => m.l + ((round - 1) / Math.max(1, xMax - 1)) * plotW;
  const yPlot = (v: number) => baseline - (v / yMax) * plotH;

  const shown = points.slice(0, index + 1);
  const cur = points[index]!;
  const poly = shown.map((p) => `${xPlot(p.round)},${yPlot(p.cwnd)}`).join(" ");

  // Dedupe so tiny ranges (e.g. very few rounds) can't produce duplicate tick
  // values, which would collide as React keys.
  const yTicks = [...new Set([0, Math.round(yMax / 2), Math.floor(yMax)])];
  const xTicks = [...new Set([1, Math.ceil(xMax / 2), xMax])];

  return (
    <div className="overflow-x-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, color: "var(--fg)" }}
        role="img"
        aria-label={`Step ${index + 1} of ${total}: round ${cur.round}, cwnd ${cur.cwnd}, ${
          cur.event ?? PHASE_LABEL[cur.phase]
        }`}
      >
        {/* Axes */}
        <line x1={m.l} y1={m.t} x2={m.l} y2={baseline} stroke="currentColor" strokeOpacity={0.4} />
        <line
          x1={m.l}
          y1={baseline}
          x2={width - m.r}
          y2={baseline}
          stroke="currentColor"
          strokeOpacity={0.4}
        />

        {/* Y ticks + gridlines */}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line
              x1={m.l}
              y1={yPlot(t)}
              x2={width - m.r}
              y2={yPlot(t)}
              stroke="currentColor"
              strokeOpacity={t === 0 ? 0 : 0.08}
            />
            <text
              x={m.l - 6}
              y={yPlot(t) + 4}
              textAnchor="end"
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="currentColor"
              fillOpacity={0.6}
            >
              {t}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {xTicks.map((t) => (
          <text
            key={`x${t}`}
            x={xPlot(t)}
            y={baseline + 16}
            textAnchor="middle"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="currentColor"
            fillOpacity={0.6}
          >
            {t}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={m.l - 34}
          y={m.t + plotH / 2}
          fontSize={11}
          fill="currentColor"
          fillOpacity={0.7}
          textAnchor="middle"
          transform={`rotate(-90 ${m.l - 34} ${m.t + plotH / 2})`}
        >
          cwnd (segments)
        </text>
        <text
          x={m.l + plotW / 2}
          y={height - 4}
          fontSize={11}
          fill="currentColor"
          fillOpacity={0.7}
          textAnchor="middle"
        >
          RTT round
        </text>

        {/* Current ssthresh line */}
        <line
          x1={m.l}
          y1={yPlot(cur.ssthresh)}
          x2={width - m.r}
          y2={yPlot(cur.ssthresh)}
          stroke={SKETCH.l5}
          strokeWidth={1.4}
          strokeDasharray="5 4"
        />
        <text
          x={width - m.r}
          y={yPlot(cur.ssthresh) - 4}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          fill={SKETCH.l5}
        >
          ssthresh {cur.ssthresh}
        </text>

        {/* cwnd curve */}
        <polyline points={poly} fill="none" stroke={TEAL} strokeWidth={2} />
        {shown.map((p) => (
          <circle
            key={p.round}
            cx={xPlot(p.round)}
            cy={yPlot(p.cwnd)}
            r={p.round === cur.round ? 5 : 3}
            fill={dotColor(p)}
            stroke={p.round === cur.round ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {/* Phase legend */}
      <div
        className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        {(Object.keys(PHASE_COLOR) as CcPhase[]).map((ph) => (
          <span key={ph} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: PHASE_COLOR[ph] }}
            />
            {ph.replace("-", " ")}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Interactive TCP Reno/NewReno congestion-window chart. Declare the network
 * conditions (initial ssthresh, pipe capacity, an optional timeout round) and it
 * simulates cwnd over RTTs and plays the classic AIMD sawtooth back step by step.
 */
export function CongestionControlViz({
  rounds = 24,
  initialSsthresh = 16,
  capacity = 20,
  timeoutAtRound,
  title = "TCP Reno — congestion window over time",
  caption,
  width = 640,
  height = 320,
}: {
  rounds?: number;
  initialSsthresh?: number;
  capacity?: number;
  timeoutAtRound?: number;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  const points = useMemo(
    () => congestionRun({ rounds, initialSsthresh, capacity, timeoutAtRound }),
    [rounds, initialSsthresh, capacity, timeoutAtRound],
  );

  const summary = `Interactive plot of TCP Reno's congestion window over ${rounds} round trips: slow start grows it exponentially to the ssthresh, congestion avoidance grows it linearly, a triple-duplicate-ACK loss halves it (fast recovery), and a timeout collapses it to one segment — the AIMD sawtooth.`;

  return (
    <StepPlayer
      title={title}
      summary={summary}
      caption={
        caption ??
        "Step through each RTT: dots are colored by phase, the dashed line is the current ssthresh. Watch the sawtooth — exponential rise, linear climb, multiplicative drop on loss."
      }
      stepCount={points.length}
      narration={(i) => {
        const p = points[i];
        if (!p) return "";
        return `Round ${p.round}, cwnd ${p.cwnd}: ${p.event ?? PHASE_LABEL[p.phase] + "."}`;
      }}
      renderStep={(i) => (
        <Chart points={points} index={i} total={points.length} width={width} height={height} />
      )}
    />
  );
}
