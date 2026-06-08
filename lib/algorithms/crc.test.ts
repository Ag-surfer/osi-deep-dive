import { describe, expect, it } from "vitest";
import { crcSteps } from "./crc";

const remainderOf = (msg: string, gen: string) => crcSteps(msg, gen).at(-1)!.remainder;

describe("crcSteps", () => {
  it("matches the canonical Wikipedia CRC example (gen 1011)", () => {
    // message 11010011101100, generator 1011 → remainder 100.
    expect(remainderOf("11010011101100", "1011")).toBe("100");
  });

  it("computes a single parity bit for the x+1 generator", () => {
    // Generator 11 (x+1) yields a 1-bit CRC = parity. Even # of 1s → 0.
    expect(remainderOf("1010", "11")).toBe("0"); // two 1s (even)
    expect(remainderOf("1110", "11")).toBe("1"); // three 1s (odd)
  });

  it("a frame followed by its CRC divides to a zero remainder (receiver check)", () => {
    const gen = "1011";
    const msg = "11010011101100";
    const crc = remainderOf(msg, gen)!;
    // The received frame is message+crc; dividing it should leave remainder 0.
    expect(remainderOf(msg + crc, gen)).toBe("0".repeat(gen.length - 1));
  });

  it("emits an init step, the XOR steps, and a final remainder step", () => {
    const steps = crcSteps("11010011101100", "1011");
    expect(steps[0]?.genPos).toBeNull();
    expect(steps.at(-1)?.remainder).toBe("100");
    // At least one XOR step highlights a generator position.
    expect(steps.some((s) => s.genPos !== null)).toBe(true);
  });

  it("rejects non-binary input", () => {
    expect(() => crcSteps("12", "1011")).toThrow();
    expect(() => crcSteps("1010", "2")).toThrow();
  });
});
