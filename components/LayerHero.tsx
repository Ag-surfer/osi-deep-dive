import type { LayerMeta } from "@/lib/layers";

/** The "at-a-glance" header shown at the top of every layer page. */
export function LayerHero({ layer }: { layer: LayerMeta }) {
  const facts: [string, string][] = [
    ["PDU", layer.pdu],
    ["Addressing", layer.addressing],
    ["Key protocols", layer.protocols.slice(0, 4).join(", ")],
    ["Devices", layer.devices.slice(0, 3).join(", ")],
  ];

  return (
    <header className="mb-8">
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-mono text-2xl font-bold"
          style={{ backgroundColor: layer.color, color: "var(--on-accent)" }}
        >
          {layer.number}
        </span>
        <div>
          <p
            className="font-mono text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            Layer {layer.number} of 7
          </p>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">{layer.name} Layer</h1>
        </div>
      </div>

      <p className="mt-4 text-lg leading-relaxed">{layer.summary}</p>

      <dl
        className="mt-6 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--border)" }}
      >
        {facts.map(([k, v]) => (
          <div key={k} className="p-3" style={{ backgroundColor: "var(--bg-soft)" }}>
            <dt
              className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--fg-muted)" }}
            >
              {k}
            </dt>
            <dd className="mt-0.5 text-sm">{v}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
