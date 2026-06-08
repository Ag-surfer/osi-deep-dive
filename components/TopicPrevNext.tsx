import Link from "next/link";
import { getLayer, prevTopic, nextTopic } from "@/lib/layers";

/** Prev/next navigation *within* a layer's sub-topics, plus a link back up to
 *  the parent layer. Shown at the foot of every deep-dive page. */
export function TopicPrevNext({ layerSlug, topicSlug }: { layerSlug: string; topicSlug: string }) {
  const layer = getLayer(layerSlug);
  const prev = prevTopic(layerSlug, topicSlug);
  const next = nextTopic(layerSlug, topicSlug);
  if (!layer) return null;

  return (
    <nav className="mt-12 border-t pt-6" style={{ borderColor: "var(--border)" }}>
      <Link
        href={`/layers/${layer.slug}/`}
        className="text-sm hover:underline"
        style={{ color: "var(--fg-muted)" }}
      >
        ← Back to Layer {layer.number}: {layer.name}
      </Link>

      {prev || next ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/layers/${layer.slug}/${prev.slug}/`}
              className="rounded-lg border p-4 transition-colors hover:bg-[var(--bg-soft)]"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                ← {prev.category}
              </span>
              <span className="mt-0.5 block font-serif font-semibold">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/layers/${layer.slug}/${next.slug}/`}
              className="rounded-lg border p-4 text-right transition-colors hover:bg-[var(--bg-soft)]"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                {next.category} →
              </span>
              <span className="mt-0.5 block font-serif font-semibold">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </nav>
  );
}
