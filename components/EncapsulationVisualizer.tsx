"use client";

import { useEffect, useState } from "react";

type Kind = "data" | "l4" | "l3" | "l2" | "bits";

interface Stage {
  layer: number;
  pdu: string;
  desc: string;
  segments: { label: string; kind: Kind }[];
}

const COLOR: Record<Kind, string> = {
  data: "var(--fg-muted)",
  l4: "var(--color-layer-4)",
  l3: "var(--color-layer-3)",
  l2: "var(--color-layer-2)",
  bits: "var(--color-layer-1)",
};

const STAGES: Stage[] = [
  {
    layer: 7,
    pdu: "Data",
    desc: "Layers 7–5: the application produces the message; Presentation encodes/encrypts it; Session frames the dialogue. No wire headers yet — just data.",
    segments: [{ label: "Application Data", kind: "data" }],
  },
  {
    layer: 4,
    pdu: "Segment",
    desc: "Layer 4 (Transport) prepends a TCP header — source/dest ports, sequence numbers — turning the data into a segment.",
    segments: [
      { label: "TCP", kind: "l4" },
      { label: "Application Data", kind: "data" },
    ],
  },
  {
    layer: 3,
    pdu: "Packet",
    desc: "Layer 3 (Network) prepends an IP header — source/dest IP addresses — turning the segment into a packet.",
    segments: [
      { label: "IP", kind: "l3" },
      { label: "TCP", kind: "l4" },
      { label: "Application Data", kind: "data" },
    ],
  },
  {
    layer: 2,
    pdu: "Frame",
    desc: "Layer 2 (Data Link) wraps the packet in a frame — a MAC header in front and an FCS (CRC) trailer behind for error detection.",
    segments: [
      { label: "Eth", kind: "l2" },
      { label: "IP", kind: "l3" },
      { label: "TCP", kind: "l4" },
      { label: "Application Data", kind: "data" },
      { label: "FCS", kind: "l2" },
    ],
  },
  {
    layer: 1,
    pdu: "Bits",
    desc: "Layer 1 (Physical) serializes the frame into signals on the medium — the whole structure becomes a stream of 1s and 0s.",
    segments: [{ label: "0100101101000110100…", kind: "bits" }],
  },
];

export function EncapsulationVisualizer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stage = STAGES[step]!;

  // Auto-advance while playing (setState in a timer callback is the allowed pattern).
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= STAGES.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1400);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Mini stack */}
        <ol className="flex shrink-0 flex-col gap-1 sm:w-44">
          {[7, 6, 5, 4, 3, 2, 1].map((n) => {
            const active = stage.layer === n || (step === 0 && n >= 5);
            return (
              <li
                key={n}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors"
                style={{
                  backgroundColor: active ? "var(--bg-soft)" : "transparent",
                  opacity: active ? 1 : 0.5,
                }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded font-mono text-[11px] font-bold text-white"
                  style={{ backgroundColor: `var(--color-layer-${n})` }}
                >
                  {n}
                </span>
                <span className={stage.layer === n ? "font-semibold" : undefined}>L{n}</span>
              </li>
            );
          })}
        </ol>

        {/* PDU assembly */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="font-serif text-lg font-semibold">{stage.pdu}</p>
            <span className="font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
              step {step + 1} / {STAGES.length}
            </span>
          </div>

          <div className="mt-2 flex overflow-hidden rounded-md">
            {stage.segments.map((seg) => (
              <div
                key={seg.label}
                className="border-r px-2 py-3 text-center text-xs font-medium text-white transition-all last:border-r-0"
                style={{
                  backgroundColor: COLOR[seg.kind],
                  borderColor: "var(--bg)",
                  flex: seg.kind === "data" || seg.kind === "bits" ? "1 1 auto" : "0 0 auto",
                  color: seg.kind === "data" ? "var(--fg)" : "white",
                  fontFamily: seg.kind === "bits" ? "var(--font-mono)" : undefined,
                }}
              >
                {seg.label}
              </div>
            ))}
          </div>

          <p
            className="mt-3 min-h-[3.5rem] text-sm leading-relaxed"
            style={{ color: "var(--fg-muted)" }}
          >
            {stage.desc}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3"
        style={{ borderColor: "var(--border)" }}
      >
        <ControlButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ◀ Back
        </ControlButton>
        <ControlButton
          onClick={() => setStep((s) => Math.min(STAGES.length - 1, s + 1))}
          disabled={step === STAGES.length - 1}
        >
          Next ▶
        </ControlButton>
        <ControlButton
          onClick={() => {
            if (step === STAGES.length - 1) setStep(0);
            setPlaying((p) => !p);
          }}
          primary
        >
          {playing ? "❚❚ Pause" : "▶ Play"}
        </ControlButton>
        <ControlButton
          onClick={() => {
            setPlaying(false);
            setStep(0);
          }}
        >
          ↺ Reset
        </ControlButton>
        <span className="ml-auto text-xs" style={{ color: "var(--fg-muted)" }}>
          De-encapsulation is the exact reverse on the receiver.
        </span>
      </div>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40"
      style={{
        borderColor: "var(--border)",
        backgroundColor: primary ? "var(--color-layer-3)" : "transparent",
        color: primary ? "white" : "var(--fg)",
      }}
    >
      {children}
    </button>
  );
}
