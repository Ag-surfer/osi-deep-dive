import type { ReactNode } from "react";

/**
 * Wrapper for hand-authored animated SVG diagrams. The SVG is a server component
 * (no client JS) animated purely with CSS — so it is static-export friendly,
 * theme-aware (via currentColor / CSS vars), and auto-respects
 * prefers-reduced-motion (the global rule in globals.css disables the animation,
 * leaving a readable resting state). Always pass a `summary` for screen readers.
 */
export function AnimatedFigure({
  children,
  caption,
  summary,
}: {
  children: ReactNode;
  caption?: ReactNode;
  summary?: string;
}) {
  return (
    <figure className="my-8">
      <div
        className="overflow-x-auto rounded-lg border p-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
        role="img"
        aria-label={summary ?? (typeof caption === "string" ? caption : "Animated diagram")}
      >
        {children}
      </div>
      {summary ? <p className="sr-only">{summary}</p> : null}
      {caption ? (
        <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
