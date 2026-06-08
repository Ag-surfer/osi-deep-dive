/**
 * A TCP congestion-control (TCP Reno / NewReno) simulation, instrumented as a
 * per-RTT series for the interactive cwnd-over-time chart. Each entry is one
 * round-trip's congestion window, the current slow-start threshold, the phase,
 * and any loss event — which together trace the classic AIMD "sawtooth".
 *
 * Pure and deterministic so it is unit tested and renders identically every run.
 * Window units are MSS-sized segments (cwnd in segments, not bytes).
 */

export type CcPhase = "slow-start" | "congestion-avoidance" | "fast-recovery" | "timeout";

export interface CwndPoint {
  /** RTT round number (1-based). */
  round: number;
  /** Congestion window this round, in segments. */
  cwnd: number;
  /** Slow-start threshold in effect this round, in segments. */
  ssthresh: number;
  /** The control phase this round. */
  phase: CcPhase;
  /** A loss/transition note attached to this round, if any. */
  event?: string;
}

export interface CongestionConfig {
  /** How many RTT rounds to simulate. */
  rounds: number;
  /** Initial slow-start threshold (segments). */
  initialSsthresh: number;
  /** Network "pipe" capacity (segments); reaching it triggers a triple-dup-ACK loss. */
  capacity: number;
  /** A round at which a retransmission timeout occurs (resets cwnd to 1), if any. */
  timeoutAtRound?: number;
}

/** Run the Reno/NewReno simulation and return the per-round cwnd series. */
export function congestionRun(cfg: CongestionConfig): CwndPoint[] {
  const { rounds, initialSsthresh, capacity, timeoutAtRound } = cfg;
  const pts: CwndPoint[] = [];

  let cwnd = 1;
  let ssthresh = initialSsthresh;
  let phase: CcPhase = "slow-start";

  for (let round = 1; round <= rounds; round++) {
    // A retransmission timeout this round: the most drastic response — collapse
    // cwnd to 1 and restart slow start (ssthresh halves to the window at loss).
    if (round === timeoutAtRound) {
      const newSsthresh = Math.max(2, Math.floor(cwnd / 2));
      pts.push({
        round,
        cwnd,
        ssthresh,
        phase,
        event: `Retransmission timeout at cwnd=${cwnd}: ssthresh ← ${newSsthresh}, cwnd ← 1, restart slow start.`,
      });
      ssthresh = newSsthresh;
      cwnd = 1;
      phase = "slow-start";
      continue;
    }

    // Reaching the pipe capacity drops a segment → triple duplicate ACKs → fast
    // retransmit / fast recovery: ssthresh and cwnd both halve (multiplicative
    // decrease), and we resume congestion avoidance (NewReno, no slow start).
    if (cwnd >= capacity) {
      const newSsthresh = Math.max(2, Math.floor(cwnd / 2));
      pts.push({
        round,
        cwnd,
        ssthresh,
        phase,
        event: `3 duplicate ACKs at cwnd=${cwnd}: ssthresh ← ${newSsthresh}, cwnd ← ${newSsthresh} (fast recovery).`,
      });
      ssthresh = newSsthresh;
      cwnd = newSsthresh;
      phase = "congestion-avoidance";
      continue;
    }

    pts.push({ round, cwnd, ssthresh, phase });

    // Advance the window for next round.
    if (phase === "slow-start") {
      cwnd = cwnd * 2; // exponential: +1 per ACK ≈ doubling per RTT
      if (cwnd >= ssthresh) {
        cwnd = ssthresh; // cap at the threshold and switch to linear growth
        phase = "congestion-avoidance";
      }
    } else if (phase === "congestion-avoidance") {
      cwnd = cwnd + 1; // additive increase: +1 MSS per RTT
    }
  }

  return pts;
}
