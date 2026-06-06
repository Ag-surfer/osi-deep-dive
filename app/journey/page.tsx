import { PacketJourney } from "@/components/PacketJourney";
import { EncapsulationVisualizer } from "@/components/EncapsulationVisualizer";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "A Packet's Journey",
  description:
    "Follow a single web request end-to-end through all seven OSI layers — encapsulation down the sender's stack, routing across the network, and de-encapsulation up the receiver's.",
  path: "/journey/",
});

export default function JourneyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          Worked walkthrough
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">A Packet&rsquo;s Journey</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The layers make the most sense when you watch them work together. Here is what really
          happens when you load <code className="font-mono">https://example.com</code> — one
          request, traced through all seven layers and back.
        </p>
      </header>

      <section className="mt-10">
        <PacketJourney />
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold">Encapsulation, step by step</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The core mechanic above is <strong>encapsulation</strong>: each layer wraps the data from
          the layer above in its own header (and, at Layer 2, a trailer). Step through it — and
          remember the receiver does the exact reverse.
        </p>
        <div className="mt-4">
          <EncapsulationVisualizer />
        </div>
      </section>
    </main>
  );
}
