/** Canonical production URL (GitHub Pages project site, including base path). */
export const SITE_URL = "https://ag-surfer.github.io/osi-deep-dive";

export const SITE_NAME = "OSI Deep Dive";

export const SITE_TAGLINE = "The OSI Model, in Depth";

export const SITE_DESCRIPTION =
  "A deep, interactive reference for the OSI model — one in-depth page per layer with diagrams, bit-level header breakdowns, security analysis, worked examples, and self-check questions.";

const OG_IMAGE_URL = `${SITE_URL}/og.png`;

/**
 * Build a page's Metadata with canonical URL + OpenGraph/Twitter cards that
 * always carry the social image (sub-page `openGraph` objects otherwise drop
 * the root-inherited image). Keeps every page's social tags consistent.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { title, description, images: [OG_IMAGE_URL] },
  };
}
