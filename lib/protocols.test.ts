import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROTOCOLS, getProtocol, protocolsForLayer } from "./protocols";

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
});
