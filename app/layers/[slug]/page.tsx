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
