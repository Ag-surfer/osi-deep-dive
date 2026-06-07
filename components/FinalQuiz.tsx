"use client";

import { useState } from "react";
import Link from "next/link";
import { QuestionCard } from "./Quiz";
import { LAYERS } from "@/lib/layers";
import { FINAL_QUIZ } from "@/lib/finalQuiz";

function LayerTag({ layer }: { layer: number }) {
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

/** Scored cross-layer final exam built on the shared QuestionCard. */
export function FinalQuiz() {
  const total = FINAL_QUIZ.length;
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [attempt, setAttempt] = useState(0);

  const answeredCount = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;
  const done = answeredCount === total;
  const pct = Math.round((correct / total) * 100);

  function retake() {
    setAnswers({});
    setAttempt((a) => a + 1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const verdict =
    pct >= 90
      ? { title: "You've mastered the stack. 🎉", color: "var(--ok)" }
      : pct >= 70
        ? { title: "Solid understanding — a couple to revisit.", color: "var(--ok)" }
        : { title: "Worth another pass through the layers.", color: "var(--bad)" };

  return (
    <div>
      {/* Sticky progress / score */}
      <div
        className="sticky top-16 z-10 mb-6 rounded-lg border px-4 py-3 backdrop-blur"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in oklch, var(--bg) 88%, transparent)",
        }}
      >
        <div className="flex items-center justify-between text-sm">
          <span aria-live="polite">
            <strong>
              {answeredCount} / {total}
            </strong>{" "}
            answered · <span style={{ color: "var(--ok)" }}>{correct} correct</span>
          </span>
          <span className="font-mono" style={{ color: "var(--fg-muted)" }}>
            {answeredCount > 0 ? `${pct}%` : ""}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: "var(--bg-soft)" }}
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(answeredCount / total) * 100}%`,
              backgroundColor: "var(--color-layer-3)",
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {FINAL_QUIZ.map((question, i) => (
          <QuestionCard
            key={`${attempt}-${i}`}
            index={i}
            question={question}
            tag={<LayerTag layer={question.layer} />}
            allowReset={false}
            onAnswer={(ok) => setAnswers((a) => ({ ...a, [i]: ok }))}
          />
        ))}
      </div>

      {/* Result */}
      {done ? (
        <div
          className="mt-8 rounded-lg border p-6 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)" }}
          role="status"
          aria-live="polite"
        >
          <p className="font-mono text-sm" style={{ color: "var(--fg-muted)" }}>
            Your score
          </p>
          <p className="mt-1 font-serif text-4xl font-bold">
            {correct} / {total}
          </p>
          <p className="mt-2 font-semibold" style={{ color: verdict.color }}>
            {verdict.title}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={retake}
              className="rounded-md px-5 py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--color-layer-3)", color: "var(--on-accent)" }}
            >
              ↺ Retake
            </button>
            <Link
              href="/layers/physical/"
              className="rounded-md border px-5 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--border)" }}
            >
              Revisit the layers
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
