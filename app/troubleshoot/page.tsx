import Link from "next/link";
import { DIAGNOSES, LADDER, STRATEGIES, TOOLS } from "@/lib/troubleshoot";
import { LAYERS } from "@/lib/layers";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Troubleshooting Method",
  description:
    "How engineers actually debug networks: the three diagnosis strategies, which tool interrogates which OSI layer and what its output proves, and worked diagnoses from symptom to root cause.",
  path: "/troubleshoot/",
});

function LayerTag({ layer }: { layer: number }) {
  const l = LAYERS.find((x) => x.number === layer);
  if (!l) return null;
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: l.color, color: "var(--on-accent)" }}
    >
      L{l.number} {l.name}
    </span>
  );
}

export default function TroubleshootPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          The OSI model as a debugger
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Troubleshooting Method</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The OSI model&rsquo;s real day job isn&rsquo;t certification exams — it&rsquo;s diagnosis.
          The layers form a dependency chain, so every test that proves a layer healthy eliminates
          everything beneath it. Debugging a network is binary search over that chain: pick a probe,
          read what its result <em>proves</em>, and halve the suspect list. This page is the method
          — strategies, the tool-to-layer map, and real diagnoses worked end to end.
        </p>
      </header>

      {/* Strategies */}
      <section className="mt-12" aria-labelledby="strategies">
        <h2 id="strategies" className="font-serif text-2xl font-bold">
          Three ways to walk the stack
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {STRATEGIES.map((s) => (
            <div
              key={s.name}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="font-semibold">{s.name}</p>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {s.how}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                <span className="font-semibold">Use it when: </span>
                <span style={{ color: "var(--fg-muted)" }}>{s.when}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The ladder */}
      <section className="mt-12" aria-labelledby="ladder">
        <h2 id="ladder" className="font-serif text-2xl font-bold">
          The divide-and-conquer ladder
        </h2>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The sixty-second triage that localizes most faults:
        </p>
        <ol className="mt-5 space-y-3">
          {LADDER.map((rung, i) => (
            <li
              key={rung.check}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="font-mono text-sm font-semibold">
                {i + 1}. {rung.check}
              </p>
              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-semibold" style={{ color: "var(--ok)" }}>
                    Works:
                  </span>{" "}
                  <span style={{ color: "var(--fg-muted)" }}>{rung.ifGood}</span>
                </p>
                <p>
                  <span className="font-semibold" style={{ color: "var(--bad)" }}>
                    Fails:
                  </span>{" "}
                  <span style={{ color: "var(--fg-muted)" }}>{rung.ifBad}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Tool map */}
      <section className="mt-12" aria-labelledby="tools">
        <h2 id="tools" className="font-serif text-2xl font-bold">
          Which tool interrogates which layer
        </h2>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Every tool asks one question. Knowing what a clean result <em>proves</em> — and what it
          doesn&rsquo;t — is the whole skill.
        </p>
        <div className="mt-5 space-y-3">
          {TOOLS.map((t) => (
            <div
              key={t.tool}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-sm font-semibold">{t.tool}</code>
                <span className="flex gap-1">
                  {t.layers.map((l) => (
                    <LayerTag key={l} layer={l} />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>
                  Asks:
                </span>{" "}
                {t.asks}
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>
                  Proves:
                </span>{" "}
                {t.proves}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Worked diagnoses */}
      <section className="mt-12" aria-labelledby="worked">
        <h2 id="worked" className="font-serif text-2xl font-bold">
          Worked diagnoses
        </h2>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The method in motion: symptom → probe → what the output eliminated → next move. Try
          predicting the next command before reading it.
        </p>
        <div className="mt-5 space-y-4">
          {DIAGNOSES.map((d) => (
            <details
              key={d.id}
              id={d.id}
              className="group rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            >
              <summary className="flex cursor-pointer items-start justify-between gap-3 p-4 font-medium">
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 transition-transform group-open:rotate-90"
                  style={{ color: "var(--fg-muted)" }}
                >
                  ▸
                </span>
                <span className="flex-1">
                  <span className="block">{d.title}</span>
                  <span
                    className="mt-0.5 block text-sm font-normal"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {d.symptom}
                  </span>
                </span>
                <span className="mt-0.5 shrink-0">
                  <LayerTag layer={d.layer} />
                </span>
              </summary>
              <div className="border-t px-4 pt-3 pb-4" style={{ borderColor: "var(--border)" }}>
                <ol className="space-y-3">
                  {d.steps.map((s, i) => (
                    <li key={s.action} className="text-sm leading-relaxed">
                      <p className="font-mono font-semibold">
                        {i + 1}. {s.action}
                      </p>
                      <p style={{ color: "var(--fg-muted)" }}>
                        <span className="font-semibold" style={{ color: "var(--fg)" }}>
                          Saw:
                        </span>{" "}
                        {s.observation}
                      </p>
                      <p style={{ color: "var(--fg-muted)" }}>
                        <span className="font-semibold" style={{ color: "var(--fg)" }}>
                          Therefore:
                        </span>{" "}
                        {s.conclusion}
                      </p>
                    </li>
                  ))}
                </ol>
                <p
                  className="mt-4 rounded-md border-l-4 p-3 text-sm leading-relaxed"
                  style={{
                    borderColor: LAYERS.find((l) => l.number === d.layer)?.color,
                    backgroundColor: "color-mix(in oklch, var(--bg-soft) 70%, transparent)",
                  }}
                >
                  <span className="font-semibold">Lesson: </span>
                  {d.lesson}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-lg border p-6" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-serif text-xl font-bold">Go deeper</h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Every layer page ends with a <em>Failure modes &amp; troubleshooting</em> section listing
          that layer&rsquo;s symptoms:{" "}
          {LAYERS.map((l, i) => (
            <span key={l.slug}>
              {i > 0 ? " · " : ""}
              <Link href={`/layers/${l.slug}/`} className="underline underline-offset-2">
                L{l.number} {l.name}
              </Link>
            </span>
          ))}
          . And{" "}
          <Link href="/anatomy/" className="underline underline-offset-2">
            Packet Anatomy
          </Link>{" "}
          shows what tcpdump would show you — the referee of last resort.
        </p>
      </section>
    </main>
  );
}
