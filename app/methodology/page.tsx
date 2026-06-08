import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Accuracy & Methodology",
  description:
    "How this OSI reference is kept accurate: tested algorithms behind every interactive diagram, a multi-agent technical red-team of the content, and a continuous quality gate — plus a changelog and how to report errors.",
  path: "/methodology/",
});

const REPO = "https://github.com/Ag-surfer/osi-deep-dive";

const CHANGELOG: { date: string; items: string[] }[] = [
  {
    date: "2026-06-07",
    items: [
      "Added manipulable tools: a live IPv4 subnet calculator, a slider-driven eye diagram, and editable bit-pattern inputs for the line-coding and CRC visualizers.",
      "Ran a 26-page multi-agent technical red-team (one network-engineer reviewer per page, each finding adversarially verified) and corrected 22 confirmed inaccuracies across the Physical, Data Link, Network, Transport, Presentation, Session, and Application layers.",
    ],
  },
  {
    date: "Earlier",
    items: [
      "Added 24 expert deep-dive sub-pages across all seven layers, each with diagrams, worked examples, failure modes, security notes, and a quiz.",
      "Built 10 interactive, step-driven visualizers (SPF, BGP best-path, TCP congestion control, spanning tree, CRC, line coding, eye diagram, Huffman coding, DNS resolution, Kerberos) on one shared engine.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">Accuracy &amp; Methodology</h1>
        <p className="mt-3 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          An educational reference is only as good as it is correct. This site is developed in the
          open with AI assistance and a deliberate verification pipeline — here is exactly how it is
          checked, and how you can help make it better.
        </p>
      </header>

      <section className="mt-10 space-y-6">
        <h2 className="font-serif text-2xl font-semibold">How the content is verified</h2>

        <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-serif text-lg font-semibold">
            1. Tested algorithms behind every diagram
          </h3>
          <p className="mt-2 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Every interactive visualizer is driven by a pure, unit-tested algorithm module —
            Dijkstra/SPF, the BGP best-path decision, TCP congestion control, spanning-tree
            election, CRC division, Huffman coding, DNS resolution, Kerberos, and more.{" "}
            <strong>100+ unit tests</strong> pin the logic to canonical reference cases (e.g. the
            textbook CRC remainder, the optimal Huffman code length), so what you see animated
            can&rsquo;t drift away from what the math actually does.
          </p>
        </div>

        <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-serif text-lg font-semibold">2. Multi-agent technical red-team</h3>
          <p className="mt-2 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            The prose is audited, not just trusted. Each deep-dive page is independently reviewed by
            a senior-network-engineer AI agent hunting for factual errors and misleading
            oversimplifications; every claimed finding is then handed to a second, skeptical agent
            that must <em>adversarially confirm</em> it is a real error before it counts. The most
            recent pass over all 26 deep-dive pages surfaced and corrected{" "}
            <strong>22 verified inaccuracies</strong>. This directly targets the biggest risk for
            any explainer: confident-sounding text that is subtly wrong.
          </p>
        </div>

        <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-serif text-lg font-semibold">3. A continuous quality gate</h3>
          <p className="mt-2 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Every change must pass a non-negotiable gate before it ships: type-checking, linting,
            formatting, the full unit-test suite, and a complete static build of all pages. Nothing
            goes live on a red gate.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">Honest limitations</h2>
        <ul className="mt-3 space-y-2 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <li>
            • This is a <strong>conceptual reference</strong>, not a hands-on lab. It is no
            substitute for real packet captures, device configuration practice, or the primary RFCs
            and vendor docs it cites.
          </li>
          <li>
            • Verification reduces errors; it does not guarantee perfection. If you spot something
            wrong or imprecise, please{" "}
            <a
              href={`${REPO}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: "var(--fg)" }}
            >
              open an issue
            </a>{" "}
            — corrections are logged below.
          </li>
          <li>
            • The site is open source. Read or audit any page, diagram, or algorithm at{" "}
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: "var(--fg)" }}
            >
              the repository
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">Changelog</h2>
        <ol className="mt-4 space-y-5">
          {CHANGELOG.map((entry) => (
            <li key={entry.date}>
              <p
                className="font-mono text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                {entry.date}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {entry.items.map((it, i) => (
                  <li key={i} className="leading-relaxed">
                    {it}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
