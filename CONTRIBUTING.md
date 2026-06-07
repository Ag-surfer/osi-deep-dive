# Contributing

This project aims to be a trustworthy, deep reference for the OSI model. Corrections and improvements
are very welcome — especially anything that makes the content **more accurate** or **clearer**.

## Ground rules

1. **Accuracy is the product.** Technical claims — especially header field layouts and protocol
   behavior — must be backed by a primary source (an RFC, an IEEE standard, or a standard textbook).
   Cite it in the layer's `sources` export.
2. **Keep the gate green.** Before opening a PR, run:
   ```bash
   npm run check        # typecheck + lint + format + test + build
   ```
   A red gate will not be merged.
3. **Match the house style.** Follow the existing structure of a layer page (problem → mechanism →
   protocols → header diagram → devices → failure modes → security → quiz → sources).

## How to edit content

- **Layer metadata** (name, PDU, protocols, colors) lives in `lib/layers.ts`.
- **Layer prose** lives in `content/layers/<slug>.mdx`.
- Reusable MDX components are registered in `mdx-components.tsx` and need no import inside MDX:
  `<HeaderDiagram>`, `<Callout>`, `<ProtocolTable>`, `<WorkedExample>`, `<SequenceDiagram>`,
  `<Quiz>`, `<RFCRef>`, `<KeyTerm>`.

## How to add a diagram

Layer diagrams come in four flavours (bit-level headers, message sequences, hand-drawn rough.js, and
CSS-animated SVG). See the dedicated **[Diagram contributing guide](./docs/contributing-diagrams.md)**
for which to pick, copy-paste templates, the theme/accessibility/reduced-motion conventions, and the
verification checklist.

Quick note for **header** diagrams: bit widths must sum to the real header size — they're added to
`lib/headers.ts` and an automated test (`lib/headers.test.ts`) enforces it, so a wrong bit can't ship.

## Reporting errors

Open an issue describing the error and citing the correct source. Precise, sourced bug reports are the
most valuable contribution you can make.

## Licensing

By contributing you agree that your code is licensed under **MIT** and your content under
**CC BY 4.0** (see `LICENSE` and `CONTENT-LICENSE`).
