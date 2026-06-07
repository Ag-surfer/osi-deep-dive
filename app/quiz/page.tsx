import { FinalQuiz } from "@/components/FinalQuiz";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Final Quiz",
  description:
    "A cross-layer final exam covering all seven OSI layers — encapsulation, addressing, routing, transport, and the full request round trip. Test your understanding of the whole stack.",
  path: "/quiz/",
});

export default function QuizPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          Test yourself
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Final Quiz</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Twelve questions spanning all seven layers and the ideas that tie them together —
          encapsulation, addressing, the request round trip, and how OSI maps to TCP/IP. Each is
          tagged with the layer it tests.
        </p>
      </header>

      <section className="mt-10">
        <FinalQuiz />
      </section>
    </main>
  );
}
