import { describe, expect, it } from "vitest";
import { stpSteps } from "./stp";
import type { GraphNode, GraphEdge } from "./dijkstra";

// Four switches in a square with a diagonal. S1 has the lowest Bridge ID → root.
const nodes: GraphNode[] = [
  { id: "S1", x: 0, y: 0 },
  { id: "S2", x: 0, y: 0 },
  { id: "S3", x: 0, y: 0 },
  { id: "S4", x: 0, y: 0 },
];
const edges: GraphEdge[] = [
  { a: "S1", b: "S2", cost: 4 },
  { a: "S1", b: "S3", cost: 4 },
  { a: "S2", b: "S4", cost: 4 },
  { a: "S3", b: "S4", cost: 4 },
  { a: "S2", b: "S3", cost: 19 },
];
const bridgeIds = {
  S1: "4096.0000.0000.0001",
  S2: "32768.0000.0000.0002",
  S3: "32768.0000.0000.0003",
  S4: "32768.0000.0000.0004",
};

const costOf = (step: ReturnType<typeof stpSteps>[number], id: string) =>
  step.table.find((r) => r.id === id)?.cells[1];
const viaOf = (step: ReturnType<typeof stpSteps>[number], id: string) =>
  step.table.find((r) => r.id === id)?.cells[2];

describe("stpSteps", () => {
  it("elects the lowest Bridge ID as root and marks it the source node", () => {
    const steps = stpSteps(nodes, edges, bridgeIds);
    expect(steps[0]?.narration).toContain("S1");
    const final = steps.at(-1)!;
    expect(final.nodeState.S1).toBe("source");
    expect(costOf(final, "S1")).toBe("0 (root)");
  });

  it("computes least-cost path to root for each switch", () => {
    const final = stpSteps(nodes, edges, bridgeIds).at(-1)!;
    expect(costOf(final, "S2")).toBe("4");
    expect(costOf(final, "S3")).toBe("4");
    expect(costOf(final, "S4")).toBe("8"); // via S2 or S3, cost 4+4
  });

  it("breaks the S4 root-port tie toward the lower Bridge ID (S2)", () => {
    const final = stpSteps(nodes, edges, bridgeIds).at(-1)!;
    // S4 reaches root at cost 8 via S2 (BID …0002) or S3 (…0003); S2 wins the tie.
    expect(viaOf(final, "S4")).toBe("S2");
  });

  it("produces an active tree with exactly N-1 forwarding links (loops blocked)", () => {
    const final = stpSteps(nodes, edges, bridgeIds).at(-1)!;
    expect(final.treeEdges).toHaveLength(nodes.length - 1);
  });

  it("settles every switch onto the tree", () => {
    const final = stpSteps(nodes, edges, bridgeIds).at(-1)!;
    for (const id of ["S2", "S3", "S4"]) expect(final.nodeState[id]).toBe("settled");
  });
});
