# Getting Started with VelinStyle

Short path from install to a page you can preview and gate.  
Landing overview: [`README.md`](README.md) · systems deep dive: [`ARCHITECTURE.md`](ARCHITECTURE.md)

> **npm latest today:** still **1.1.0** on the registry. Commands like `create` / `check` / `skills` below describe the **1.2** ship surface in this repo (and the upcoming cut). Until publish, run the CLI via `node path/to/velinstyle/cli/index.js …` from a clone.

---

## 1. Install

```bash
npm i @birdapi/velinstyle
# or: pnpm add / yarn add / bun add @birdapi/velinstyle
```

**CDN-only** (no bundler):

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.2.0/dist/velinstyle.min.css">
<script type="module" src="https://unpkg.com/@birdapi/velinstyle@1.2.0/dist/velinstyle-components.min.js"></script>
```

Until the public 1.2.0 cut, use `@1.1.0` on CDN or a local clone.

---

## 2. Minimal page

```html
<!DOCTYPE html>
<html lang="en" data-velin-theme="ocean">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello VelinStyle</title>
  <link rel="stylesheet" href="node_modules/@birdapi/velinstyle/dist/velinstyle.min.css">
  <script type="module" src="node_modules/@birdapi/velinstyle/dist/velinstyle-components.min.js"></script>
</head>
<body class="velin-p-6 velin-flex velin-flex-col velin-gap-4">
  <h1 class="velin-text-3xl velin-font-bold">Hello</h1>
  <p class="velin-text-muted">Readable classes. AAA-oriented tokens.</p>
  <button type="button" class="velin-btn velin-btn--primary">Primary action</button>
</body>
</html>
```

Themes: set `data-velin-theme` on `<html>` (e.g. `ocean`, `forest`, …). Contrast: `data-velin-contrast="aa"` for the lighter AA palette.

---

## 3. Scaffold with the CLI (1.2)

```bash
npx @birdapi/velinstyle create landing ./my-site
cd my-site
npx @birdapi/velinstyle serve .
npx @birdapi/velinstyle check .
```

| Kind | Intent |
|------|--------|
| `landing` | Marketing page |
| `dashboard` | Simple app chrome |
| `docs` | Documentation shell |
| `auth` | Sign-in layout |

Vendor assets land under `vendor/velinstyle/`. Offline WC notes: `vendor/velinstyle/docs/` or `velinstyle wc api <tag>`.

---

## 4. Everyday CLI workflows

```bash
npx @birdapi/velinstyle init                 # velinstyle.config.js
npx @birdapi/velinstyle doctor               # install / path health
npx @birdapi/velinstyle scan .               # a11y / security / CSS
npx @birdapi/velinstyle review page.html     # design gate (beta)
npx @birdapi/velinstyle check . --profile app
npx @birdapi/velinstyle build --preset lite  # smaller marketing CSS
npx @birdapi/velinstyle meta                 # agent bundle + llms.txt
```

`check` aggregates doctor + blueprint `--strict` + scan + review. Prefer it on **consumer scaffolds**, not on huge docs trees full of demos.

---

## 5. Import only what you need

```js
import '@birdapi/velinstyle/css';
import { bootFromDOM } from '@birdapi/velinstyle';
import { initMotion } from '@birdapi/velinstyle/motion';

bootFromDOM();
initMotion();
```

| Export | Module |
|--------|--------|
| CSS | `@birdapi/velinstyle/css` |
| Bundle | `@birdapi/velinstyle/bundle` |
| Search | `@birdapi/velinstyle/search` |
| Motion | `@birdapi/velinstyle/motion` |
| Attributes | `@birdapi/velinstyle/attributes` |
| Highlight | `@birdapi/velinstyle/highlight` |
| Meta | `@birdapi/velinstyle/meta` |
| Sanitize | `@birdapi/velinstyle/sanitize` |

React: see [`packages/react/README.md`](packages/react/README.md). Vite starter: `templates/vite-react-velinstyle`.

---

## 6. Common patterns

**Modal (attribute bridge + CSS):**

```html
<button type="button" class="velin-btn" velin-modal="#demo">Open</button>
<dialog id="demo" class="velin-modal">…</dialog>
```

**Accessible form errors:**

```html
<form>
  <velin-form-summary></velin-form-summary>
  <!-- fields with data-error-message, etc. -->
</form>
```

**Progressive table:**

```html
<velin-data-table filter-input="#q" page-size="10">
  <table>…</table>
</velin-data-table>
```

---

## 7. Upgrade notes

- From **1.1 → 1.2:** [`UPGRADING.md`](UPGRADING.md)
- Release overview: [`RELEASE_NOTES_1.2.0.md`](RELEASE_NOTES_1.2.0.md)
- Full delta: [`CHANGELOG.md`](CHANGELOG.md)

Expect stricter `scan` / `review` after 1.2 — fix markup; do not weaken gates.

---

## 8. Where next

| Goal | Link |
|------|------|
| Components | [Introduction](https://velinstyle.info/docs/getting-started/introduction.html) |
| Live demos | [velinstyle.info/demos](https://velinstyle.info/demos/) |
| A11y matrix | [docs/a11y](https://velinstyle.info/docs/a11y.html) |
| Landing in 15 min | [docs/guides/landing-15-min.html](https://velinstyle.info/docs/guides/landing-15-min.html) |
| FAQ / Troubleshooting / Deploy | [`FAQ.md`](FAQ.md) · [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) · [`DEPLOY.md`](DEPLOY.md) |
| Design Intelligence | [`docs/guides/design-intelligence.md`](docs/guides/design-intelligence.md) |
| CLI ship surface | [`docs/guides/cli-ship-surface.md`](docs/guides/cli-ship-surface.md) |
| Architecture / AI | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
