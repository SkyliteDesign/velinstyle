<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-banner-dark.svg">
  <img src=".github/assets/readme-banner.svg" alt="VelinStyle — developer-first CSS system" width="100%">
</picture>

# VelinStyle

**The developer-first CSS system.**

Build clean interfaces.  
Without utility chaos.

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-2563eb?style=flat-square)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v0.8.0-2563eb?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.8.0)
[![npm version](https://img.shields.io/npm/v/@birdapi/velinstyle?style=flat-square)](https://www.npmjs.com/package/@birdapi/velinstyle)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-16a34a?style=flat-square)](https://velinstyle.info/docs/)
[![GitHub stars](https://img.shields.io/github/stars/SkyliteDesign/velinstyle?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-2563eb?style=flat-square)](CONTRIBUTING.md)

<br>

```bash
npm install @birdapi/velinstyle
```

<br>

**[Live demos](https://velinstyle.info/demos/)** · **[Docs](https://velinstyle.info/docs/)** · **[Star on GitHub](https://github.com/SkyliteDesign/velinstyle)** · **[npm](https://www.npmjs.com/package/@birdapi/velinstyle)**

**English** · **[Deutsch](README.de.md)**

</div>

---

## The problem

Modern UI stacks trade readability for speed.

| | Pain |
| --- | --- |
| **Tailwind** | Utility spam. Unreadable markup. Endless `dark:` prefixes. |
| **Bootstrap** | Hard to override. Legacy weight. Samey look. |
| **Shoelace** | Web Component overhead. Shadow DOM styling fights. |

You ship fast. Then you fight your HTML.

---

## The solution

**VelinStyle** is a lean CSS + Web Component system built for developers who want **structure, not sprawl**.

- **Semantic components** — `velin-btn`, `velin-card`, `velin-table`. Names you can grep.
- **Predictable BEM-style classes** — no generated utility soup.
- **CSS cascade layers** — tokens → base → components → utilities. Overrides stay sane.
- **Optional Web Components** — 32 interactive widgets when you need behavior, plain CSS when you don't.
- **OKLCH design tokens + 13 themes** — swap `data-velin-theme`, skip `dark:` hell.
- **Ship without a build step** — link CSS + ESM from npm or CDN. CLI when you want automation.
- **WCAG 2.2 AA by design** — focus, ARIA, keyboard patterns baked in.

---

## Quick example

Readable HTML. Real components. No 40-class `<div>` tags.

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle.min.css">

<div class="velin-container velin-p-6">
  <div class="velin-grid velin-grid--cols-3 velin-gap-4">
    <article class="velin-card">
      <div class="velin-card__body">
        <h2 class="velin-card__title">Revenue</h2>
        <p class="velin-card__text velin-text-3xl velin-font-bold">$24.8k</p>
        <button type="button" class="velin-btn velin-btn--primary velin-btn--sm">Details</button>
      </div>
    </article>
    <article class="velin-card">
      <div class="velin-card__body">
        <h2 class="velin-card__title">Users</h2>
        <p class="velin-card__text velin-text-3xl velin-font-bold">1,284</p>
        <button type="button" class="velin-btn velin-btn--outline velin-btn--sm">Details</button>
      </div>
    </article>
    <article class="velin-card">
      <div class="velin-card__body">
        <h2 class="velin-card__title">Conversion</h2>
        <p class="velin-card__text velin-text-3xl velin-font-bold">3.2%</p>
        <button type="button" class="velin-btn velin-btn--ghost velin-btn--sm">Details</button>
      </div>
    </article>
  </div>
</div>
```

This is what Tailwind **doesn't** look like.

---

## Installation

### npm

```bash
npm install @birdapi/velinstyle
```

```html
<link rel="stylesheet" href="node_modules/@birdapi/velinstyle/dist/velinstyle.min.css">
<script type="module" src="node_modules/@birdapi/velinstyle/dist/velinstyle-components.min.js"></script>
```

### CDN

Pin the version. Ship today.

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle.min.css">
<script type="module" src="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle-components.min.js"></script>
```

### Download / clone

`dist/` is not in git. After clone:

```bash
git clone https://github.com/SkyliteDesign/velinstyle.git
cd velinstyle
npm install && npm run build
```

**Zero-build option:** fork [showcase-demos](showcase-demos/) and open HTML files — unpkg CDN only.

---

## Quick start

Minimal page. One button. Done.

```html
<!DOCTYPE html>
<html lang="en" data-velin-theme="ocean">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle.min.css">
  <script type="module" src="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle-components.min.js"></script>
</head>
<body>
  <div class="velin-container velin-p-6">
    <button type="button" class="velin-btn velin-btn--primary">Ship it</button>
  </div>
</body>
</html>
```

**Next:** [Getting started docs](https://velinstyle.info/docs/) · [Vite starter](templates/vite-velinstyle) · [React starter](templates/vite-react-velinstyle)

---

## Core philosophy

Four rules. No exceptions.

1. **Clean HTML** — structure first, decoration second.
2. **Predictable classes** — `velin-*` naming you and your IDE understand.
3. **Readable UI code** — diffs stay human-sized. Reviews stay fast.
4. **AI-friendly structure** — consistent patterns for codegen; CLI `scaffold` and `blueprint` for bootstrapping.

---

## Features

| | |
| --- | --- |
| **Grid & layout** | `velin-grid`, container queries, responsive utilities |
| **Components** | 35+ CSS components + 32 Web Components |
| **Themes** | 13 OKLCH presets via `data-velin-theme` |
| **Footprint** | ~150 KB CSS + ~111 KB JS (min, full bundle) |
| **Accessibility** | WCAG 2.2 AA, RTL, `prefers-reduced-motion` |
| **Motion (0.8.0)** | Sparkline, counter, live-dot, FLIP helpers, reveal |
| **CLI** | `init`, `build`, `scan`, `scaffold`, `layout`, `blueprint`, `icons`, `prefix` |

**Advanced:** [CLI & architecture in CHANGELOG](CHANGELOG.md#080---2026-05-16) · [Full docs](https://velinstyle.info/docs/)

---

## Comparison

| | Bootstrap | Tailwind | Shoelace | **VelinStyle** |
| --- | :---: | :---: | :---: | :---: |
| HTML readability | Medium | Low | Medium | **High** |
| Class predictability | Medium | Low | Medium | **`velin-btn--primary`** |
| Utility sprawl | Low | **High** | Low | **Controlled** |
| Override story | Hard | Config file | Shadow DOM | **CSS layers + tokens** |
| Accessibility | Partial | DIY | Good WC | **WCAG 2.2 AA** |
| Dark mode | Manual | `dark:` everywhere | Theme attr | **Token swap** |
| App chrome | Legacy JS | BYO | WC only | **CSS + optional WCs** |
| Ship speed | Fast | Fast (with build) | Fast | **CDN, no build required** |
| Full-page demos | Basic | None official | Storybook | **[Live showcases](https://velinstyle.info/demos/)** |

---

## Live demos

Full application pages — not toy snippets.

<p align="center">
  <a href="https://velinstyle.info/demos/showcase-crypto.html">
    <img src=".github/assets/readme/hero-demo.webp" alt="VelinStyle crypto dashboard demo" width="100%">
  </a>
</p>

<table>
<tr>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-crypto.html"><img src=".github/assets/readme/demo-crypto.webp" alt="Crypto dashboard" width="100%"></a>

**[Crypto →](https://velinstyle.info/demos/showcase-crypto.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-ecommerce.html"><img src=".github/assets/readme/demo-ecommerce.webp" alt="E-commerce demo" width="100%"></a>

**[E-Commerce →](https://velinstyle.info/demos/showcase-ecommerce.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-dashboard.html"><img src=".github/assets/readme/demo-dashboard.webp" alt="Dashboard demo" width="100%"></a>

**[Dashboard →](https://velinstyle.info/demos/showcase-dashboard.html)**

</td>
</tr>
<tr>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-saas.html"><img src=".github/assets/readme/demo-saas.webp" alt="SaaS marketing" width="100%"></a>

**[SaaS →](https://velinstyle.info/demos/showcase-saas.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-interactive.html"><img src=".github/assets/readme/demo-interactive.webp" alt="Interactive components" width="100%"></a>

**[Interactive →](https://velinstyle.info/demos/showcase-interactive.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-forum.html"><img src=".github/assets/readme/demo-forum.webp" alt="Forum community" width="100%"></a>

**[Forum →](https://velinstyle.info/demos/showcase-forum.html)**

</td>
</tr>
</table>

<p align="center">
  <a href="https://velinstyle.info/demos/"><strong>All demos →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/SkyliteDesign/velinstyle/tree/main/showcase-demos"><strong>Fork showcase-demos →</strong></a>
</p>

---

## Contributing

PRs welcome. All sizes.

1. Fork the repo
2. `npm install && npm run build` (`dist/` is gitignored)
3. Make your change · run `npm test` and `npm run test:a11y`
4. Open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, branch rules, and review process.

---

## Roadmap

Direction, not a commitment. See [CHANGELOG](CHANGELOG.md) for shipped work.

| Phase | Focus |
| --- | --- |
| **Now (0.8.0)** | Motion tokens, sparkline / counter / live-dot, FLIP helpers, filter utilities, `scaffold` + `layout` CLI |
| **Next** | Smaller optional bundles, more blueprint packs, expanded scaffold intents |
| **Exploring** | Framework adapters, design-token export, additional theme presets |

---

## Community

| | |
| --- | --- |
| **Issues & bugs** | [github.com/SkyliteDesign/velinstyle/issues](https://github.com/SkyliteDesign/velinstyle/issues) |
| **Releases** | [github.com/SkyliteDesign/velinstyle/releases](https://github.com/SkyliteDesign/velinstyle/releases) |
| **Product site** | [velinstyle.info](https://velinstyle.info) |
| **Documentation** | [velinstyle.info/docs/](https://velinstyle.info/docs/) |

**Help others find VelinStyle:** [Star the repo](https://github.com/SkyliteDesign/velinstyle) · [Try a live demo](https://velinstyle.info/demos/) · [Fork showcase-demos](https://github.com/SkyliteDesign/velinstyle/tree/main/showcase-demos)

---

## License

[MIT](LICENSE) — Copyright © 2026 VelinStyle

<div align="center">

Made with care for the web by [SkyliteDesign](https://github.com/SkyliteDesign)

</div>
