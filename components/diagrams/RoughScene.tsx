"use client";

import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

/**
 * A declarative, hand-drawn (Excalidraw-style) diagram built on rough.js —
 * the same engine Excalidraw uses. Each diagram is a data spec of boxes,
 * arrows, regions, brackets, signals, dots, and notes; this module turns
 * that into a `RoughFigure` draw callback with auto-centered box text and
 * hand-drawn arrowheads, so the diagrams stay consistent and compact.
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

/** A dashed (and optionally hachure-filled) grouping rectangle with a corner label. */
export interface SceneRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  accent?: Accent;
  /** Faint hachure fill in the accent color. */
  fill?: boolean;
  solid?: boolean; // solid border instead of dashed
}

/** A span bracket under (or over) a horizontal range, with a centered label. */
export interface SceneBracket {
  x: number;
  w: number;
  y: number;
  label?: string;
  /** "down" (default): the bracket cups content above it, label below. "up": mirror. */
  dir?: "up" | "down";
  accent?: Accent;
  /** Tick depth. */
  depth?: number;
}

/** A free hand-drawn polyline (waveforms, custom shapes). */
export interface ScenePolyline {
  points: [number, number][];
  accent?: Accent;
  dashed?: boolean;
  width?: number;
}

/**
 * A digital line-coding waveform generated from a bit string — for Physical-layer
 * signaling diagrams. Conventions: NRZ level = bit; NRZI transition at a cell's
 * start = 1; Manchester (IEEE 802.3) = mid-cell transition, 1 → low-then-high,
 * 0 → high-then-low. Caption the convention where it's used.
 */
export interface SceneSignal {
  x: number;
  y: number;
  width: number;
  height: number;
  bits: string; // e.g. "10110"
  encoding: "nrz" | "nrzi" | "manchester";
  label?: string;
  accent?: Accent;
  /** Print each bit above its cell. */
  showBits?: boolean;
}

/** A small filled dot (QAM constellations, multiplexing points). */
export interface SceneDot {
  x: number;
  y: number;
  r?: number;
  accent?: Accent;
  label?: string;
}

export interface Scene {
  width: number;
  height: number;
  regions?: SceneRegion[];
  boxes?: SceneBox[];
  arrows?: SceneArrow[];
  polylines?: ScenePolyline[];
  signals?: SceneSignal[];
  dots?: SceneDot[];
  brackets?: SceneBracket[];
  notes?: SceneNote[];
}

const ARROW_LEN = 9;
const ARROW_SPREAD = 0.42;
const col = (a?: Accent) => (a ? SKETCH[a]! : "currentColor");

/** Generate the level-sequence points for a line-coding waveform. */
function signalPoints(s: SceneSignal): [number, number][] {
  const cells = s.bits.length;
  if (cells === 0) return [];
  const cw = s.width / cells;
  const hi = s.y;
  const lo = s.y + s.height;
  const pts: [number, number][] = [];
  if (s.encoding === "manchester") {
    for (let i = 0; i < cells; i++) {
      const b = s.bits[i] === "1";
      const x0 = s.x + i * cw;
      const xm = x0 + cw / 2;
      const x1 = x0 + cw;
      const first = b ? lo : hi;
      const second = b ? hi : lo;
      pts.push([x0, first], [xm, first], [xm, second], [x1, second]);
    }
  } else if (s.encoding === "nrzi") {
    let level = lo;
    for (let i = 0; i < cells; i++) {
      const x0 = s.x + i * cw;
      const x1 = x0 + cw;
      if (s.bits[i] === "1") level = level === hi ? lo : hi; // transition at cell start
      pts.push([x0, level], [x1, level]);
    }
  } else {
    // nrz
    for (let i = 0; i < cells; i++) {
      const x0 = s.x + i * cw;
      const x1 = x0 + cw;
      const level = s.bits[i] === "1" ? hi : lo;
      pts.push([x0, level], [x1, level]);
    }
  }
  return pts;
}

