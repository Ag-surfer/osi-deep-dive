import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/layers/physical/", label: "Layers" },
  { href: "/journey/", label: "Packet Journey" },
  { href: "/anatomy/", label: "Anatomy" },
  { href: "/glossary/", label: "Glossary" },
  { href: "/quiz/", label: "Quiz" },
  { href: "/interview/", label: "Interview" },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur print:hidden"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in oklch, var(--bg) 85%, transparent)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold">
          <StackGlyph />
          <span>OSI&nbsp;Deep&nbsp;Dive</span>
        </Link>
        <nav
          className="hidden items-center gap-5 text-sm sm:flex"
          style={{ color: "var(--fg-muted)" }}
        >
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-[var(--fg)]">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/cheat-sheet/"
            className="hidden text-sm sm:inline"
            style={{ color: "var(--fg-muted)" }}
          >
            Cheat&nbsp;Sheet
          </Link>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

/** Tiny 7-bar stack mark echoing the layer colors. */
function StackGlyph() {
  return (
    <span className="flex flex-col gap-[2px]" aria-hidden>
      {[7, 6, 5, 4, 3, 2, 1].map((n) => (
        <span
          key={n}
          className="block h-[2px] rounded-full"
          style={{ width: 18, backgroundColor: `var(--color-layer-${n})` }}
        />
      ))}
    </span>
  );
}
