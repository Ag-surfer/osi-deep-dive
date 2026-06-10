import Link from "next/link";
import { LAYERS_TOP_DOWN } from "@/lib/layers";
import { PrintButton } from "@/components/PrintButton";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Cheat Sheet",
  description:
    "The OSI model on one printable page: the seven layers with PDUs, addressing, protocols and devices, the demultiplexing chain, well-known ports, and the numbers worth memorizing.",
  path: "/cheat-sheet/",
});

const PORTS: { port: string; proto: string; service: string }[] = [
  { port: "20/21", proto: "TCP", service: "FTP (data/control)" },
  { port: "22", proto: "TCP", service: "SSH" },
  { port: "25", proto: "TCP", service: "SMTP (relay)" },
  { port: "53", proto: "UDP+TCP", service: "DNS" },
  { port: "67/68", proto: "UDP", service: "DHCP (server/client)" },
  { port: "80", proto: "TCP", service: "HTTP" },
  { port: "110", proto: "TCP", service: "POP3" },
  { port: "123", proto: "UDP", service: "NTP" },
  { port: "143", proto: "TCP", service: "IMAP" },
  { port: "443", proto: "TCP/QUIC", service: "HTTPS (HTTP/3 = UDP)" },
  { port: "587", proto: "TCP", service: "SMTP (submission)" },
  { port: "993", proto: "TCP", service: "IMAPS" },
];

const NUMBERS: { value: string; what: string }[] = [
  { value: "48 / 32 / 128 / 16 bits", what: "MAC / IPv4 / IPv6 address / port number widths" },
  { value: "14 + 4 B", what: "Ethernet header + FCS (frame: 64 min / 1518 max)" },
  { value: "1500 B", what: "Classic Ethernet MTU (payload available to IP)" },
  { value: "20 / 20 / 8 B", what: "Minimum IPv4 / TCP / UDP header sizes" },
  { value: "64 or 128", what: "Common initial TTL values (Linux–macOS / Windows)" },
  { value: "1 RTT each", what: "TCP handshake; TLS 1.3 handshake (0-RTT with early data)" },
  { value: "~4 RTTs", what: "Cold HTTPS first byte: DNS + TCP + TLS + HTTP" },
];

const CONTRASTS: { a: string; b: string; rule: string }[] = [
  { a: "Hub", b: "Switch", rule: "repeats bits to all ports vs forwards frames by learned MAC" },
  { a: "Switch", b: "Router", rule: "one broadcast domain vs connects/bounds networks (IP)" },
  { a: "Forwarding", b: "Routing", rule: "per-packet table lookup vs building the table" },
  { a: "Flow control", b: "Congestion control", rule: "protects the receiver vs the network" },
  { a: "TCP", b: "UDP", rule: "reliable ordered stream vs bare datagrams + ports" },
  { a: "MAC", b: "IP", rule: "flat, per-hop, link-local vs hierarchical, end-to-end" },
];

export default function CheatSheetPage() {
  return (
    <main className="cheat-sheet mx-auto max-w-4xl px-4 py-12 sm:px-6 print:max-w-none print:py-2">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="font-mono text-xs font-semibold tracking-wide uppercase print:hidden"
            style={{ color: "var(--fg-muted)" }}
          >
            One page, everything load-bearing
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl print:mt-0 print:text-2xl">
            OSI Cheat Sheet
          </h1>
          <p className="mt-2 text-sm print:text-xs" style={{ color: "var(--fg-muted)" }}>
            Mnemonics, top down: <strong>A</strong>ll <strong>P</strong>eople <strong>S</strong>eem{" "}
            <strong>T</strong>o <strong>N</strong>eed <strong>D</strong>ata <strong>P</strong>
            rocessing · bottom up: <strong>P</strong>lease <strong>D</strong>o <strong>N</strong>ot{" "}
            <strong>T</strong>hrow <strong>S</strong>ausage <strong>P</strong>izza{" "}
            <strong>A</strong>
            way
          </p>
        </div>
        <PrintButton />
      </header>

      {/* The stack */}
      <section className="mt-8 print:mt-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm print:text-xs">
            <thead>
              <tr
                className="border-b text-left font-mono text-xs uppercase"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Layer</th>
                <th className="py-2 pr-3">PDU</th>
                <th className="py-2 pr-3">Addressing</th>
                <th className="py-2 pr-3">Key protocols</th>
                <th className="py-2">Lives in</th>
              </tr>
            </thead>
            <tbody>
              {LAYERS_TOP_DOWN.map((l) => (
                <tr
                  key={l.slug}
                  className="border-b align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-2 pr-3">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-bold"
                      style={{ backgroundColor: l.color, color: "var(--on-accent)" }}
                    >
                      {l.number}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                    <Link href={`/layers/${l.slug}/`} className="print:no-underline">
                      {l.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">{l.pdu}</td>
                  <td className="py-2 pr-3">{l.addressing}</td>
                  <td className="py-2 pr-3">
                    {l.protocols
                      .slice(0, 4)
                      .map((p) => p.replace(/\*$/, ""))
                      .join(", ")}
                  </td>
                  <td className="py-2">{l.devices.slice(0, 3).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--fg-muted)" }}>
          <strong>Demux chain</strong> (how arriving bytes find their process): EtherType{" "}
          <span className="font-mono">0x0800</span> → IP Protocol{" "}
          <span className="font-mono">6</span> (TCP) / <span className="font-mono">17</span> (UDP) →
          destination port → <span className="font-mono">accept()</span>.
        </p>
      </section>

      {/* Three-column reference */}
      <div className="mt-8 grid gap-8 sm:grid-cols-2 print:mt-4 print:grid-cols-2 print:gap-4">
        <section>
          <h2 className="font-serif text-lg font-bold">Well-known ports</h2>
          <table className="mt-2 w-full text-sm print:text-xs">
            <tbody>
              {PORTS.map((p) => (
                <tr key={p.port} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-1 pr-2 font-mono whitespace-nowrap">{p.port}</td>
                  <td className="py-1 pr-2 whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                    {p.proto}
                  </td>
                  <td className="py-1">{p.service}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-serif text-lg font-bold">Numbers to know</h2>
          <table className="mt-2 w-full text-sm print:text-xs">
            <tbody>
              {NUMBERS.map((n) => (
                <tr key={n.what} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-1 pr-2 font-mono whitespace-nowrap">{n.value}</td>
                  <td className="py-1">{n.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="sm:col-span-2 print:col-span-2">
          <h2 className="font-serif text-lg font-bold">Classic contrasts</h2>
          <table className="mt-2 w-full text-sm print:text-xs">
            <tbody>
              {CONTRASTS.map((c) => (
                <tr key={c.a + c.b} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-1 pr-2 font-semibold whitespace-nowrap">
                    {c.a} vs {c.b}
                  </td>
                  <td className="py-1">{c.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <p className="mt-8 text-xs print:mt-4" style={{ color: "var(--fg-muted)" }}>
        From <strong>OSI Deep Dive</strong> — ag-surfer.github.io/osi-deep-dive · the deep version
        of every row: <span className="print:hidden">linked above.</span>
        <span className="hidden print:inline">/layers/&lt;name&gt;/</span>
      </p>
    </main>
  );
}
