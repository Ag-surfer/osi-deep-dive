# CLAUDE.md — OSI Deep Dive

A statically-exported Next.js 16 educational site about the OSI model, deployed to GitHub Pages.

## Quality gate (non-negotiable)

`npm run check` = `typecheck + lint + format + test + build`. Nothing ships on a red gate.
The **build is part of the gate** because static-export errors (e.g. a dynamic route missing
`generateStaticParams`) only surface at `next build`.

## Performance budget

A Lighthouse budget guards perf/a11y/SEO and bundle size. Config in `lighthouserc.json`;
enforced in CI by `.github/workflows/lighthouse.yml` on every push/PR (fails on regression).

- Run locally: `CHROME_PATH="$(node -e "console.log(require('playwright').chromium.executablePath())")" npm run perf`
  (rebuilds with an empty basePath, serves the gzip'd export via `scripts/perf-server.mjs`, runs Lighthouse).
- Current baseline: **Performance 98-99, Accessibility 100, Best-Practices 100, SEO 100**; JS ~185 KB,
  total ~260 KB per page. Thresholds: perf ≥ 0.85, a11y/bp/seo ≥ 0.95, script ≤ 280 KB, total ≤ 440 KB,
  CLS ≤ 0.1. Sizes are measured **gzipped** (Pages serves compressed) — a plain static server
  over-reports and tanks the score, hence the custom gzip server.

## Architecture

- `lib/layers.ts` is the **single source of truth** — nav, stack, routing (`generateStaticParams`),
  prev/next all derive from it. Add a layer here + a `content/layers/<slug>.mdx` file.
- Content is **MDX**; custom components (`HeaderDiagram`, `Callout`, `Quiz`, `WorkedExample`,
  `SequenceDiagram`, `ProtocolTable`, `RFCRef`, `KeyTerm`) are registered in `mdx-components.tsx` and
  usable in any `.mdx` without imports.
- `HeaderDiagram` is driven by a `fields: {name,bits,desc,variable?}[]` spec — **bits must sum to the
  real header size** (verify against the RFC).

## Lessons Learned (compounding — append, don't delete)

- **Next 16 builds with Turbopack by default.** MDX remark/rehype plugins must be passed as
  serializable **string names** (`remarkPlugins: [["remark-gfm"]]`), NOT imported functions, or the
  build fails with "loader … does not have serializable options."
- **`eslint-config-next@16` ships native flat-config arrays** (`eslint-config-next/core-web-vitals`,
  `/typescript`). Spread them directly — wrapping in `FlatCompat` throws "Converting circular
  structure to JSON."
- **Next 16 lint enforces `react-hooks/set-state-in-effect`.** To read an external system (the DOM
  theme class) use `useSyncExternalStore`, not `useEffect`+`setState`.
- **GitHub Pages = static export.** `output:'export'`, `images.unoptimized:true`, `trailingSlash:true`,
  and `basePath` derived from `GITHUB_REPOSITORY` (so dev=`/`, Pages=`/osi-deep-dive`). Dynamic routes
  need `generateStaticParams` + `dynamicParams=false`. A `.nojekyll` file is required or Pages strips
  the `_next/` asset dir.
- **Visual verification:** Playwright MCP wasn't available mid-session; `scripts/shoot.mjs` (local
  Playwright) screenshots pages so changes can be eyeballed. `npm run dev` then `node scripts/shoot.mjs`.

## Dev-time MCP servers (`.mcp.json`)

These are **development tools** (they load at session start and never ship in the static build):

- **playwright** (`@playwright/mcp`) — drive the rendered site for visual QA / screenshots.
- **mermaid** (`mcp-mermaid`) — render Mermaid definitions to **SVG/PNG**; commit the SVG and inline
  it for clean (non-sketchy) diagrams like state machines / sequences.
- **excalidraw** (`excalidraw-mcp`) — author Excalidraw scenes for bespoke art.

They start via `npx`, so no manual install — but Claude Code loads MCP servers **at session start**,
so after editing `.mcp.json` you must restart the session (and approve the servers) before the tools
appear. For diagrams that should be theme-aware/responsive/animated, prefer the in-app **rough.js**
components in `components/diagrams/` over committing static images.

## Deploy

Push to `main` → `.github/workflows/deploy.yml` builds + publishes to Pages. Live at
https://ag-surfer.github.io/osi-deep-dive/. Repo Settings → Pages → Source = GitHub Actions.
