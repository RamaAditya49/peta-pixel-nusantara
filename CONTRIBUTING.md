# Contributing

Thanks for helping improve Peta Pixel Nusantara.

This project is intentionally small: source boundary files, one rasterizer, one
vanilla demo, and generated runtime data. Contributions should keep that shape
unless there is a clear reason to expand it.

## Good First Contributions

- Improve the README examples.
- Add framework examples without changing the core data format.
- Improve keyboard accessibility in `index.html`.
- Normalize ADM2 names against official BPS/BIG region codes.
- Improve the rasterizer while keeping output reproducible.

## Data Changes

If you change any file in `sources/`, regenerate and verify:

```bash
node tools/rasterize.mjs
node tools/verify-data.mjs
```

Commit source changes and generated `data/` changes together.

## Documentation Changes

Run:

```bash
npx --yes markdownlint-cli2 README.md ATTRIBUTION.md AGENTS.md CLAUDE.md CONTRIBUTING.md
git diff --check
```

Keep the public keywords natural. The main phrase is `peta indonesia 8bit`, but
the README should still read like a professional open-source project.

## Preview Image

If the visible count, attribution footer, or UI changes, regenerate:

```bash
npx --yes playwright screenshot --viewport-size=1092,572 \
  "file:///home/ramaaditya/Project/peta-pixel-nusantara/index.html" \
  assets/preview.png
```

## Pull Request Checklist

- [ ] I ran `node tools/verify-data.mjs` for data changes.
- [ ] I ran markdown lint for documentation changes.
- [ ] I updated `ATTRIBUTION.md` if source data changed.
- [ ] I regenerated `assets/preview.png` if the visible demo changed.
- [ ] I did not manually edit generated data without explaining why.
