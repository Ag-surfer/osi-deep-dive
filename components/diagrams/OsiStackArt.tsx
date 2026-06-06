"use client";

import { LAYERS_TOP_DOWN } from "@/lib/layers";
import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

const draw: RoughDraw = (rc, svg, h) => {
  const arrowOpts = { stroke: "currentColor", roughness: 1, strokeWidth: 1.3 };

  LAYERS_TOP_DOWN.forEach((l, i) => {
    const y = 36 + i * 48;
    const c = SKETCH[`l${l.number}`]!;
    svg.appendChild(
      rc.rectangle(70, y, 380, 40, {
        stroke: c,
        strokeWidth: 1.7,
        roughness: 1.3,
        fill: c,
        fillStyle: "hachure",
        fillWeight: 1,
        hachureGap: 8,
      }),
    );
    h.text(92, y + 26, String(l.number), { weight: 800, size: 16, color: c });
    h.text(116, y + 25, l.name, { anchor: "start", weight: 600 });
    h.text(438, y + 25, l.pdu.split(" ")[0]!, {
      anchor: "end",
      size: 11,
      opacity: 0.8,
      mono: true,
    });
  });

  // Encapsulate arrow (down, left side)
  svg.appendChild(rc.line(40, 44, 40, 372, arrowOpts));
  svg.appendChild(rc.line(40, 372, 35, 362, arrowOpts));
  svg.appendChild(rc.line(40, 372, 45, 362, arrowOpts));
  h.text(20, 210, "send", { size: 11, opacity: 0.75 });

  // De-encapsulate arrow (up, right side)
  svg.appendChild(rc.line(480, 372, 480, 44, arrowOpts));
  svg.appendChild(rc.line(480, 44, 475, 54, arrowOpts));
  svg.appendChild(rc.line(480, 44, 485, 54, arrowOpts));
  h.text(500, 210, "recv", { size: 11, opacity: 0.75 });

  h.text(260, 18, "Encapsulation flows down · De-encapsulation flows up", {
    size: 11,
    opacity: 0.7,
  });
};

/** Hand-drawn illustration of the 7-layer stack with PDUs and data-flow direction. */
export function OsiStackArt() {
  return (
    <RoughFigure
      width={520}
      height={388}
      draw={draw}
      summary="The seven OSI layers from top to bottom: 7 Application (Data), 6 Presentation (Data), 5 Session (Data), 4 Transport (Segment), 3 Network (Packet), 2 Data Link (Frame), 1 Physical (Bits). Data is encapsulated going down and de-encapsulated going up."
      caption="The OSI stack: each layer wraps the one above as data descends the sender's stack, and unwraps as it climbs the receiver's."
    />
  );
}
