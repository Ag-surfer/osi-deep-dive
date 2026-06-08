import { describe, expect, it } from "vitest";
import { dijkstraSteps, type GraphNode, type GraphEdge } from "./dijkstra";

// The topology used on the OSPF page. SPF from R1 should improve R3 (5→4 via R2)
// and R5 (7→6 via R4), exercising edge relaxation.
const nodes: GraphNode[] = [
  { id: "R1", x: 0, y: 0 },
  { id: "R2", x: 0, y: 0 },
  { id: "R3", x: 0, y: 0 },
  { id: "R4", x: 0, y: 0 },
  { id: "R5", x: 0, y: 0 },
];
const edges: GraphEdge[] = [
  { a: "R1", b: "R2", cost: 2 },
  { a: "R1", b: "R3", cost: 5 },
  { a: "R2", b: "R3", cost: 2 },
  { a: "R2", b: "R4", cost: 3 },
  { a: "R3", b: "R5", cost: 3 },
  { a: "R4", b: "R5", cost: 1 },
];

/** Read the cost column out of a step's table for a given node. */
function cost(step: ReturnType<typeof dijkstraSteps>[number], id: string) {
  return step.table.find((r) => r.id === id)?.cells[1];
}

describe("dijkstraSteps", () => {
  it("emits an init frame plus one frame per node", () => {
    const steps = dijkstraSteps(nodes, edges, "R1");
    expect(steps).toHaveLength(nodes.length + 1);
  });

  it("computes the correct final shortest-path costs", () => {
    const final = dijkstraSteps(nodes, edges, "R1").at(-1)!;
    expect(cost(final, "R1")).toBe("0");
    expect(cost(final, "R2")).toBe("2");
    expect(cost(final, "R3")).toBe("4"); // improved from the direct 5 via R2
    expect(cost(final, "R4")).toBe("5");
    expect(cost(final, "R5")).toBe("6"); // improved from 7 (via R3) to 6 (via R4)
  });

  it("builds the expected shortest-path tree (predecessors)", () => {
    const final = dijkstraSteps(nodes, edges, "R1").at(-1)!;
    const via = (id: string) => final.table.find((r) => r.id === id)?.cells[2];
    expect(via("R2")).toBe("R1");
    expect(via("R3")).toBe("R2");
    expect(via("R4")).toBe("R2");
    expect(via("R5")).toBe("R4");
  });

  it("settles the source first and all nodes by the end", () => {
    const steps = dijkstraSteps(nodes, edges, "R1");
    expect(steps[1]?.nodeState.R1).toBe("source");
    const final = steps.at(-1)!;
    for (const id of ["R2", "R3", "R4", "R5"]) {
      expect(final.nodeState[id]).toBe("settled");
    }
  });

  it("marks unreachable nodes and stops cleanly", () => {
    const islandNodes: GraphNode[] = [...nodes, { id: "R9", x: 0, y: 0 }];
    const final = dijkstraSteps(islandNodes, edges, "R1").at(-1)!;
    expect(cost(final, "R9")).toBe("∞");
    expect(final.nodeState.R9).toBe("unvisited");
  });

  it("throws if the source is not a node", () => {
    expect(() => dijkstraSteps(nodes, edges, "RX")).toThrow();
  });
});
