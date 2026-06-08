/**
 * Dijkstra's shortest-path-first (SPF) algorithm, instrumented to emit a *step
 * sequence* for the interactive RoutingAlgoViz player. This is the exact
 * computation OSPF and IS-IS run over their link-state database to build the
 * shortest-path tree rooted at the local router.
 *
 * Pure and deterministic (ties broken by node declaration order) so it is unit
 * testable and renders identically every run. The presentational component
 * (`RoutingAlgoViz`) knows nothing about Dijkstra — it just plays back the steps.
 */

export interface GraphNode {
  /** Stable id used by edges and tables, e.g. "R1". */
  id: string;
  /** SVG x coordinate. */
  x: number;
  /** SVG y coordinate. */
  y: number;
  /** Display label; falls back to `id`. */
  label?: string;
}

export interface GraphEdge {
  /** One endpoint id. */
  a: string;
  /** Other endpoint id (links are undirected for SPF). */
  b: string;
  /** Link cost / metric. */
  cost: number;
}

/** Per-node visual state at a given step of the algorithm. */
export type NodeState = "source" | "settled" | "frontier" | "unvisited";

export interface AlgoTableRow {
  /** Node id this row describes (lets the UI color the row's chip). */
  id: string;
  /** Cell values aligned to the player's column headers. */
  cells: string[];
}

/** One frozen frame of the algorithm: what to draw and what to say. */
export interface AlgoStep {
  /** Plain-language explanation of what just happened. */
  narration: string;
  /** State of every node at this frame. */
  nodeState: Record<string, NodeState>;
  /** Edges committed to the shortest-path tree so far, as `[from, to]`. */
  treeEdges: [string, string][];
  /** Edges relaxed (examined) on this step — highlighted transiently. */
  consideredEdges: [string, string][];
  /** Snapshot of the distance/predecessor table at this frame. */
  table: AlgoTableRow[];
}

/**
 * Run SPF from `sourceId` and return one `AlgoStep` per settled node (plus an
 * initialization frame). Throws if the source id is not among the nodes.
 */
export function dijkstraSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string,
): AlgoStep[] {
  const ids = nodes.map((n) => n.id);
  if (!ids.includes(sourceId)) {
    throw new Error(`dijkstraSteps: source "${sourceId}" is not a node`);
  }

  const labelOf = new Map(nodes.map((n) => [n.id, n.label ?? n.id]));
  const nameOf = (id: string) => labelOf.get(id) ?? id;

  const dist: Record<string, number> = {};
  const via: Record<string, string | null> = {};
  for (const id of ids) {
    dist[id] = Infinity;
    via[id] = null;
  }
  dist[sourceId] = 0;

  // Every id is initialized above, but noUncheckedIndexedAccess widens record
  // reads to `| undefined`; these helpers re-narrow at the access sites.
  const D = (id: string): number => dist[id] ?? Infinity;
  const V = (id: string): string | null => via[id] ?? null;

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
        id === sourceId
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
        cells: [nameOf(id), D(id) === Infinity ? "∞" : String(D(id)), p ? nameOf(p) : "—"],
      };
    });
    steps.push({ narration, nodeState, treeEdges, consideredEdges, table });
  };

  snapshot(
    `Initialize: the root ${nameOf(sourceId)} has cost 0; every other router starts at ∞. SPF grows a shortest-path tree outward from the root.`,
  );

  while (settled.size < ids.length) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of ids) {
      if (!settled.has(id) && D(id) < best) {
        best = D(id);
        u = id;
      }
    }
    if (u === null) {
      snapshot(
        "Every remaining router is still ∞ — unreachable from the root over the available links. SPF stops.",
      );
      break;
    }

    settled.add(u);
    const considered: [string, string][] = [];
    const improvements: string[] = [];
    for (const { to, cost } of adj.get(u) ?? []) {
      if (settled.has(to)) continue;
      considered.push([u, to]);
      const nd = D(u) + cost;
      if (nd < D(to)) {
        dist[to] = nd;
        via[to] = u;
        improvements.push(`${nameOf(to)} → ${nd} (via ${nameOf(u)})`);
      }
    }

    const relaxText = improvements.length
      ? ` Relax its neighbors: ${improvements.join(", ")}.`
      : " None of its neighbors get a cheaper path.";
    const settleText =
      u === sourceId
        ? `Settle the root ${nameOf(u)} (cost 0) — it is permanently on the tree.`
        : `Pick the smallest tentative cost: ${nameOf(u)} at ${best}, reached via ${nameOf(
            V(u) ?? u,
          )}. Settle it onto the tree.`;
    snapshot(settleText + relaxText, considered);
  }

  return steps;
}
