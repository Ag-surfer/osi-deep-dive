"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Shared chrome for every step-driven algorithm diagram (SPF graph, BGP best-path
 * elimination, DUAL, …). It owns the current step index, autoplay, keyboard
 * stepping, the aria-live narration line, and the Prev/Next/Play/Restart
 * controls — so each algorithm viz only has to render the *visual* for a given
 * step index. Theme-aware and static-export safe; autoplay is suppressed under
 * prefers-reduced-motion, but manual stepping always works.
 */
export function StepPlayer({
  title,
  summary,
  caption,
  stepCount,
  renderStep,
  narration,
  controls,
  intervalMs = 1600,
}: {
  title?: string;
  /** Screen-reader description of the whole figure. */
  summary: string;
  caption?: ReactNode;
  stepCount: number;
  /** Render the visual for a given (clamped) step index. */
  renderStep: (index: number) => ReactNode;
  /** The narration shown in the aria-live status line for a step. */
  narration: (index: number) => ReactNode;
  /** Optional interactive inputs rendered under the title (e.g. an editable field). */
  controls?: ReactNode;
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const labelId = useId();

  const last = stepCount - 1;
  const cur = Math.min(i, last);

  // Autoplay: the state updates happen in the timeout callback (not synchronously
  // in the effect body), and playback stops itself at the final step.
  useEffect(() => {
    if (!playing || reduced || i >= last) return;
    const t = setTimeout(() => {
      setI((n) => Math.min(n + 1, last));
      if (i + 1 >= last) setPlaying(false);
    }, intervalMs);
    return () => clearTimeout(t);
  }, [playing, reduced, i, last, intervalMs]);

  const go = (n: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(n, last)));
  };

  const btn =
    "rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--bg-soft)] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <figure className="my-8">
      <div
        className="rounded-lg border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
        role="group"
        aria-labelledby={labelId}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(cur + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(cur - 1);
          }
        }}
        tabIndex={0}
      >
        <p id={labelId} className="sr-only">
          {title ? `${title}. ` : ""}
          {summary}
        </p>

        {title ? (
          <p
            className="border-b px-4 py-2 font-serif text-sm font-semibold"
            style={{ borderColor: "var(--border)" }}
          >
            {title}
          </p>
        ) : null}

        {controls ? (
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
            {controls}
          </div>
        ) : null}

        {renderStep(cur)}

        {/* Narration (announced to screen readers as steps change) */}
        <p
          className="border-t px-4 py-3 text-sm"
          style={{ borderColor: "var(--border)" }}
          role="status"
          aria-live="polite"
        >
          <span className="font-mono text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
            STEP {cur + 1}/{stepCount}
          </span>{" "}
          {narration(cur)}
        </p>

        {/* Controls */}
        <div
          className="flex flex-wrap items-center gap-2 border-t px-4 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            type="button"
            className={btn}
            style={{ borderColor: "var(--border)" }}
            onClick={() => go(0)}
            disabled={cur === 0}
          >
            ⏮ Restart
          </button>
          <button
            type="button"
            className={btn}
            style={{ borderColor: "var(--border)" }}
            onClick={() => go(cur - 1)}
            disabled={cur === 0}
          >
            ← Prev
          </button>
          {!reduced ? (
            <button
              type="button"
              className={btn}
              style={{ borderColor: "var(--border)" }}
              onClick={() => (cur >= last ? go(0) : setPlaying((p) => !p))}
            >
              {playing ? "⏸ Pause" : cur >= last ? "↻ Replay" : "▶ Play"}
            </button>
          ) : null}
          <button
            type="button"
            className={btn}
            style={{ borderColor: "var(--border)" }}
            onClick={() => go(cur + 1)}
            disabled={cur >= last}
          >
            Next →
          </button>
        </div>
      </div>

      {caption ? (
        <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
