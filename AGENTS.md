# AGENTS.md

Guidance for AI agents working on Peta Pixel Nusantara.

## Project Purpose

This repo publishes an open-source **peta Indonesia 8bit** / **8-bit map of
Indonesia**. It contains:

- a vanilla HTML/Canvas demo in `index.html`;
- generated runtime data in `data/peta-hd-data.js` and
  `data/peta-hd-data.json`;
- source boundaries in `sources/`;
- a rasterizer in `tools/rasterize.mjs`;
- a data verifier in `tools/verify-data.mjs`.

The public positioning matters. Keep copy natural, but preserve the core search
phrases: `peta indonesia 8bit`, `peta pixel indonesia`, `indonesia 8-bit map`,
`indonesia pixel map`, `interactive indonesia map`, and `indonesia map geojson`.

## Data Contract

- `sources/geoBoundaries-IDN-ADM2_simplified.geojson` is the primary ADM2
  source.
- `sources/indonesia-topojson-city-regency.json` is a legacy fallback only.
- `sources/indonesia-38-provinces.topo.json` remains the ADM1 province source.
- `data/peta-hd-data.js` and `data/peta-hd-data.json` are generated files.
- Do not manually edit generated data. Change sources or the rasterizer, then
  run `node tools/rasterize.mjs`.
- Generated data must include 38 provinces and at least 514 ADM2 units.
  Current expected output is 519 ADM2 units with 98 cities.

## Required Verification

Run these before claiming the repo is ready:

```bash
node --check tools/rasterize.mjs
node --check tools/verify-data.mjs
node tools/rasterize.mjs
node tools/verify-data.mjs
npx --yes markdownlint-cli2 README.md ATTRIBUTION.md AGENTS.md CLAUDE.md CONTRIBUTING.md
git diff --check
```

If `node tools/rasterize.mjs` changes files in `data/`, commit those generated
files together with the source/rasterizer change.

## README And SEO Rules

- Keep the first 100 words clear for humans and search engines.
- The primary keyword is `peta indonesia 8bit`.
- The English bridge keyword is `8-bit map of Indonesia`.
- Do not keyword-stuff. Use the phrases where they read naturally.
- Keep the preview image current when visible counts or footer attribution
  changes:

```bash
npx --yes playwright screenshot --viewport-size=1092,572 \
  "file:///home/ramaaditya/Project/peta-pixel-nusantara/index.html" \
  assets/preview.png
```

## Attribution And Licensing

- Code is MIT.
- geoBoundaries ADM2 data is CC-BY-4.0 and must be attributed.
- The legacy fallback source is GADM-derived and has stricter usage terms.
- Keep `ATTRIBUTION.md`, README data-source copy, and the `index.html` footer
  consistent whenever sources change.

## Development Boundaries

- Keep the project dependency-free unless there is a strong reason.
- Prefer vanilla JavaScript for the demo.
- Keep the runtime format platform-agnostic: JSON metadata plus RLE grids.
- Do not add build tooling for simple documentation or data updates.
- Avoid unrelated redesigns while changing data, SEO, or docs.

## Git Hygiene

- Commit only files relevant to the requested change.
- Never revert user changes without explicit approval.
- Before pushing, verify `git status --short --branch` and make sure the branch
  is synced after push.
