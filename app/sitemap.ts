import type { MetadataRoute } from "next";
import { LAYERS } from "@/lib/layers";
import { PROTOCOLS } from "@/lib/protocols";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/journey/",
    "/anatomy/",
    "/glossary/",
    "/quiz/",
    "/interview/",
    "/troubleshoot/",
    "/models/",
    "/modern/",
    "/wireless/",
    "/cheat-sheet/",
    "/protocols/",
    ...LAYERS.map((l) => `/layers/${l.slug}/`),
    ...PROTOCOLS.map((p) => `/protocols/${p.slug}/`),
  ];
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
