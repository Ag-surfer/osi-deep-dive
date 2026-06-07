/**
 * CRC (Cyclic Redundancy Check) computation as binary polynomial long division,
 * instrumented step-by-step for the interactive divider. This is the math behind
 * the Ethernet Frame Check Sequence: append the CRC width in zero bits to the
 * message, divide by the generator polynomial using XOR (no carries), and the
 * remainder is the CRC. The receiver divides the whole frame and expects a zero
 * remainder — a non-zero result means corruption.
 *
 * Pure and deterministic so it is unit tested.
 */

export interface CrcStep {
  /** Plain-language explanation of this step. */
  narration: string;
  /** The working register (the dividend, mutated in place) as a bit string. */
  register: string;
  /** Index where the generator is XOR-aligned this step (highlight), or null. */
  genPos: number | null;
  /** Generator length, so the UI knows how wide to highlight. */
  genLen: number;
  /** The final CRC remainder bit string, set only on the last step. */
  remainder: string | null;
}

/** Compute the CRC of `message` under `generator` (both binary strings) and
 *  return the long-division step trace. The CRC width is `generator.length - 1`. */
export function crcSteps(message: string, generator: string): CrcStep[] {
  if (!/^[01]+$/.test(message) || !/^[01]+$/.test(generator)) {
    throw new Error("crcSteps: message and generator must be non-empty binary strings");
  }
  const genLen = generator.length;
  const n = genLen - 1; // CRC width in bits
  const gen: number[] = generator.split("").map((c) => (c === "1" ? 1 : 0));
  const reg: number[] = (message + "0".repeat(n)).split("").map((c) => (c === "1" ? 1 : 0));
  const len = reg.length;

  const steps: CrcStep[] = [];
  const snap = (narration: string, genPos: number | null, remainder: string | null = null) =>
    steps.push({ narration, register: reg.join(""), genPos, genLen, remainder });

  snap(
    `Augment the ${message.length}-bit message with ${n} zero bits (the CRC width) and divide by the generator ${generator}. Division is bitwise XOR — no borrows or carries.`,
    null,
  );

  for (let i = 0; i + genLen <= len; i++) {
    if (reg[i] === 1) {
      for (let j = 0; j < genLen; j++) reg[i + j] = (reg[i + j] ?? 0) ^ (gen[j] ?? 0);
      snap(
        `Position ${i}: the leading bit is 1, so XOR the generator in — the leading bit clears and the difference is brought down.`,
        i,
      );
    }
    // Positions with a leading 0 are skipped: XOR-ing by zero changes nothing.
  }

  const remainder = reg.slice(len - n).join("");
  snap(
    `No 1-bits remain above the CRC field. The last ${n} bits — ${remainder} — are the CRC / Frame Check Sequence. The sender transmits message + CRC; the receiver divides the whole frame by ${generator} and a non-zero remainder flags a corrupted frame.`,
    null,
    remainder,
  );

  return steps;
}
