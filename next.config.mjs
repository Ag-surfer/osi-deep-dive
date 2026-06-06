import createMDX from "@next/mdx";

// On the GitHub Pages build, GITHUB_REPOSITORY is "user/repo" — derive basePath
// from the repo name so the site works at https://user.github.io/<repo>/.
// Locally (next dev / non-prod) basePath is "" so the site serves at "/".
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd && repo ? `/${repo}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // static HTML export to ./out
  images: { unoptimized: true }, // required: the default image optimizer needs a server
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true, // emit /route/index.html — avoids 404s on GitHub Pages
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Expose basePath to client code that builds raw asset URLs (public/ images, etc.).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // This repo lives beside other lockfiles; pin the workspace root explicitly.
  turbopack: { root: import.meta.dirname },
};

// Next 16 builds with Turbopack by default, which runs the MDX loader in a Rust
// worker — so remark/rehype plugins must be passed as serializable STRING names
// (optionally `["name", options]`), never imported functions.
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm"]],
    rehypePlugins: [["rehype-slug"]],
  },
});

export default withMDX(nextConfig);
