# Troubleshooting

Stuck as a new VelinStyle user? Start here. Related: [`FAQ.md`](FAQ.md) · [`GETTING_STARTED.md`](GETTING_STARTED.md)

---

## Install / CLI

### `npx velinstyle` → 404 Not Found

The package name is **`@birdapi/velinstyle`**, not `velinstyle`.

```bash
npx @birdapi/velinstyle --help
```

Local clone (1.2 prep):

```bash
node path/to/velinstyle/cli/index.js --help
```

### `create` / `check` / `skills` unknown on npm 1.1.0

Those commands are part of the **1.2 ship surface**. Until publish, use this repo’s CLI. After publish, install `@birdapi/velinstyle@1.2.0` (or later).

### Windows: config import fails / weird path errors

Always load ESM via `pathToFileURL`. Run `velinstyle doctor` — it checks Windows-safe imports. Avoid raw `d:\…` dynamic imports.

### `doctor` warns about missing vendor CSS

Copy `dist/` into `vendor/velinstyle/` (or run `create`, which vendors assets), or install the package so `node_modules/@birdapi/velinstyle/dist` exists.

---

## `check` / `scan` / `review`

### `check .` fails with tens of thousands of issues

You pointed `check` at a **docs / demo monorepo**. It scans the whole tree. Use it on a **scaffold** (`create landing ./app`) or a single HTML file:

```bash
velinstyle check ./index.html --profile docs
velinstyle scan ./src --severity error
```

### Review gate fails on an admin page

Pass the right profile:

```bash
velinstyle check . --profile app
velinstyle review page.html --profile app
```

Profiles: `marketing` · `app` · `docs` · `fragment` · `ecommerce`

### Scan complains about unknown `velin-*` classes

Blueprints or hand-written HTML may drift from CSS. Run `velinstyle blueprint --strict` / `npm run check:blueprints` in the framework, or fix the class name. Prefer classes from [utilities docs](https://velinstyle.info/docs/utilities/spacing.html).

### Nested interactive / `aria-hidden` on buttons

Real a11y defects. Don’t silence the rule — fix markup (no interactive inside interactive; don’t hide focusable controls with `aria-hidden`).

---

## Build / assets

### Blank styles after clone

`dist/` is **not** in git. Run:

```bash
npm install && npm run build
```

### Icons missing

Ensure `velin-icons.svg` sits next to CSS, or set `<meta name="velin-icon-sprite" content="…">`. `doctor` warns when the sprite is missing.

### Theme CSS 404

Themes live under `dist/themes/`. Point `velin-theme-toggle` / docs `data-velin-themes-base` at that folder.

---

## Components

### Custom element not upgrading

Load the components bundle (or register the tag). Placeholders: `wc-placeholder.css` reduces CLS before upgrade.

### Need the API for a tag offline

```bash
velinstyle wc api velin-toast
```

Generated docs: `docs/generated/components/<tag>.md`

### React props not applying

Use `@velinstyle/react` wrappers — booleans become attributes; objects are properties; `onVelin*` maps to custom events.

---

## AI / Design Intelligence

### Skill paths missing (`skills doctor` fails)

Demo/guide paths in skill records must exist. Fix records or restore linked samples/guides, then re-run `velinstyle skills doctor`.

### `skills run` didn’t change my HTML

Expected. `run` inspects workflow steps (often dry-run). For HTML, use `create`, `scaffold`, or `plan` + render.

### Agents don’t “know” VelinStyle

Generate metadata:

```bash
velinstyle meta
velinstyle meta page index.html --write
```

Point tools at `dist/llms.txt` / `dist/velin-agent.json`.

---

## Deploy

See [`DEPLOY.md`](DEPLOY.md). Typical failure: shipping without built `dist/`, wrong CDN pin, or absolute paths that break on static hosts.

---

## Still stuck?

1. `velinstyle doctor`  
2. `velinstyle check <your-page.html> --json`  
3. [Forum](https://forum.birdapi.de/) · [GitHub issues](https://github.com/SkyliteDesign/velinstyle/issues)
