"use client";

import { useMemo } from "react";
import { RoutingAlgoViz } from "./RoutingAlgoViz";
import { dijkstraSteps, type GraphEdge, type GraphNode } from "@/lib/algorithms/dijkstra";

/**
 * MDX-facing wrapper: declare a link-state topology and a root router, and this
 * runs SPF (Dijkstra) and hands the resulting step sequence to the generic
 * player. This is exactly what OSPF/IS-IS do over their LSDB to build the
 * shortest-path tree rooted at the local router.
 */
export function DijkstraViz({
  nodes,
  edges,
  source,
  title = "SPF (Dijkstra) — shortest-path tree from the root",
  caption,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  source: string;
  title?: string;
  caption?: string;
}) {
  const steps = useMemo(() => dijkstraSteps(nodes, edges, source), [nodes, edges, source]);

  const summary = `Interactive shortest-path-first walkthrough on a ${nodes.length}-router topology rooted at ${source}. Step through to watch SPF settle each router in increasing cost order, relax neighbor links, and build the shortest-path tree, with a live cost/next-hop table.`;

  return (
    <RoutingAlgoViz
      title={title}
      nodes={nodes}
      edges={edges}
      steps={steps}
      columns={["Router", "Cost", "Via"]}
      caption={
        caption ??
        "Step through SPF: green = settled (on the tree), amber dashed = the link being relaxed this step, the badge above each router is its current best cost from the root."
      }
      summary={summary}
    />
  );
}
