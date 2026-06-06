"use client";

import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

const draw: RoughDraw = (rc, svg, h) => {
  const axis = { stroke: "currentColor", roughness: 0.8, strokeWidth: 1.2 };
  const frame = (c: string) => ({
    stroke: c,
    strokeWidth: 1.6,
    roughness: 1.2,
    fill: c,
    fillStyle: "hachure",
    fillWeight: 1,
    hachureGap: 6,
  });

  // Lane labels
  h.text(28, 52, "A", { weight: 700, size: 16 });
  h.text(28, 132, "B", { weight: 700, size: 16 });

  // Time axis
  svg.appendChild(rc.line(50, 175, 770, 175, axis));
  h.text(760, 195, "time →", { anchor: "end", size: 11, opacity: 0.7, mono: true });

  // A starts transmitting at t0; signal reaches B only after propagation delay.
  svg.appendChild(rc.rectangle(70, 36, 250, 30, frame(SKETCH.l5!)));
  h.text(195, 56, "A transmits", { size: 12, color: "#fff", weight: 600 });

  // B senses idle (A's signal hasn't arrived yet) and starts — overlap = collision.
  svg.appendChild(rc.rectangle(250, 116, 110, 30, frame(SKETCH.l7!)));
  h.text(305, 136, "B transmits", { size: 12, color: "#fff", weight: 600 });

  // Collision zone (jagged) where the two overlap on the medium.
  const zig: [number, number][] = [];
  for (let i = 0; i <= 8; i++) zig.push([250 + i * 9, i % 2 ? 88 : 104]);
  svg.appendChild(rc.linearPath(zig, { stroke: SKETCH.l1!, strokeWidth: 2.4, roughness: 1.6 }));
  h.text(305, 80, "COLLISION", { size: 11, weight: 700, color: SKETCH.l1 });

  // Both detect it, send a JAM, then back off a random time before retrying.
  svg.appendChild(rc.rectangle(322, 36, 36, 30, frame(SKETCH.l1!)));
  h.text(340, 56, "jam", { size: 10, color: "#fff" });
  svg.appendChild(rc.rectangle(362, 116, 36, 30, frame(SKETCH.l1!)));
  h.text(380, 136, "jam", { size: 10, color: "#fff" });

  // Backoff (dashed gap) then retransmit
  svg.appendChild(
    rc.line(358, 51, 470, 51, {
      stroke: "currentColor",
      strokeWidth: 1,
      roughness: 0.6,
      strokeLineDash: [5, 5],
    }),
  );
  h.text(414, 42, "random backoff", { size: 10, opacity: 0.7 });
  svg.appendChild(rc.rectangle(470, 36, 150, 30, frame(SKETCH.l5!)));
  h.text(545, 56, "A retransmits", { size: 12, color: "#fff", weight: 600 });
};

/** Hand-drawn CSMA/CD timeline: two stations collide, jam, back off, and retransmit. */
export function CsmaCdTimeline() {
  return (
    <RoughFigure
      width={800}
      height={210}
      draw={draw}
      caption="Classic Ethernet (CSMA/CD): A and B both sense idle and transmit; their signals overlap and collide. Each detects it, sends a jam, waits a random backoff, then retries."
    />
  );
}
