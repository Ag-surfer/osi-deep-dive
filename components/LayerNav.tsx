"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAYERS_TOP_DOWN } from "@/lib/layers";

/** Sticky sidebar listing the 7 layers top-down, highlighting the active one. */
export function LayerNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="OSI layers" className="text-sm">
      <p
        className="mb-3 px-2 text-xs font-semibold tracking-wide uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        The 7 Layers
      </p>
      <ul className="space-y-1">
        {LAYERS_TOP_DOWN.map((l) => {
          const href = `/layers/${l.slug}/`;
          const active = pathname === href || pathname === href.slice(0, -1);
          return (
            <li key={l.slug}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--bg-soft)]"
                style={active ? { backgroundColor: "var(--bg-soft)" } : undefined}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-bold text-white"
                  style={{ backgroundColor: l.color }}
                >
                  {l.number}
                </span>
                <span className={active ? "font-semibold" : undefined}>{l.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p
        className="mt-4 mb-2 px-2 text-xs font-semibold tracking-wide uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        More
      </p>
      <ul className="space-y-1">
        {[
          { href: "/journey/", label: "Packet Journey" },
          { href: "/glossary/", label: "Glossary & RFCs" },
        ].map((m) => {
          const active = pathname === m.href || pathname === m.href.slice(0, -1);
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={active ? "page" : undefined}
                className="block rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--bg-soft)]"
                style={active ? { backgroundColor: "var(--bg-soft)", fontWeight: 600 } : undefined}
              >
                {m.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
