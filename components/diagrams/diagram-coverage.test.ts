import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LAYER_DIAGRAMS } from "./LayerDiagram";

/** Every <LayerDiagram id="…" /> embedded in layer MDX must resolve to a real
 * diagram — a typo would silently render nothing, so guard it. */
function embeddedLayerIds(): string[] {
  const dir = join(process.cwd(), "content", "layers");
  const ids: string[] = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".mdx"))) {
    const src = readFileSync(join(dir, f), "utf8");
    for (const m of src.matchAll(/<LayerDiagram\s+id="([^"]+)"\s*\/>/g)) ids.push(m[1]!);
  }
  return ids;
}

describe("LayerDiagram coverage", () => {
  it("every embedded layer-diagram id resolves to a registered diagram", () => {
    const ids = embeddedLayerIds();
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(LAYER_DIAGRAMS[id], `embedded id "${id}" missing from LAYER_DIAGRAMS`).toBeDefined();
    }
  });

  it("every registered diagram carries a caption and a screen-reader summary", () => {
    for (const [id, d] of Object.entries(LAYER_DIAGRAMS)) {
      expect(d.caption.length, `${id} caption`).toBeGreaterThan(20);
      expect(d.summary.length, `${id} summary`).toBeGreaterThan(20);
      expect(d.scene.width).toBeGreaterThan(0);
      expect(d.scene.height).toBeGreaterThan(0);
    }
  });
});
