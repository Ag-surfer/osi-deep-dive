"use client";

import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

/**
 * A declarative, hand-drawn (Excalidraw-style) diagram built on rough.js —
 * the same engine Excalidraw uses. Each diagram is a data spec of boxes,
 * arrows, and notes; this module turns that into a `RoughFigure` draw
 * callback with auto-centered box text and hand-drawn arrowheads, so the
 * 24 protocol diagrams stay consistent and short.
 *
 * Coordinates are in an 820×N viewport (matching the other diagrams). Text
 * uses `currentColor` (theme-aware); accents use the fixed SKETCH hexes,
 * because rough.js writes strokes as SVG attributes where CSS vars don't work.
 */

type Accent = keyof typeof SKETCH; // "l1".."l7"

export interface SceneBox {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Bold title line (centered). */
  title?: string;
  /** Secondary lines under the title (smaller, muted). */
  lines?: string[];
  /** Layer accent for the border + faint fill. */
  accent?: Accent;
  /** Render as an ellipse (clouds, the internet, etc.). */
  ellipse?: boolean;
  /** Monospace the title. */
  mono?: boolean;
}

export interface SceneArrow {
  from: [number, number];
  to: [number, number];
  label?: string;
  dashed?: boolean;
  /** Arrowheads on both ends. */
  both?: boolean;
  /** Nudge the label off the midpoint. */
  labelDx?: number;
  labelDy?: number;
  /** Color the arrow + label with a layer accent. */
  accent?: Accent;
}

export interface SceneNote {
  x: number;
  y: number;
  text: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
  weight?: number;
  opacity?: number;
  accent?: Accent;
}

export interface Scene {
  width: number;
  height: number;
  boxes?: SceneBox[];
  arrows?: SceneArrow[];
  notes?: SceneNote[];
}

const ARROW_LEN = 9;
const ARROW_SPREAD = 0.42;

/** Build a RoughFigure draw callback from a declarative scene. */
export function sceneDraw(scene: Scene): RoughDraw {
  return (rc, svg, h) => {
    const lineStyle = (accent?: Accent, dashed?: boolean) => ({
      stroke: accent ? SKETCH[accent]! : "currentColor",
      roughness: 1.1,
      strokeWidth: 1.5,
      ...(dashed ? { strokeLineDash: [7, 6] } : {}),
    });

    // Arrows first, so boxes sit on top of their endpoints.
    for (const a of scene.arrows ?? []) {
      const [x1, y1] = a.from;
      const [x2, y2] = a.to;
      const style = lineStyle(a.accent, a.dashed);
      svg.appendChild(rc.line(x1, y1, x2, y2, style));
      const head = lineStyle(a.accent); // solid heads even on dashed shafts
      const ang = Math.atan2(y2 - y1, x2 - x1);
      drawHead(rc, svg, x2, y2, ang, head);
      if (a.both) drawHead(rc, svg, x1, y1, ang + Math.PI, head);
      if (a.label) {
        h.text((x1 + x2) / 2 + (a.labelDx ?? 0), (y1 + y2) / 2 + (a.labelDy ?? -6), a.label, {
          size: 11,
          color: a.accent ? SKETCH[a.accent] : undefined,
          opacity: a.accent ? 1 : 0.85,
        });
      }
    }

    // Boxes + their text.
    for (const b of scene.boxes ?? []) {
      const stroke = b.accent ? SKETCH[b.accent]! : "currentColor";
      const shape = {
        stroke,
        roughness: 1.25,
        strokeWidth: 1.5,
        ...(b.accent
          ? { fill: stroke, fillStyle: "hachure" as const, fillWeight: 0.8, hachureGap: 8 }
          : {}),
      };
      svg.appendChild(
        b.ellipse
          ? rc.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, shape)
          : rc.rectangle(b.x, b.y, b.w, b.h, shape),
      );
      const cx = b.x + b.w / 2;
      const lineCount = b.lines?.length ?? 0;
      // Vertically center the whole text block (title + lines).
      const blockTop = b.y + b.h / 2 - (lineCount * 13) / 2;
      if (b.title) {
        h.text(cx, blockTop + (b.title ? 5 : 0), b.title, {
          weight: 600,
          size: 13,
          mono: b.mono,
        });
      }
      b.lines?.forEach((ln, i) => {
        h.text(cx, blockTop + 20 + i * 13, ln, { size: 10, opacity: 0.7, mono: true });
      });
    }

    // Free notes last (always on top).
    for (const n of scene.notes ?? []) {
      h.text(n.x, n.y, n.text, {
        size: n.size ?? 12,
        anchor: n.anchor ?? "middle",
        mono: n.mono,
        weight: n.weight,
        opacity: n.opacity,
        color: n.accent ? SKETCH[n.accent] : undefined,
      });
    }
  };
}

function drawHead(
  rc: ReturnType<typeof import("roughjs").default.svg>,
  svg: SVGSVGElement,
  x: number,
  y: number,
  ang: number,
  style: object,
) {
  svg.appendChild(
    rc.line(
      x,
      y,
      x - ARROW_LEN * Math.cos(ang - ARROW_SPREAD),
      y - ARROW_LEN * Math.sin(ang - ARROW_SPREAD),
      style,
    ),
  );
  svg.appendChild(
    rc.line(
      x,
      y,
      x - ARROW_LEN * Math.cos(ang + ARROW_SPREAD),
      y - ARROW_LEN * Math.sin(ang + ARROW_SPREAD),
      style,
    ),
  );
}

/** Render a declarative scene as a captioned hand-drawn figure. */
export function RoughScene({
  scene,
  caption,
  summary,
}: {
  scene: Scene;
  caption?: string;
  summary: string;
}) {
  return (
    <RoughFigure
      width={scene.width}
      height={scene.height}
      draw={sceneDraw(scene)}
      caption={caption}
      summary={summary}
    />
  );
}
