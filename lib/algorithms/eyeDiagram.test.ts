import { describe, expect, it } from "vitest";
import { eyeTraces } from "./eyeDiagram";

const base = { ui: 120, amplitude: 120, riseFrac: 0.3 };

describe("eyeTraces", () => {
  it("produces one trace per 3-bit transition pattern", () => {
    const { traces } = eyeTraces({ ...base, jitter: 0, noise: 0 });
    expect(traces).toHaveLength(8);
  });

  it("an ideal signal has a wide-open eye", () => {
    const { eyeHeight, eyeWidth } = eyeTraces({ ...base, jitter: 0, noise: 0 });
    expect(eyeHeight).toBe(120); // full amplitude
    expect(eyeWidth).toBeCloseTo(120 - 0.3 * 120); // UI minus the edge ramp
  });

  it("noise reduces the eye height (voltage margin)", () => {
    const clean = eyeTraces({ ...base, jitter: 0, noise: 0 }).eyeHeight;
    const noisy = eyeTraces({ ...base, jitter: 0, noise: 25 }).eyeHeight;
    expect(noisy).toBe(clean - 50); // amplitude − 2·noise
    expect(noisy).toBeLessThan(clean);
  });

  it("jitter reduces the eye width (timing margin)", () => {
    const clean = eyeTraces({ ...base, jitter: 0, noise: 0 }).eyeWidth;
    const jittery = eyeTraces({ ...base, jitter: 20, noise: 0 }).eyeWidth;
    expect(jittery).toBe(clean - 40); // UI − rise − 2·jitter
    expect(jittery).toBeLessThan(clean);
  });

  it("severe impairment closes the eye to zero", () => {
    const { eyeHeight, eyeWidth } = eyeTraces({ ...base, jitter: 100, noise: 100 });
    expect(eyeHeight).toBe(0);
    expect(eyeWidth).toBe(0);
  });

  it("each trace is a sampled polyline across the 2-UI window", () => {
    const { traces } = eyeTraces({ ...base, jitter: 0, noise: 0 });
    const first = traces[0]!;
    expect(first.split(" ").length).toBe(81); // SAMPLES + 1 points
  });
});
