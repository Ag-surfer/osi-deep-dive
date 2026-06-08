"use client";

import { useMemo } from "react";
import { SKETCH } from "./RoughFigure";
import { SequenceWalkViz, type WalkStep } from "./SequenceWalkViz";
import { kerberosSteps } from "@/lib/algorithms/kerberos";

/**
 * MDX-facing wrapper: play the Kerberos ticket exchange through the generic
 * sequence-walk diagram. Requests are neutral; the tickets/grants the KDC and
 * service return are green.
 */
export function KerberosViz({
  user = "alice",
  service = "fileserver",
  title = "Kerberos — proving identity with tickets, no password on the wire",
  caption,
}: {
  user?: string;
  service?: string;
  title?: string;
  caption?: string;
}) {
  const { actors, steps } = useMemo(() => kerberosSteps(user, service), [user, service]);

  const walkSteps: WalkStep[] = steps.map((s) => ({
    from: s.from,
    to: s.to,
    label: s.label,
    narration: s.narration,
    accent: s.kind === "grant" || s.kind === "confirm" ? "good" : "neutral",
    dashed: s.kind === "grant" || s.kind === "confirm",
  }));

  return (
    <SequenceWalkViz
      title={title}
      headerColor={SKETCH.l5!}
      actors={actors}
      steps={walkSteps}
      summary={`Interactive Kerberos exchange: ${user} gets a Ticket-Granting Ticket from the Authentication Server, exchanges it at the Ticket-Granting Server for a ${service} ticket, then presents that ticket to the service — proving identity without the password ever crossing the network, and enabling single sign-on.`}
      caption={
        caption ??
        "Neutral arrows are requests; green arrows carry the tickets/grants from the KDC and the service. The password never travels — only the real user can decrypt the AS reply, and the TGT then unlocks many services (single sign-on)."
      }
    />
  );
}
