"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAYERS_TOP_DOWN } from "@/lib/layers";

const TOP = [
  { href: "/", label: "Home" },
  { href: "/journey/", label: "Packet Journey" },
  { href: "/anatomy/", label: "Packet Anatomy" },
  { href: "/glossary/", label: "Glossary & RFCs" },
  { href: "/quiz/", label: "Final Quiz" },
];

/** Hamburger menu for small screens (the desktop nav is hidden below `sm`). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const isActive = (href: string) => pathname === href || pathname === href.slice(0, -1);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
        style={{ borderColor: "var(--border)" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-14 z-40 max-h-[80vh] overflow-y-auto border-b shadow-lg"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
        >
          <nav className="mx-auto max-w-6xl px-4 py-4" aria-label="Mobile">
            <ul className="space-y-1 text-sm">
              {TOP.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={close}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className="block rounded-md px-3 py-2 hover:bg-[var(--bg-soft)]"
                    style={
                      isActive(n.href)
                        ? { backgroundColor: "var(--bg-soft)", fontWeight: 600 }
                        : undefined
                    }
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p
              className="mt-4 mb-1 px-3 text-xs font-semibold uppercase"
              style={{ color: "var(--fg-muted)" }}
            >
              The 7 Layers
            </p>
            <ul className="space-y-1 text-sm">
              {LAYERS_TOP_DOWN.map((l) => {
                const href = `/layers/${l.slug}/`;
                return (
                  <li key={l.slug}>
                    <Link
                      href={href}
                      onClick={close}
                      aria-current={isActive(href) ? "page" : undefined}
                      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[var(--bg-soft)]"
                      style={isActive(href) ? { backgroundColor: "var(--bg-soft)" } : undefined}
                    >
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-bold"
                        style={{ backgroundColor: l.color, color: "var(--on-accent)" }}
                      >
                        {l.number}
                      </span>
                      <span className={isActive(href) ? "font-semibold" : undefined}>{l.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
