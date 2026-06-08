/**
 * Spanning Tree Protocol (802.1D / RSTP) convergence, instrumented as a step
 * sequence for the interactive graph player. STP elects the switch with the
 * lowest Bridge ID as the **root bridge**, then every other switch computes its
 * least-cost path to the root — the port on that path becomes its **root port**
 * (forwarding); links that lose the cost/Bridge-ID comparison go **blocking**.
 * That computation is a shortest-path tree rooted at the root bridge, so it
 * reuses the same `AlgoStep[]` shape (and `RoutingAlgoViz`) as OSPF's SPF.
 *
 * Pure and deterministic (ties broken by Bridge ID) so it is unit tested.
 */

import type { AlgoStep, AlgoTableRow, GraphEdge, GraphNode, NodeState } from "./dijkstra";

/** Run STP root election + least-cost-path computation over a switched topology.
 *  `bridgeIds` maps each node id to its Bridge ID string (priority.MAC), which
 *  must be lexically comparable (lower = better), e.g. "4096.0000.0000.0001". */
export function stpSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  bridgeIds: Record<string, string>,
): AlgoStep[] {
  const ids = nodes.map((n) => n.id);
  const labelOf = new Map(nodes.map((n) => [n.id, n.label ?? n.id]));
  const name = (id: string) => labelOf.get(id) ?? id;
  const bid = (id: string) => bridgeIds[id] ?? "65535.ffff.ffff.ffff";

  // Compare two Bridge IDs ("priority.mac") the way a switch does: numerically on
  // priority first, then by MAC — NOT lexically, since "4096" would otherwise
  // sort after "32768" ('4' > '3'). Lower is better.
  const cmpBid = (a: string, b: string): number => {
    const [pa, ...ra] = a.split(".");
    const [pb, ...rb] = b.split(".");
    const na = Number(pa);
    const nb = Number(pb);
    if (na !== nb) return na - nb;
    const sa = ra.join(".");
    const sb = rb.join(".");
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  };

  // Root bridge = lowest Bridge ID (deterministic).
  let root = ids[0]!;
  for (const id of ids) if (cmpBid(bid(id), bid(root)) < 0) root = id;

  const dist: Record<string, number> = {};
  const via: Record<string, string | null> = {};
  for (const id of ids) {
    dist[id] = Infinity;
    via[id] = null;
  }
  dist[root] = 0;
  const D = (id: string) => dist[id] ?? Infinity;
  const V = (id: string) => via[id] ?? null;

  const adj = new Map<string, { to: string; cost: number }[]>();
  for (const id of ids) adj.set(id, []);
  for (const e of edges) {
    adj.get(e.a)?.push({ to: e.b, cost: e.cost });
    adj.get(e.b)?.push({ to: e.a, cost: e.cost });
  }

  const settled = new Set<string>();
  const steps: AlgoStep[] = [];

  const snapshot = (narration: string, consideredEdges: [string, string][] = []) => {
    const nodeState: Record<string, NodeState> = {};
    for (const id of ids) {
      nodeState[id] =
        id === root
          ? "source"
          : settled.has(id)
            ? "settled"
            : D(id) < Infinity
              ? "frontier"
              : "unvisited";
    }
    const treeEdges: [string, string][] = [];
    for (const id of ids) {
      const p = V(id);
      if (p) treeEdges.push([p, id]);
    }
    const table: AlgoTableRow[] = ids.map((id) => {
      const p = V(id);
      return {
        id,
        cells: [
          name(id),
          id === root ? "0 (root)" : D(id) === Infinity ? "∞" : String(D(id)),
          id === root ? "— (root)" : p ? name(p) : "—",
        ],
      };
    });
    steps.push({ narration, nodeState, treeEdges, consideredEdges, table });
  };

  snapshot(
    `Every switch boots believing it is root and floods BPDUs. The lowest Bridge ID wins: ${name(
      root,
    )} (${bid(root)}) is elected root bridge.`,
  );

  while (settled.size < ids.length) {
    // Choose the unsettled switch with the lowest cost to root; tie → lowest Bridge ID.
    let u: string | null = null;
    for (const id of ids) {
      if (settled.has(id)) continue;
      if (D(id) === Infinity) continue;
      if (u === null || D(id) < D(u) || (D(id) === D(u) && cmpBid(bid(id), bid(u)) < 0)) u = id;
    }
    if (u === null) {
      snapshot("Remaining switches have no path to the root — they cannot join the tree.");
      break;
    }

    settled.add(u);
    const considered: [string, string][] = [];
    const improved: string[] = [];
    for (const { to, cost } of adj.get(u) ?? []) {
      if (settled.has(to)) continue;
      considered.push([u, to]);
      const nd = D(u) + cost;
      // Lower cost wins; on a tie the neighbor with the lower Bridge ID as next
      // hop keeps the existing choice unless this strictly improves cost.
      if (nd < D(to)) {
        dist[to] = nd;
        via[to] = u;
        improved.push(`${name(to)}→${nd}`);
      }
    }

    if (u === root) {
      snapshot(
        `${name(root)} is root: all its ports are designated (forwarding), cost 0. Neighbors learn a path: ${improved.join(", ") || "none"}.`,
        considered,
      );
    } else {
      const cost = D(u);
      const rp = name(V(u) ?? u);
      snapshot(
        `${name(u)} selects its least-cost path to root: cost ${cost} via ${rp} — that port becomes its root port (forwarding). Losing links go blocking.${
          improved.length ? ` Neighbors updated: ${improved.join(", ")}.` : ""
        }`,
        considered,
      );
    }
  }

  return steps;
}
