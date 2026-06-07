/**
 * Eye-diagram geometry. An eye diagram overlays every short segment of a received
 * signal, aligned to the bit clock, so all the bit-transition patterns pile on
 * top of each other. The clear region in the middle — the "eye" — is the margin a
 * receiver has to sample correctly: its **height** is the voltage (noise) margin
 * and its **width** is the timing (jitter) margin. As noise and jitter grow, the
 * eye closes; a closed eye means bit errors.
 *
 * This generates the overlaid traces deterministically (fixed per-pattern offsets,
 * no randomness — so it is SSR/hydration-safe and unit testable) and reports the
 * eye opening.
 */

export interface EyeConfig {
  /** Unit interval (one bit) width in px. */
  ui: number;
  /** Peak-to-peak amplitude in px. */
  amplitude: number;
  /** Edge ramp (rise/fall time) as a fraction of the UI. */
  riseFrac: number;
  /** Horizontal spread of edges from timing jitter, in px. */
  jitter: number;
  /** Vertical spread of levels from amplitude noise, in px. */
  noise: number;
}

export interface EyeResult {
  /** One SVG polyline `points` string per 3-bit transition pattern. */
  traces: string[];
  /** x of the eye center — the ideal sampling instant. */
  centerX: number;
  /** Vertical opening (voltage margin) in px. */
  eyeHeight: number;
  /** Horizontal opening (timing margin) in px. */
  eyeWidth: number;
}

const SAMPLES = 80; // points per trace

/** Build the overlaid eye traces and the eye-opening metrics for a config. */
export function eyeTraces(cfg: EyeConfig): EyeResult {
  const { ui, amplitude, riseFrac, jitter, noise } = cfg;
  const r = riseFrac * ui; // edge ramp width
  const win = 2 * ui; // a 2-UI window: transitions at 0.5·UI and 1.5·UI
  const centerX = ui;

  const yOf = (level: number, noiseOffset: number) => (1 - level) * amplitude + noiseOffset;

  const traces: string[] = [];
  for (let p = 0; p < 8; p++) {
    const b0 = (p >> 2) & 1;
    const b1 = (p >> 1) & 1;
    const b2 = p & 1;
    // Deterministic per-pattern offsets in [-1, 1] → spread without randomness.
    const jit = jitter * (((p % 4) - 1.5) / 1.5);
    const noi = noise * (((p % 3) - 1) / 1);
    const xA = 0.5 * ui + jit; // b0 → b1 transition
    const xB = 1.5 * ui + jit; // b1 → b2 transition

    const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));
    const levelAt = (x: number): number => {
      if (x <= xA - r / 2) return b0;
      if (x < xA + r / 2) return lerp(b0, b1, (x - (xA - r / 2)) / r);
      if (x <= xB - r / 2) return b1;
      if (x < xB + r / 2) return lerp(b1, b2, (x - (xB - r / 2)) / r);
      return b2;
    };

    const pts: string[] = [];
    for (let s = 0; s <= SAMPLES; s++) {
      const x = (s / SAMPLES) * win;
      pts.push(`${x.toFixed(1)},${yOf(levelAt(x), noi).toFixed(1)}`);
    }
    traces.push(pts.join(" "));
  }

  return {
    traces,
    centerX,
    eyeHeight: Math.max(0, amplitude - 2 * noise),
    eyeWidth: Math.max(0, ui - r - 2 * jitter),
  };
}
