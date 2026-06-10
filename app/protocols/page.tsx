import Link from "next/link";
import { protocolsForLayer } from "@/lib/protocols";
import { LAYERS_TOP_DOWN } from "@/lib/layers";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Protocol Deep Dives",
  description:
    "Dedicated deep dives into the protocols and algorithms that run today's networks — BGP, OSPF, TCP, QUIC, TLS, DNS, HTTP and more — organized by OSI layer.",
  path: "/protocols/",
});

export default function ProtocolsIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          The protocols behind the model
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Protocol Deep Dives</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The layer pages teach the <em>jobs</em>; these pages teach the <em>workers</em> — the
          specific protocols and algorithms a working engineer actually meets, each with its
          mechanics, header anatomy, failure modes, security history, and the details interviews
          probe. Organized by the layer each one calls home.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {LAYERS_TOP_DOWN.map((layer) => {
          const protos = protocolsForLayer(layer.number);
          if (protos.length === 0) return null;
          return (
            <section key={layer.slug} aria-labelledby={`layer-${layer.number}`}>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded font-mono text-sm font-bold"
                  style={{ backgroundColor: layer.color, color: "var(--on-accent)" }}
                  aria-hidden
                >
                  {layer.number}
                </span>
                <h2 id={`layer-${layer.number}`} className="font-serif text-xl font-bold">
                  <Link href={`/layers/${layer.slug}/`} className="hover:underline">
                    {layer.name}
                  </Link>
                </h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {protos.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/protocols/${p.slug}/`}
                    className="rounded-lg border p-4 transition-colors hover:bg-[var(--bg-soft)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold">{p.name}</span>
                      <span className="font-mono text-[10px]" style={{ color: "var(--fg-muted)" }}>
                        {p.standard}
                      </span>
                    </div>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {p.tagline}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
