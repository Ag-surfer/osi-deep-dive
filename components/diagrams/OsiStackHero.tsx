"use client";

import { LAYERS_TOP_DOWN } from "@/lib/layers";
import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

/**
 * Home-page hero — the hand-drawn "Excalidraw aesthetic" rendered with rough.js so
 * it is theme-aware (light/dark) and responsive, which a committed Excalidraw SVG
 * can't be. The composition was authored in Excalidraw and saved as an editable
 * source at `docs/osi-stack-hero.excalidraw`; this realizes it and adds the
 * encapsulation "packet on the wire" motif. Layers are color-coded, with data-flow
 * arrows and a worked frame below.
 */

const PACKET = [
  { label: "Eth", layer: 2, w: 56 },
  { label: "IP", layer: 3, w: 50 },
  { label: "TCP", layer: 4, w: 58 },
  { label: "Data", layer: 7, w: 86 },
  { label: "FCS", layer: 2, w: 44 },
];

const draw: RoughDraw = (rc, svg, h) => {
  const line = { stroke: "currentColor", roughness: 1, strokeWidth: 1.3 };

  // Title + a hand-drawn highlight under "header".
  h.text(260, 22, "Each layer wraps the data in a header", { size: 14, weight: 700 });
  svg.appendChild(rc.line(330, 28, 388, 28, { stroke: SKETCH.l3, roughness: 2, strokeWidth: 2.4 }));

  // The 7-layer stack.
  LAYERS_TOP_DOWN.forEach((l, i) => {
    const y = 46 + i * 38;
    const c = SKETCH[`l${l.number}`]!;
    svg.appendChild(
      rc.rectangle(78, y, 300, 32, {
        stroke: c,
        strokeWidth: 1.6,
        roughness: 1.4,
        fill: c,
        fillStyle: "hachure",
        fillWeight: 1,
        hachureGap: 8,
      }),
    );
    h.text(96, y + 21, String(l.number), { weight: 800, size: 15, color: c });
    h.text(118, y + 20, l.name, { anchor: "start", weight: 600 });
    h.text(366, y + 20, l.pdu.split(" ")[0]!, {
      anchor: "end",
      size: 10,
      opacity: 0.8,
      mono: true,
    });
  });
  const stackBottom = 46 + 7 * 38; // 312

  // Encapsulate (down, left) and de-encapsulate (up, right) arrows.
  svg.appendChild(rc.line(56, 52, 56, stackBottom - 4, line));
  svg.appendChild(rc.line(56, stackBottom - 4, 51, stackBottom - 14, line));
  svg.appendChild(rc.line(56, stackBottom - 4, 61, stackBottom - 14, line));
  h.text(34, 180, "send", { size: 10, opacity: 0.7 });

  svg.appendChild(rc.line(400, stackBottom - 4, 400, 52, line));
  svg.appendChild(rc.line(400, 52, 395, 62, line));
  svg.appendChild(rc.line(400, 52, 405, 62, line));
  h.text(420, 180, "recv", { size: 10, opacity: 0.7 });

  // "Becomes one frame" arrow down to the packet motif.
  const py = stackBottom + 40;
  svg.appendChild(rc.line(228, stackBottom + 2, 228, py - 8, line));
  svg.appendChild(rc.line(228, py - 8, 223, py - 18, line));
  svg.appendChild(rc.line(228, py - 8, 233, py - 18, line));
  h.text(260, stackBottom + 24, "one frame on the wire", { size: 10, opacity: 0.75 });

  // The packet: nested headers wrapping the Data payload.
  let x = 228 - PACKET.reduce((s, p) => s + p.w, 0) / 2;
  for (const seg of PACKET) {
    const c = SKETCH[`l${seg.layer}`]!;
    const isData = seg.label === "Data";
    svg.appendChild(
      rc.rectangle(x, py, seg.w, 30, {
        stroke: c,
        strokeWidth: 1.6,
        roughness: 1.3,
        fill: isData ? undefined : c,
        fillStyle: "hachure",
        fillWeight: 1,
        hachureGap: 6,
      }),
    );
    h.text(x + seg.w / 2, py + 19, seg.label, {
      size: 11,
      weight: 700,
      mono: true,
      color: isData ? undefined : "#fff",
    });
    x += seg.w;
  }
};

/** Hand-drawn home-page hero: the 7-layer stack, data-flow arrows, and the frame
 *  that encapsulation builds. Theme-aware (rough.js), authored in Excalidraw. */
export function OsiStackHero() {
  return (
    <RoughFigure
      width={520}
      height={392}
      draw={draw}
      summary="The seven OSI layers top to bottom — 7 Application, 6 Presentation, 5 Session, 4 Transport, 3 Network, 2 Data Link, 1 Physical — with data encapsulated going down and de-encapsulated going up. Below, the resulting frame: an Ethernet header, IP header, TCP header, the Data payload, and an FCS trailer."
      caption="Each layer wraps the data above it in a header as a message descends the stack — the bottom shows the finished frame placed on the wire."
    />
  );
}
