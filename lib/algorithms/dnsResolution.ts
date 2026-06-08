/**
 * DNS recursive resolution, instrumented as a step sequence for the interactive
 * walkthrough. A stub resolver asks a recursive resolver, which then walks the
 * hierarchy *iteratively* — root → TLD → authoritative — following referrals
 * until it gets the answer, caches it, and returns it to the stub. This models
 * the canonical cold-cache lookup.
 *
 * Pure and deterministic so it is unit tested.
 */

export interface DnsActor {
  id: string;
  label: string;
  /** Smaller secondary line under the label. */
  sub: string;
}

export type DnsMsgKind = "query" | "referral" | "answer" | "deliver";

export interface DnsStep {
  from: string;
  to: string;
  kind: DnsMsgKind;
  /** Short label drawn on the message arrow. */
  label: string;
  narration: string;
}

export interface DnsResult {
  actors: DnsActor[];
  steps: DnsStep[];
}

/** Build the resolution walk for `domain` (e.g. "www.example.com"). */
export function dnsSteps(domain: string, recordType = "A"): DnsResult {
  const labels = domain.split(".").filter(Boolean);
  if (labels.length < 2) throw new Error("dnsSteps: need at least a second-level domain");
  const tld = labels[labels.length - 1]!;
  const sld = labels.slice(-2).join("."); // registered domain, e.g. example.com

  const actors: DnsActor[] = [
    { id: "stub", label: "Stub", sub: "resolver (your OS)" },
    { id: "resolver", label: "Recursive", sub: "resolver (e.g. 8.8.8.8)" },
    { id: "root", label: "Root", sub: '"." servers' },
    { id: "tld", label: "TLD", sub: `.${tld} servers` },
    { id: "auth", label: "Authoritative", sub: `${sld} servers` },
  ];

  const q = `${recordType}? ${domain}`;
  const steps: DnsStep[] = [
    {
      from: "stub",
      to: "resolver",
      kind: "query",
      label: q,
      narration: `Your machine's stub resolver asks its configured recursive resolver for the ${recordType} record of ${domain}, then waits — it does no walking itself (a recursive query).`,
    },
    {
      from: "resolver",
      to: "root",
      kind: "query",
      label: q,
      narration: `Cache is cold, so the resolver starts at a root server — it knows the 13 root server addresses from a built-in hints file.`,
    },
    {
      from: "root",
      to: "resolver",
      kind: "referral",
      label: `go ask .${tld}`,
      narration: `The root doesn't know ${domain}; it returns a referral to the .${tld} TLD servers (NS records plus their glue addresses). This is an iterative answer — "I don't know, but they might."`,
    },
    {
      from: "resolver",
      to: "tld",
      kind: "query",
      label: q,
      narration: `The resolver follows the referral and asks a .${tld} server the same question.`,
    },
    {
      from: "tld",
      to: "resolver",
      kind: "referral",
      label: `go ask ${sld}`,
      narration: `The .${tld} server refers the resolver down to ${sld}'s authoritative name servers — one level closer.`,
    },
    {
      from: "resolver",
      to: "auth",
      kind: "query",
      label: q,
      narration: `The resolver asks the authoritative server for the ${sld} zone.`,
    },
    {
      from: "auth",
      to: "resolver",
      kind: "answer",
      label: `${domain} → 192.0.2.10`,
      narration: `The authoritative server is the source of truth for the zone; it returns the ${recordType} record (with a TTL). The resolver caches it so the next lookup skips this whole walk until the TTL expires.`,
    },
    {
      from: "resolver",
      to: "stub",
      kind: "deliver",
      label: `192.0.2.10`,
      narration: `The recursive resolver hands the final answer back to the stub. The application can now open a connection — and the cached entry serves everyone else until its TTL runs out.`,
    },
  ];

  return { actors, steps };
}
