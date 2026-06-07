import type { MetadataRoute } from "next";
import { LAYERS, ALL_TOPICS } from "@/lib/layers";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/journey/",
    "/glossary/",
    "/quiz/",
    "/methodology/",
    ...LAYERS.map((l) => `/layers/${l.slug}/`),
    ...ALL_TOPICS.map(({ layer, topic }) => `/layers/${layer.slug}/${topic.slug}/`),
  ];
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
