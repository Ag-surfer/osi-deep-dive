import { describe, expect, it } from "vitest";
import { encode } from "./lineCoding";

// Reference waveforms for the bit string 0110, sampled at half-bit resolution
// (two samples per bit), starting from a low line.
describe("encode", () => {
  it("NRZ-L drives the line to the bit's level for the whole bit", () => {
    expect(encode("0110", "NRZ-L")).toEqual([0, 0, 1, 1, 1, 1, 0, 0]);
  });

  it("NRZI transitions on a 1 and holds on a 0", () => {
    // 0: hold 0 | 1: →1 | 1: →0 | 0: hold 0
    expect(encode("0110", "NRZI")).toEqual([0, 0, 1, 1, 0, 0, 0, 0]);
  });

  it("Manchester puts a transition in every bit (self-clocking)", () => {
    // 0 = high→low [1,0]; 1 = low→high [0,1]
    expect(encode("0110", "Manchester")).toEqual([1, 0, 0, 1, 0, 1, 1, 0]);
  });

  it("Differential Manchester always transitions mid-bit, and at the start for a 0", () => {
    expect(encode("0110", "Diff-Manchester")).toEqual([1, 0, 0, 1, 1, 0, 1, 0]);
  });

  it("returns two samples per bit", () => {
    expect(encode("10101010", "NRZ-L")).toHaveLength(16);
  });

  it("Manchester encodes a constant bit stream with a transition every bit", () => {
    // All zeros → repeating [1,0]; the mid-bit transitions keep the clock alive.
    expect(encode("000", "Manchester")).toEqual([1, 0, 1, 0, 1, 0]);
  });

  it("rejects non-binary input", () => {
    expect(() => encode("0120", "NRZ-L")).toThrow();
  });
});
