"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";
import { LAYERS } from "@/lib/layers";

/** Layer filter values: null = all, 0 = cross-cutting, 1–7 = that layer. */
type LayerFilter = number | null;

/** Searchable glossary with layer-filter chips and per-term layer tags linking back to layer pages. */
export function GlossaryList() {
  const [q, setQ] = useState("");
  const [layerFilter, setLayerFilter] = useState<LayerFilter>(null);

  const entries = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = GLOSSARY.filter((e) => {
      if (layerFilter !== null && e.layer !== layerFilter) return false;
      if (!needle) return true;
      return e.term.toLowerCase().includes(needle) || e.def.toLowerCase().includes(needle);
    });
    return [...list].sort((a, b) => a.term.localeCompare(b.term));
  }, [q, layerFilter]);

  const chips: { value: LayerFilter; label: string; color?: string }[] = [
    { value: null, label: "All" },
    ...LAYERS.map((l) => ({ value: l.number, label: `L${l.number}`, color: l.color })),
    { value: 0, label: "Cross-cutting" },
  ];

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search terms…"
        aria-label="Search glossary"
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
      />
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by layer">
        {chips.map((chip) => {
          const active = layerFilter === chip.value;
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => setLayerFilter(chip.value)}
              className="rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors"
              style={
                active
                  ? chip.color
                    ? {
                        backgroundColor: chip.color,
                        borderColor: chip.color,
                        color: "var(--on-accent)",
                      }
                    : // No layer color (All / Cross-cutting): invert fg/bg for contrast.
                      {
                        backgroundColor: "var(--fg)",
                        borderColor: "var(--fg)",
                        color: "var(--bg)",
                      }
                  : { borderColor: chip.color ?? "var(--border)", color: "var(--fg-muted)" }
              }
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs" style={{ color: "var(--fg-muted)" }} aria-live="polite">
        {entries.length} term{entries.length === 1 ? "" : "s"}
      </p>

      <dl className="mt-4 space-y-3">
        {entries.map((e) => {
          const layer = LAYERS.find((l) => l.number === e.layer);
          return (
            <div
              key={e.term}
              className="rounded-lg border p-3"
              style={{ borderColor: "var(--border)" }}
            >
              <dt className="flex items-center gap-2">
                <span className="font-mono font-semibold">{e.term}</span>
                {layer ? (
                  <Link
                    href={`/layers/${layer.slug}/`}
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: layer.color, color: "var(--on-accent)" }}
                  >
                    L{layer.number} {layer.name}
                  </Link>
                ) : (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: "var(--bg-soft)", color: "var(--fg-muted)" }}
                  >
                    cross-cutting
                  </span>
                )}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {e.def}
              </dd>
            </div>
          );
        })}
      </dl>
      {entries.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          No terms match &ldquo;{q}&rdquo;.
        </p>
      ) : null}
    </div>
  );
}
