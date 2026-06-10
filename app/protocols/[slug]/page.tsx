import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROTOCOLS, getProtocol, protocolsForLayer } from "@/lib/protocols";
import { LAYERS } from "@/lib/layers";
import { pageMetadata } from "@/lib/site";

// Prerender exactly the registered protocols; 404 anything else (required for export).
export function generateStaticParams() {
  return PROTOCOLS.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const proto = getProtocol(slug);
  if (!proto) return {};
  return pageMetadata({
    title: `${proto.name} — ${proto.fullName}`,
    description: proto.tagline,
    path: `/protocols/${proto.slug}/`,
  });
}

interface Source {
  label: string;
  href: string;
}

export default async function ProtocolPage({ params }: Params) {
  const { slug } = await params;
  const proto = getProtocol(slug);
  if (!proto) notFound();

  const layer = LAYERS.find((l) => l.number === proto.layer)!;
  const siblings = protocolsForLayer(proto.layer).filter((p) => p.slug !== proto.slug);

  const mod = (await import(`../../../content/protocols/${slug}.mdx`)) as {
    default: React.ComponentType;
    sources?: Source[];
  };
  const Content = mod.default;
  const sources = mod.sources ?? [];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/layers/${layer.slug}/`}
            className="rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
            style={{ backgroundColor: layer.color, color: "var(--on-accent)" }}
          >
            L{layer.number} {layer.name}
          </Link>
          <span className="font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
            {proto.standard}
          </span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">{proto.fullName}</h1>
        <p className="mt-3 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {proto.tagline}
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert prose-headings:font-serif prose-h2:scroll-mt-20 prose-h2:border-b prose-h2:pb-1 prose-a:break-words mt-8 max-w-none">
        <Content />
      </div>

      {sources.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-xl font-semibold">Sources & further reading</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {siblings.length > 0 ? (
        <nav className="mt-12 rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold">
            More Layer {proto.layer} deep dives
            <Link
              href="/protocols/"
              className="ml-2 font-normal underline underline-offset-2"
              style={{ color: "var(--fg-muted)" }}
            >
              (all protocols)
            </Link>
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {siblings.map((p) => (
              <li key={p.slug}>
                <Link href={`/protocols/${p.slug}/`} className="underline underline-offset-2">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </article>
  );
}
