import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LAYERS, getLayer } from "@/lib/layers";
import { pageMetadata } from "@/lib/site";
import { LayerHero } from "@/components/LayerHero";
import { PrevNext } from "@/components/PrevNext";

// Prerender exactly the 7 known layers; 404 anything else (required for export).
export function generateStaticParams() {
  return LAYERS.map((l) => ({ slug: l.slug }));
}
export const dynamicParams = false;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const layer = getLayer(slug);
  if (!layer) return {};
  return pageMetadata({
    title: `${layer.name} Layer`,
    description: layer.summary,
    path: `/layers/${layer.slug}/`,
  });
}

interface Source {
  label: string;
  href: string;
}

export default async function LayerPage({ params }: Params) {
  const { slug } = await params;
  const layer = getLayer(slug);
  if (!layer) notFound();

  // Each layer's deep content lives in content/layers/<slug>.mdx. The MDX may
  // also export a `sources` array for its citation list.
  const mod = (await import(`../../../content/layers/${slug}.mdx`)) as {
    default: React.ComponentType;
    sources?: Source[];
  };
  const Content = mod.default;
  const sources = mod.sources ?? [];

  return (
    <article>
      <LayerHero layer={layer} />
      <div className="prose prose-neutral dark:prose-invert prose-headings:font-serif prose-h2:scroll-mt-20 prose-h2:border-b prose-h2:pb-1 prose-a:break-words max-w-none">
        <Content />
      </div>

      {layer.topics && layer.topics.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-xl font-semibold">Deep dives</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
            Protocol-by-protocol and concept-by-concept breakdowns for this layer.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {layer.topics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/layers/${layer.slug}/${t.slug}/`}
                  className="block h-full rounded-lg border p-4 transition-colors hover:bg-[var(--bg-soft)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {t.category}
                  </span>
                  <span className="mt-0.5 block font-serif font-semibold">{t.title}</span>
                  <span className="mt-1 block text-sm" style={{ color: "var(--fg-muted)" }}>
                    {t.tagline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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

      <PrevNext slug={slug} />
    </article>
  );
}
