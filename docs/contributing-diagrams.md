# Contributing: Layer Diagrams

This guide is for adding a diagram to a layer page. The site has **four diagram families** — pick the
right one, follow the shared conventions, and verify. Every diagram must be theme-aware, accessible
(the site holds a Lighthouse **accessibility 100**), and respect reduced motion.

## 1. Pick the right family

| You want to show… | Use | Kind | File location |
| --- | --- | --- | --- |
| A protocol's **bit-level header** | `<NamedHeader id="…" />` | client | `lib/headers.ts` (data) |
| A **message exchange / handshake** (A↔B) | `<SequenceDiagram … />` | server | inline in MDX |
| A **hand-drawn** structural diagram (topology, timeline, state machine) | a `RoughFigure` component | client | `components/diagrams/*.tsx` |
| An **animated** concept (something moving/transforming) | an `AnimatedFigure` component | server | `components/diagrams/anim/*.tsx` |

Prefer **server** components (SequenceDiagram, AnimatedFigure) — they ship no JS and protect the
[perf budget](../CLAUDE.md#performance-budget). Only reach for a client island (rough.js) when you
need the hand-drawn look (rough.js requires the DOM).

## Shared conventions (all families)

- **Theme-aware colours.** Use `currentColor` for line work and CSS vars for fills/text:
  `var(--color-layer-N)` (N = the layer's number) for the layer accent, `var(--on-accent)` for text
  **on** an accent (dark, passes AA — never `text-white` on an accent), `var(--fg)` / `var(--fg-muted)`
  / `var(--border)` / `var(--bg-soft)` for everything else. **Exception:** rough.js writes colours as
  SVG _attributes_ where `var(...)` is invalid — there, use `currentColor` for strokes and the `SKETCH`
  hex palette for accents.
- **Accessibility.** Pass a meaningful `summary` (a sentence describing the diagram's content) — it
  becomes the `sr-only` text / `aria-label`. Never let a diagram announce only "diagram". Keep contrast
  AA (dark text on light accents).
- **Reduced motion.** Animated SVGs auto-respect `prefers-reduced-motion` (a global rule in
  `globals.css` disables the animation) — so **design a readable resting state**: all informational
  elements must be visible without animation; the motion only adds emphasis. For JS-driven motion, gate
  it with `usePrefersReducedMotion()`.
- **Register + use.** Add the component to **`mdx-components.tsx`** (both the `import` and the returned
  object), then drop `<YourDiagram />` into `content/layers/<slug>.mdx`.

---

## 2. Bit-level header — `<NamedHeader>`

Headers are data-driven and **accuracy-tested** (the build asserts each header's fixed fields sum to
its documented size — see `lib/headers.test.ts`). Three steps:

**a. Add the spec** to `HEADERS` in `lib/headers.ts`:

```ts
arp: {
  title: "ARP packet (RFC 826) — 28 bytes for IPv4/Ethernet",
  expectedBits: 224, // sum of the non-variable fields
  fields: [
    { name: "Hardware Type", bits: 16, desc: "Link-layer type — 1 for Ethernet." },
    { name: "Protocol Type", bits: 16, desc: "Upper-layer protocol — 0x0800 for IPv4." },
    // …each field { name, bits, desc, variable? }; bits must match the RFC
  ],
},
```

**b. Add the known size** to the `known` map in `lib/headers.test.ts` (`arp: 224`). The test fails if
your `expectedBits` ≠ this value, or if the non-variable bits don't sum to `expectedBits`.

**c. Use it** in MDX (NamedHeader is already registered):

```mdx
<NamedHeader id="arp" />
```

Double-check every `bits` against the primary source (RFC/IEEE) and cite it in the layer's `sources`.

---

## 3. Message exchange — `<SequenceDiagram>`

Authored inline in MDX (already registered, ships an `sr-only` step list automatically):

```mdx
<SequenceDiagram
  actors={["Client", "Server"]}
  steps={[
    { from: 0, to: 1, label: "SYN  seq = x" },
    { from: 1, to: 0, label: "SYN-ACK  seq = y, ack = x+1", dashed: true },
    { from: 0, to: 1, label: "ACK  ack = y+1" },
  ]}
  caption="The TCP three-way handshake."
/>
```

`from`/`to` are indices into `actors` (equal indices = a self-message); `dashed` marks replies/acks.

---

## 4. Hand-drawn — `RoughFigure` (rough.js)

A client island. Define the geometry in a **module-scope** `draw` (stable identity) so it renders once.

```tsx
// components/diagrams/MyTopology.tsx
"use client";
import { RoughFigure, SKETCH, type RoughDraw } from "./RoughFigure";

const draw: RoughDraw = (rc, svg, h) => {
  // strokes: currentColor (theme-aware). accents: SKETCH.l1 … SKETCH.l7 (hex).
  svg.appendChild(rc.rectangle(20, 20, 90, 44, { stroke: "currentColor", roughness: 1.2 }));
  svg.appendChild(rc.line(110, 42, 200, 42, { stroke: "currentColor", strokeWidth: 1.4 }));
  h.text(65, 46, "Host A", { weight: 600 });           // rough.js can't draw text — use h.text
  h.text(65, 60, "L2", { size: 10, opacity: 0.7, mono: true });
};

export function MyTopology() {
  return (
    <RoughFigure
      width={420}
      height={120}
      draw={draw}
      summary="Describe the nodes and connections for screen readers."
      caption="A short caption shown under the figure."
    />
  );
}
```

- `rc` is a [`RoughSVG`](https://github.com/rough-stuff/rough); use `rc.rectangle/line/ellipse/linearPath/path(...)` and `svg.appendChild(...)`.
- `h.text(x, y, str, { size?, anchor?, weight?, mono?, color?, opacity? })` adds labels.
- Use `SKETCH.l<N>` for a layer accent (CSS vars don't work in rough's attribute writes).

---

## 5. Animated — `AnimatedFigure` (CSS, server component)

Zero client JS. Plain SVG with an inline `<style>`; **prefix keyframe + class names uniquely** to avoid
leaking globally. Theme colours come from CSS vars (valid in the `style`/attr here, unlike rough.js).

```tsx
// components/diagrams/anim/MyAnim.tsx
import { AnimatedFigure } from "../AnimatedFigure";

export function MyAnim() {
  return (
    <AnimatedFigure
      summary="Describe what moves and what it means, for screen readers."
      caption="Caption shown under the figure."
    >
      <svg viewBox="0 0 480 120" width="100%" style={{ maxWidth: 480, color: "var(--fg)" }}>
        <style>{`
          @keyframes mya-move { to { transform: translateX(360px) } }
          .mya-dot { animation: mya-move 3s linear infinite; }
        `}</style>
        {/* always-visible structure (readable with motion disabled) */}
        <line x1={20} y1={60} x2={460} y2={60} stroke="currentColor" strokeWidth={2} />
        {/* the moving part — extra emphasis, not the only info */}
        <g className="mya-dot" transform="translate(20,60)">
          <circle r={7} fill="var(--color-layer-3)" />
        </g>
      </svg>
    </AnimatedFigure>
  );
}
```

Reduced motion is handled for you (the global rule disables the animation) — so the line + dot at its
start position must already tell the story.

---

## Verify before opening a PR

1. `npm run check` — typecheck + lint + format + **test** (header bit-sums) + build. Must be green.
2. `npm run dev`, view the page in **light and dark** mode; confirm the diagram is legible and
   theme-correct, and readable with OS "reduce motion" enabled.
3. `npm run perf` — the Lighthouse budget. **Accessibility must stay 100**, and a new client island
   must not push the script size past the budget (animated/sequence/header diagrams add ~0 JS; rough.js
   diagrams add a little).
4. Cite any new factual claims (header fields, protocol behaviour) in the layer's `sources`.

See the existing diagrams for reference: `components/diagrams/NetworkTopology.tsx` (rough.js),
`components/diagrams/anim/PacketRouting.tsx` (animated), and `lib/headers.ts` (header specs).
