import type { ReactNode } from "react";

/** Link to an RFC by number, e.g. <RFCRef n={791}>IPv4</RFCRef>. */
export function RFCRef({ n, children }: { n: number; children?: ReactNode }) {
  return (
    <a
      href={`https://www.rfc-editor.org/rfc/rfc${n}.html`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[0.9em] underline decoration-dotted underline-offset-2"
    >
      {children ? `${children} (RFC ${n})` : `RFC ${n}`}
    </a>
  );
}

/** A glossary key term with an optional definition tooltip. */
export function KeyTerm({ term, def }: { term: string; def?: string }) {
  return (
    <span
      className="cursor-help border-b border-dotted font-medium"
      style={{ borderColor: "var(--fg-muted)" }}
      title={def}
    >
      {term}
    </span>
  );
}
