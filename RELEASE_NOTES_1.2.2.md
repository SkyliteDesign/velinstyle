# VelinStyle 1.2.2 — Production Release

**Build only what your project actually uses.**

VelinStyle 1.2.2 focuses on production builds and developer workflow. The new Production Builder creates optimized output based on the actual project instead of shipping the complete framework. This release also introduces the first Atelier CLI integration and new production-ready components.

## 1.2.x series

| Release | Focus |
|---------|--------|
| **1.2.0** | Design Intelligence |
| **1.2.1** | Transparency Framework |
| **1.2.2** | Production Builder + Atelier CLI |

Further 1.2.x work should round out this foundation (Production Builder, Atelier CLI, review engine, components, blueprints, CLI) — not invent a new product line.

## Production Builder

Do not ship the full framework blindly. VelinStyle analyzes the project and builds an optimized production package:

- CSS only for used components
- Runtime only for needed Web Components
- Themes / icons / motion only when used
- Report with size comparison (`--explain` lists removals)

```bash
npm i @birdapi/velinstyle@1.2.2
npx velinstyle build --production --explain
# alias: npx velinstyle production .
```

Link `./dist/velin-production/velinstyle.css` + `velinstyle.js` (+ themes/icons as needed) instead of the full CDN bundle when publishing.

Guide: [`docs/guides/production-build.md`](docs/guides/production-build.md)

## Atelier CLI (Beta)

Atelier Library is usable from the CLI for the first time — separate from **Velin Studio** (planned):

```bash
npx velinstyle atelier list
npx velinstyle atelier 24
npx velinstyle scaffold --atelier 24
```

`--format blade|vue|react` writes **integration wrappers** around vanilla showcase assets (not native rewrites). Guide: [`docs/guides/atelier-cli.md`](docs/guides/atelier-cli.md)

## New components

- `<velin-otp-input>`
- `<velin-password-strength>`
- `<velin-empty-state>`

## Improvements

- Table / data-table row severity modifiers
- Modal, Drawer, and Sheet: dynamic / reactive titles (`slot="title"`)

## Not in 1.2.2

- Image / srcset pipeline (report placeholder)
- Public CLI brand `velinstyle optimize` (internal modules only)
- Velin Studio Builder (planned)
- Native Blade/Vue/React rewrites of Atelier templates (planned)

## Upgrade

See [`UPGRADING.md`](UPGRADING.md) and site Production Builder / CLI docs after sync.
