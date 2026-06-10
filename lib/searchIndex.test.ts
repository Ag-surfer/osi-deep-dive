import { describe, expect, it } from "vitest";
import { buildSearchRecords, slugify, stripMdx } from "./searchIndex";
import { LAYERS } from "./layers";
import { GLOSSARY } from "./glossary";
import { INTERVIEW_QUESTIONS } from "./interview";

const records = buildSearchRecords();

describe("buildSearchRecords", () => {
  it("indexes every layer, glossary term, and interview question", () => {
    expect(records.filter((r) => r.type === "layer")).toHaveLength(LAYERS.length);
    expect(records.filter((r) => r.type === "glossary")).toHaveLength(GLOSSARY.length);
    expect(records.filter((r) => r.type === "question")).toHaveLength(INTERVIEW_QUESTIONS.length);
  });

  it("indexes a substantial number of MDX sections (one per ## heading)", () => {
    const sections = records.filter((r) => r.type === "section");
    expect(sections.length).toBeGreaterThanOrEqual(50);
    // Every layer page contributed sections.
    for (const l of LAYERS) {
      expect(sections.some((s) => s.href.startsWith(`/layers/${l.slug}/#`))).toBe(true);
    }
  });

  it("gives every record a unique id, a title, and an internal href", () => {
    const ids = records.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of records) {
      expect(r.title.length).toBeGreaterThan(2);
      expect(r.href).toMatch(/^\/([a-z0-9-]+\/)*(#[a-z0-9-]+)?$/);
      expect(r.body.length).toBeLessThanOrEqual(200);
    }
  });

  it("section bodies contain no MDX/JSX residue", () => {
    for (const r of records.filter((x) => x.type === "section")) {
      expect(r.body).not.toMatch(/<[A-Za-z]/);
      expect(r.body).not.toMatch(/```/);
      expect(r.body).not.toContain("export const");
    }
  });
});

describe("slugify (must match rehype-slug's github-slugger output)", () => {
  it("handles the site's real headings", () => {
    expect(slugify("Failure modes & troubleshooting")).toBe("failure-modes--troubleshooting");
    expect(slugify("Check your understanding")).toBe("check-your-understanding");
    expect(slugify("NAT: the workaround that ate the internet")).toBe(
      "nat-the-workaround-that-ate-the-internet",
    );
    expect(slugify("QUIC: transport, reinvented in user space")).toBe(
      "quic-transport-reinvented-in-user-space",
    );
  });
});

describe("stripMdx", () => {
  it("removes components, code fences, tables, and markdown syntax", () => {
    const src = `
Some **bold** text with [a link](/x/).

<Callout variant="insight" title="T">
Inside callout.
</Callout>

| a | b |
| - | - |

\`\`\`http
GET / HTTP/1.1
\`\`\`

<SignalWire />
Tail text.`;
    const out = stripMdx(src);
    expect(out).toContain("Some bold text with a link");
    expect(out).toContain("Inside callout");
    expect(out).toContain("Tail text");
    expect(out).not.toContain("<");
    expect(out).not.toContain("|");
    expect(out).not.toContain("```");
  });
});
