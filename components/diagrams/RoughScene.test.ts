// @vitest-environment node
import { describe, expect, it } from "vitest";
import { __signalPoints, type SceneSignal } from "./RoughScene";

const base = { x: 0, y: 0, width: 100, height: 20 } as const;
const HI = 0; // top of the box
const LO = 20; // bottom

describe("line-coding waveform generation", () => {
  it("NRZ holds each cell at the bit's level", () => {
    const s: SceneSignal = { ...base, bits: "10", encoding: "nrz" };
    expect(__signalPoints(s)).toEqual([
      [0, HI],
      [50, HI],
      [50, LO],
      [100, LO],
    ]);
  });

  it("Manchester puts a mid-cell transition in every bit (1 = low→high)", () => {
    const s: SceneSignal = { ...base, width: 40, bits: "1", encoding: "manchester" };
    expect(__signalPoints(s)).toEqual([
      [0, LO],
      [20, LO],
      [20, HI],
      [40, HI],
    ]);
    // 0 = high→low
    const z = __signalPoints({ ...base, width: 40, bits: "0", encoding: "manchester" });
    expect(z).toEqual([
      [0, HI],
      [20, HI],
      [20, LO],
      [40, LO],
    ]);
  });

  it("NRZI transitions at the start of every 1-bit and holds on 0", () => {
    // start level is LOW; "1" flips, "0" holds
    const s: SceneSignal = { ...base, width: 30, bits: "101", encoding: "nrzi" };
    const pts = __signalPoints(s);
    // bit0 "1": flip LOW->HIGH
    expect(pts.slice(0, 2)).toEqual([
      [0, HI],
      [10, HI],
    ]);
    // bit1 "0": hold HIGH
    expect(pts.slice(2, 4)).toEqual([
      [10, HI],
      [20, HI],
    ]);
    // bit2 "1": flip HIGH->LOW
    expect(pts.slice(4, 6)).toEqual([
      [20, LO],
      [30, LO],
    ]);
  });

  it("always emits a connected orthogonal path (all encodings, incl. equal-bit cell joins)", () => {
    for (const encoding of ["nrz", "nrzi", "manchester"] as const) {
      const pts = __signalPoints({ ...base, bits: "1100", encoding });
      expect(pts.length).toBeGreaterThan(0);
      for (let i = 1; i < pts.length; i++) {
        // consecutive points share an x or a y (orthogonal segments only)
        const sameX = pts[i]![0] === pts[i - 1]![0];
        const sameY = pts[i]![1] === pts[i - 1]![1];
        expect(sameX || sameY, `${encoding} segment ${i}`).toBe(true);
      }
    }
  });

  it("returns no points for an empty bit string (no NaN)", () => {
    expect(__signalPoints({ ...base, bits: "", encoding: "nrz" })).toEqual([]);
  });
});
