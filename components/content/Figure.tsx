import type { ReactNode } from "react";

/** A captioned figure wrapper for SVG diagrams in layer content. */
export function Figure({
  children,
  caption,
  id,
}: {
  children: ReactNode;
  caption?: ReactNode;
  id?: string;
}) {
  return (
    <figure id={id} className="my-8">
      <div
        className="overflow-x-auto rounded-lg border p-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
      >
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
