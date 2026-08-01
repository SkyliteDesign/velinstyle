# Web Components integration (vanilla)

**Planning-ID:** VS-195 / [#21](https://github.com/SkyliteDesign/velinstyle/issues/21)  
**SSR caveats:** [ssr-hydration.md](./ssr-hydration.md)

Primary integration path for VelinStyle: **no native Vue/Angular/Svelte adapter required**.

## 1. CSS + optional JS

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@birdapi/velinstyle@1.2.0/dist/velinstyle.min.css">
```

## 2. Register components

### Full bundle (demos / quick start)

```html
<script src="https://cdn.jsdelivr.net/npm/@birdapi/velinstyle@1.2.0/dist/velinstyle-components.iife.js"></script>
```

### ESM tree-shake / selective register

```js
import { register } from '@birdapi/velinstyle';
import '@birdapi/velinstyle/css';

await register(['velin-modal', 'velin-theme-toggle']);
```

### Boot from DOM

Scan the document for `velin-*` tags and load what is used:

```js
import { bootFromDOM } from '@birdapi/velinstyle';
await bootFromDOM();
```

Exact export names follow the package runtime entry — prefer the official starter and `velin-agent.json` module map when unsure.

## 3. Markup

```html
<velin-modal>
  <h2 slot="title">Title</h2>
  <p>Body</p>
</velin-modal>
<button type="button" onclick="document.querySelector('velin-modal').open()">Open</button>
```

Use real buttons/links for triggers; keep accessible names.

## 4. Themes

```html
<html data-velin-theme="light">
```

Or system preference with no attribute — see Light/Dark contract (ADR 0011).

## 5. Placeholders / CLS

Include `wc-placeholder` CSS (shipped in the framework base) so unknown custom elements reserve space before upgrade. Details: [ssr-hydration.md](./ssr-hydration.md).

## 6. React

Optional: `@velinstyle/react` (target rename `@birdapi/velinstyle-react` — ADR 0010). Vanilla WC guide remains the source of truth for behavior.

## Non-goals

- Native Vue/Angular/Svelte packages
- Replacing semantic HTML with custom elements everywhere
