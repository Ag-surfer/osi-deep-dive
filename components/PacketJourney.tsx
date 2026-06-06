"use client";

import { useState } from "react";
import { LAYERS_TOP_DOWN } from "@/lib/layers";

type Side = "client" | "network" | "server";

interface Step {
  side: Side;
  layer: number | null;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    side: "client",
    layer: 7,
    title: "Resolve the name (DNS)",
    body: "You enter https://example.com. Before anything else, the Application layer asks DNS to turn example.com into an IP address (e.g. 192.0.2.10) via a UDP query to a resolver.",
  },
  {
    side: "client",
    layer: 7,
    title: "Build the HTTP request",
    body: "The browser forms an HTTP request: GET / HTTP/1.1, Host: example.com, plus headers. This is the Application-layer message — the payload everything below will carry.",
  },
  {
    side: "client",
    layer: 6,
    title: "Encrypt with TLS",
    body: "Because it's HTTPS, the Presentation layer wraps the request in TLS — encrypting it and ensuring integrity, after a TLS handshake negotiated keys.",
  },
  {
    side: "client",
    layer: 4,
    title: "Segment it (TCP)",
    body: "The Transport layer prepends a TCP header: source/destination ports (→443), sequence numbers, window. A three-way handshake already established the connection. The PDU is now a segment.",
  },
  {
    side: "client",
    layer: 3,
    title: "Address & route (IP)",
    body: "The Network layer prepends an IP header — source IP and destination 192.0.2.10 — and consults its routing table to pick the next hop. The PDU is now a packet.",
  },
  {
    side: "client",
    layer: 2,
    title: "Frame for the first hop (MAC)",
    body: "The Data Link layer wraps the packet in an Ethernet frame addressed to the default gateway's MAC (found via ARP), with an FCS trailer. The destination MAC is the next hop, not the server.",
  },
  {
    side: "client",
    layer: 1,
    title: "Onto the wire (bits)",
    body: "The Physical layer encodes the frame as signals — electrical pulses, light, or radio — and the bits leave your device.",
  },
  {
    side: "network",
    layer: null,
    title: "Hop by hop through routers",
    body: "Each router strips the frame (L2), reads the IP header (L3), decrements TTL, looks up the next hop, and re-frames the packet for the next link (L2 again) — repeating until the destination network. The IP addresses stay fixed; the MAC addresses change every hop.",
  },
  {
    side: "server",
    layer: 1,
    title: "Arrive & climb the stack",
    body: "At the server, bits become a frame (L1→L2), the frame's packet is extracted (L3), the segment reassembled (L4), TLS decrypted (L6) — de-encapsulation is the mirror image of the sender's encapsulation.",
  },
  {
    side: "server",
    layer: 7,
    title: "Server responds",
    body: "The web server's Application layer handles GET / and produces 200 OK with the HTML. The whole journey now runs in reverse, back to your browser — which renders the page.",
  },
];

export function PacketJourney() {
  const [i, setI] = useState(0);
  const step = STEPS[i]!;

  return (
    <div className="rounded-lg border p-4 sm:p-6" style={{ borderColor: "var(--border)" }}>
      {/* Three zones: client stack · network · server stack */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <Stack side="client" active={step} label="Your device" />
        <div className="flex flex-col items-center text-center">
          <div
            className="rounded-full border px-3 py-6 text-xs sm:px-4"
            style={{
              borderColor: step.side === "network" ? "var(--color-layer-3)" : "var(--border)",
              backgroundColor: step.side === "network" ? "var(--bg-soft)" : "transparent",
              color: "var(--fg-muted)",
            }}
          >
            ☁
            <br />
            routers
          </div>
        </div>
        <Stack side="server" active={step} label="Web server" />
      </div>

      {/* Narrative */}
      <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-lg font-semibold">{step.title}</h3>
          <span className="shrink-0 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
            {i + 1} / {STEPS.length}
          </span>
        </div>
        <p className="mt-2 min-h-[4.5rem] text-sm leading-relaxed">{step.body}</p>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
            style={{ borderColor: "var(--border)" }}
          >
            ◀ Back
          </button>
          <button
            type="button"
            onClick={() => setI((n) => Math.min(STEPS.length - 1, n + 1))}
            disabled={i === STEPS.length - 1}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--color-layer-3)" }}
          >
            Next ▶
          </button>
          <div className="ml-auto flex gap-1" aria-hidden>
            {STEPS.map((_, n) => (
              <span
                key={n}
                className="h-1.5 w-1.5 rounded-full transition-colors"
                style={{ backgroundColor: n === i ? "var(--color-layer-3)" : "var(--border)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stack({ side, active, label }: { side: Side; active: Step; label: string }) {
  const isActiveSide = active.side === side;
  return (
    <div>
      <p className="mb-2 text-center text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
        {label}
      </p>
      <ol className="space-y-1">
        {LAYERS_TOP_DOWN.map((l) => {
          const on = isActiveSide && active.layer === l.number;
          return (
            <li
              key={l.slug}
              className="flex items-center gap-2 rounded px-2 py-1 text-xs transition-all"
              style={{
                backgroundColor: on ? "var(--bg-soft)" : "transparent",
                outline: on ? `2px solid ${l.color}` : "none",
                opacity: on ? 1 : 0.45,
              }}
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded font-mono text-[10px] font-bold text-white"
                style={{ backgroundColor: l.color }}
              >
                {l.number}
              </span>
              <span className={on ? "font-semibold" : undefined}>{l.name}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
