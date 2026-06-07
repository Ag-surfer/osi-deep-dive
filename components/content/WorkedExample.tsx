import type { ReactNode } from "react";

/** A highlighted, numbered worked-example box for step-by-step calculations. */
export function WorkedExample({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="my-6 rounded-lg border"
      style={{ borderColor: "var(--color-layer-4)", backgroundColor: "var(--bg-soft)" }}
    >
      <p
        className="flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-semibold"
        style={{ backgroundColor: "var(--color-layer-4)", color: "var(--on-accent)" }}
      >
        <span aria-hidden>∑</span> Worked example: {title}
      </p>
      <div className="px-4 py-3 text-[0.95rem] leading-relaxed [&_code]:text-[0.9em]">
        {children}
      </div>
    </div>
  );
}
