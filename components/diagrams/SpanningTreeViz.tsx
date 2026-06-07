"use client";

import { useMemo } from "react";
import { RoutingAlgoViz } from "./RoutingAlgoViz";
import { stpSteps } from "@/lib/algorithms/stp";
import type { GraphEdge, GraphNode } from "@/lib/algorithms/dijkstra";

/**
 * MDX-facing wrapper: declare a switched topology with per-switch Bridge IDs and
 * this runs STP — root election then least-cost path to the root — and plays it
 * back on the shared graph player. Forwarding links (root/designated ports) are
 * the green tree; faded links are blocking, broken to keep the L2 loop out.
 */
export function SpanningTreeViz({
  nodes,
  edges,
  bridgeIds,
  title = "Spanning Tree Protocol — electing the root and pruning loops",
  caption,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  bridgeIds: Record<string, string>;
  title?: string;
  caption?: string;
}) {
  const steps = useMemo(() => stpSteps(nodes, edges, bridgeIds), [nodes, edges, bridgeIds]);

  const summary = `Interactive Spanning Tree Protocol walkthrough on a ${nodes.length}-switch topology. Step through to watch the lowest Bridge ID win root election, then each switch choose its least-cost path to the root as its root port, with the remaining loop links placed into blocking.`;

  return (
    <RoutingAlgoViz
      title={title}
      nodes={nodes}
      edges={edges}
      steps={steps}
      columns={["Switch", "Cost→Root", "Root port via"]}
      caption={
        caption ??
        "Green = forwarding (root/designated ports, the active tree); faded = blocking links held in reserve. The double-ringed switch is the elected root bridge."
      }
      summary={summary}
    />
  );
}
