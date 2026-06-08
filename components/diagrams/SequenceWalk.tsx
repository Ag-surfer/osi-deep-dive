"use client";

import { SequenceWalkViz, type WalkStep } from "./SequenceWalkViz";

export interface SequenceWalkStep {
  /** Index into `actors` for the sender. */
  from: number;
  /** Index into `actors` for the receiver. */
  to: number;
  /** Short label drawn on the arrow. */
  label: string;
  /** Longer explanation shown in the narration line for this step. */
  note?: string;
  /** Arrow intent: neutral (a request/setup), warn (a referral), good (a reply/ack). */
  accent?: "neutral" | "warn" | "good";
  dashed?: boolean;
}

/**
 * MDX-facing **interactive** sequence diagram: like the static `SequenceDiagram`,
 * but messages are revealed one Play/step at a time with a narration line — built
 * on the shared `SequenceWalkViz` engine. Declare actors as plain labels and steps
 * with `from`/`to` indices; add a `note` per step for the teaching narration.
 */
export function SequenceWalk({
  actors,
  steps,
  title,
  caption,
  headerColor,
}: {
  actors: string[];
  steps: SequenceWalkStep[];
  title?: string;
  caption?: string;
  headerColor?: string;
}) {
  const walkActors = actors.map((label, i) => ({ id: `a${i}`, label, sub: "" }));
  const walkSteps: WalkStep[] = steps.map((s) => ({
    from: `a${s.from}`,
    to: `a${s.to}`,
    label: s.label,
    narration: s.note ?? s.label,
    accent: s.accent ?? "neutral",
    dashed: s.dashed,
  }));

  const summary = `Interactive sequence diagram with ${actors.length} participants. Step through: ${steps
    .map((s) => `${actors[s.from]} → ${actors[s.to]}: ${s.label}`)
    .join("; ")}.`;

  return (
    <SequenceWalkViz
      title={title}
      actors={walkActors}
      steps={walkSteps}
      caption={caption}
      summary={summary}
      headerColor={headerColor}
    />
  );
}
