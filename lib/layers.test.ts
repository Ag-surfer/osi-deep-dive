import { describe, expect, it } from "vitest";
import { LAYERS, getLayer, prevLayer, nextLayer, LAYERS_TOP_DOWN } from "./layers";

describe("layer registry", () => {
  it("has exactly 7 layers numbered 1..7 in order", () => {
    expect(LAYERS.map((l) => l.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("has unique, url-safe slugs", () => {
    const slugs = LAYERS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(7);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("every layer carries required metadata", () => {
    for (const l of LAYERS) {
      expect(l.name).toBeTruthy();
      expect(l.pdu).toBeTruthy();
      expect(l.color).toMatch(/^var\(--color-layer-\d\)$/);
      expect(l.protocols.length).toBeGreaterThan(0);
      expect(l.devices.length).toBeGreaterThan(0);
    }
  });

  it("getLayer resolves by slug and returns undefined for unknown", () => {
    expect(getLayer("network")?.number).toBe(3);
    expect(getLayer("nope")).toBeUndefined();
  });

  it("prev/next walk the stack and terminate at the ends", () => {
    expect(prevLayer("physical")).toBeUndefined();
    expect(nextLayer("application")).toBeUndefined();
    expect(nextLayer("network")?.slug).toBe("transport");
    expect(prevLayer("transport")?.slug).toBe("network");
  });

  it("LAYERS_TOP_DOWN runs 7→1 for stack rendering", () => {
    expect(LAYERS_TOP_DOWN.map((l) => l.number)).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });
});
