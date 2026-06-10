import Link from "next/link";
import { INTERVIEW_QUESTIONS, QUESTION_LAYERS, URL_JOURNEY } from "@/lib/interview";
import { LAYERS } from "@/lib/layers";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Interview Prep",
  description:
    "The networking interview canon: 'what happens when you type a URL' as a complete model answer, plus the classic questions for every OSI layer — each with a strong answer, the follow-ups interviewers ask, and links to the deep material.",
  path: "/interview/",
});

function LayerChip({ layer }: { layer: number }) {
  if (layer === 0) {
    return (
      <span
        className="rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
        style={{ backgroundColor: "var(--bg-soft)", color: "var(--fg-muted)" }}
      >
        Cross-layer
      </span>
    );
  }
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

function sectionTitle(layer: number): string {
  if (layer === 0) return "Cross-layer classics";
  const l = LAYERS.find((x) => x.number === layer)!;
  return `Layer ${l.number} — ${l.name}`;
}

export default function InterviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          The canon, with strong answers
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Interview Prep</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Networking interviews draw from a surprisingly stable canon. This page collects it: the
          one question everyone gets, then the classics for each layer — each with the answer a
          strong candidate gives, the follow-ups interviewers use to probe depth, and links into
          this site&rsquo;s deep material. Cramming instead?{" "}
          <Link href="/cheat-sheet/" className="underline underline-offset-2">
            The cheat sheet
          </Link>{" "}
          is one printable page.
        </p>
      </header>

      {/* The centerpiece */}
      <section className="mt-12" aria-labelledby="url-walkthrough">
        <h2 id="url-walkthrough" className="font-serif text-2xl font-bold">
          &ldquo;What happens when you type a URL and press Enter?&rdquo;
        </h2>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The most-asked systems question in the industry, because it traverses the entire stack.
          Interviewers aren&rsquo;t looking for every detail — they&rsquo;re looking for
          <em> ordered, layered</em> thinking. Here is the full arc; go as deep as your interview
          slot allows.
        </p>
        <ol className="mt-6 space-y-4">
          {URL_JOURNEY.map((step, i) => (
            <li
              key={step.title}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                  style={{ backgroundColor: "var(--bg-soft)" }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="font-semibold">{step.title}</span>
                <span className="flex gap-1">
                  {step.layers.map((l) => (
                    <LayerChip key={l} layer={l} />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {step.text}{" "}
                <Link href={step.href} className="underline underline-offset-2">
                  Go deeper →
                </Link>
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* The question bank */}
      <section className="mt-14" aria-labelledby="question-bank">
        <h2 id="question-bank" className="font-serif text-2xl font-bold">
          The question bank
        </h2>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          {INTERVIEW_QUESTIONS.length} questions, every layer covered. Try answering aloud before
          expanding — the gap between recognizing an answer and producing one is exactly what
          interviews measure.
        </p>

        {QUESTION_LAYERS.map((layer) => (
          <div key={layer} className="mt-8">
            <h3
              className="font-mono text-sm font-semibold tracking-wide uppercase"
              style={{ color: "var(--fg-muted)" }}
            >
              {sectionTitle(layer)}
            </h3>
            <div className="mt-3 space-y-3">
              {INTERVIEW_QUESTIONS.filter((q) => q.layer === layer).map((q) => (
                <details
                  key={q.id}
                  id={q.id}
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
                    <span className="flex-1">{q.question}</span>
                    <span className="mt-0.5 shrink-0">
                      <LayerChip layer={q.layer} />
                    </span>
                  </summary>
                  <div className="border-t px-4 pt-3 pb-4" style={{ borderColor: "var(--border)" }}>
                    <p className="text-sm leading-relaxed">{q.answer}</p>
                    <p
                      className="mt-3 font-mono text-xs font-semibold tracking-wide uppercase"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      Likely follow-ups
                    </p>
                    <ul
                      className="mt-1 list-disc space-y-1 pl-5 text-sm"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {q.followUps.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm">
                      {q.links.map((link, li) => (
                        <span key={link.href + link.label}>
                          {li > 0 ? " · " : ""}
                          <Link href={link.href} className="underline underline-offset-2">
                            {link.label}
                          </Link>
                        </span>
                      ))}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-lg border p-6" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-serif text-xl font-bold">Before the interview</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm" style={{ color: "var(--fg-muted)" }}>
          <li>
            Print{" "}
            <Link href="/cheat-sheet/" className="underline underline-offset-2">
              the cheat sheet
            </Link>{" "}
            — the stack, PDUs, ports, and key numbers on one page.
          </li>
          <li>
            Take{" "}
            <Link href="/quiz/" className="underline underline-offset-2">
              the final quiz
            </Link>{" "}
            cold and revisit any layer you miss.
          </li>
          <li>
            Walk{" "}
            <Link href="/anatomy/" className="underline underline-offset-2">
              the packet anatomy
            </Link>{" "}
            once more — naming real fields beats reciting definitions.
          </li>
        </ul>
      </section>
    </main>
  );
}
