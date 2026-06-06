import type { ReactNode } from "react";

type Variant = "note" | "insight" | "warning" | "history" | "security";

const STYLES: Record<Variant, { label: string; color: string; icon: string }> = {
  note: { label: "Note", color: "var(--color-layer-5)", icon: "ℹ" },
  insight: { label: "Key Insight", color: "var(--color-layer-3)", icon: "✦" },
  warning: { label: "Gotcha", color: "var(--color-layer-2)", icon: "⚠" },
  history: { label: "History", color: "var(--color-layer-6)", icon: "⏱" },
  security: { label: "Security", color: "var(--color-layer-1)", icon: "🛡" },
};

/** A labeled aside used throughout layer content for insights, warnings, etc. */
export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const s = STYLES[variant];
  return (
    <aside
      className="my-6 rounded-lg border-l-4 p-4 text-[0.95rem]"
      style={{
        borderColor: s.color,
        backgroundColor: "color-mix(in oklch, var(--bg-soft) 70%, transparent)",
      }}
    >
      <p className="mb-1 flex items-center gap-2 font-semibold" style={{ color: s.color }}>
        <span aria-hidden>{s.icon}</span>
        {title ?? s.label}
      </p>
      <div className="leading-relaxed [&>p]:mt-2 [&>p:first-child]:mt-0">{children}</div>
    </aside>
  );
}
