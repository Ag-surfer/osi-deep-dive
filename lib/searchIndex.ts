/**
 * Build-time search index. This module reads MDX from disk with node:fs, so
 * it must only ever be imported from SERVER components (the static export
 * runs them at `next build`); the records it returns are serializable props
 * for the client-side search dialog.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GLOSSARY } from "./glossary";
import { INTERVIEW_QUESTIONS } from "./interview";
import { LAYERS } from "./layers";

export interface SearchRecord {
  id: string;
  type: "layer" | "glossary" | "section" | "question" | "page";
  /** Display title. */
  title: string;
  /** Context line, e.g. the parent layer for a section. */
  context: string;
  /** Searchable body text, capped. */
  body: string;
  href: string;
}

const BODY_CAP = 200;

/**
 * Mirror of rehype-slug (github-slugger) for the headings this site uses
 * (ASCII + ' : & ? . _). Slugger keeps underscores and non-ASCII letters;
 * we keep underscores and don't use accented headings — tests pin parity
 * on every real heading.
 */
export function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9 _-]/g, "")
    .replace(/ /g, "-");
}

/** Strip MDX/JSX/markdown syntax down to plain searchable text. */
export function stripMdx(src: string): string {
  return (
    src
      // fenced code blocks, export blocks, then JSX tags (open, close, or
      // self-closing — [^>]* spans newlines, covering multi-line props)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/^export [\s\S]*?^];?$/gm, " ")
      .replace(/<\/?[A-Za-z][^>]*>/g, " ")
      // markdown furniture
      .replace(/^\|.*\|$/gm, " ")
      .replace(/[`*_#>]/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
}

const STATIC_PAGES: { title: string; context: string; body: string; href: string }[] = [
  {
    title: "Packet Journey",
    context: "Interactive walkthrough",
    body: "Follow a packet down the stack and across the network — encapsulation visualized step by step.",
    href: "/journey/",
  },
  {
    title: "Packet Anatomy",
    context: "Byte-level dissection",
    body: "A real five-frame TCP conversation — SYN, SYN-ACK, HTTP GET, 200 response, FIN — every byte annotated, checksums verified, tcpdump instructions.",
    href: "/anatomy/",
  },
  {
    title: "Final Quiz",
    context: "Test yourself",
    body: "A scored cross-layer exam covering all seven layers, encapsulation, addressing, routing, and transport.",
    href: "/quiz/",
  },
  {
    title: "Interview Prep",
    context: "The canon, with answers",
    body: "What happens when you type a URL, plus the classic questions for every layer with model answers and follow-ups.",
    href: "/interview/",
  },
  {
    title: "Troubleshooting Method",
    context: "The OSI model as a debugger",
    body: "Bottom-up, top-down, divide and conquer; which tool interrogates which layer; worked diagnoses from symptom to root cause; MTU black hole; it's always DNS.",
    href: "/troubleshoot/",
  },
  {
    title: "Cheat Sheet",
    context: "One printable page",
    body: "The seven layers with PDUs and addressing, well-known ports, numbers to know, classic contrasts, mnemonics.",
    href: "/cheat-sheet/",
  },
  {
    title: "OSI vs TCP/IP: The History",
    context: "Why the model survived",
    body: "The protocol wars, GOSIP, rough consensus and running code, the 4/5/7-layer mapping, and protocols that refuse to fit.",
    href: "/models/",
  },
  {
    title: "The Modern Internet, Layer by Layer",
    context: "The model meets production",
    body: "CDNs and anycast, L4 vs L7 load balancers, VPNs and tunneling, IPv6 NDP and SLAAC, VXLAN overlay networks.",
    href: "/modern/",
  },
  {
    title: "Wireless: The Stack Without Wires",
    context: "Layers 1–2, airborne",
    body: "802.11 in depth: BSS/ESS, the three-address frame, association and the 4-way handshake, WEP to WPA3, Wi-Fi 4/5/6/7 generations, cellular scheduling vs Wi-Fi contention.",
    href: "/wireless/",
  },
  {
    title: "Glossary & RFC Index",
    context: "Vocabulary",
    body: "Every networking term on the site, tagged by layer, searchable and filterable.",
    href: "/glossary/",
  },
];

/** Build the full record set. Server-only (reads content/ from disk). */
export function buildSearchRecords(): SearchRecord[] {
  const records: SearchRecord[] = [];

  for (const l of LAYERS) {
    records.push({
      id: `layer-${l.slug}`,
      type: "layer",
      title: `Layer ${l.number} — ${l.name}`,
      context: l.tagline,
      // Protocols/devices lead so the body cap can't truncate them away —
      // they're the highest-signal search terms for a layer.
      body: `${l.protocols.join(" ")} ${l.devices.join(" ")} ${l.pdu} ${l.addressing} ${l.summary}`.slice(
        0,
        BODY_CAP,
      ),
      href: `/layers/${l.slug}/`,
    });
  }

  for (const g of GLOSSARY) {
    records.push({
      id: `glossary-${slugify(g.term)}`,
      type: "glossary",
      title: g.term,
      context: g.layer === 0 ? "Cross-cutting" : `Layer ${g.layer}`,
      body: g.def.slice(0, BODY_CAP),
      href: "/glossary/",
    });
  }

  const contentDir = join(process.cwd(), "content", "layers");
  for (const file of readdirSync(contentDir).filter((f) => f.endsWith(".mdx"))) {
    const slug = file.replace(/\.mdx$/, "");
    const layer = LAYERS.find((l) => l.slug === slug);
    if (!layer) continue;
    const src = readFileSync(join(contentDir, file), "utf8");
    const sections = src.split(/^## /m).slice(1);
    for (const section of sections) {
      const heading = section.split("\n")[0]!.trim();
      const text = stripMdx(section.slice(heading.length));
      records.push({
        id: `section-${slug}-${slugify(heading)}`,
        type: "section",
        title: heading,
        context: `L${layer.number} ${layer.name}`,
        body: text.slice(0, BODY_CAP),
        href: `/layers/${slug}/#${slugify(heading)}`,
      });
    }
  }

  for (const q of INTERVIEW_QUESTIONS) {
    records.push({
      id: `question-${q.id}`,
      type: "question",
      title: q.question,
      context: q.layer === 0 ? "Cross-layer" : `Layer ${q.layer}`,
      body: q.answer.slice(0, BODY_CAP),
      href: `/interview/#${q.id}`,
    });
  }

  for (const p of STATIC_PAGES) {
    records.push({
      id: `page-${slugify(p.title)}`,
      type: "page",
      title: p.title,
      context: p.context,
      body: p.body.slice(0, BODY_CAP),
      href: p.href,
    });
  }

  return records;
}
