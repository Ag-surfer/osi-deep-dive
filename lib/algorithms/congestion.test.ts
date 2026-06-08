import { describe, expect, it } from "vitest";
import { congestionRun } from "./congestion";

const cfg = { rounds: 24, initialSsthresh: 16, capacity: 20, timeoutAtRound: 20 };

describe("congestionRun", () => {
  it("produces one point per round", () => {
    expect(congestionRun(cfg)).toHaveLength(cfg.rounds);
  });

  it("doubles cwnd each round during slow start", () => {
    const pts = congestionRun(cfg);
    expect(pts.slice(0, 4).map((p) => p.cwnd)).toEqual([1, 2, 4, 8]);
    expect(pts[0]?.phase).toBe("slow-start");
  });

  it("switches to congestion avoidance at ssthresh and grows linearly (+1/RTT)", () => {
    const pts = congestionRun(cfg);
    const ca = pts.find((p) => p.phase === "congestion-avoidance");
    expect(ca?.cwnd).toBe(16); // capped at the initial ssthresh
    // Linear growth before the capacity loss: 16,17,18,19…
    const caRun = pts.filter((p) => p.phase === "congestion-avoidance" && p.round <= 8);
    expect(caRun.map((p) => p.cwnd)).toEqual([16, 17, 18, 19]);
  });

  it("halves on a triple-dup-ACK loss at capacity (multiplicative decrease)", () => {
    const pts = congestionRun(cfg);
    const loss = pts.find((p) => p.event?.includes("3 duplicate ACKs"));
    expect(loss?.cwnd).toBe(20); // loss occurs at the capacity
    // The round after fast recovery resumes at ssthresh = cwnd/2 = 10.
    const after = pts.find((p) => p.round === (loss?.round ?? 0) + 1);
    expect(after?.cwnd).toBe(10);
    expect(after?.phase).toBe("congestion-avoidance");
  });

  it("collapses cwnd to 1 and restarts slow start on a timeout", () => {
    const pts = congestionRun(cfg);
    const timeout = pts.find((p) => p.event?.includes("Retransmission timeout"));
    expect(timeout?.round).toBe(20);
    const after = pts.find((p) => p.round === 21);
    expect(after?.cwnd).toBe(1);
    expect(after?.phase).toBe("slow-start");
  });

  it("never lets cwnd exceed the capacity", () => {
    for (const p of congestionRun(cfg)) {
      expect(p.cwnd).toBeLessThanOrEqual(cfg.capacity);
    }
  });
});
