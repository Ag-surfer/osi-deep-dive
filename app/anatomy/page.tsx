import { PacketWalkthrough } from "@/components/PacketWalkthrough";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Packet Anatomy",
  description:
    "A real TCP conversation dissected byte by byte — SYN, SYN-ACK, HTTP request, 200 response, and FIN, with every field color-coded by OSI layer, verified checksums, and sequence numbers that chain across frames.",
  path: "/anatomy/",
});

export default function AnatomyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          See the actual bytes
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Packet Anatomy</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Every diagram on this site is an abstraction of something concrete: bytes on a wire. Here
          is a complete, real TCP conversation — five frames, from the laptop in our NAT example (
          <span className="font-mono text-base">192.168.1.23</span>): the handshake&rsquo;s SYN and
          SYN-ACK, the HTTP request, the 200 response, and the closing FIN. Every byte is
          color-coded by the layer that owns it, every checksum is genuinely correct, and the
          sequence numbers chain arithmetically across frames — our test suite verifies all of it.
          Encapsulation stops being a metaphor when you can point at byte 22 and say
          &ldquo;that&rsquo;s the TTL,&rdquo; and reliability stops being one when you watch the
          response&rsquo;s acknowledgment number account for all 74 bytes of the request.
        </p>
      </header>

      <section className="mt-10" aria-label="Annotated packet capture">
        <PacketWalkthrough />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Capture your own</h2>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          This is exactly what packet-capture tools show you. To see live frames on your own
          machine:
        </p>
        <pre
          className="mt-4 overflow-x-auto rounded-lg border p-4 font-mono text-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
        >
          {`# Hex-dump live HTTP traffic (Ctrl-C to stop)
# macOS: use your active interface, e.g. en0. Linux: en0 → eth0, or "-i any".
sudo tcpdump -i en0 -X 'tcp port 80'

# Or capture to a file and explore it in Wireshark
sudo tcpdump -i en0 -w capture.pcap 'tcp port 80'`}
        </pre>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          In <strong>Wireshark</strong>, clicking any field in the detail pane highlights its exact
          bytes — the same interaction as above, on your real traffic. Try following one TCP stream
          end-to-end: handshake, request, response, teardown. Almost everything on this site will be
          in that one capture.
        </p>
      </section>
    </main>
  );
}
