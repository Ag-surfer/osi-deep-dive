/**
 * BGP best-path selection, instrumented as a step sequence for the interactive
 * elimination-table player. Given several candidate routes to the *same* prefix,
 * BGP applies a fixed, ordered list of tie-breakers, discarding the losers at
 * each rule until a single best path remains. This models the canonical decision
 * process (the subset taught at CCNP/expert level); a few low-order Cisco
 * tie-breaks (oldest eBGP route, shortest cluster list, lowest neighbor address)
 * are omitted in favor of the deterministic Router-ID final tiebreak.
 *
 * Pure and deterministic so it is unit-tested and renders identically every run.
 */

export type OriginCode = "IGP" | "EGP" | "Incomplete";

export interface BgpRoute {
  /** Display id, e.g. "Path A". */
  id: string;
  /** Where it was learned / the next hop, e.g. "R2 · iBGP". */
  via: string;
  /** Cisco-proprietary Weight (higher wins; local to this router). */
  weight: number;
  /** Local Preference (higher wins; carried AS-wide in iBGP). */
  localPref: number;
  /** Whether this router originated the route (network/redistribute/aggregate). */
  localOrigin: boolean;
  /** The AS_PATH as a list of AS numbers (shorter wins). */
  asPath: number[];
  /** Origin attribute (IGP < EGP < Incomplete). */
  origin: OriginCode;
  /** Multi-Exit Discriminator (lower wins; only vs. same neighbor AS by default). */
  med: number;
  /** True for eBGP-learned, false for iBGP (eBGP wins). */
  ebgp: boolean;
  /** IGP metric to reach the BGP next hop (lower wins). */
  igpMetric: number;
  /** Advertising router's BGP Router ID (lowest wins — final tiebreak). */
  routerId: string;
}

/** One frame of the elimination: which rule fired and what it killed. */
export interface DecisionStep {
  narration: string;
  /** Column key to highlight for this rule, or null on init/final frames. */
  decidingAttr: string | null;
  /** All route ids eliminated up to and including this step. */
  eliminated: string[];
  /** Ids eliminated specifically on this step (for emphasis). */
  justEliminated: string[];
  /** The winning route id, set once one path remains. */
  winnerId: string | null;
}

type Key = number | string;

const ORIGIN_RANK: Record<OriginCode, number> = { IGP: 0, EGP: 1, Incomplete: 2 };

/** The ordered decision rules. `key` maps a route to a comparable where lower wins. */
const CRITERIA: { attr: string; better: string; key: (r: BgpRoute) => Key }[] = [
  { attr: "weight", better: "highest Weight", key: (r) => -r.weight },
  { attr: "localPref", better: "highest Local Preference", key: (r) => -r.localPref },
  { attr: "local", better: "locally originated paths", key: (r) => (r.localOrigin ? 0 : 1) },
  { attr: "aspath", better: "the shortest AS-Path", key: (r) => r.asPath.length },
  {
    attr: "origin",
    better: "the lowest Origin code (IGP < EGP < Incomplete)",
    key: (r) => ORIGIN_RANK[r.origin],
  },
  // Teaching simplification: real BGP only compares MED *between routes from the
  // same neighboring AS* (the page's Callout says so). We compare it globally,
  // which is correct for the shipped dataset (the MED-compared routes share a
  // neighbor AS). Authors changing the data should keep that invariant.
  { attr: "med", better: "the lowest MED", key: (r) => r.med },
  { attr: "type", better: "eBGP over iBGP", key: (r) => (r.ebgp ? 0 : 1) },
  { attr: "igp", better: "the lowest IGP metric to the next hop", key: (r) => r.igpMetric },
  { attr: "rid", better: "the lowest BGP Router ID", key: (r) => r.routerId },
];

function cmp(a: Key, b: Key): number {
  if (typeof a === "number" && typeof b === "number") return a === b ? 0 : a < b ? -1 : 1;
  return String(a).localeCompare(String(b));
}

/** Run BGP best-path over `routes` (need at least two) and return the step trace. */
export function bgpBestPathSteps(routes: BgpRoute[]): DecisionStep[] {
  if (routes.length < 2) {
    throw new Error("bgpBestPathSteps: need at least two candidate routes");
  }

  const eliminated = new Set<string>();
  const eligible = () => routes.filter((r) => !eliminated.has(r.id));

  const steps: DecisionStep[] = [
    {
      narration: `${routes.length} candidate paths exist for this prefix. BGP walks its tie-breakers in strict order, discarding losers until exactly one path survives.`,
      decidingAttr: null,
      eliminated: [],
      justEliminated: [],
      winnerId: null,
    },
  ];

  for (const c of CRITERIA) {
    const elig = eligible();
    if (elig.length <= 1) break;

    const keyed = elig.map((r) => ({ r, k: c.key(r) }));
    let best = keyed[0]!.k;
    for (const x of keyed) if (cmp(x.k, best) < 0) best = x.k;

    const losers = keyed.filter((x) => cmp(x.k, best) !== 0).map((x) => x.r.id);
    for (const id of losers) eliminated.add(id);

    const survivors = eligible();
    const winnerId = survivors.length === 1 ? survivors[0]!.id : null;
    const narration = losers.length
      ? `Prefer ${c.better}: ${survivors.map((r) => r.id).join(", ")} survive${
          survivors.length === 1 ? "s" : ""
        }; ${losers.join(", ")} eliminated.`
      : `Prefer ${c.better}: every remaining path ties here — fall through to the next rule.`;

    steps.push({
      narration,
      decidingAttr: c.attr,
      eliminated: [...eliminated],
      justEliminated: losers,
      winnerId,
    });

    if (winnerId) break;
  }

  const survivors = eligible();
  const winner = survivors[0] ?? routes[0]!;
  steps.push({
    narration: `Best path: ${winner.id} via ${winner.via}. It is installed in the BGP table, used for forwarding, and (subject to policy) advertised to neighbors.`,
    decidingAttr: null,
    eliminated: [...eliminated],
    justEliminated: [],
    winnerId: winner.id,
  });

  return steps;
}
