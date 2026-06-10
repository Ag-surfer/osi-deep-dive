"use client";

import { useState } from "react";
import { FRAMES, fieldAt, type CaptureField } from "@/lib/capture";
import { LAYERS } from "@/lib/layers";

const BYTES_PER_ROW = 16;

function layerColor(layer: number): string {
  return LAYERS.find((l) => l.number === layer)?.color ?? "var(--border)";
}

function layerName(layer: number): string {
  return LAYERS.find((l) => l.number === layer)?.name ?? "";
}

function hex(b: number): string {
  return b.toString(16).padStart(2, "0");
}

function printable(b: number): string {
  return b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : "·";
}

/**
 * Interactive byte-level walkthrough of a real five-frame TCP conversation.
 * Pick a frame, then click any byte to decode its protocol field. Real
 * buttons throughout, so tap and keyboard work by construction.
 */
export function PacketWalkthrough() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [selected, setSelected] = useState<CaptureField | null>(null);
  const frame = FRAMES[frameIdx]!;

  const rows: number[][] = [];
  for (let i = 0; i < frame.bytes.length; i += BYTES_PER_ROW) {
    rows.push(frame.bytes.slice(i, i + BYTES_PER_ROW));
  }

  const isSelected = (offset: number) =>
    selected !== null && offset >= selected.start && offset < selected.start + selected.length;

  function pickFrame(idx: number) {
    setFrameIdx(idx);
    setSelected(null);
  }

  return (
    <div>
      {/* Frame tabs — the conversation in order */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Frames in this conversation">
        {FRAMES.map((f, i) => {
          const active = i === frameIdx;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => pickFrame(i)}
              className="rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors"
              style={
                active
                  ? {
                      backgroundColor: "var(--fg)",
                      borderColor: "var(--fg)",
                      color: "var(--bg)",
                    }
                  : { borderColor: "var(--border)", color: "var(--fg-muted)" }
              }
            >
              <span className="font-mono">{i + 1}</span> · {f.label}{" "}
              <span aria-hidden>{f.direction === "client → server" ? "→" : "←"}</span>
              <span className="sr-only">({f.direction})</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {frame.summary}
      </p>

      {/* Layer legend / overview bar */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Layers in this frame">
        {frame.layerSpans.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setSelected(fieldAt(frame, s.start) ?? null)}
            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold"
            style={{ borderColor: layerColor(s.layer) }}
          >
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: layerColor(s.layer) }}
              aria-hidden
            />
            L{s.layer} {s.label}
            <span className="font-mono font-normal" style={{ color: "var(--fg-muted)" }}>
              {s.length} B
            </span>
          </button>
        ))}
      </div>

      {/* Hex dump */}
      <div
        className="mt-4 overflow-x-auto rounded-lg border p-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
      >
        <div className="min-w-max font-mono text-[13px] leading-6">
          {rows.map((row, ri) => {
            const base = ri * BYTES_PER_ROW;
            return (
              <div key={`${frame.id}-${ri}`} className="flex items-center gap-3">
                <span className="select-none" style={{ color: "var(--fg-muted)" }} aria-hidden>
                  {base.toString(16).padStart(4, "0")}
                </span>
                <span className="flex gap-1">
                  {row.map((b, bi) => {
                    const offset = base + bi;
                    const field = fieldAt(frame, offset)!;
                    const sel = isSelected(offset);
                    return (
                      <button
                        key={offset}
                        type="button"
                        onClick={() => setSelected(field)}
                        aria-label={`Byte ${offset}: 0x${hex(b)} — ${field.name}`}
                        aria-pressed={sel}
                        className="rounded px-0.5 transition-colors"
                        style={{
                          backgroundColor: sel
                            ? layerColor(field.layer)
                            : `color-mix(in oklch, ${layerColor(field.layer)} 16%, transparent)`,
                          color: sel ? "var(--on-accent)" : undefined,
                        }}
                      >
                        {hex(b)}
                      </button>
                    );
                  })}
                </span>
                <span
                  className="whitespace-pre select-none"
                  style={{ color: "var(--fg-muted)" }}
                  aria-hidden
                >
                  {row.map(printable).join("")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field detail panel */}
      <div
        className="mt-4 rounded-lg border p-4"
        style={{ borderColor: "var(--border)" }}
        role="status"
        aria-live="polite"
      >
        {selected ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
                style={{ backgroundColor: layerColor(selected.layer), color: "var(--on-accent)" }}
              >
                L{selected.layer} {layerName(selected.layer)}
              </span>
              <span className="font-semibold">{selected.name}</span>
              <span className="font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
                bytes {selected.start}–{selected.start + selected.length - 1} ·{" "}
                {frame.bytes
                  .slice(selected.start, selected.start + selected.length)
                  .map(hex)
                  .join(" ")}
              </span>
            </div>
            <p className="mt-2 font-mono text-sm">{selected.value}</p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {selected.desc}
            </p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Click any byte (or a layer above) to decode it. The colors mark which layer owns each
            byte — switch frames above to follow the whole conversation: handshake, request,
            response, close.
          </p>
        )}
      </div>

      {/* Full field index */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold">
          All {frame.fields.length} fields of this frame, in order
        </summary>
        <ul className="mt-2 space-y-1">
          {frame.fields.map((f) => (
            <li key={f.start}>
              <button
                type="button"
                onClick={() => setSelected(f)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-[var(--bg-soft)]"
              >
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: layerColor(f.layer) }}
                  aria-hidden
                />
                <span className="w-44 shrink-0 truncate font-medium sm:w-56">{f.name}</span>
                <span className="truncate font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
                  {f.value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
