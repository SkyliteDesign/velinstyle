<div align="center">

```
██╗   ██╗███████╗██╗     ██╗███╗   ██╗███████╗████████╗██╗  ██╗██╗     ███████╗
██║   ██║██╔════╝██║     ██║████╗  ██║██╔════╝╚══██╔══╝██║  ██║██║     ██╔════╝
██║   ██║█████╗  ██║     ██║██╔██╗ ██║███████╗   ██║   ███████║██║     █████╗
╚██╗ ██╔╝██╔══╝  ██║     ██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║     ██╔══╝
 ╚████╔╝ ███████╗███████╗██║██║ ╚████║███████║   ██║   ██║  ██║███████╗███████╗
  ╚═══╝  ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝
```

**Accessibility-first CSS-Framework · Web Components · Design Intelligence · AI-Workflows**

Ein Framework. Eine CLI. Ein Design System. Ein AI-fähiges Ökosystem.

[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-2563eb?style=flat-square)](LICENSE)
[![npm](https://img.shields.io/npm/v/@birdapi/velinstyle?style=flat-square)](https://www.npmjs.com/package/@birdapi/velinstyle)
[![npm downloads](https://img.shields.io/npm/dm/@birdapi/velinstyle?style=flat-square)](https://www.npmjs.com/package/@birdapi/velinstyle)
[![GitHub Stars](https://img.shields.io/github/stars/SkyliteDesign/velinstyle?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/stargazers)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square)](https://nodejs.org/)
[![Browser](https://img.shields.io/badge/Browser-modern-0ea5e9?style=flat-square)](https://velinstyle.info/docs/getting-started/introduction.html)
[![WCAG 2.2 AAA Support](https://img.shields.io/badge/WCAG_2.2-AAA_Support-16a34a?style=flat-square)](https://velinstyle.info/docs/getting-started/accessibility.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-willkommen-2563eb?style=flat-square)](CONTRIBUTING.de.md)

```bash
npm i @birdapi/velinstyle
```

**[Website](https://velinstyle.info)** · **[Atelier](https://velinstyle.info/atelier/index.de.html)** · **[Doku](https://velinstyle.info/docs/getting-started/introduction.html)** · **[Demos](https://velinstyle.info/demos/)** · **[Getting Started](GETTING_STARTED.md)** · **[Architecture](ARCHITECTURE.md)** · **[English](README.md)**

</div>

---

VelinStyle ist ein **produktives CSS- + Web-Components-Framework** mit **WCAG-2.2-AAA-orientierten Defaults**, einer echten **CLI-Ship-Surface**, dem **Transparency Framework** (Kennzeichnung + Nachweis, Beta) und den ersten **Design-Intelligence- / AI-Foundation**-Systemen (Beta). Kein externes UI-Framework im Kern.

**VelinStyle Atelier** ist die kuratierte Oberfläche darüber: **über 2.600 produktionsreife Interfaces**, vier komplette Produktwelten und eine durchsuchbare Bibliothek — fertige Oberflächen statt leerer Komponenten-Fragmente.

**Passung heute:** Marketing-Landings, Docs-Shells, Admin-/SaaS-Starter, Shop- und Community-UIs über Atelier.  
**Noch nicht:** alleiniger Primary-Stack für große Multipage-Shops + Enterprise-Admin ohne Custom-Arbeit.

> **Release:** **1.2.2** (Production Release — Production Builder + Atelier CLI). VelinStyle **zertifiziert keine Anwendung** — siehe [A11y-Matrix](https://velinstyle.info/docs/getting-started/accessibility.html).

---

## Warum VelinStyle

| Bedarf | Was du bekommst |
|--------|-----------------|
| Lesbares HTML | Semantisches BEM (`velin-btn--primary`), keine Utility-Wände |
| Accessibility | AAA-fähige Tokens, Fokus-Management, Reduced Motion — eingebaut |
| Ship ohne Build | CDN-CSS + optionale WCs; Vite/React wenn gewünscht |
| Vorhersehbare Overrides | Cascade Layers + OKLCH Design Tokens |
| Quality Gates | `scan`, `review`, `check` — echte Defekte vor dem Merge |
| KI, die hilft | Skills, Workflows, Agent-Metadata — **Mensch → Framework → KI** |

### Das Tailwind-Sprawl-Problem

Intensive Tailwind-Nutzung wird im HTML oft zum **Klassensalat** — ein einfacher Button braucht dann 10–15 Utilities (`flex items-center … hover:bg-blue-700 … focus:ring-2 …`). VelinStyle nutzt zwar ein `velin-`-Präfix, liefert aber **semantische, fertige Komponenten** (Utilities nur für Feinschliff) statt jedes UI aus atomaren Einzelteilen zusammenzustecken. Ergebnis: kürzeres Markup, AAA-orientierte Defaults und optionale Blueprints / `plan`-Rezepte — kein fertiges Studio-Produkt (Studio bleibt **planned**).

```html
<!-- Tailwind-Sprawl -->
<button class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
  Speichern
</button>

<!-- VelinStyle -->
<button class="velin-btn velin-btn--primary">Speichern</button>
```

Gegenüber **Tailwind**: weniger Class-Sprawl, stärkere Defaults für Kontrast und Semantik. Siehe den [Migrationsleitfaden](https://velinstyle.info/docs/migration-de.html).  
Gegenüber **Bootstrap**: moderne Tokens/Layers, progressive WCs, CLI-Automation statt Legacy-JS-Chrome.

---

## Feature-Highlights

| | Bereich | Kurz |
|---|--------|------|
| 🎨 | **CSS-Framework** | OKLCH-Themes, Utilities, Komponenten, Lite-Preset |
| 🧩 | **Web Components** | 43 kanonische Custom Elements; CSS allein reicht oft |
| ⚡ | **Runtime** | Search, Motion, Highlight, Attributes, Tree-Shaking |
| 🛠 | **CLI** | `create` · `serve` · `doctor` · `check` · `scan` · `review` · `skills` · `transparency` |
| 🔎 | **Transparency** | Kennzeichnung + Nachweis (KI / Trust / Compliance / Metadaten) — Beta-Foundation |
| 🧠 | **Design Intelligence** | Plan → Constraints → Registry → Review (Beta) |
| 🤖 | **AI Skills** | 40 Skills, Packs, Bundles, Templates, Workflows (Beta) |
| 📦 | **Registry** | Skills + Page/Section als maschinenlesbare Verträge |
| 📄 | **AI Metadata** | `velin-agent.json`, `llms.txt`, Page-Level-Agent-JSON |
| 📚 | **Dokumentation** | Dogfooding — 100 % VelinStyle |
| 🔍 | **Review Engine** | Heuristische Design-/A11y-/SEO-Gates (Beta) |
| 🛡 | **Scan Engine** | A11y, Security, CSS-Honesty, PII |
| 🚀 | **Performance** | Lite-CSS, Chunked Runtime, CLS-Platzhalter |
| ♿ | **Accessibility** | Contracts, WCAG-2.2-Tooling, Keyboard + ARIA |
| 🖼 | **Atelier** | Kuratierte Bibliothek kompletter Interfaces, Layouts & Studio-Bausteine |

---

## VelinStyle Atelier

[Atelier](https://velinstyle.info/atelier/index.de.html) ist die Produkt-Showcase-Fläche für VelinStyle: **komplette Interfaces**, keine einzelnen Buttons und Karten. Nach Einsatzzweck browsen (Apps, Marketing, Commerce, Auth…), Live-Welten öffnen, Quellcode kopieren oder ZIPs laden.

| Fläche | Was du bekommst | Link |
|--------|-----------------|------|
| **Atelier Home** | Brand-Hub — Warum Atelier, vier Welten, Bau-Pfade | [Öffnen](https://velinstyle.info/atelier/index.de.html) |
| **Library** | 2.638 Templates — Filter nach Mode, Kategorie, Tags, Qualität | [Durchsuchen](https://velinstyle.info/atelier/library/) |
| **Cascade Console** | Enterprise-/SaaS-Dashboard-Welt | [Live-Demo](https://velinstyle.info/showcase-reihe/01-enterprise-api-ai-dashboard/) |
| **LUMEN** | Kompletter Shop — Katalog, Warenkorb, Checkout | [Live-Demo](https://velinstyle.info/showcase-reihe/02-enterprise-ecommerce-storefront/) |
| **FORGE** | Community- & Forum-System | [Live-Demo](https://velinstyle.info/showcase-reihe/03-modern-community-forum/) |

Library-Shortcuts: [Apps](https://velinstyle.info/atelier/library/?mode=apps) · [Studio-Bausteine](https://velinstyle.info/atelier/library/?mode=studio) · [Recipes](https://velinstyle.info/atelier/library/?mode=recipes) · [Marketing](https://velinstyle.info/atelier/library/?cat=marketing) · [Dashboards](https://velinstyle.info/atelier/library/?cat=dashboards) · [Auth](https://velinstyle.info/atelier/library/?cat=authentication)

Englischer Hub: [atelier/](https://velinstyle.info/atelier/)

---

## Neu in 1.2.2

**Production Release** — **Build only what your project actually uses.** / Nur bauen, was das Projekt wirklich nutzt.

VelinStyle analysiert das Projekt und erzeugt ein optimiertes Produktionspaket statt das komplette Framework auszuliefern. Dazu: erste **Atelier-CLI** (Beta) und neue produktionsreife Komponenten.

### Production Builder

```bash
npx velinstyle build --production --explain
# → ./dist/velin-production/
```

- CSS nur für verwendete Komponenten · Runtime nur für benötigte Web Components
- Themes / Icons / Motion nur bei Nutzung · Größen-Report

### Atelier CLI (Beta)

```bash
npx velinstyle atelier list
npx velinstyle atelier 24
npx velinstyle scaffold --atelier 24
```

Atelier Library ≠ Velin Studio (Studio bleibt **planned**). Siehe [`docs/guides/atelier-cli.md`](docs/guides/atelier-cli.md).

### Neue Komponenten & Verbesserungen

- `<velin-otp-input>`, `<velin-password-strength>`, `<velin-empty-state>`
- Tabellen-Severity · dynamische Overlay-Titel (Modal / Drawer / Sheet)

Siehe [`RELEASE_NOTES_1.2.2.md`](RELEASE_NOTES_1.2.2.md) und [`docs/guides/production-build.md`](docs/guides/production-build.md).

## Neu in 1.2.1

- **Transparency Framework (Beta)** — `@birdapi/velinstyle/transparency`, Bridge `velin-transparency`, Claim-Taxonomie, CLI `transparency doctor|validate|report|export|migrate`
- Baut auf der **1.2.0**-Foundation auf: Ship Surface, Design Intelligence, AI Skills, neue WC-Primitives

Details: [`CHANGELOG.md`](CHANGELOG.md) · 1.2.0-Überblick: [`RELEASE_NOTES_1.2.0.md`](RELEASE_NOTES_1.2.0.md)

---

## Installation

```bash
npm i @birdapi/velinstyle
pnpm add @birdapi/velinstyle
yarn add @birdapi/velinstyle
bun add @birdapi/velinstyle
```

**CDN** (Version pinnen):

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.2.2/dist/velinstyle.min.css">
<script type="module" src="https://unpkg.com/@birdapi/velinstyle@1.2.2/dist/velinstyle-components.min.js"></script>
```

> Pin **`@1.2.2`** (oder `@latest` nach Publish). Nach Clone: `npm install && npm run build`.

---

## Quick Start

```bash
npx @birdapi/velinstyle create landing ./my-site
cd my-site && npx @birdapi/velinstyle serve . && npx @birdapi/velinstyle check .
```

Minimal-HTML und Import-Pfade: [`GETTING_STARTED.md`](GETTING_STARTED.md) · Systeme: [`ARCHITECTURE.md`](ARCHITECTURE.md) · FAQ: [`FAQ.md`](FAQ.md) · Troubleshooting: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)

---

## CLI (Kurz)

| Befehl | Rolle |
|--------|------|
| `create` | Scaffolds (`landing` · `dashboard` · `docs` · `auth`) |
| `check` | doctor + blueprints + scan + review (+ Transparency-Scores) |
| `scan` / `review` | Statische bzw. Design-Intelligence-Gates |
| `transparency` | doctor · validate · report · export · migrate (Beta) |
| `atelier` | Library-Showcase per Nummer/ID pullen (`--format`-Wrapper) |
| `scaffold` / `plan` | Prompt-HTML oder `--atelier`-Compose (Beta) |
| `skills` / `workflow` | AI-Registry & Graphen (Beta) |
| `wc api <tag>` | WC-API aus dem Source |
| `meta` | Agent-Bundle + `llms.txt` |

Atelier-Pull/Compose und **Einschränkungen** (Wrapper ≠ natives Blade/Vue/React; Studio geplant): [`docs/guides/atelier-cli.md`](docs/guides/atelier-cli.md).

---

## Komponenten & Accessibility

**43 kanonische** Custom Elements (**45** Lazy-Loader inkl. Legacy-`*-wc`). Progressive Enhancement: HTML/CSS first, WC nur bei Verhalten.

AAA-orientierte Token-Defaults, Fokus-Management, Reduced Motion, Scanner-Contracts — siehe [A11y-Matrix](https://velinstyle.info/docs/getting-started/accessibility.html).

---

## Reifegrad

| Status | Surfaces |
|--------|----------|
| **Stable** | CSS · Runtime · WC · CLI-Kern · Blueprints |
| **Beta** | Transparency Framework · Review · Prompt · Knowledge Graph · AI Metadata · Constraints · Atelier-Compose (`--atelier`) |
| **Foundation** | AI Skills · Workflow Graphs · Registries · Transparency pillars |
| **Planned** | Velin Studio Builder · Utility Engine Generator · native Blade/Vue/React-Bausteine |

---

## Mitwirken & Lizenz

Siehe [`CONTRIBUTING.de.md`](CONTRIBUTING.de.md). Lizenz: [MIT](LICENSE).

Vollständige englische README: [`README.md`](README.md).

---

## Live-Demos & Module

Fertige Oberflächen erkunden — Atelier-Welten, Template-Bibliothek und klassische Demo-Module.

### Atelier-Produktwelten

| Modul | Fokus | Demo |
|-------|-------|------|
| **Cascade Console** | Enterprise-API- / AI-Dashboard | [Öffnen](https://velinstyle.info/showcase-reihe/01-enterprise-api-ai-dashboard/) |
| **LUMEN** | E-Commerce-Storefront | [Öffnen](https://velinstyle.info/showcase-reihe/02-enterprise-ecommerce-storefront/) |
| **FORGE** | Community-Forum | [Öffnen](https://velinstyle.info/showcase-reihe/03-modern-community-forum/) |
| **Atelier Library** | Vollständige Template-Hub (2.638) | [Öffnen](https://velinstyle.info/atelier/library/) |
| **Atelier Home** | Marketing-Hub (DE) | [Öffnen](https://velinstyle.info/atelier/index.de.html) |
| **Atelier Home** | Marketing-Hub (EN) | [Öffnen](https://velinstyle.info/atelier/) |

### Klassische Demo-Module

| Modul | Fokus | Demo |
|-------|-------|------|
| **Demo-Index** | Alle klassischen Showcases | [Öffnen](https://velinstyle.info/demos/) |
| **Crypto-Dashboard** | Dichtes Admin / Charts | [Öffnen](https://velinstyle.info/demos/showcase-crypto.html) |
| **Dashboard** | App-Shell & KPIs | [Öffnen](https://velinstyle.info/demos/showcase-dashboard.html) |
| **SaaS** | Product Marketing | [Öffnen](https://velinstyle.info/demos/showcase-saas.html) |
| **E-Commerce** | Shop-Patterns | [Öffnen](https://velinstyle.info/demos/showcase-ecommerce.html) |
| **Forum** | Community-UI | [Öffnen](https://velinstyle.info/demos/showcase-forum.html) |
| **UI Kit** | Komponenten-Galerie | [Öffnen](https://velinstyle.info/demos/showcase-ui-kit.html) |
| **Interactive** | WC-Verhalten | [Öffnen](https://velinstyle.info/demos/showcase-interactive.html) |
| **Runtime** | Search / Motion / Boot | [Öffnen](https://velinstyle.info/demos/showcase-runtime.html) |

### Library nach Intent

| Intent | Link |
|--------|------|
| Applications | [library/?mode=apps](https://velinstyle.info/atelier/library/?mode=apps) |
| Studio-Bausteine | [library/?mode=studio](https://velinstyle.info/atelier/library/?mode=studio) |
| Recipes | [library/?mode=recipes](https://velinstyle.info/atelier/library/?mode=recipes) |
| Marketing | [library/?cat=marketing](https://velinstyle.info/atelier/library/?cat=marketing) |
| Dashboards | [library/?cat=dashboards](https://velinstyle.info/atelier/library/?cat=dashboards) |
| Commerce | [library/?cat=commerce](https://velinstyle.info/atelier/library/?cat=commerce) |
| Authentication | [library/?cat=authentication](https://velinstyle.info/atelier/library/?cat=authentication) |
| Community | [library/?cat=community](https://velinstyle.info/atelier/library/?cat=community) |
| Admin | [library/?cat=admin](https://velinstyle.info/atelier/library/?cat=admin) |

<p align="center">
  <a href="https://velinstyle.info/atelier/index.de.html">
    <img src=".github/assets/readme/hero-demo.webp" alt="VelinStyle Atelier und Demo-Oberflächen" width="720">
  </a>
</p>
