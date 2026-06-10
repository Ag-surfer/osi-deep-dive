import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROTOCOLS, getProtocol, protocolsForLayer } from "./protocols";
import { PROTOCOL_DIAGRAMS } from "../components/diagrams/ProtocolDiagram";

describe("PROTOCOLS registry integrity", () => {
  it("has unique, url-safe slugs", () => {
    const slugs = PROTOCOLS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("files every protocol under a valid layer, with 3-4 per layer", () => {
    for (const p of PROTOCOLS) {
      expect(p.layer).toBeGreaterThanOrEqual(1);
      expect(p.layer).toBeLessThanOrEqual(7);
    }
    for (let l = 1; l <= 7; l++) {
      const count = protocolsForLayer(l).length;
      expect(count, `layer ${l}`).toBeGreaterThanOrEqual(3);
      expect(count, `layer ${l}`).toBeLessThanOrEqual(4);
    }
  });

  it("gives every entry a name, full name, standard, and tagline", () => {
    for (const p of PROTOCOLS) {
      expect(p.name.length).toBeGreaterThan(1);
      expect(p.fullName.length).toBeGreaterThan(p.name.length - 1);
      expect(p.standard.length).toBeGreaterThan(2);
      expect(p.tagline.length).toBeGreaterThan(20);
    }
  });

  it("has exactly one content file per registry entry, and vice versa", () => {
    const dir = join(process.cwd(), "content", "protocols");
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""))
      .sort();
    const slugs = PROTOCOLS.map((p) => p.slug).sort();
    expect(files).toEqual(slugs);
  });

  it("getProtocol round-trips", () => {
    expect(getProtocol("bgp")?.name).toBe("BGP");
    expect(getProtocol("nope")).toBeUndefined();
  });

  it("has a hand-drawn diagram for every protocol, each embedded in its page", () => {
    const diagramSlugs = Object.keys(PROTOCOL_DIAGRAMS).sort();
    const registrySlugs = PROTOCOLS.map((p) => p.slug).sort();
    expect(diagramSlugs).toEqual(registrySlugs);

    const dir = join(process.cwd(), "content", "protocols");
    for (const p of PROTOCOLS) {
      const src = readFileSync(join(dir, `${p.slug}.mdx`), "utf8");
      expect(src, `${p.slug}.mdx embeds its diagram`).toContain(
        `<ProtocolDiagram id="${p.slug}" />`,
      );
    }
  });

  it("every diagram has a non-empty caption and screen-reader summary", () => {
    for (const [slug, d] of Object.entries(PROTOCOL_DIAGRAMS)) {
      expect(d.caption.length, `${slug} caption`).toBeGreaterThan(20);
      expect(d.summary.length, `${slug} summary`).toBeGreaterThan(20);
      expect(d.scene.width).toBeGreaterThan(0);
      expect(d.scene.height).toBeGreaterThan(0);
    }
  });
});
