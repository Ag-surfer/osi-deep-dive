import { buildSearchRecords } from "@/lib/searchIndex";

// Statically emitted at build time as /search-index.json — fetched lazily by
// the search dialog on first open, so the index never weighs down page HTML.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchRecords());
}
