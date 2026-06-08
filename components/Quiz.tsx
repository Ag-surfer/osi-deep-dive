"use client";

import { useState, type ReactNode } from "react";

export interface QuizQuestion {
  q: string;
  /** Answer options. */
  options: string[];
  /** Index of the correct option. */
  answer: number;
  /** Explanation shown after answering. */
  explanation?: string;
}

/** Interactive self-check: pick an answer, get immediate feedback + explanation. */
export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  return (
    <div className="my-6 space-y-4">
      {questions.map((question, i) => (
        <QuestionCard key={i} index={i} question={question} />
      ))}
    </div>
  );
}

/**
 * A single interactive question. Reused by both the per-layer `Quiz` and the
 * cross-layer final quiz: `tag` shows a layer badge, `onAnswer` reports the result
 * up for scoring, and `allowReset` hides the per-question reset in exam mode.
 */
export function QuestionCard({
  index,
  question,
  tag,
  onAnswer,
  allowReset = true,
}: {
  index: number;
  question: QuizQuestion;
  tag?: ReactNode;
  onAnswer?: (correct: boolean) => void;
  allowReset?: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">
          <span className="font-mono text-sm" style={{ color: "var(--fg-muted)" }}>
            Q{index + 1}.
          </span>{" "}
          {question.q}
        </p>
        {tag ? <div className="shrink-0">{tag}</div> : null}
      </div>
      <ul className="mt-3 space-y-2">
        {question.options.map((opt, oi) => {
          const isCorrect = oi === question.answer;
          const isPicked = picked === oi;
          let bg = "transparent";
          let border = "var(--border)";
          if (answered && isCorrect) {
            bg = "color-mix(in oklch, var(--color-layer-3) 20%, transparent)";
            border = "var(--color-layer-3)";
          } else if (answered && isPicked && !isCorrect) {
            bg = "color-mix(in oklch, var(--color-layer-1) 18%, transparent)";
            border = "var(--color-layer-1)";
          }
          return (
            <li key={oi}>
              <button
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked(oi);
                  onAnswer?.(oi === question.answer);
                }}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${
                  answered && isCorrect
                    ? "quiz-pop"
                    : answered && isPicked && !isCorrect
                      ? "quiz-shake"
                      : ""
                }`}
                style={{ backgroundColor: bg, borderColor: border }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-xs"
                  style={{ borderColor: border }}
                >
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1">{opt}</span>
                {answered && isCorrect ? (
                  <span aria-hidden>✓</span>
                ) : answered && isPicked && !isCorrect ? (
                  <span aria-hidden>✗</span>
                ) : null}
                {/* Convey correctness to assistive tech, not by color/glyph alone. */}
                {answered && isCorrect ? <span className="sr-only"> (correct answer)</span> : null}
                {answered && isPicked && !isCorrect ? (
                  <span className="sr-only"> (your answer, incorrect)</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {answered ? (
        <div className="quiz-reveal mt-3 text-sm" role="status" aria-live="polite">
          <p
            className="font-semibold"
            style={{ color: picked === question.answer ? "var(--ok)" : "var(--bad)" }}
          >
            {picked === question.answer
              ? ["Correct! 🎉", "Nailed it!", "Exactly right."][index % 3]
              : ["Not quite — here's why:", "Close, but here's the catch:"][index % 2]}
          </p>
          {question.explanation ? (
            <p className="mt-1 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {question.explanation}
            </p>
          ) : null}
          {allowReset ? (
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="mt-2 text-xs underline underline-offset-2"
              style={{ color: "var(--fg-muted)" }}
            >
              Reset
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
