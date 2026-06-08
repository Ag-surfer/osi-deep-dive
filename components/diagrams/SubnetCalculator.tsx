"use client";

import { useId, useMemo, useState } from "react";
import { SKETCH } from "./RoughFigure";
import { subnetInfo } from "@/lib/algorithms/subnet";

const GREEN = SKETCH.l3!; // network bits

/** Render a 32-bit binary string (octets dotted) with the leading `prefix` bits
 *  colored as the network portion and the rest as host. */
function BinaryRow({ binary, prefix, label }: { binary: string; prefix: number; label: string }) {
  const bits = binary.replace(/\./g, "").split("");
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className="w-16 shrink-0 text-xs" style={{ color: "var(--fg-muted)" }}>
        {label}
      </span>
      <span className="font-mono text-[13px] leading-6">
        {bits.map((b, i) => (
          <span key={i}>
            <span
              style={{
                color: i < prefix ? GREEN : "var(--fg-muted)",
                fontWeight: i < prefix ? 700 : 400,
              }}
            >
              {b}
            </span>
            {i % 8 === 7 && i !== 31 ? <span style={{ color: "var(--fg-muted)" }}>.</span> : null}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * A fully interactive IPv4 subnet calculator: type a CIDR (e.g. 192.168.1.10/26)
 * and the network/broadcast/usable range, masks, class, scope, and a binary
 * network/host split recompute live. Unlike the stepped diagrams, this is a
 * manipulable tool — change the input and everything updates instantly.
 */
export function SubnetCalculator({ initial = "192.168.1.10/26" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const info = useMemo(() => subnetInfo(value), [value]);
  const inputId = useId();

  const facts: [string, string][] = info.valid
    ? [
        ["Network", info.network],
        ["Broadcast", info.broadcast],
        ["Usable range", `${info.firstHost} – ${info.lastHost}`],
        ["Usable hosts", info.usableHosts.toLocaleString()],
        ["Total addresses", info.totalAddresses.toLocaleString()],
        ["Subnet mask", info.mask],
        ["Wildcard", info.wildcard],
        [
          "Class · scope",
          `${info.ipClass} · ${info.note ?? (info.isPrivate ? "Private" : "Public")}`,
        ],
      ]
    : [];

  return (
    <figure className="my-8">
      <div
        className="rounded-lg border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
      >
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <label htmlFor={inputId} className="mb-1 block text-sm font-semibold">
            Subnet calculator — try your own CIDR
          </label>
          <input
            id={inputId}
            value={value}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={!info.valid}
            className="w-full max-w-xs rounded-md border px-3 py-1.5 font-mono text-sm"
            style={{
              borderColor: info.valid ? "var(--border)" : "var(--color-layer-1)",
              backgroundColor: "var(--bg)",
              color: "var(--fg)",
            }}
            placeholder="192.168.1.10/26"
          />
        </div>

        {info.valid ? (
          <div className="p-4">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 border-b pb-1.5"
                  style={{ borderColor: "var(--border)" }}
                >
                  <dt className="text-sm" style={{ color: "var(--fg-muted)" }}>
                    {k}
                  </dt>
                  <dd className="font-mono text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 space-y-1 overflow-x-auto">
              <BinaryRow binary={info.ipBinary} prefix={info.prefix} label="address" />
              <BinaryRow binary={info.maskBinary} prefix={info.prefix} label="mask" />
              <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
                <span style={{ color: GREEN, fontWeight: 700 }}>Green</span> = the {info.prefix}{" "}
                network bits (fixed by the mask); grey = the {32 - info.prefix} host bits.
              </p>
            </div>
          </div>
        ) : (
          <p className="px-4 py-3 text-sm" style={{ color: "var(--color-layer-1)" }}>
            {info.error}
          </p>
        )}
      </div>
      <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
        Edit the address or prefix and watch the network, broadcast, host range, and binary split
        update live.
      </figcaption>
    </figure>
  );
}