/** Build a RoughFigure draw callback from a declarative scene. */
export function sceneDraw(scene: Scene): RoughDraw {
  return (rc, svg, h) => {
    // 1. Regions (behind everything).
    for (const r of scene.regions ?? []) {
      svg.appendChild(
        rc.rectangle(r.x, r.y, r.w, r.h, {
          stroke: col(r.accent),
          roughness: 1.2,
          strokeWidth: 1.3,
          ...(r.solid ? {} : { strokeLineDash: [6, 6] }),
          ...(r.fill
            ? {
                fill: col(r.accent),
                fillStyle: "hachure" as const,
                fillWeight: 0.6,
                hachureGap: 10,
              }
            : {}),
        }),
      );
      if (r.label) {
        h.text(r.x + 8, r.y + 15, r.label, {
          size: 11,
          anchor: "start",
          weight: 600,
          color: r.accent ? col(r.accent) : undefined,
        });
      }
    }

    // 2. Arrows.
    for (const a of scene.arrows ?? []) {
      const [x1, y1] = a.from;
      const [x2, y2] = a.to;
      const style = {
        stroke: col(a.accent),
        roughness: 1.1,
        strokeWidth: 1.5,
        ...(a.dashed ? { strokeLineDash: [7, 6] } : {}),
      };
      svg.appendChild(rc.line(x1, y1, x2, y2, style));
      const head = { stroke: col(a.accent), roughness: 1.1, strokeWidth: 1.5 };
      const ang = Math.atan2(y2 - y1, x2 - x1);
      drawHead(rc, svg, x2, y2, ang, head);
      if (a.both) drawHead(rc, svg, x1, y1, ang + Math.PI, head);
      if (a.label) {
        h.text((x1 + x2) / 2 + (a.labelDx ?? 0), (y1 + y2) / 2 + (a.labelDy ?? -6), a.label, {
          size: 11,
          color: a.accent ? col(a.accent) : undefined,
          opacity: a.accent ? 1 : 0.85,
        });
      }
    }

    // 3. Boxes + their text.
    for (const b of scene.boxes ?? []) {
      const stroke = col(b.accent);
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
      const blockTop = b.y + b.h / 2 - (lineCount * 13) / 2;
      if (b.title) {
        h.text(cx, blockTop + 5, b.title, { weight: 600, size: 13, mono: b.mono });
      }
      b.lines?.forEach((ln, i) => {
        h.text(cx, blockTop + 20 + i * 13, ln, { size: 10, opacity: 0.7, mono: true });
      });
    }

    // 4. Polylines (waveforms / custom shapes).
    for (const p of scene.polylines ?? []) {
      svg.appendChild(
        rc.linearPath(p.points, {
          stroke: col(p.accent),
          roughness: 0.8,
          strokeWidth: p.width ?? 1.8,
          ...(p.dashed ? { strokeLineDash: [5, 5] } : {}),
        }),
      );
    }

    // 5. Signals (generated waveforms).
    for (const s of scene.signals ?? []) {
      const pts = signalPoints(s);
      svg.appendChild(
        rc.linearPath(pts, { stroke: col(s.accent), roughness: 0.7, strokeWidth: 1.9 }),
      );
      const cw = s.width / s.bits.length;
      if (s.showBits) {
        for (let i = 0; i < s.bits.length; i++) {
          h.text(s.x + i * cw + cw / 2, s.y - 8, s.bits[i]!, { size: 12, mono: true, weight: 600 });
        }
        // faint cell-boundary ticks
        for (let i = 0; i <= s.bits.length; i++) {
          svg.appendChild(
            rc.line(s.x + i * cw, s.y - 4, s.x + i * cw, s.y + s.height + 4, {
              stroke: "currentColor",
              roughness: 0.5,
              strokeWidth: 0.5,
              strokeLineDash: [2, 3],
            }),
          );
        }
      }
      if (s.label) h.text(s.x - 8, s.y + s.height / 2 + 4, s.label, { size: 11, anchor: "end" });
    }

    // 6. Dots (constellations / points).
    for (const d of scene.dots ?? []) {
      const c = col(d.accent);
      svg.appendChild(
        rc.circle(d.x, d.y, (d.r ?? 4) * 2, {
          stroke: c,
          fill: c,
          fillStyle: "solid",
          roughness: 0.6,
          strokeWidth: 1,
        }),
      );
      if (d.label) h.text(d.x, d.y - 8, d.label, { size: 9, mono: true, opacity: 0.7 });
    }

    // 7. Brackets (span labels).
    for (const br of scene.brackets ?? []) {
      const depth = br.depth ?? 7;
      const sign = br.dir === "up" ? -1 : 1;
      const y = br.y;
      const pts: [number, number][] = [
        [br.x, y],
        [br.x, y + sign * depth],
        [br.x + br.w, y + sign * depth],
        [br.x + br.w, y],
      ];
      svg.appendChild(
        rc.linearPath(pts, { stroke: col(br.accent), roughness: 0.8, strokeWidth: 1.3 }),
      );
      if (br.label) {
        h.text(br.x + br.w / 2, y + sign * depth + (br.dir === "up" ? -6 : 14), br.label, {
          size: 11,
          weight: 600,
          color: br.accent ? col(br.accent) : undefined,
        });
      }
    }

    // 8. Free notes (always on top).
    for (const n of scene.notes ?? []) {
      h.text(n.x, n.y, n.text, {
        size: n.size ?? 12,
        anchor: n.anchor ?? "middle",
        mono: n.mono,
        weight: n.weight,
        opacity: n.opacity,
        color: n.accent ? col(n.accent) : undefined,
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

/** Exposed for unit tests: the generated waveform points for a signal spec. */
export const __signalPoints = signalPoints;
