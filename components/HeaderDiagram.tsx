"use client";

import { useState } from "react";

export interface HeaderField {
  /** Field name, e.g. "Source Address". */
  name: string;
  /** Width in bits. For variable-length fields, give a nominal display width and set `variable`. */
  bits: number;
  /** Field explanation shown in the detail panel. */
  desc?: string;
  /** Mark variable/optional fields (rendered with a dashed border + "var"). */
  variable?: boolean;
}

interface Segment {
  field: HeaderField;
  fieldIndex: number;
  bits: number; // bits of this field in this row
  startBit: number; // bit offset within the row (0..wordBits)
}

/**
 * Renders a packet/frame header as a bit-accurate field diagram, in the style of
 * the ASCII header diagrams in RFCs (default 32 bits per row). Fields flow left
 * to right and wrap across words; clicking a field reveals its description.
 */
export function HeaderDiagram({
  title,
  fields,
  wordBits = 32,
}: {
  title?: string;
  fields: HeaderField[];
  wordBits?: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const rows = layoutRows(fields, wordBits);

  return (
    <div className="my-6">
      {title ? <p className="mb-2 text-sm font-semibold">{title}</p> : null}

      {/* Bit ruler */}
      <div
        className="grid font-mono text-[10px]"
        style={{
          gridTemplateColumns: `repeat(${wordBits}, minmax(0, 1fr))`,
          color: "var(--fg-muted)",
        }}
        aria-hidden
      >
        {Array.from({ length: wordBits }, (_, i) => (
          <span
            key={i}
            className="border-b pb-0.5 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            {i % 4 === 0 || i === wordBits - 1 ? i : ""}
          </span>
        ))}
      </div>

      {/* Field rows */}
      <div
        className="overflow-hidden rounded-b-md border border-t-0"
        style={{ borderColor: "var(--border)" }}
      >
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="grid"
            style={{ gridTemplateColumns: `repeat(${wordBits}, minmax(0, 1fr))` }}
          >
            {row.map((seg, si) => {
              const isSel = selected === seg.fieldIndex;
              const color = FIELD_COLORS[seg.fieldIndex % FIELD_COLORS.length];
              return (
                <button
                  key={si}
                  type="button"
                  onClick={() => setSelected(isSel ? null : seg.fieldIndex)}
                  title={`${seg.field.name} — ${seg.field.bits} bit${seg.field.bits === 1 ? "" : "s"}`}
                  className="min-w-0 border px-1 py-2 text-center text-[11px] leading-tight transition-colors"
                  style={{
                    gridColumn: `span ${seg.bits} / span ${seg.bits}`,
                    borderColor: "var(--bg)",
                    borderStyle: seg.field.variable ? "dashed" : "solid",
                    backgroundColor: isSel
                      ? color
                      : `color-mix(in oklch, ${color} 22%, var(--bg-soft))`,
                    color: isSel ? "white" : "var(--fg)",
                    outline: isSel ? `2px solid ${color}` : "none",
                  }}
                >
                  <span className="block truncate font-medium">{seg.field.name}</span>
                  <span className="block opacity-70">
                    {seg.field.variable ? "var" : seg.field.bits}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <div
        className="mt-2 min-h-[3rem] rounded-md border p-3 text-sm"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
        aria-live="polite"
      >
        {selected === null ? (
          <span style={{ color: "var(--fg-muted)" }}>
            Click a field to read what it does. Dashed fields are variable-length.
          </span>
        ) : (
          <div>
            <p className="font-semibold">
              {fields[selected]?.name}{" "}
              <span className="font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
                · {fields[selected]?.variable ? "variable" : `${fields[selected]?.bits} bits`}
              </span>
            </p>
            {fields[selected]?.desc ? (
              <p className="mt-1 leading-relaxed">{fields[selected]?.desc}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/** Split fields into rows of `wordBits`, breaking any field that crosses a row boundary. */
export function layoutRows(fields: HeaderField[], wordBits: number): Segment[][] {
  const rows: Segment[][] = [];
  let row: Segment[] = [];
  let cursor = 0; // bits filled in the current row

  fields.forEach((field, fieldIndex) => {
    let remaining = Math.max(1, field.bits);
    while (remaining > 0) {
      const space = wordBits - cursor;
      const take = Math.min(remaining, space);
      row.push({ field, fieldIndex, bits: take, startBit: cursor });
      cursor += take;
      remaining -= take;
      if (cursor >= wordBits) {
        rows.push(row);
        row = [];
        cursor = 0;
      }
    }
  });
  if (row.length) rows.push(row);
  return rows;
}

// Distinct field tints (OKLCH) cycled across fields for visual separation.
const FIELD_COLORS = [
  "oklch(0.62 0.17 25)",
  "oklch(0.68 0.15 60)",
  "oklch(0.7 0.14 130)",
  "oklch(0.66 0.12 195)",
  "oklch(0.62 0.15 250)",
  "oklch(0.58 0.17 300)",
  "oklch(0.6 0.18 340)",
];
