"use client";

import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

const draw: RoughDraw = (rc, svg, h) => {
  const teal = SKETCH.l4!;
  const lineOpts = { stroke: "currentColor", roughness: 1, strokeWidth: 1.3 };

  const state = (x: number, y: number, label: string, filled = false) => {
    svg.appendChild(
      rc.rectangle(x, y, 132, 44, {
        stroke: teal,
        strokeWidth: 1.7,
        roughness: 1.3,
        fill: filled ? teal : undefined,
        fillStyle: "solid",
      }),
    );
    h.text(x + 66, y + 27, label, {
      weight: 700,
      size: 13,
      mono: true,
      color: filled ? "#fff" : undefined,
    });
  };

  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    svg.appendChild(rc.line(x1, y1, x2, y2, lineOpts));
    const a = Math.atan2(y2 - y1, x2 - x1);
    const s = 9;
    svg.appendChild(
      rc.line(x2, y2, x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4), lineOpts),
    );
    svg.appendChild(
      rc.line(x2, y2, x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4), lineOpts),
    );
  };

  // Open path (top row)
  state(20, 40, "CLOSED");
  state(330, 40, "SYN_SENT");
  state(640, 40, "ESTABLISHED", true);
  arrow(152, 62, 330, 62);
  h.text(241, 52, "active open:", { size: 10, opacity: 0.8 });
  h.text(241, 78, "send SYN", { size: 10, opacity: 0.8, mono: true });
  arrow(462, 62, 640, 62);
  h.text(551, 52, "recv SYN+ACK", { size: 10, opacity: 0.8 });
  h.text(551, 78, "send ACK", { size: 10, opacity: 0.8, mono: true });

  // Down from ESTABLISHED to close path
  arrow(706, 84, 706, 200);
  h.text(716, 145, "close:", { anchor: "start", size: 10, opacity: 0.8 });
  h.text(716, 165, "send FIN", { anchor: "start", size: 10, opacity: 0.8, mono: true });

  // Close path (bottom row)
  state(640, 200, "FIN_WAIT");
  state(330, 200, "TIME_WAIT");
  state(20, 200, "CLOSED");
  arrow(640, 222, 462, 222);
  h.text(551, 212, "recv ACK/FIN", { size: 10, opacity: 0.8 });
  h.text(551, 238, "send ACK", { size: 10, opacity: 0.8, mono: true });
  arrow(330, 222, 152, 222);
  h.text(241, 212, "2·MSL", { size: 10, opacity: 0.8 });
  h.text(241, 238, "timeout", { size: 10, opacity: 0.8, mono: true });
};

/** Hand-drawn (simplified) TCP connection state machine: active open through graceful close. */
export function TcpStateMachine() {
  return (
    <RoughFigure
      width={790}
      height={270}
      draw={draw}
      summary="State diagram: CLOSED → (send SYN) → SYN_SENT → (receive SYN+ACK, send ACK) → ESTABLISHED → (send FIN) → FIN_WAIT → (receive ACK/FIN, send ACK) → TIME_WAIT → (2·MSL timeout) → CLOSED."
      caption="A simplified TCP state walk: the active-open handshake (top) establishes the connection; the graceful close (bottom) tears it down, ending in TIME_WAIT before returning to CLOSED."
    />
  );
}
