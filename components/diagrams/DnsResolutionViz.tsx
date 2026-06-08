"use client";

import { useMemo } from "react";
import { SKETCH } from "./RoughFigure";
import { SequenceWalkViz, type WalkStep } from "./SequenceWalkViz";
import { dnsSteps } from "@/lib/algorithms/dnsResolution";

/**
 * MDX-facing wrapper: run a DNS resolution for `domain` and play it through the
 * generic sequence-walk diagram. Referrals are amber/dashed; the authoritative
 * answer and its delivery are green.
 */
export function DnsResolutionViz({
  domain = "www.example.com",
  recordType = "A",
  title = "DNS resolution — walking the hierarchy from root to answer",
  caption,
}: {
  domain?: string;
  recordType?: string;
  title?: string;
  caption?: string;
}) {
  const { actors, steps } = useMemo(() => dnsSteps(domain, recordType), [domain, recordType]);

  const walkSteps: WalkStep[] = steps.map((s) => ({
    from: s.from,
    to: s.to,
    label: s.label,
    narration: s.narration,
    accent:
      s.kind === "referral"
        ? "warn"
        : s.kind === "answer" || s.kind === "deliver"
          ? "good"
          : "neutral",
    dashed: s.kind === "referral",
  }));

  return (
    <SequenceWalkViz
      title={title}
      headerColor={SKETCH.l7!}
      actors={actors}
      steps={walkSteps}
      summary={`Interactive DNS resolution of ${domain}: step through the recursive resolver querying a root server, following its referral to the .${domain
        .split(".")
        .pop()} TLD, then to the authoritative server, and caching the answer before returning it to the stub resolver.`}
      caption={
        caption ??
        "Neutral arrows are queries; amber dashed arrows are referrals ('I don't know, go ask them'); green is the authoritative answer and its delivery. Only the authoritative server gives a real answer — everyone above just points closer."
      }
    />
  );
}
