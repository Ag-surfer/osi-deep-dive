import { describe, expect, it } from "vitest";
import { HEADERS } from "./headers";

/**
 * Accuracy invariant: "accuracy is the product." Every header diagram's fixed
 * (non-variable) fields must sum to the documented header size, so a wrong bit
 * width can never ship silently.
 */
describe("header bit-layout accuracy", () => {
  const known: Record<string, number> = {
    ipv4: 160, // RFC 791  — 20 bytes
    ipv6: 320, // RFC 8200 — 40 bytes
    tcp: 160, // RFC 9293 — 20 bytes min
    udp: 64, // RFC 768  — 8 bytes
    ethernet: 144, // IEEE 802.3 fixed framing (header + FCS)
    dns: 96, // RFC 1035 — 12 bytes
  };

  for (const [id, spec] of Object.entries(HEADERS)) {
    it(`${id}: non-variable fields sum to expectedBits (${spec.expectedBits})`, () => {
      const sum = spec.fields
        .filter((f) => !("variable" in f && f.variable))
        .reduce((n, f) => n + f.bits, 0);
      expect(sum).toBe(spec.expectedBits);
    });

    it(`${id}: expectedBits matches the documented size`, () => {
      expect(spec.expectedBits).toBe(known[id]);
    });

    it(`${id}: every field has a positive bit width and a name`, () => {
      for (const f of spec.fields) {
        expect(f.bits).toBeGreaterThan(0);
        expect(f.name.length).toBeGreaterThan(0);
      }
    });
  }

  it("ethernet payload field is marked variable-length", () => {
    const payload = HEADERS.ethernet.fields.find((f) => f.name === "Payload");
    expect(payload && "variable" in payload && payload.variable).toBe(true);
  });
});
