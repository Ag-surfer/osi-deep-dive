import type { MDXComponents } from "mdx/types";

// Required at the project root for @next/mdx with the App Router — MDX will not
// render without it. Custom component overrides for MDX content are wired in
// later (HeaderDiagram, Callout, Quiz, etc.) via the layer page template.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
