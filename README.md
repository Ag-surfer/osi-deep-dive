# OSI Deep Dive

An open, in-depth educational reference for the **OSI model** — one rigorous page per layer, with
interactive diagrams, bit-accurate header breakdowns, worked numeric examples, security analysis, and
self-check questions. Built to be the kind of resource you'd hand a networking student at a top CS
program.

🔗 **Live site:** _deployed via GitHub Pages_ (see [Deployment](#deployment))

## What's inside

- **Seven deep layer pages** (Physical → Application), each covering: the problem the layer solves, how
  it works, protocols & standards (with RFC links), a **clickable bit-level header diagram**, real
  devices, failure modes & troubleshooting, security considerations, and a quiz.
- **Interactive visualizations**
  - _Encapsulation Visualizer_ — watch data become Segment → Packet → Frame → Bits.
  - _A Packet's Journey_ — a 10-step walkthrough of a real HTTPS request across all seven layers.
- **Worked examples** — Shannon capacity, Ethernet frame efficiency, UTF-8 encoding, TCP
  bandwidth-delay product, subnetting, round-trips-to-first-byte.
- **OSI ↔ TCP/IP mapping**, a searchable **glossary**, and an **RFC index**.
- Cited sources on every layer page (RFCs, Tanenbaum, Kurose & Ross).

## Tech stack

- **Next.js 16** (App Router, TypeScript) — statically exported (`output: 'export'`).
- **Tailwind CSS v4** (CSS-first) · **MDX** for content · **React 19** islands for interactivity.
- **Vitest + Testing Library** for unit/component tests.

## Local development

This project uses **[pnpm](https://pnpm.io)** (see [Tooling & supply-chain](#tooling--supply-chain) for why).

```bash
pnpm install
pnpm dev             # http://localhost:3000
```

### Quality gate

A single command runs the whole gate (and must be green before merging):

```bash
pnpm check           # typecheck + lint + format + test + static-export build
```

Individual scripts: `pnpm typecheck | lint | format | test | build`.

### Tooling & supply-chain

We use pnpm with two supply-chain hardening defaults configured in `pnpm-workspace.yaml`:

- **Build-script allowlist** — dependency lifecycle scripts (`postinstall` etc.) are blocked
  unless explicitly allowed under `allowBuilds`. This neutralizes the most common npm
  supply-chain payload. pnpm errors on any *new* package with a build script until you record a
  decision, so nothing runs scripts silently.
- **Release cooldown** (`minimumReleaseAge: 4320` = 3 days) — pnpm refuses to install dependency
  versions published in the last 3 days, so a compromised release (usually detected and yanked
  within a day or two) never reaches us. The `@types/*` scope is exempt — those are declaration-only
  files with no executable code. Versions already pinned in `pnpm-lock.yaml` install unaffected.

## Project structure

```
app/                 # routes: home, /layers/[slug], /journey, /glossary
content/layers/*.mdx # the deep per-layer content
lib/layers.ts        # the layer registry (single source of truth)
lib/glossary.ts      # glossary data
components/           # HeaderDiagram, Quiz, EncapsulationVisualizer, PacketJourney, …
```

To add or edit a layer, edit `lib/layers.ts` (metadata) and `content/layers/<slug>.mdx` (content).
Custom MDX components (`<HeaderDiagram>`, `<Callout>`, `<Quiz>`, `<WorkedExample>`, `<SequenceDiagram>`)
are registered in `mdx-components.tsx` and available in any layer file without imports.

Adding a **diagram**? See the [Diagram contributing guide](./docs/contributing-diagrams.md) — it covers
the four diagram families, copy-paste templates, and the theme/accessibility/reduced-motion conventions.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs the build and publishes the
static export to **GitHub Pages**. In the repo settings, set **Pages → Source → GitHub Actions**. The
site's base path is derived automatically from the repository name.

## Accuracy

This is a learning resource. Header layouts and protocol claims are cited to their RFCs/standards —
verify against the primary sources for production work. Spotted an error? Please open an issue (see
[CONTRIBUTING](./CONTRIBUTING.md)).

## License

- **Code** — [MIT](./LICENSE)
- **Content** (prose, diagrams) — [CC BY 4.0](./CONTENT-LICENSE)
