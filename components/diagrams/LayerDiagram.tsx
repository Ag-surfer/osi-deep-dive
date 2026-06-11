"use client";

import { RoughScene, type Scene } from "./RoughScene";

/**
 * Per-subtopic hand-drawn diagrams for the seven layer pages, keyed by
 * `<layer>-<subtopic>`. Embedded in MDX as `<LayerDiagram id="physical-qam" />`.
 * A test asserts every referenced id exists here.
 */
interface Diagram {
  scene: Scene;
  caption: string;
  summary: string;
}

// QAM constellation: a 4×4 grid of points around I/Q axes centered at (410,158).
const qamDots = (() => {
  const cx = 410,
    cy = 158,
    g = [-120, -40, 40, 120];
  const dots: Scene["dots"] = [];
  for (const qy of g) for (const ix of g) dots.push({ x: cx + ix, y: cy - qy, r: 5, accent: "l1" });
  return dots;
})();

export const LAYER_DIAGRAMS: Record<string, Diagram> = {
  // ───────── Physical (Layer 1) ─────────
  "physical-line-coding": {
    scene: {
      width: 820,
      height: 302,
      signals: [
        {
          x: 180,
          y: 78,
          width: 560,
          height: 36,
          bits: "01110001",
          encoding: "nrz",
          label: "NRZ",
          accent: "l1",
          showBits: true,
        },
        {
          x: 180,
          y: 188,
          width: 560,
          height: 36,
          bits: "01110001",
          encoding: "manchester",
          label: "Manchester",
          accent: "l1",
        },
      ],
      brackets: [{ x: 180, w: 70, y: 234, label: "transition every bit", accent: "l1" }],
      notes: [
        { x: 410, y: 42, text: "the same 8 bits, two line codes", size: 12, weight: 600 },
        {
          x: 410,
          y: 278,
          text: "NRZ: a long run of one value has no transitions, so the receiver's clock drifts.",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 294,
          text: "Manchester forces a mid-bit transition every bit (self-clocking) — at 2× the bandwidth.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "The same bit string in NRZ (level = bit) and Manchester (a mid-bit transition every bit, shown in the IEEE 802.3 convention where 1 = a rising edge). Self-clocking is what NRZ lacks on long runs.",
    summary:
      "Two waveforms of the bits 01110001: NRZ holds a level per bit and goes flat on repeated values, while Manchester puts a transition in the middle of every bit so the clock never drifts.",
  },

  "physical-qam": {
    scene: {
      width: 820,
      height: 320,
      polylines: [
        {
          points: [
            [250, 158],
            [570, 158],
          ],
        }, // I axis
        {
          points: [
            [410, 40],
            [410, 276],
          ],
        }, // Q axis
      ],
      dots: qamDots,
      notes: [
        { x: 410, y: 18, text: "16-QAM constellation", size: 12, weight: 600 },
        { x: 582, y: 162, text: "I", size: 12, anchor: "start", opacity: 0.7 },
        { x: 426, y: 36, text: "Q", size: 12, anchor: "start", opacity: 0.7 },
        {
          x: 410,
          y: 300,
          text: "16 points = 4 bits/symbol. 256-QAM = 8 bits, 1024-QAM = 10 — denser grids crowd the points,",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 316,
          text: "so each needs higher SNR. Walk away from the router and it drops to a sparser grid.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Each constellation point is a distinct amplitude-and-phase symbol. More points carry more bits per symbol but sit closer together — so denser modulation demands a cleaner signal.",
    summary:
      "A 16-point QAM constellation on in-phase (I) and quadrature (Q) axes; 16 points encode 4 bits per symbol, and denser schemes pack points closer, requiring higher signal-to-noise ratio.",
  },

  "physical-multiplexing": {
    scene: {
      width: 820,
      height: 250,
      regions: [
        { x: 20, y: 36, w: 240, h: 158, label: "FDM — by frequency", accent: "l1" },
        { x: 290, y: 36, w: 240, h: 158, label: "TDM — by time", accent: "l2" },
        { x: 560, y: 36, w: 240, h: 158, label: "WDM — by wavelength", accent: "l4" },
      ],
      boxes: [
        { x: 40, y: 74, w: 200, h: 30, title: "User A — always on" },
        { x: 40, y: 110, w: 200, h: 30, title: "User B — always on" },
        { x: 40, y: 146, w: 200, h: 30, title: "User C — always on" },
        { x: 304, y: 110, w: 50, h: 40, title: "A" },
        { x: 360, y: 110, w: 50, h: 40, title: "B" },
        { x: 416, y: 110, w: 50, h: 40, title: "C" },
        { x: 472, y: 110, w: 50, h: 40, title: "A" },
        { x: 580, y: 104, w: 200, h: 40, title: "one fiber", lines: ["λ1 + λ2 + λ3 + …"] },
      ],
      notes: [
        {
          x: 410,
          y: 218,
          text: "Share one medium three ways. Statistical TDM — slots on demand, not fixed rotation —",
          size: 11,
          opacity: 0.8,
        },
        {
          x: 410,
          y: 234,
          text: "is packet switching itself, the internet's founding bet.",
          size: 11,
          opacity: 0.8,
        },
      ],
    },
    caption:
      "Three ways to share one medium: a frequency band each (FDM), the whole channel in rotating time slots (TDM), or a separate color of light each (WDM).",
    summary:
      "Three panels: FDM gives each user a frequency band continuously, TDM gives each the whole channel in rotating time slots, and WDM carries many wavelengths on one fiber at once.",
  },
};

/** Render the diagram registered for a layer-subtopic id. */
export function LayerDiagram({ id }: { id: string }) {
  const d = LAYER_DIAGRAMS[id];
  if (!d) return null;
  return <RoughScene scene={d.scene} caption={d.caption} summary={d.summary} />;
}
