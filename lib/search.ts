/**
 * Zero-dependency client-side search over the build-time index. The corpus
 * is ~200 small records, so simple weighted substring scoring is plenty —
 * and instant.
 */

import type { SearchRecord } from "./searchIndex";

const MAX_RESULTS = 12;

/** Score one record against pre-lowercased query tokens. 0 = no match. */
function score(record: SearchRecord, tokens: string[]): number {
  const title = record.title.toLowerCase();
  const context = record.context.toLowerCase();
  const body = record.body.toLowerCase();
  let total = 0;
  for (const t of tokens) {
    let s = 0;
    if (title === t) s = 100;
    else if (title.startsWith(t)) s = 60;
    else if (title.includes(t)) s = 40;
    else if (context.includes(t)) s = 20;
    else if (body.includes(t)) s = 10;
    if (s === 0) return 0; // every token must match somewhere
    total += s;
  }
  return total;
}

export function searchRecords(records: SearchRecord[], query: string): SearchRecord[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  return records
    .map((r) => ({ r, s: score(r, tokens) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, MAX_RESULTS)
    .map(({ r }) => r);
}
