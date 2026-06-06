import { LAYERS_TOP_DOWN } from "@/lib/layers";

/** Side-by-side mapping of the 7-layer OSI model to the 4-layer TCP/IP model. */
export function OsiTcpIpMap() {
  // TCP/IP groupings, top-down, with how many OSI layers each spans.
  const tcpip = [
    { name: "Application", span: 3, note: "L7–L5", color: "var(--color-layer-6)" },
    { name: "Transport", span: 1, note: "L4", color: "var(--color-layer-4)" },
    { name: "Internet", span: 1, note: "L3", color: "var(--color-layer-3)" },
    { name: "Link", span: 2, note: "L2–L1", color: "var(--color-layer-2)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* OSI column */}
      <div>
        <p className="mb-2 text-center text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
          OSI · 7 layers
        </p>
        <div className="grid grid-rows-7 gap-1">
          {LAYERS_TOP_DOWN.map((l) => (
            <div
              key={l.slug}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white"
              style={{ backgroundColor: l.color }}
            >
              <span className="font-mono text-xs font-bold">{l.number}</span>
              <span>{l.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TCP/IP column */}
      <div>
        <p className="mb-2 text-center text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
          TCP/IP · 4 layers
        </p>
        <div className="grid grid-rows-7 gap-1">
          {tcpip.map((t) => (
            <div
              key={t.name}
              className="flex flex-col items-center justify-center rounded border px-3 text-center"
              style={{ gridRow: `span ${t.span} / span ${t.span}`, borderColor: t.color }}
            >
              <span className="text-sm font-semibold">{t.name}</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--fg-muted)" }}>
                {t.note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
