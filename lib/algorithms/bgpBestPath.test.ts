import { describe, expect, it } from "vitest";
import { bgpBestPathSteps, type BgpRoute } from "./bgpBestPath";

/** A baseline route; override per test to isolate a decision rule. */
function route(id: string, over: Partial<BgpRoute>): BgpRoute {
  return {
    id,
    via: id,
    weight: 0,
    localPref: 100,
    localOrigin: false,
    asPath: [65010, 65000],
    origin: "IGP",
    med: 0,
    ebgp: true,
    igpMetric: 10,
    routerId: "10.0.0.1",
    ...over,
  };
}

const winnerOf = (routes: BgpRoute[]) => bgpBestPathSteps(routes).at(-1)!.winnerId;

describe("bgpBestPathSteps", () => {
  it("throws with fewer than two candidates", () => {
    expect(() => bgpBestPathSteps([route("A", {})])).toThrow();
  });

  it("resolves on Local Preference, then AS-Path, then MED (the page example)", () => {
    const routes = [
      route("A", { localPref: 100, asPath: [65002, 65010] }),
      route("B", { localPref: 150, asPath: [65003, 65020, 65010] }),
      route("C", { localPref: 150, asPath: [65004, 65010], med: 30 }),
      route("D", { localPref: 150, asPath: [65004, 65010], med: 10 }),
    ];
    expect(winnerOf(routes)).toBe("D");

    const steps = bgpBestPathSteps(routes);
    const elimAt = (attr: string) =>
      steps.find((s) => s.decidingAttr === attr)?.justEliminated ?? [];
    expect(elimAt("localPref")).toEqual(["A"]); // lower local-pref dropped
    expect(elimAt("aspath")).toEqual(["B"]); // longer AS-path dropped
    expect(elimAt("med")).toEqual(["C"]); // higher MED dropped → D wins
  });

  it("falls through ties to eBGP-over-iBGP, then lowest IGP metric", () => {
    const routes = [
      route("P1", { asPath: [1, 2], ebgp: true, igpMetric: 10, routerId: "10.0.0.9" }),
      route("P2", { asPath: [3, 2], ebgp: false, igpMetric: 10, routerId: "10.0.0.1" }),
      route("P3", { asPath: [4, 2], ebgp: true, igpMetric: 5, routerId: "10.0.0.7" }),
    ];
    expect(winnerOf(routes)).toBe("P3");
    const steps = bgpBestPathSteps(routes);
    expect(steps.find((s) => s.decidingAttr === "type")?.justEliminated).toEqual(["P2"]);
    expect(steps.find((s) => s.decidingAttr === "igp")?.justEliminated).toEqual(["P1"]);
  });

  it("uses the lowest Router ID as the deterministic final tiebreak", () => {
    const routes = [route("Q1", { routerId: "10.0.0.8" }), route("Q2", { routerId: "10.0.0.2" })];
    expect(winnerOf(routes)).toBe("Q2");
  });

  it("highest Weight short-circuits everything else", () => {
    const routes = [
      route("W1", { weight: 0, localPref: 999 }),
      route("W2", { weight: 100, localPref: 1 }),
    ];
    expect(winnerOf(routes)).toBe("W2"); // weight beats local-pref
  });

  it("always terminates with exactly one winner among the candidates", () => {
    const routes = [
      route("A", { igpMetric: 7 }),
      route("B", { igpMetric: 3 }),
      route("C", { igpMetric: 9 }),
    ];
    const winner = winnerOf(routes);
    expect(routes.map((r) => r.id)).toContain(winner);
  });
});
