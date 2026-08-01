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
[![WCAG 2.2 AAA Support](https://img.shields.io/badge/WCAG_2.2-AAA_Support-16a34a?style=flat-square)](https://velinstyle.info/docs/a11y.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-willkommen-2563eb?style=flat-square)](CONTRIBUTING.de.md)

```bash
npm i @birdapi/velinstyle
```

**[Website](https://velinstyle.info)** · **[Doku](https://velinstyle.info/docs/getting-started/introduction.html)** · **[Demos](https://velinstyle.info/demos/)** · **[Getting Started](GETTING_STARTED.md)** · **[Architecture](ARCHITECTURE.md)** · **[English](README.md)**

</div>

---

VelinStyle ist ein **produktives CSS- + Web-Components-Framework** mit **WCAG-2.2-AAA-orientierten Defaults**, einer echten **CLI-Ship-Surface** und den ersten **Design-Intelligence- / AI-Foundation**-Systemen (Beta). Kein externes UI-Framework im Kern.

**Passung heute:** Marketing-Landings, Docs-Shells, einfache Admin-Starter.  
**Noch nicht:** alleiniger Primary-Stack für große Multipage-Shops + Enterprise-Admin ohne Custom-Arbeit.

> **Release:** **1.2.0** (Core + Design Intelligence Foundation + Trust/Ship). VelinStyle **zertifiziert keine Anwendung** — siehe [A11y-Matrix](https://velinstyle.info/docs/a11y.html).

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

Gegenüber **Tailwind**: weniger Class-Sprawl, stärkere Defaults für Kontrast und Semantik.  
Gegenüber **Bootstrap**: moderne Tokens/Layers, progressive WCs, CLI-Automation statt Legacy-JS-Chrome.

---

## Feature-Highlights

| | Bereich | Kurz |
|---|--------|------|
| 🎨 | **CSS-Framework** | OKLCH-Themes, Utilities, Komponenten, Lite-Preset |
| 🧩 | **Web Components** | 40 kanonische Custom Elements; CSS allein reicht oft |
| ⚡ | **Runtime** | Search, Motion, Highlight, Attributes, Tree-Shaking |
| 🛠 | **CLI** | `create` · `serve` · `doctor` · `check` · `scan` · `review` · `skills` |
| 🧠 | **Design Intelligence** | Plan → Constraints → Registry → Review (Beta) |
| 🤖 | **AI Skills** | 40 Skills, Packs, Bundles, Templates, Workflows (Beta) |
| 📦 | **Registry** | Skills + Page/Section als maschinenlesbare Verträge |
| 📄 | **AI Metadata** | `velin-agent.json`, `llms.txt`, Page-Level-Agent-JSON |
| 📚 | **Dokumentation** | Dogfooding — 100 % VelinStyle |
| 🔍 | **Review Engine** | Heuristische Design-/A11y-/SEO-Gates (Beta) |
| 🛡 | **Scan Engine** | A11y, Security, CSS-Honesty, PII |
| 🚀 | **Performance** | Lite-CSS, Chunked Runtime, CLS-Platzhalter |
| ♿ | **Accessibility** | Contracts, WCAG-2.2-Tooling, Keyboard + ARIA |

---

## Neu in 1.2

Kein reines CSS-Bump — ein **Foundation-Release**.

- **Ship Surface** — `create`, `serve`, `doctor`, `check` (`--json` / `--sarif`)
- **Design Intelligence (Beta)** — Prompt Engine, Review Engine, Knowledge-Graph-Seed, Constraints
- **AI Foundation (Beta)** — Skill Engine, Workflows, reicheres Agent-Metadata
- **Neue Primitives** — Calendar, File-Dropzone, editierbare Data-Table
- **Trust Gates** — strengere Scan/Review-Regeln

Details: [`RELEASE_NOTES_1.2.0.md`](RELEASE_NOTES_1.2.0.md) · Historie: [`CHANGELOG.md`](CHANGELOG.md)

---

## Installation

```bash
npm i @birdapi/velinstyle
pnpm add @birdapi/velinstyle
yarn add @birdapi/velinstyle
bun add @birdapi/velinstyle
```

**CDN** (Version pinnen) — siehe [`README.md`](README.md#installation).  
Nach Clone: `npm install && npm run build`.

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
| `check` | doctor + blueprints + scan + review |
| `scan` / `review` | Statische bzw. Design-Intelligence-Gates |
| `skills` / `workflow` | AI-Registry & Graphen (Beta) |
| `wc api <tag>` | WC-API aus dem Source |
| `meta` | Agent-Bundle + `llms.txt` |

---

## Komponenten & Accessibility

**40 kanonische** Custom Elements (**42** Lazy-Loader inkl. Legacy-`*-wc`). Progressive Enhancement: HTML/CSS first, WC nur bei Verhalten.

AAA-orientierte Token-Defaults, Fokus-Management, Reduced Motion, Scanner-Contracts — siehe [A11y-Matrix](https://velinstyle.info/docs/a11y.html).

---

## Reifegrad

| Status | Surfaces |
|--------|----------|
| **Stable** | CSS · Runtime · WC · CLI-Kern · Blueprints |
| **Beta** | Review · Prompt · Knowledge Graph · AI Metadata · Constraints |
| **Foundation** | AI Skills · Workflow Graphs · Registries |
| **Planned** | Studio · Utility Engine Generator |

---

## Mitwirken & Lizenz

Siehe [`CONTRIBUTING.de.md`](CONTRIBUTING.de.md). Lizenz: [MIT](LICENSE).

Vollständige englische README: [`README.md`](README.md).
