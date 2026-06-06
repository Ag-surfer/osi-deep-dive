import Link from "next/link";
import { LayerStack } from "@/components/LayerStack";
import { EncapsulationVisualizer } from "@/components/EncapsulationVisualizer";
import { OsiTcpIpMap } from "@/components/OsiTcpIpMap";
import { OsiStackArt } from "@/components/diagrams/OsiStackArt";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          <p
            className="font-mono text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            ISO/IEC 7498-1 · The Reference Model
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
            The OSI Model, in Depth
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed lg:mx-0"
            style={{ color: "var(--fg-muted)" }}
          >
            A rigorous, layer-by-layer reference for how networks really work — from raw signals on
            a wire to the protocols your browser speaks. Each layer gets its own deep dive with
            diagrams, bit-level header breakdowns, security analysis, and self-check questions.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/layers/physical/"
              className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-layer-3)" }}
            >
              Start at Layer 1 →
            </Link>
            <Link
              href="/journey/"
              className="rounded-md border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: "var(--border)" }}
            >
              Trace a packet through all 7 layers
            </Link>
          </div>
        </div>
        <div className="hidden lg:block">
          <OsiStackArt />
        </div>
      </section>

      {/* Interactive stack */}
      <section className="mt-14">
        <h2 className="sr-only">The seven layers</h2>
        <LayerStack />
        <p className="mt-4 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
          Hover a layer for its essence; click to dive in. Data is <strong>encapsulated</strong> on
          the way down the sender&rsquo;s stack and <strong>de-encapsulated</strong> on the way up
          the receiver&rsquo;s.
        </p>
      </section>

      {/* Encapsulation visualizer */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-semibold">How data travels: encapsulation</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          As data descends the sender&rsquo;s stack, each layer wraps it in a header. Step through
          the assembly of a frame from raw application data down to bits on the wire.
        </p>
        <div className="mt-5">
          <EncapsulationVisualizer />
        </div>
      </section>

      {/* OSI vs TCP/IP */}
      <section className="mt-16 grid items-center gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Theory vs. the real internet</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            The OSI model is the teaching framework, but the internet actually runs on the leaner{" "}
            <strong>TCP/IP model</strong>, which collapses seven layers into four. OSI&rsquo;s top
            three layers (Application, Presentation, Session) map to a single TCP/IP Application
            layer; its bottom two fold into the Link layer. Learn OSI for the concepts, recognize
            TCP/IP in practice.
          </p>
        </div>
        <OsiTcpIpMap />
      </section>

      {/* How to use */}
      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        <FeatureCard title="Mnemonic">
          <em>Please Do Not Throw Sausage Pizza Away</em> — Physical, Data Link, Network, Transport,
          Session, Presentation, Application (1→7).
        </FeatureCard>
        <FeatureCard title="OSI vs. TCP/IP">
          The internet runs on the leaner TCP/IP model. We map the two so you learn the theory and
          the reality.
        </FeatureCard>
        <FeatureCard title="Cited & verifiable">
          Header layouts and protocol claims reference their RFCs and standards so you can check the
          primary sources.
        </FeatureCard>
      </section>
    </main>
  );
}

function FeatureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        {children}
      </p>
    </div>
  );
}
