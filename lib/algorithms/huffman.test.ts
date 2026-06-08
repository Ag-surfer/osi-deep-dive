import { describe, expect, it } from "vitest";
import { huffmanSteps, type SymbolFreq } from "./huffman";

// The classic textbook example.
const input: SymbolFreq[] = [
  { char: "a", freq: 5 },
  { char: "b", freq: 9 },
  { char: "c", freq: 12 },
  { char: "d", freq: 13 },
  { char: "e", freq: 16 },
  { char: "f", freq: 45 },
];

const codeMap = (inp: SymbolFreq[]) =>
  new Map(huffmanSteps(inp).codes.map((c) => [c.char, c.code]));

describe("huffmanSteps", () => {
  it("assigns a code to every symbol", () => {
    const codes = huffmanSteps(input).codes;
    expect(codes).toHaveLength(input.length);
  });

  it("produces a prefix-free code (no code prefixes another)", () => {
    const codes = huffmanSteps(input).codes.map((c) => c.code);
    for (const a of codes) {
      for (const b of codes) {
        if (a !== b) expect(b.startsWith(a)).toBe(false);
      }
    }
  });

  it("achieves the optimal weighted code length (224 bits for the classic input)", () => {
    const { codes } = huffmanSteps(input);
    const total = codes.reduce((s, c) => s + c.freq * c.code.length, 0);
    expect(total).toBe(224);
  });

  it("gives the most frequent symbol the shortest code", () => {
    const codes = codeMap(input);
    expect(codes.get("f")!.length).toBe(1); // freq 45 → depth 1
    expect(codes.get("a")!.length).toBeGreaterThanOrEqual(codes.get("f")!.length);
  });

  it("emits an init step, one step per merge, and a final code step", () => {
    const { steps } = huffmanSteps(input);
    // 6 leaves → 5 merges, + init + final code reveal = 7 steps.
    expect(steps).toHaveLength(5 + 2);
    expect(steps.at(-1)?.showCodes).toBe(true);
  });

  it("handles a single symbol (code '0')", () => {
    const { codes } = huffmanSteps([{ char: "x", freq: 1 }]);
    expect(codes).toEqual([{ char: "x", freq: 1, code: "0" }]);
  });

  it("reports average vs fixed-length bits/symbol", () => {
    const { avgBits, fixedBits } = huffmanSteps(input);
    expect(fixedBits).toBe(3); // ceil(log2(6))
    expect(avgBits).toBeLessThan(fixedBits); // Huffman beats fixed-length
  });
});
