import type { MetadataRoute } from "next";
import { LAYERS } from "@/lib/layers";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/journey/", "/glossary/", ...LAYERS.map((l) => `/layers/${l.slug}/`)];
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
