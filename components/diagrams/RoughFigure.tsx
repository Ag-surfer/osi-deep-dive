"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";
import type { RoughSVG } from "roughjs/bin/svg";

const SVGNS = "http://www.w3.org/2000/svg";

/**
 * Hand-drawn (Excalidraw-style) accent palette for diagrams. rough.js writes the
 * stroke as an SVG *attribute*, where CSS `var(--…)` is not valid — so diagrams
 * use `currentColor` (theme-aware, inherits the page text color) for line work
 * and these fixed hex accents that read well in both light and dark themes.
 */
export const SKETCH: Record<string, string> = {
  l1: "#e0524d",
  l2: "#e08a3c",
  l3: "#4fa15e",
  l4: "#3fa6a0",
  l5: "#5a7fd6",
  l6: "#8a63c9",
  l7: "#c45aa8",
};

export interface SvgHelpers {
  /** Append an SVG <text> label. */
  text: (
    x: number,
    y: number,
    content: string,
    opts?: {
      size?: number;
      anchor?: "start" | "middle" | "end";
      weight?: number;
      mono?: boolean;
      color?: string;
      opacity?: number;
    },
  ) => void;
}

export type RoughDraw = (rc: RoughSVG, svg: SVGSVGElement, h: SvgHelpers) => void;

/**
 * Renders a static hand-drawn diagram via rough.js. The draw callback runs once
 * on mount (client-only — rough needs the DOM), so it is fully compatible with
 * static export: the page prerenders an empty <svg> that fills in on hydration.
 * Pass a module-scope `draw` for stable identity.
 */
export function RoughFigure({
  width,
  height,
  draw,
  caption,
}: {
  width: number;
  height: number;
  draw: RoughDraw;
  caption?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.replaceChildren();
    const rc = rough.svg(svg);
    const helpers: SvgHelpers = {
      text(x, y, content, opts = {}) {
        const t = document.createElementNS(SVGNS, "text");
        t.setAttribute("x", String(x));
        t.setAttribute("y", String(y));
        t.setAttribute("text-anchor", opts.anchor ?? "middle");
        t.setAttribute("font-size", String(opts.size ?? 13));
        t.setAttribute("fill", opts.color ?? "currentColor");
        if (opts.weight) t.setAttribute("font-weight", String(opts.weight));
        if (opts.opacity != null) t.setAttribute("opacity", String(opts.opacity));
        t.setAttribute("font-family", opts.mono ? "var(--font-mono)" : "var(--font-sans)");
        t.textContent = content;
        svg.appendChild(t);
      },
    };
    draw(rc, svg, helpers);
  }, [draw, width, height]);

  return (
    <figure className="my-8">
      <div
        className="overflow-x-auto rounded-lg border p-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
      >
        <svg
          ref={ref}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width, color: "var(--fg)" }}
          role="img"
          aria-label={caption ?? "diagram"}
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
