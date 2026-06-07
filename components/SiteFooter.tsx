import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)" }}>
      <div
        className="mx-auto max-w-6xl px-4 py-10 text-sm sm:px-6"
        style={{ color: "var(--fg-muted)" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            An open educational reference for the OSI model. Content licensed{" "}
            <span className="font-medium">CC BY 4.0</span>; code{" "}
            <span className="font-medium">MIT</span>.
          </p>
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-[var(--fg)]">
              Home
            </Link>
            <Link href="/journey/" className="hover:text-[var(--fg)]">
              Packet Journey
            </Link>
            <Link href="/glossary/" className="hover:text-[var(--fg)]">
              Glossary
            </Link>
            <Link href="/quiz/" className="hover:text-[var(--fg)]">
              Quiz
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-xs">
          Built as a learning resource. Verify protocol details against the cited RFCs and standards
          for production work.
        </p>
      </div>
    </footer>
  );
}
