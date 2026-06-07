/**
 * Digital line-coding schemes: turning a bit string into the sequence of line
 * levels a transmitter drives onto the medium. Each bit is sampled at half-bit
 * resolution (two samples per bit) so mid-bit transitions — the self-clocking
 * trick in Manchester coding — can be represented. Level 1 = high, 0 = low.
 *
 * Pure and deterministic so it is unit tested and drives the interactive
 * waveform diagram identically every run.
 */

export type Encoding = "NRZ-L" | "NRZI" | "Manchester" | "Diff-Manchester";

export const ENCODINGS: Encoding[] = ["NRZ-L", "NRZI", "Manchester", "Diff-Manchester"];

/**
 * Encode `bits` under `enc`, returning 2 samples per bit (first half, second
 * half), each 0 (low) or 1 (high). Stateful schemes (NRZI, Differential
 * Manchester) start from a low line.
 */
export function encode(bits: string, enc: Encoding): number[] {
  if (!/^[01]+$/.test(bits)) throw new Error("encode: bits must be a non-empty binary string");
  const out: number[] = [];
  let level = 0; // current line level for the stateful schemes

  for (const ch of bits) {
    const b = ch === "1" ? 1 : 0;
    switch (enc) {
      case "NRZ-L":
        out.push(b, b);
        break;
      case "NRZI":
        if (b === 1) level = 1 - level; // a 1 causes a transition
        out.push(level, level);
        break;
      case "Manchester":
        // IEEE 802.3 convention: 0 = high→low, 1 = low→high.
        if (b === 0) out.push(1, 0);
        else out.push(0, 1);
        break;
      case "Diff-Manchester":
        if (b === 0) level = 1 - level; // a 0 transitions at the start of the bit
        out.push(level);
        level = 1 - level; // every bit has a mid-bit transition (the clock)
        out.push(level);
        break;
    }
  }
  return out;
}
