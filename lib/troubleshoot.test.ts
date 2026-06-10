import { describe, expect, it } from "vitest";
import { DIAGNOSES, LADDER, STRATEGIES, TOOLS } from "./troubleshoot";

describe("troubleshooting data integrity", () => {
  it("offers the three canonical strategies", () => {
    expect(STRATEGIES.map((s) => s.name)).toEqual(["Bottom-up", "Top-down", "Divide and conquer"]);
    for (const s of STRATEGIES) {
      expect(s.how.length).toBeGreaterThan(40);
      expect(s.when.length).toBeGreaterThan(40);
    }
  });

  it("maps tools to valid layers, and collectively covers every layer 1–7", () => {
    const covered = new Set<number>();
    for (const t of TOOLS) {
      expect(t.layers.length).toBeGreaterThanOrEqual(1);
      for (const l of t.layers) {
        expect(l).toBeGreaterThanOrEqual(1);
        expect(l).toBeLessThanOrEqual(7);
        covered.add(l);
      }
      expect(t.asks.length).toBeGreaterThan(20);
      expect(t.proves.length).toBeGreaterThan(40);
    }
    for (let l = 1; l <= 7; l++) expect(covered, `layer ${l} uncovered`).toContain(l);
  });

  it("gives every worked diagnosis a valid culprit layer, unique id, and full reasoning chain", () => {
    const ids = DIAGNOSES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const d of DIAGNOSES) {
      expect(d.id).toMatch(/^[a-z0-9-]+$/);
      expect(d.layer).toBeGreaterThanOrEqual(1);
      expect(d.layer).toBeLessThanOrEqual(7);
      expect(d.steps.length).toBeGreaterThanOrEqual(3);
      for (const s of d.steps) {
        expect(s.action.length).toBeGreaterThan(5);
        expect(s.observation.length).toBeGreaterThan(5);
        expect(s.conclusion.length).toBeGreaterThan(20);
      }
      expect(d.lesson.length).toBeGreaterThan(60);
    }
  });

  it("diagnoses span distinct layers (the method generalizes)", () => {
    expect(new Set(DIAGNOSES.map((d) => d.layer)).size).toBeGreaterThanOrEqual(3);
  });

  it("the ladder has both branches on every rung", () => {
    expect(LADDER.length).toBeGreaterThanOrEqual(3);
    for (const rung of LADDER) {
      expect(rung.check.length).toBeGreaterThan(10);
      expect(rung.ifGood.length).toBeGreaterThan(10);
      expect(rung.ifBad.length).toBeGreaterThan(10);
    }
  });
});
