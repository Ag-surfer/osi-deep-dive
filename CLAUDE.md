# CLAUDE.md — OSI Deep Dive

A statically-exported Next.js 16 educational site about the OSI model, deployed to GitHub Pages.

## Package manager (pnpm, not npm)

This project uses **pnpm** for supply-chain reasons. Always use `pnpm` (not `npm`/`npx`):
`pnpm install`, `pnpm dev`, `pnpm check`, `pnpm exec <bin>`. Settings live in
`pnpm-workspace.yaml`:

- **`allowBuilds`** — dependency build/lifecycle scripts are blocked unless listed (`unrs-resolver:
  true`; `sharp: false`). pnpm errors on any *new* package with a build script until you add a
  decision here — never blanket-approve; check the package first.
- **`minimumReleaseAge: 4320`** (3-day cooldown) — pnpm rejects dep versions published in the last
  3 days (dodges zero-day compromised releases). `@types/*` is excluded (declaration-only). If a
  fresh version is genuinely needed before it ages, prefer waiting; only narrow the policy with a
  reason. The committed lockfile already contains aged versions, so `--frozen-lockfile` installs work.

## Quality gate (non-negotiable)

`pnpm check` = `typecheck + lint + format + test + build`. Nothing ships on a red gate.
The **build is part of the gate** because static-export errors (e.g. a dynamic route missing
`generateStaticParams`) only surface at `next build`.

## Performance budget

A Lighthouse budget guards perf/a11y/SEO and bundle size. Config in `lighthouserc.json`;
enforced in CI by `.github/workflows/lighthouse.yml` on every push/PR (fails on regression).

- Run locally: `CHROME_PATH="$(node -e "console.log(require('playwright').chromium.executablePath())")" pnpm perf`
  (rebuilds with an empty basePath, serves the gzip'd export via `scripts/perf-server.mjs`, runs Lighthouse).
- Current baseline: **Performance 98-99, Accessibility 100, Best-Practices 100, SEO 100**; JS ~185 KB,
  total ~260 KB per page. Thresholds: perf ≥ 0.85, a11y/bp/seo ≥ 0.95, script ≤ 280 KB, total ≤ 440 KB,
  CLS ≤ 0.1. Sizes are measured **gzipped** (Pages serves compressed) — a plain static server
  over-reports and tanks the score, hence the custom gzip server.

## Architecture

- `lib/layers.ts` is the **single source of truth** — nav, stack, routing (`generateStaticParams`),
  prev/next all derive from it. Add a layer here + a `content/layers/<slug>.mdx` file.
- **Sub-topics (deep dives) nest under a layer.** Add a `TopicMeta` to a layer's `topics[]` in
  `lib/layers.ts` **and** create `content/layers/<layer-slug>/<topic-slug>.mdx`. The nested route
  `app/layers/[slug]/[topic]/page.tsx` prerenders every declared `(layer, topic)` pair with
  `dynamicParams = false` — so a topic listed without its MDX file **breaks the build**. The sidebar
  (`LayerNav`), breadcrumb (`TopicHero`), in-layer prev/next (`TopicPrevNext`), the layer page's
  "Deep dives" cards, and the sitemap all derive from `topics[]`/`ALL_TOPICS` automatically.
- Content is **MDX**; custom components (`HeaderDiagram`, `Callout`, `Quiz`, `WorkedExample`,
  `SequenceDiagram`, `ProtocolTable`, `RFCRef`, `KeyTerm`) are registered in `mdx-components.tsx` and
  usable in any `.mdx` without imports.
- `HeaderDiagram` is driven by a `fields: {name,bits,desc,variable?}[]` spec — **bits must sum to the
  real header size** (verify against the RFC).
- **Interactive routing-algorithm diagrams** share one engine. `components/diagrams/StepPlayer.tsx` is
  the common chrome — it owns the step index, autoplay (suppressed under reduced motion), keyboard
  stepping, the aria-live narration line, and the Prev/Next/Play/Restart controls; each viz only renders
  the *visual* for a step via the `renderStep(i)` / `narration(i)` props. Two visual families sit on top:
  `RoutingAlgoViz.tsx` (a **graph** player — nodes/edges/tree, used for SPF/Dijkstra),
  `DecisionTableViz.tsx` (an **elimination table** — rows struck out as ordered rules fire, used for BGP
  best-path), `CongestionControlViz.tsx` (a **time-series chart** — a value plotted per step, used for
  the TCP cwnd sawtooth), `CrcViz.tsx` (a **monospace long-division** — the working register with the
  divisor aligned, used for CRC), `LineCodingViz.tsx` (a **stacked-waveform** builder revealed
  bit-by-bit, used for NRZ/Manchester line coding), and `EyeDiagramViz.tsx` (an **overlaid-trace eye
  diagram** that closes as jitter/noise grow, used for signal integrity), and `HuffmanViz.tsx` (a
  **tree-building** viz that reveals merges against a precomputed layout, used for Huffman coding), and
  `SequenceWalkViz.tsx` (a **stepped sequence diagram** — actors as columns, messages revealed per step,
  colored by intent). Two families are reused beyond their first use: `SpanningTreeViz.tsx` feeds
  `RoutingAlgoViz` from an STP stepper (root election + least-cost-to-root *is* a rooted SPF), and both
  `DnsResolutionViz.tsx` and `KerberosViz.tsx` are thin wrappers over `SequenceWalkViz` (DNS resolution;
  the Kerberos ticket exchange). The *logic* lives in pure, unit-tested steppers under `lib/algorithms/`
  (`dijkstra.ts`/`stp.ts` → `AlgoStep[]`; `bgpBestPath.ts` → `DecisionStep[]`; `congestion.ts` →
  `CwndPoint[]`; `crc.ts` → `CrcStep[]`; `lineCoding.ts` → half-bit samples; `eyeDiagram.ts` → overlaid
  traces + eye metrics; `huffman.ts` → laid-out tree + merge steps; `dnsResolution.ts`/`kerberos.ts` →
  actors + message steps). To add one: write a pure `…Steps(): Step[]`
  generator (+ a `.test.ts`), then a thin MDX wrapper (like `DijkstraViz.tsx` / `BgpBestPathViz.tsx`)
  that `useMemo`s the steps and renders the matching family. Register the wrapper in `mdx-components.tsx`.
  Graph topologies are declared as data (`{id,x,y,label}` nodes + `{a,b,cost}` edges) in the MDX — keep
  coords inside the ~620×320 viewBox and non-overlapping.

## Lessons Learned (compounding — append, don't delete)

- **A layer/topic page's `sources` array is keyed by `href`** in the page component, so **two entries
  with the same URL trigger a React duplicate-key error** (and only show at runtime, not in the build).
  Keep every source href unique within a page; the key now includes the index as a backstop.

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
  Playwright) screenshots pages so changes can be eyeballed. `pnpm dev` then `node scripts/shoot.mjs`.

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
