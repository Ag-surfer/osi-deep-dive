"use client";

import Link from "next/link";
import { useState } from "react";
import { LAYERS_TOP_DOWN, type LayerMeta } from "@/lib/layers";

/**
 * Interactive 7-layer stack for the home page. Hovering/focusing a layer
 * reveals its essence; clicking navigates to the deep-dive page. The flanking
 * rails show the two directions data moves through the stack.
 */
export function LayerStack() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex items-stretch gap-3">
      <DirectionRail direction="down" />
      <ol className="flex-1 space-y-1.5" aria-label="OSI model layers, top to bottom">
        {LAYERS_TOP_DOWN.map((l) => (
          <StackRow
            key={l.slug}
            layer={l}
            active={active === l.number}
            onActivate={() => setActive(l.number)}
            onDeactivate={() => setActive((cur) => (cur === l.number ? null : cur))}
          />
        ))}
      </ol>
      <DirectionRail direction="up" />
    </div>
  );
}

function StackRow({
  layer,
  active,
  onActivate,
  onDeactivate,
}: {
  layer: LayerMeta;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <li>
      <Link
        href={`/layers/${layer.slug}/`}
        onMouseEnter={onActivate}
        onMouseLeave={onDeactivate}
        onFocus={onActivate}
        onBlur={onDeactivate}
        className="group block rounded-lg border p-px transition-all"
        style={{
          borderColor: active ? layer.color : "var(--border)",
          boxShadow: active ? `0 0 0 1px ${layer.color}` : "none",
        }}
      >
        <div className="flex items-center gap-4 rounded-[7px] px-4 py-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-mono text-lg font-bold"
            style={{ backgroundColor: layer.color, color: "var(--on-accent)" }}
          >
            {layer.number}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-base font-semibold">{layer.name}</h3>
              <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
                {layer.pdu}
              </span>
            </div>
            <p
              className="mt-0.5 truncate text-sm transition-all group-hover:whitespace-normal"
              style={{ color: "var(--fg-muted)" }}
            >
              {layer.tagline}
            </p>
          </div>
          <span
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: layer.color }}
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

/** A vertical rail annotating the direction data moves through the stack. */
function DirectionRail({ direction }: { direction: "down" | "up" }) {
  const isDown = direction === "down";
  return (
    <div
      className="hidden w-20 flex-col items-center justify-center text-center sm:flex"
      style={{ color: "var(--fg-muted)" }}
    >
      <span className="text-2xl" aria-hidden>
        {isDown ? "↓" : "↑"}
      </span>
      <span className="mt-1 text-[11px] leading-tight">
        {isDown ? (
          <>
            Sender
            <br />
            encapsulates
          </>
        ) : (
          <>
            Receiver
            <br />
            de-encapsulates
          </>
        )}
      </span>
    </div>
  );
}
