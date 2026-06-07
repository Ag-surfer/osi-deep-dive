import Link from "next/link";
import type { LayerMeta, TopicMeta } from "@/lib/layers";

/** Header for a deep-dive sub-topic page: a breadcrumb back to the parent
 *  layer, the layer's accent chip, and the topic title + summary. */
export function TopicHero({ layer, topic }: { layer: LayerMeta; topic: TopicMeta }) {
  return (
    <header className="mb-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <Link href="/" className="hover:underline">
          OSI
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/layers/${layer.slug}/`} className="hover:underline">
          Layer {layer.number}: {layer.name}
        </Link>
        <span aria-hidden>/</span>
        <span style={{ color: "var(--fg)" }}>{topic.title}</span>
      </nav>

      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-xl font-bold"
          style={{ backgroundColor: layer.color, color: "var(--on-accent)" }}
        >
          {layer.number}
        </span>
        <div>
          <p
            className="font-mono text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            {topic.category}
          </p>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">{topic.title}</h1>
        </div>
      </div>

      <p className="mt-4 text-lg leading-relaxed">{topic.summary}</p>
    </header>
  );
}
