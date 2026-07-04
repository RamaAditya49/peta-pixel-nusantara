# CLAUDE.md

Quick context for Claude and other coding agents.

## What This Repo Is

Peta Pixel Nusantara is an open-source **peta Indonesia 8bit**: an interactive
pixel map of Indonesia with 38 provinces and 519 ADM2 units. The demo is
vanilla HTML/Canvas. The runtime data is generated from boundary sources into
RLE-compressed grids.

Read `AGENTS.md` for the full operating rules.

## Most Important Files

- `index.html` - interactive demo and renderer.
- `tools/rasterize.mjs` - source boundaries to generated data.
- `tools/verify-data.mjs` - coverage and consistency checks.
- `data/peta-hd-data.js` - generated browser data (`window.PETA_HD`).
- `data/peta-hd-data.json` - generated JSON data.
- `sources/geoBoundaries-IDN-ADM2_simplified.geojson` - primary ADM2 source.
- `README.md` - public-facing SEO/readability surface.
- `ATTRIBUTION.md` - source and license accounting.

## Standard Workflow

For data or renderer changes:

```bash
node tools/rasterize.mjs
node tools/verify-data.mjs
```

For docs changes:

```bash
npx --yes markdownlint-cli2 README.md ATTRIBUTION.md AGENTS.md CLAUDE.md CONTRIBUTING.md
git diff --check
```

For preview changes:

```bash
npx --yes playwright screenshot --viewport-size=1092,572 \
  "file:///home/ramaaditya/Project/peta-pixel-nusantara/index.html" \
  assets/preview.png
```

## SEO Direction

Primary phrase: `peta indonesia 8bit`.

Secondary phrases:

- `peta pixel indonesia`
- `peta pixel nusantara`
- `indonesia 8-bit map`
- `indonesia pixel map`
- `interactive indonesia map`
- `indonesia map geojson`

Keep these phrases visible in public documentation, but write for humans first.

## Non-Negotiables

- Do not manually edit `data/*` unless you are correcting generated output after
  a rasterizer run and can explain why.
- Do not remove attribution for geoBoundaries, denyherianto, or the legacy GADM
  fallback.
- Do not add a package manager or framework unless the user asks for a larger
  app rewrite.
- Do not claim data coverage improved unless `tools/verify-data.mjs` passes.
