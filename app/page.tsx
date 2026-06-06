import { LAYERS } from "@/lib/layers";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">The OSI Model — A Deep Dive</h1>
      <p className="mt-4 text-lg" style={{ color: "var(--fg-muted)" }}>
        Scaffold online. {LAYERS.length} layers registered.
      </p>
      <ul className="mt-8 space-y-2">
        {LAYERS.map((l) => (
          <li key={l.slug}>
            <span className="font-mono">L{l.number}</span> — {l.name}: {l.tagline}
          </li>
        ))}
      </ul>
    </main>
  );
}
