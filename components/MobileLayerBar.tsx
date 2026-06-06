"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAYERS } from "@/lib/layers";

/** Horizontally-scrollable layer switcher shown on layer pages below `lg`. */
export function MobileLayerBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Layers"
      className="-mx-4 mb-6 overflow-x-auto border-b px-4 pb-3 lg:hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <ul className="flex gap-2">
        {LAYERS.map((l) => {
          const href = `/layers/${l.slug}/`;
          const active = pathname === href || pathname === href.slice(0, -1);
          return (
            <li key={l.slug}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap"
                style={{
                  borderColor: active ? l.color : "var(--border)",
                  backgroundColor: active ? "var(--bg-soft)" : "transparent",
                }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                  style={{ backgroundColor: l.color, color: "var(--on-accent)" }}
                >
                  {l.number}
                </span>
                <span className={active ? "font-semibold" : undefined}>{l.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
