"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";
import { LAYERS } from "@/lib/layers";

/** Searchable glossary with per-term layer tags linking back to layer pages. */
export function GlossaryList() {
  const [q, setQ] = useState("");

  const entries = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? GLOSSARY.filter(
          (e) => e.term.toLowerCase().includes(needle) || e.def.toLowerCase().includes(needle),
        )
      : GLOSSARY;
    return [...list].sort((a, b) => a.term.localeCompare(b.term));
  }, [q]);

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
      <p className="mt-2 text-xs" style={{ color: "var(--fg-muted)" }}>
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
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: layer.color }}
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
        {entries.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            No terms match &ldquo;{q}&rdquo;.
          </p>
        ) : null}
      </dl>
    </div>
  );
}
