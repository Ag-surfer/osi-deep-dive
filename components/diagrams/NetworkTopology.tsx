"use client";

import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

const draw: RoughDraw = (rc, svg, h) => {
  const line = { stroke: "currentColor", roughness: 1.1, strokeWidth: 1.4 };
  const box = { stroke: "currentColor", roughness: 1.3, strokeWidth: 1.4 };
  const accent = (c: string) => ({
    stroke: c,
    strokeWidth: 1.8,
    roughness: 1.4,
    fill: c,
    fillStyle: "hachure",
    fillWeight: 1,
    hachureGap: 7,
  });

  // Links first (so boxes sit on top).
  svg.appendChild(rc.line(108, 60, 210, 100, line)); // Host A → Switch
  svg.appendChild(rc.line(108, 173, 210, 122, line)); // Host B → Switch
  svg.appendChild(rc.line(302, 111, 380, 111, line)); // Switch → Router
  svg.appendChild(rc.line(472, 111, 502, 111, line)); // Router → Internet
  svg.appendChild(rc.line(630, 111, 700, 111, line)); // Internet → Server

  // End hosts
  svg.appendChild(rc.rectangle(16, 38, 92, 44, box));
  svg.appendChild(rc.rectangle(16, 150, 92, 44, box));
  // Switch (L2) and Router (L3) accented
  svg.appendChild(rc.rectangle(210, 88, 92, 46, accent(SKETCH.l2!)));
  svg.appendChild(rc.rectangle(380, 88, 92, 46, accent(SKETCH.l3!)));
  // Internet cloud
  svg.appendChild(rc.ellipse(566, 111, 128, 72, box));
  // Server
  svg.appendChild(rc.rectangle(700, 88, 92, 46, box));

  // Labels
  h.text(62, 56, "Host A", { weight: 600 });
  h.text(62, 72, "MAC · IP", { size: 10, opacity: 0.65, mono: true });
  h.text(62, 168, "Host B", { weight: 600 });
  h.text(62, 184, "MAC · IP", { size: 10, opacity: 0.65, mono: true });
  h.text(256, 108, "Switch", { weight: 600 });
  h.text(256, 124, "L2 · MAC", { size: 10, opacity: 0.8, mono: true });
  h.text(426, 108, "Router", { weight: 600 });
  h.text(426, 124, "L3 · IP", { size: 10, opacity: 0.8, mono: true });
  h.text(566, 116, "Internet", { weight: 600 });
  h.text(746, 108, "Server", { weight: 600 });
  h.text(746, 124, "MAC · IP", { size: 10, opacity: 0.65, mono: true });
};

/** Hand-drawn LAN-to-internet topology: hosts → switch (L2) → router (L3) → internet → server. */
export function NetworkTopology() {
  return (
    <RoughFigure
      width={820}
      height={210}
      draw={draw}
      caption="A switch forwards by MAC within the LAN (L2); a router forwards by IP between networks (L3). IP addresses stay fixed end-to-end; MAC addresses change at every hop."
    />
  );
}
