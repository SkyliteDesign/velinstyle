<div align="center">

```
██╗   ██╗███████╗██╗     ██╗███╗   ██╗███████╗████████╗██╗  ██╗██╗     ███████╗
██║   ██║██╔════╝██║     ██║████╗  ██║██╔════╝╚══██╔══╝██║  ██║██║     ██╔════╝
██║   ██║█████╗  ██║     ██║██╔██╗ ██║███████╗   ██║   ███████║██║     █████╗
╚██╗ ██╔╝██╔══╝  ██║     ██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║     ██╔══╝
 ╚████╔╝ ███████╗███████╗██║██║ ╚████║███████║   ██║   ██║  ██║███████╗███████╗
  ╚═══╝  ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝
```

**Accessibility-first CSS Framework · Web Components · Design Intelligence · AI Workflows**

One framework. One CLI. One design system. One AI-ready ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-2563eb?style=flat-square)](LICENSE)
[![npm](https://img.shields.io/npm/v/@birdapi/velinstyle?style=flat-square)](https://www.npmjs.com/package/@birdapi/velinstyle)
[![npm downloads](https://img.shields.io/npm/dm/@birdapi/velinstyle?style=flat-square)](https://www.npmjs.com/package/@birdapi/velinstyle)
[![GitHub stars](https://img.shields.io/github/stars/SkyliteDesign/velinstyle?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/stargazers)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square)](https://nodejs.org/)
[![Browsers](https://img.shields.io/badge/Browsers-modern-0ea5e9?style=flat-square)](https://velinstyle.info/docs/getting-started/introduction.html)
[![WCAG 2.2 AAA support](https://img.shields.io/badge/WCAG_2.2-AAA_support-16a34a?style=flat-square)](https://velinstyle.info/docs/getting-started/accessibility.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-2563eb?style=flat-square)](CONTRIBUTING.md)

```bash
npm i @birdapi/velinstyle
```

**[Website](https://velinstyle.info)** · **[Atelier](https://velinstyle.info/atelier/)** · **[Docs](https://velinstyle.info/docs/getting-started/introduction.html)** · **[Demos](https://velinstyle.info/demos/)** · **[Getting Started](GETTING_STARTED.md)** · **[Architecture](ARCHITECTURE.md)** · **[Deutsch](README.de.md)**

</div>

---

VelinStyle is a **production CSS + Web Components framework** with **WCAG 2.2 AAA-oriented defaults**, a real **CLI ship surface**, the **Transparency Framework** (labeling + provenance, beta), and the first **Design Intelligence / AI Foundation** systems (beta). No external UI framework in the core.

**VelinStyle Atelier** is the curated surface on top: **2,600+ production-ready interfaces**, four complete product worlds, and a browsable library — complete screens instead of empty component fragments.

**Best fit today:** marketing landings, docs shells, admin/SaaS starters, shop & community UIs via Atelier.  
**Not yet:** sole primary stack for large multipage shop + enterprise admin without custom work.

> **Release:** **1.2.2** (Production Release — Production Builder + Atelier CLI). Using VelinStyle does **not** certify your app — see the [a11y matrix](https://velinstyle.info/docs/getting-started/accessibility.html).

---

## Why VelinStyle

| Need | What you get |
|------|----------------|
| Readable HTML | Semantic BEM (`velin-btn--primary`), not utility walls |
| Accessibility | AAA-capable tokens, focus management, reduced motion — built in |
| Ship without a build | CDN CSS + optional WCs; Vite/React when you want them |
| Predictable overrides | Cascade layers + OKLCH design tokens |
| Quality gates | `scan`, `review`, `check` — catch real defects before merge |
| AI that helps | Skills, workflows, and agent metadata — **Mensch → Framework → KI** |

### The Tailwind sprawl problem

Heavy Tailwind use often turns HTML into a **class salad** — a simple button can need 10–15 utilities (`flex items-center … hover:bg-blue-700 … focus:ring-2 …`). VelinStyle still uses a `velin-` prefix, but ships **semantic, ready-made components** (plus utilities for one-off tweaks) instead of assembling every surface from atomic pieces. You get shorter markup, built-in a11y defaults, and optional blueprints / `plan` recipes — not a finished Studio product (Studio remains **planned**).

```html
<!-- Tailwind sprawl -->
<button class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
  Save
</button>

<!-- VelinStyle -->
<button class="velin-btn velin-btn--primary">Save</button>
```

Compared to **Tailwind**: less class sprawl, stronger defaults for contrast and semantics. See the [Migration Guide](https://velinstyle.info/docs/migration.html).  
Compared to **Bootstrap**: modern tokens/layers, optional progressive WCs, CLI automation instead of jQuery-era chrome.

---

## Feature highlights

| | Area | What it does |
|---|------|----------------|
| 🎨 | **CSS Framework** | OKLCH themes, utilities, components, lite preset for marketing budgets |
| 🧩 | **Web Components** | 43 canonical custom elements; use CSS alone when you need no JS |
| ⚡ | **Runtime** | Search, motion, highlight, attributes, `bootFromDOM` tree-shaking |
| 🛠 | **CLI** | `create` · `serve` · `doctor` · `check` · `scan` · `review` · `skills` · `transparency` |
| 🔎 | **Transparency** | Labeling + provenance (AI / trust / compliance / metadata) — beta foundation |
| 🧠 | **Design Intelligence** | Plan → constraints → page/section registry → review (beta) |
| 🤖 | **AI Skills** | 40 skills, packs, bundles, templates, workflow graphs (beta) |
| 📦 | **Registry** | Skills + page/section registries as machine-readable contracts |
| 📄 | **AI Metadata** | `velin-agent.json`, `llms.txt`, page-level agent JSON |
| 📚 | **Documentation** | Dogfooded site — 100% VelinStyle |
| 🔍 | **Review Engine** | Heuristic design / a11y / SEO / conversion gates (beta) |
| 🛡 | **Scan Engine** | A11y, security, CSS honesty, PII |
| 🚀 | **Performance** | Lite CSS, chunked runtime, CLS placeholders |
| ♿ | **Accessibility** | Contracts, WCAG 2.2 tooling, keyboard + ARIA patterns |
| 🖼 | **Atelier** | Curated library of complete interfaces, layouts & studio blocks |

---

## VelinStyle Atelier

[Atelier](https://velinstyle.info/atelier/) is the product showcase for VelinStyle: **complete interfaces**, not isolated buttons and cards. Browse by intent (apps, marketing, commerce, auth…), open live worlds, copy source, or download ZIPs.

| Surface | What you get | Link |
|---------|--------------|------|
| **Atelier home** | Brand hub — why Atelier, four worlds, build paths | [Open](https://velinstyle.info/atelier/) |
| **Library** | 2,638 templates — filter by mode, category, tags, quality | [Browse](https://velinstyle.info/atelier/library/) |
| **Cascade Console** | Enterprise / SaaS dashboard world | [Live demo](https://velinstyle.info/showcase-reihe/01-enterprise-api-ai-dashboard/) |
| **LUMEN** | Full shop — catalog, cart, checkout | [Live demo](https://velinstyle.info/showcase-reihe/02-enterprise-ecommerce-storefront/) |
| **FORGE** | Community & forum system | [Live demo](https://velinstyle.info/showcase-reihe/03-modern-community-forum/) |

Library shortcuts: [Apps](https://velinstyle.info/atelier/library/?mode=apps) · [Studio blocks](https://velinstyle.info/atelier/library/?mode=studio) · [Recipes](https://velinstyle.info/atelier/library/?mode=recipes) · [Marketing](https://velinstyle.info/atelier/library/?cat=marketing) · [Dashboards](https://velinstyle.info/atelier/library/?cat=dashboards) · [Auth](https://velinstyle.info/atelier/library/?cat=authentication)

German Atelier hub: [atelier/index.de.html](https://velinstyle.info/atelier/index.de.html)

---

## What's new in 1.2.2

**Production Release** — **Build only what your project actually uses.**

VelinStyle analyzes your project and creates an optimized production package instead of shipping the complete framework. This release also adds the first **Atelier CLI** (beta) and new production-ready components.

### Production Builder

```bash
npx velinstyle build --production --explain
# → ./dist/velin-production/ (CSS, JS stub, themes, icons, report)
```

- CSS only for used components · runtime only for needed Web Components
- Themes / icons / motion only when used · size report

### Atelier CLI (Beta)

```bash
npx velinstyle atelier list
npx velinstyle atelier 24
npx velinstyle scaffold --atelier 24
```

Atelier Library ≠ Velin Studio (Studio remains **planned**). See [`docs/guides/atelier-cli.md`](docs/guides/atelier-cli.md).

### New components & improvements

- `<velin-otp-input>`, `<velin-password-strength>`, `<velin-empty-state>`
- Table severity states · dynamic overlay titles (modal / drawer / sheet)

See [`RELEASE_NOTES_1.2.2.md`](RELEASE_NOTES_1.2.2.md) and [`docs/guides/production-build.md`](docs/guides/production-build.md).

## What's new in 1.2.1

- **Transparency Framework (beta)** — `@birdapi/velinstyle/transparency`, `velin-transparency` bridge, claim taxonomy, CLI `transparency doctor|validate|report|export|migrate`
- Builds on **1.2.0** foundation: ship surface, Design Intelligence, AI Skills, new WC primitives

Details: [`CHANGELOG.md`](CHANGELOG.md) · 1.2.0 overview: [`RELEASE_NOTES_1.2.0.md`](RELEASE_NOTES_1.2.0.md)

---

## Installation

```bash
npm i @birdapi/velinstyle
pnpm add @birdapi/velinstyle
yarn add @birdapi/velinstyle
bun add @birdapi/velinstyle
```

**CDN** (pin a version):

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.2.2/dist/velinstyle.min.css">
<script type="module" src="https://unpkg.com/@birdapi/velinstyle@1.2.2/dist/velinstyle-components.min.js"></script>
```

> Pin **`@1.2.2`** (or `@latest` after publish). Examples above match this package version.

| Export | Use |
|--------|-----|
| `@birdapi/velinstyle/css` | Full stylesheet |
| `@birdapi/velinstyle/bundle` | Web Components ESM |
| `/search` `/motion` `/attributes` `/highlight` `/meta` `/sanitize` | Tree-shakeable modules |

After clone: `npm install && npm run build` — `dist/` is generated, not committed.

---

## Quick start

```html
<!DOCTYPE html>
<html lang="en" data-velin-theme="ocean">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.2.2/dist/velinstyle.min.css">
  <script type="module" src="https://unpkg.com/@birdapi/velinstyle@1.2.2/dist/velinstyle-components.min.js"></script>
</head>
<body class="velin-p-6">
  <button type="button" class="velin-btn velin-btn--primary">Ship it</button>
  <velin-toast></velin-toast>
</body>
</html>
```

Scaffold + gate (local 1.2 tree / after publish):

```bash
npx @birdapi/velinstyle create landing ./my-site
cd my-site && npx @birdapi/velinstyle serve . && npx @birdapi/velinstyle check .
```

More: [`GETTING_STARTED.md`](GETTING_STARTED.md)

---

## CLI

| Command | Role |
|---------|------|
| `init` | Project config |
| `create` | Opinionated scaffolds (`landing` · `dashboard` · `docs` · `auth`) |
| `build` | CSS build (`--preset lite` for marketing) |
| `serve` | Static preview |
| `doctor` | Install / path health |
| `check` | doctor + blueprints + scan + review (+ Transparency scores) |
| `scan` | A11y / security / CSS / PII |
| `review` | Design-intelligence gate (beta) |
| `transparency` | doctor · validate · report · export · migrate (beta) |
| `plan` | Prompt → plan JSON → render (beta); `--atelier` Library plan (beta) |
| `scaffold` | Prompt HTML or `--atelier` Library compose (beta) |
| `atelier` | Pull curated Library showcase by number/id (`--format` wrappers) |
| `skills` / `workflow` | AI skill registry & graphs (beta) |
| `meta` | Agent bundle + `llms.txt` |
| `wc api <tag>` | Human-readable WC API from source |

```bash
npx @birdapi/velinstyle check . --profile marketing
npx @birdapi/velinstyle transparency doctor . --policy examples/transparency.policy.json
npx @birdapi/velinstyle atelier 36 -o ./velin-atelier/36-calendar
npx @birdapi/velinstyle scaffold --atelier 04,07 -o compose.html
npx @birdapi/velinstyle wc api velin-toast
```

Atelier pull / compose details and **limitations** (wrappers ≠ native Blade/Vue/React; Studio planned): [`docs/guides/atelier-cli.md`](docs/guides/atelier-cli.md).

---

## AI Skills & Design Intelligence

**AI Skills** give agents and humans a shared vocabulary: skill records, packs, bundles, templates, and workflow graphs. They exist so tooling can scaffold, review, and ship **without inventing VelinStyle from scratch**.

**Design Intelligence** adds structure ordinary CSS frameworks lack: a knowledge graph seed, page/section registries, design constraints, and `plan` / `review` so pages are assembled from known patterns — then checked against profiles (`marketing` · `app` · `docs` · `ecommerce`).

**Atelier compose (beta):** `scaffold --atelier` / `plan --atelier` can assemble pages from curated **Atelier Library** ids. This is Library compose — **not** Velin Studio (planned). Framework `--format` shells are wrappers only; native Blade/Vue/React blocks are planned later. See [`docs/guides/atelier-cli.md`](docs/guides/atelier-cli.md).

Deep dive: [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`VELINSTYLE_2030.md`](VELINSTYLE_2030.md) · Strategy (lokal, nicht im Git): [`docs/strategy/README.md`](docs/strategy/README.md)

---

## Components

**43 canonical** custom elements (**45** lazy-loader entries including legacy `*-wc` aliases).

Philosophy: **progressive enhancement** — semantic HTML + CSS first; upgrade to a Web Component only when you need behavior (focus traps, sorting, offline search).

Highlights: `velin-modal`, `velin-drawer`, `velin-search`, `velin-data-table`, `velin-form-summary`, `velin-calendar`, `velin-file-dropzone`, `velin-toast`, `velin-code-block`.

React: [`@velinstyle/react`](./packages/react/README.md) wraps every canonical tag.

---

## Accessibility

Accessibility is a **default**, not a plugin.

- WCAG 2.2 **AAA-oriented** token defaults (`data-velin-contrast="aa"` when you need the lighter palette)
- Semantic HTML patterns and BEM components
- Keyboard support, focus management, `inert` overlays
- `prefers-reduced-motion` gating
- Component a11y contracts + scanner rules

Docs: [a11y matrix](https://velinstyle.info/docs/getting-started/accessibility.html) · AAA marketing language: see `VELINSTYLE_2030.md` (strategy ADRs are local-only)

---

## Documentation map

| Layer | File / link | Audience |
|-------|-------------|----------|
| Landing | This README | First 30 seconds |
| First build | [`GETTING_STARTED.md`](GETTING_STARTED.md) | New adopters |
| FAQ | [`FAQ.md`](FAQ.md) | Common questions |
| Troubleshooting | [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) | When stuck |
| Deploy | [`DEPLOY.md`](DEPLOY.md) | Ship to production |
| Systems | [`ARCHITECTURE.md`](ARCHITECTURE.md) | Advanced / AI / DI |
| Design Intelligence | [`docs/guides/design-intelligence.md`](docs/guides/design-intelligence.md) | Plan / review |
| CLI ship surface | [`docs/guides/cli-ship-surface.md`](docs/guides/cli-ship-surface.md) | create / check / wc |
| AI Skills | [`docs/guides/ai-skills.md`](docs/guides/ai-skills.md) | Skills / workflows |
| Product site | [velinstyle.info/docs](https://velinstyle.info/docs/getting-started/introduction.html) | Guides, demos, reference |
| Atelier | [velinstyle.info/atelier](https://velinstyle.info/atelier/) | Template library + product worlds |
| Transparency | [Site guide](https://velinstyle.info/docs/guides/transparency.html) · `@birdapi/velinstyle/transparency` | Labeling + provenance |
| Upgrade | [`UPGRADING.md`](UPGRADING.md) | 1.2.1 → 1.2.2 · 1.2.0 → 1.2.1 · 1.1 → 1.2 |
| North star | [`VELINSTYLE_2030.md`](VELINSTYLE_2030.md) | Long-term vision |

---

## Repository structure

```
velinstyle/
├── src/                 # CSS source (tokens, base, components, utilities)
├── components/          # Web Components (JS)
├── core/                # Runtime: search, motion, highlight, attributes, meta, transparency
├── cli/                 # velinstyle binary
├── packages/            # React wrappers, skill-engine, skills registry
├── schemas/             # Design Intelligence + skill contracts
├── docs/                # Docs + strategy ADRs
├── samples/             # Local HTML samples
├── templates/           # Starters (e.g. Vite + React)
├── fixtures/            # Scanner / chaos fixtures
└── showcase-demos/      # Full-page demos
```

---

## Philosophy

**Mensch → Framework → Design Intelligence → AI**

Humans own product intent. The framework ships reliable CSS and components. Design Intelligence encodes patterns and constraints. AI skills and workflows accelerate scaffolding and review — they **support** developers; they do not replace judgment, accessibility ownership, or design responsibility.

---

## Roadmap (maturity)

| Status | Surfaces |
|--------|----------|
| **Stable** | CSS · Utilities · Runtime · Web Components · CLI core · Blueprints |
| **Beta** | Transparency Framework · Review Engine · Prompt Engine · Knowledge Graph · AI Metadata · Design Constraints |
| **Foundation** | AI Skills · Workflow Graphs · Registries · Transparency pillars |
| **Planned** | Velin Studio builder · Utility Engine Generator · native Blade/Vue/React blocks |

---

## Comparison

| | Bootstrap | Tailwind | **VelinStyle** |
|---|:---:|:---:|:---:|
| HTML readability | Medium | Low | **High** |
| Markup density | Low | High | **Controlled** |
| Utility sprawl | Low | High | **Controlled** |
| A11y defaults | Partial | DIY | **AAA-capable tokens** |
| Dark mode | Manual | `dark:` everywhere | **Token swap** |
| Build required | No | Usually | **CDN optional** |
| Design / AI gates | — | — | **plan · review · skills · transparency** |

---

## Contributing

1. Fork → `npm install && npm run build`
2. Change code · run `npm test`, `npm run test:a11y`, `npm run test:e2e`
3. Open a PR

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## License

[MIT](LICENSE) — © 2026 VelinStyle · [SkyliteDesign](https://github.com/SkyliteDesign)

---

## Live demos & modules

Explore finished surfaces — Atelier worlds, the template library, and classic component demos.

### Atelier product worlds

| Module | Focus | Demo |
|--------|-------|------|
| **Cascade Console** | Enterprise API / AI dashboard | [Open](https://velinstyle.info/showcase-reihe/01-enterprise-api-ai-dashboard/) |
| **LUMEN** | E-commerce storefront | [Open](https://velinstyle.info/showcase-reihe/02-enterprise-ecommerce-storefront/) |
| **FORGE** | Community forum | [Open](https://velinstyle.info/showcase-reihe/03-modern-community-forum/) |
| **Atelier Library** | Full template hub (2,638) | [Open](https://velinstyle.info/atelier/library/) |
| **Atelier home** | Marketing hub (EN) | [Open](https://velinstyle.info/atelier/) |
| **Atelier home** | Marketing hub (DE) | [Open](https://velinstyle.info/atelier/index.de.html) |

### Classic demo modules

| Module | Focus | Demo |
|--------|-------|------|
| **Demo index** | All classic showcases | [Open](https://velinstyle.info/demos/) |
| **Crypto dashboard** | Dense admin / charts | [Open](https://velinstyle.info/demos/showcase-crypto.html) |
| **Dashboard** | App shell & KPIs | [Open](https://velinstyle.info/demos/showcase-dashboard.html) |
| **SaaS** | Product marketing | [Open](https://velinstyle.info/demos/showcase-saas.html) |
| **E-commerce** | Shop patterns | [Open](https://velinstyle.info/demos/showcase-ecommerce.html) |
| **Forum** | Community UI | [Open](https://velinstyle.info/demos/showcase-forum.html) |
| **UI Kit** | Component gallery | [Open](https://velinstyle.info/demos/showcase-ui-kit.html) |
| **Interactive** | WC behavior samples | [Open](https://velinstyle.info/demos/showcase-interactive.html) |
| **Runtime** | Search / motion / boot | [Open](https://velinstyle.info/demos/showcase-runtime.html) |

### Library by intent

| Intent | Link |
|--------|------|
| Applications | [library/?mode=apps](https://velinstyle.info/atelier/library/?mode=apps) |
| Studio blocks | [library/?mode=studio](https://velinstyle.info/atelier/library/?mode=studio) |
| Recipes | [library/?mode=recipes](https://velinstyle.info/atelier/library/?mode=recipes) |
| Marketing | [library/?cat=marketing](https://velinstyle.info/atelier/library/?cat=marketing) |
| Dashboards | [library/?cat=dashboards](https://velinstyle.info/atelier/library/?cat=dashboards) |
| Commerce | [library/?cat=commerce](https://velinstyle.info/atelier/library/?cat=commerce) |
| Authentication | [library/?cat=authentication](https://velinstyle.info/atelier/library/?cat=authentication) |
| Community | [library/?cat=community](https://velinstyle.info/atelier/library/?cat=community) |
| Admin | [library/?cat=admin](https://velinstyle.info/atelier/library/?cat=admin) |

<p align="center">
  <a href="https://velinstyle.info/atelier/">
    <img src=".github/assets/readme/hero-demo.webp" alt="VelinStyle Atelier and demo surfaces" width="720">
  </a>
</p>
