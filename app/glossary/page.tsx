import type { Metadata } from "next";
import { GlossaryList } from "@/components/GlossaryList";

export const metadata: Metadata = {
  title: "Glossary & RFC Index",
  description:
    "Definitions of key networking terms across all seven OSI layers, plus an index of the RFCs and standards referenced throughout.",
};

const RFCS: { n: string; title: string; layer: string }[] = [
  { n: "791", title: "Internet Protocol (IPv4)", layer: "L3" },
  { n: "792", title: "Internet Control Message Protocol (ICMP)", layer: "L3" },
  { n: "826", title: "Address Resolution Protocol (ARP)", layer: "L2" },
  { n: "768", title: "User Datagram Protocol (UDP)", layer: "L4" },
  { n: "9293", title: "Transmission Control Protocol (TCP)", layer: "L4" },
  { n: "5681", title: "TCP Congestion Control", layer: "L4" },
  { n: "9000", title: "QUIC", layer: "L4" },
  { n: "4632", title: "Classless Inter-Domain Routing (CIDR)", layer: "L3" },
  { n: "1918", title: "Address Allocation for Private Internets", layer: "L3" },
  { n: "8200", title: "Internet Protocol, Version 6 (IPv6)", layer: "L3" },
  { n: "1035", title: "Domain Names — Implementation (DNS)", layer: "L7" },
  { n: "9110", title: "HTTP Semantics", layer: "L7" },
  { n: "8446", title: "TLS 1.3", layer: "L6" },
  { n: "2131", title: "Dynamic Host Configuration Protocol (DHCP)", layer: "L7" },
];

export default function GlossaryPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">Glossary &amp; RFC Index</h1>
        <p className="mt-3 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The vocabulary of networking, each term tagged with the layer it lives at, plus the
          primary sources this site cites.
        </p>
      </header>

      <section className="mt-8">
        <GlossaryList />
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold">RFC &amp; standards index</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          The authoritative specifications referenced throughout. When in doubt, read the source.
        </p>
        <ul className="mt-4 divide-y rounded-lg border" style={{ borderColor: "var(--border)" }}>
          {RFCS.map((r) => (
            <li
              key={r.n}
              className="flex items-center gap-3 px-3 py-2 text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="w-8 shrink-0 text-center font-mono text-[10px] font-semibold"
                style={{ color: "var(--fg-muted)" }}
              >
                {r.layer}
              </span>
              <a
                href={`https://www.rfc-editor.org/rfc/rfc${r.n}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-semibold underline underline-offset-2"
              >
                RFC&nbsp;{r.n}
              </a>
              <span style={{ color: "var(--fg-muted)" }}>{r.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
