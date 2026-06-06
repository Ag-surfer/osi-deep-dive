import Link from "next/link";
import { nextLayer, prevLayer } from "@/lib/layers";

/** Previous/next layer navigation shown at the foot of each layer page. */
export function PrevNext({ slug }: { slug: string }) {
  const prev = prevLayer(slug);
  const next = nextLayer(slug);

  return (
    <nav
      className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2"
      style={{ borderColor: "var(--border)" }}
    >
      {prev ? (
        <Link
          href={`/layers/${prev.slug}/`}
          className="rounded-lg border p-4 transition-colors hover:bg-[var(--bg-soft)]"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
            ← Layer {prev.number}
          </span>
          <span className="mt-0.5 block font-serif font-semibold">{prev.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/layers/${next.slug}/`}
          className="rounded-lg border p-4 text-right transition-colors hover:bg-[var(--bg-soft)]"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Layer {next.number} →
          </span>
          <span className="mt-0.5 block font-serif font-semibold">{next.name}</span>
        </Link>
      ) : (
        <Link
          href="/journey/"
          className="rounded-lg border p-4 text-right transition-colors hover:bg-[var(--bg-soft)]"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Tie it together →
          </span>
          <span className="mt-0.5 block font-serif font-semibold">Packet Journey</span>
        </Link>
      )}
    </nav>
  );
}
