"use client";

import { useMemo } from "react";
import { DecisionTableViz, type DecisionRow } from "./DecisionTableViz";
import { bgpBestPathSteps, type BgpRoute } from "@/lib/algorithms/bgpBestPath";

const COLUMNS = [
  { key: "path", label: "Path" },
  { key: "via", label: "Via" },
  { key: "weight", label: "Weight" },
  { key: "localPref", label: "LocPrf" },
  { key: "local", label: "Local?" },
  { key: "aspath", label: "AS-Path" },
  { key: "origin", label: "Org" },
  { key: "med", label: "MED" },
  { key: "type", label: "Type" },
  { key: "igp", label: "IGP" },
  { key: "rid", label: "Router ID" },
];

const ORIGIN_LETTER = { IGP: "i", EGP: "e", Incomplete: "?" } as const;

/**
 * MDX-facing wrapper: declare the candidate BGP routes for a prefix and this runs
 * the best-path decision and plays the elimination back through the shared
 * decision-table player.
 */
export function BgpBestPathViz({
  routes,
  title = "BGP best-path selection",
  caption,
}: {
  routes: BgpRoute[];
  title?: string;
  caption?: string;
}) {
  const steps = useMemo(() => bgpBestPathSteps(routes), [routes]);

  const rows: DecisionRow[] = useMemo(
    () =>
      routes.map((r) => ({
        id: r.id,
        path: r.id,
        via: r.via,
        weight: String(r.weight),
        localPref: String(r.localPref),
        local: r.localOrigin ? "yes" : "—",
        aspath: r.asPath.join(" "),
        origin: ORIGIN_LETTER[r.origin],
        med: String(r.med),
        type: r.ebgp ? "eBGP" : "iBGP",
        igp: String(r.igpMetric),
        rid: r.routerId,
      })),
    [routes],
  );

  const summary = `Interactive BGP best-path walkthrough over ${routes.length} candidate routes to one prefix. Step through to watch BGP apply its tie-breakers in order — Weight, Local Preference, AS-Path length, Origin, MED, eBGP-over-iBGP, IGP metric, and finally Router ID — eliminating losers until a single best path is starred.`;

  return (
    <DecisionTableViz
      title={title}
      columns={COLUMNS}
      rows={rows}
      steps={steps}
      caption={
        caption ??
        "Step through the decision: the highlighted column is the rule being applied; struck-through rows are eliminated; ★ marks the surviving best path."
      }
      summary={summary}
    />
  );
}
