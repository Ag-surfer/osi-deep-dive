"use client";

import { useState } from "react";
import { StepPlayer } from "./StepPlayer";

/**
 * Flagship animated concept: watch a message get wrapped in headers as it
 * descends the stack (encapsulation), the PDU renaming at each layer. Built on
 * the shared StepPlayer so it inherits Play/step/keyboard/a11y. Each header
 * segment animates its width in as its layer acts; hover a segment to see what it
 * adds. Pure CSS/SVG motion — theme-aware and within the perf budget.
 */

interface Segment {
  id: string;
  label: string;
  /** Width in px when shown (animates from 0). */
  width: number;
  /** CSS color token for the segment fill. */
  color: string;
  /** Text color over the fill. */
  text: string;
  /** Step index at which this segment first appears. */
  appearsAt: number;
  /** What this part is, shown on hover/selection. */
  desc: string;
}

// Left-to-right order of the final frame: [Eth | IP | TCP | Data | FCS].
const SEGMENTS: Segment[] = [
  {
    id: "eth",
    label: "Eth",
    width: 68,
    color: "var(--color-layer-2)",
    text: "var(--on-accent)",
    appearsAt: 3,
    desc: "Ethernet header — source/dest MAC, EtherType (Data Link, L2).",
  },
  {
    id: "ip",
    label: "IP",
    width: 64,
    color: "var(--color-layer-3)",
    text: "var(--on-accent)",
    appearsAt: 2,
    desc: "IP header — source/dest IP address, TTL, protocol (Network, L3).",
  },
  {
    id: "tcp",
    label: "TCP",
    width: 70,
    color: "var(--color-layer-4)",
    text: "var(--on-accent)",
    appearsAt: 1,
    desc: "TCP header — source/dest ports, sequence & ack numbers (Transport, L4).",
  },
  {
    id: "data",
    label: "Data",
    width: 132,
    color: "var(--bg-soft)",
    text: "var(--fg)",
    appearsAt: 0,
    desc: "The application's message (HTTP, etc.), already encoded/encrypted by L6–L5.",
  },
  {
    id: "fcs",
    label: "FCS",
    width: 52,
    color: "var(--color-layer-2)",
    text: "var(--on-accent)",
    appearsAt: 3,
    desc: "Frame Check Sequence — a CRC trailer the receiver uses to detect corruption (L2).",
  },
];

const STEPS = [
  {
    layer: "Application (L7–L5)",
    pdu: "Data",
    color: "var(--color-layer-7)",
    narration:
      "The application produces a message. Layers 7–5 format, (optionally) compress and encrypt it — the result is the Data payload everything else wraps around.",
  },
  {
    layer: "Transport (L4)",
    pdu: "Segment",
    color: "var(--color-layer-4)",
    narration:
      "Transport prepends a TCP header (ports + sequence/ack numbers) so the data reaches the right process reliably. The PDU is now a Segment.",
  },
  {
    layer: "Network (L3)",
    pdu: "Packet",
    color: "var(--color-layer-3)",
    narration:
      "Network prepends an IP header (source/dest addresses, TTL) so the data can be routed across networks. The PDU is now a Packet.",
  },
  {
    layer: "Data Link (L2)",
    pdu: "Frame",
    color: "var(--color-layer-2)",
    narration:
      "Data Link wraps it in an Ethernet header (MAC addresses) and appends an FCS trailer (a CRC). The PDU is now a Frame, ready for one physical link.",
  },
  {
    layer: "Physical (L1)",
    pdu: "Bits",
    color: "var(--color-layer-1)",
    narration:
      "Physical line-codes the whole frame into a signal — voltage, light, or radio — and clocks the Bits onto the medium. At the far end the process runs in reverse (decapsulation).",
  },
];

function Frame({
  step,
  selected,
  onSelect,
}: {
  step: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const physical = step >= 4;
  return (
    <div className="p-4">
      {/* Layer + PDU banner */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span
          className="rounded-md px-2.5 py-1 font-semibold transition-colors"
          style={{ backgroundColor: STEPS[step]!.color, color: "var(--on-accent)" }}
        >
          {STEPS[step]!.layer}
        </span>
        <span style={{ color: "var(--fg-muted)" }}>builds the</span>
        <span className="font-mono font-bold">{STEPS[step]!.pdu}</span>
      </div>

      {/* The growing PDU */}
      <div
        className="flex items-stretch justify-center transition-all duration-500"
        style={{ opacity: physical ? 0.35 : 1, filter: physical ? "blur(0.5px)" : "none" }}
      >
        {SEGMENTS.map((s) => {
          const shown = step >= s.appearsAt;
          const justAdded = step === s.appearsAt && step > 0;
          const isSel = selected === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onMouseEnter={() => onSelect(s.id)}
              onFocusCapture={() => onSelect(s.id)}
              onClick={() => onSelect(isSel ? null : s.id)}
              aria-label={`${s.label}: ${s.desc}`}
              className="flex h-14 shrink-0 items-center justify-center overflow-hidden border-y border-r font-mono text-sm font-semibold first:rounded-l-md first:border-l last:rounded-r-md"
              style={{
                width: shown ? s.width : 0,
                opacity: shown ? 1 : 0,
                backgroundColor: s.color,
                color: s.text,
                borderColor: "var(--border)",
                transition: "width 0.5s ease, opacity 0.4s ease, box-shadow 0.3s ease",
                boxShadow: justAdded || isSel ? "0 0 0 3px var(--fg) inset" : "none",
                cursor: "pointer",
              }}
            >
              {shown ? s.label : ""}
            </button>
          );
        })}
      </div>

      {/* Physical-layer signal strip */}
      {physical ? (
        <div className="mt-3 flex justify-center">
          <svg
            viewBox="0 0 360 36"
            width="360"
            style={{ maxWidth: "100%", color: "var(--color-layer-1)" }}
            aria-hidden
          >
            <polyline
              points="0,28 0,8 30,8 30,28 60,28 60,8 90,8 90,28 120,28 120,8 135,8 135,28 165,28 165,8 195,8 195,28 210,28 210,8 240,8 240,28 270,28 270,8 300,8 300,28 330,28 330,8 360,8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          </svg>
        </div>
      ) : null}

      {/* Hover/selection description */}
      <p className="mt-3 min-h-[2.5rem] text-center text-sm" style={{ color: "var(--fg-muted)" }}>
        {selected
          ? SEGMENTS.find((s) => s.id === selected)?.desc
          : "Hover or tap a segment to see what each layer adds."}
      </p>
    </div>
  );
}

export function EncapsulationExplorer({
  title = "Encapsulation — how a message is wrapped to cross the network",
  caption,
}: {
  title?: string;
  caption?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <StepPlayer
      title={title}
      summary="Interactive encapsulation walkthrough: step down the OSI stack and watch each layer wrap the message in its header — Data becomes a Segment (TCP), a Packet (IP), a Frame (Ethernet + FCS), then Bits on the wire. Hover a segment to see what it adds."
      caption={
        caption ??
        "Press Play (or step) to descend the stack. Each layer prepends its header — the PDU grows and is renamed Data → Segment → Packet → Frame → Bits. At the receiver the whole process runs in reverse."
      }
      stepCount={STEPS.length}
      narration={(i) => STEPS[i]?.narration ?? ""}
      renderStep={(i) => <Frame step={i} selected={selected} onSelect={setSelected} />}
    />
  );
}
