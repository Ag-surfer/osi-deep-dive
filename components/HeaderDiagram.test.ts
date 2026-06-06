import { describe, expect, it } from "vitest";
import { layoutRows, type HeaderField } from "./HeaderDiagram";

describe("layoutRows (bit layout)", () => {
  it("packs fields that exactly fill one 32-bit word into a single row", () => {
    const fields: HeaderField[] = [
      { name: "A", bits: 16 },
      { name: "B", bits: 16 },
    ];
    const rows = layoutRows(fields, 32);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.map((s) => s.bits)).toEqual([16, 16]);
  });

  it("wraps to a new row when fields exceed the word width", () => {
    const fields: HeaderField[] = [
      { name: "A", bits: 24 },
      { name: "B", bits: 24 },
    ];
    const rows = layoutRows(fields, 32);
    expect(rows).toHaveLength(2);
    // B splits: 8 bits finish row 1, 16 bits start row 2.
    expect(rows[0]!.map((s) => s.bits)).toEqual([24, 8]);
    expect(rows[1]!.map((s) => s.bits)).toEqual([16]);
  });

  it("splits a field that spans multiple full words", () => {
    const fields: HeaderField[] = [{ name: "Payload", bits: 96 }];
    const rows = layoutRows(fields, 32);
    expect(rows).toHaveLength(3);
    for (const r of rows) expect(r[0]!.bits).toBe(32);
  });

  it("preserves total bit count across the layout", () => {
    const fields: HeaderField[] = [
      { name: "Version", bits: 4 },
      { name: "IHL", bits: 4 },
      { name: "TOS", bits: 8 },
      { name: "Total Length", bits: 16 },
      { name: "Source Address", bits: 32 },
    ];
    const total = fields.reduce((n, f) => n + f.bits, 0);
    const laid = layoutRows(fields, 32)
      .flat()
      .reduce((n, s) => n + s.bits, 0);
    expect(laid).toBe(total);
  });

  it("gives variable/zero-bit fields at least one cell", () => {
    const rows = layoutRows([{ name: "Options", bits: 0, variable: true }], 32);
    expect(rows[0]![0]!.bits).toBe(1);
  });
});
