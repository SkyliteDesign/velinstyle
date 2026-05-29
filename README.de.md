<div align="center">

```
██╗   ██╗███████╗██╗     ██╗███╗   ██╗███████╗████████╗██╗  ██╗██╗     ███████╗
██║   ██║██╔════╝██║     ██║████╗  ██║██╔════╝╚══██╔══╝██║  ██║██║     ██╔════╝
██║   ██║█████╗  ██║     ██║██╔██╗ ██║███████╗   ██║   ███████║██║     █████╗
╚██╗ ██╔╝██╔══╝  ██║     ██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║     ██╔══╝
 ╚████╔╝ ███████╗███████╗██║██║ ╚████║███████║   ██║   ██║  ██║███████╗███████╗
  ╚═══╝  ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝
```

[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-2563eb?style=flat-square)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v1.0.0-2563eb?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/releases/tag/v1.0.0)
[![npm version](https://img.shields.io/npm/v/@birdapi/velinstyle?style=flat-square)](https://www.npmjs.com/package/@birdapi/velinstyle)
[![WCAG 2.2 AAA](https://img.shields.io/badge/WCAG_2.2-AAA-16a34a?style=flat-square)](https://velinstyle.info/docs/a11y.html)
[![GitHub Stars](https://img.shields.io/github/stars/SkyliteDesign/velinstyle?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-willkommen-2563eb?style=flat-square)](CONTRIBUTING.de.md)

```bash
npm i @birdapi/velinstyle
```

**[Website](https://velinstyle.info)** · **[Doku](https://velinstyle.info/docs/)** · **[Demos](https://velinstyle.info/demos/)** · **[npm](https://www.npmjs.com/package/@birdapi/velinstyle)** · **[Stern auf GitHub](https://github.com/SkyliteDesign/velinstyle)**

**[English](README.md)** · **Deutsch**

</div>

---

**VelinStyle** ist das **WCAG-2.2-AAA-CSS-Framework** mit nativer JavaScript-Runtime und Web Components — CSS-Utilities, 1.0.0-Module (Search, Motion, Highlight, Attributes, Meta) und Security-Toolchain, **ohne externe UI-Framework-Abhängigkeiten** im Kern.

Gedacht für Teams mit **lesbarem HTML**, **AAA-Token-Defaults** (AA über `data-velin-contrast="aa"`) und **CLI-Automatisierung** statt Utility-Chaos.

> **Dogfooding:** Die gesamte VelinStyle-Website und Dokumentation läuft zu 100 % mit VelinStyle — ohne externe Skripte oder UI-Frameworks.

---

## Features auf einen Blick

- **CSS-Utilities** — `velin-*` Spacing, Farbe, Flex, Motion, Safe-Area; Cascade Layers + OKLCH-Tokens
- **35+ Komponenten** — semantische BEM-Klassen (`velin-btn`, `velin-card`, `velin-grid`, …)
- **Motion-Runtime** — Reveal, Stagger, scroll-getriebene Animation, rAF-Scheduler
- **VelinSearch** — fuzzy Offline-Suche mit Highlighting und Kategorien
- **Syntax-Highlighting** — lazy In-View für JS, HTML, CSS, JSON und mehr
- **HTML-Attribute** — 27 deklarative Bridges (`velin-modal`, `velin-reveal`, `velin-scroll-top`, `velin-code`, …)
- **Qualität** — 36/36 A11y-Component-Contracts, Playwright Cross-Browser-Smoke (`npm run test:e2e`), CLS-Platzhalter (`wc-placeholder.css`)
- **Security-Tools** — `scan`, PII-Regeln, Sanitize-API, gehärtete Komponenten
- **CLI** — init, build, scan, scaffold, tokens, docs generate, perf audit, layout audit
- **Velin-Meta** — `velin-agent.json`, `llms.txt` und Page-Level-Agent-JSON für KI-Assistenten

---

## Installation

```bash
npm i @birdapi/velinstyle
```

| Pfad | Verwendung |
| --- | --- |
| `@birdapi/velinstyle/css` | Vollständiges minifiziertes Stylesheet |
| `@birdapi/velinstyle/bundle` | Web-Components-ESM-Bundle |
| `@birdapi/velinstyle/search` | VelinSearch-Modul |
| `@birdapi/velinstyle/motion` | Motion-Runtime |
| `@birdapi/velinstyle/attributes` | HTML-Attribut-Bridges |
| `@birdapi/velinstyle/highlight` | Syntax-Highlighting |
| `@birdapi/velinstyle/meta` | Agent-Metadaten-API |

**CDN (Version pinnen):**

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.0.0/dist/velinstyle.min.css">
<script type="module" src="https://unpkg.com/@birdapi/velinstyle@1.0.0/dist/velinstyle-components.min.js"></script>
```

Nach dem Klonen: `npm install && npm run build` — `dist/` wird erzeugt, nicht committet.

---

## Quickstart

```html
<!DOCTYPE html>
<html lang="de" data-velin-theme="ocean">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.0.0/dist/velinstyle.min.css">
  <script type="module" src="https://unpkg.com/@birdapi/velinstyle@1.0.0/dist/velinstyle-components.min.js"></script>
</head>
<body class="velin-p-6">
  <button type="button" class="velin-btn velin-btn--primary" velin-reveal="slide-up">Loslegen</button>
  <velin-code-block language="html" line-numbers>&lt;p class="velin-text-muted"&gt;Hallo VelinStyle&lt;/p&gt;</velin-code-block>
</body>
</html>
```

---

## Core-Module (1.0.0)

| Export | Beschreibung |
| --- | --- |
| `@birdapi/velinstyle/search` | Fuzzy Offline-Suche, Provider, optional Web Worker |
| `@birdapi/velinstyle/motion` | `initMotion`, Stagger, Smooth Scroll, einheitlich `.velin-in-view` |
| `@birdapi/velinstyle/attributes` | Registry deklarativer `velin-*` HTML-Attribut-Bridges |
| `@birdapi/velinstyle/highlight` | `velinSyntax`, lazy Language Packs, OKLCH-Token-Farben |
| `@birdapi/velinstyle/meta` | `buildAgentBundle`, Page-Meta MIME `application/vnd.velinstyle.meta+json` |

---

## Web Components

**36 kanonische** Custom Elements (38 Lazy-Loader-Einträge inkl. Legacy `velin-tooltip-wc` und `velin-stepper-wc`) — reines CSS, wenn kein Verhalten nötig ist. `src/base/wc-placeholder.css` verringert Layout-Shift vor dem Upgrade.

Beispiele: `velin-modal`, `velin-search`, `velin-code-block`, `velin-drawer`, `velin-stepper`, `velin-tooltip`, `velin-toast`, `velin-persist`.

- [Komponenten-Dokumentation](https://velinstyle.info/docs/components/buttons.html)
- [Generierte Web-Component-API](https://velinstyle.info/docs/generated/components/README.md)

---

## CLI

| Befehl | Zweck |
| --- | --- |
| `npx velinstyle init` | `velinstyle.config.js` im Projekt anlegen |
| `npx velinstyle scan` | Security, Accessibility, CSS und PII prüfen |
| `npx velinstyle search index` | `dist/search-index.json` für Offline-Docs-Suche |
| `npx velinstyle tokens build` | Design-Tokens-JSON nach CSS kompilieren |
| `npx velinstyle meta` | `velin-agent.json` und `llms.txt` erzeugen |

Außerdem: `npx velinstyle docs generate` — Markdown-Referenz unter `docs/generated/`.

---

## Security

VelinStyle bringt **Security-Tooling mit**, nicht als Nachgedanke:

- **`velinstyle scan`** — Markup- und A11y-Regeln; PII-Scanner (`--only pii`, `--fix`)
- **`@birdapi/velinstyle/sanitize`** — URL- und Text-Sanitization
- **`<velin-secure-field>`** — keine Klartext-Secrets im DOM; gehärtete Search-/Copy-URLs

[Security-Dokumentation](https://velinstyle.info/docs/extend/security.html)

---

## Velin-Meta

Maschinenlesbarer Kontext für **Cursor, Copilot und eigene Agenten**:

- **Globaler Bundle** — `dist/velin-agent.json` + `dist/llms.txt` via `velinstyle meta`
- **Page-Level-Meta** — `<script type="application/vnd.velinstyle.meta+json" id="velin-meta">`
- **CLI** — `velinstyle meta page my.html --write`

[Velin-Meta-Guide](https://velinstyle.info/docs/guides/velin-meta.html)

---

## Doku & Website

- [velinstyle.info](https://velinstyle.info) — Produktseite und Demos
- [Guides](https://velinstyle.info/docs/guides/index.html) · [Feature scope](https://velinstyle.info/docs/guides/feature-scope.html)
- [API-Referenz](https://velinstyle.info/docs/guides/api-reference.html) — aus dem Quellcode generiert
- [Generiertes Markdown](https://velinstyle.info/docs/generated/index.html) — Komponenten, Tokens, Utilities, CLI, Regeln

---

## Changelog

Alle Releases, Breaking Changes und Migrationsschritte: [CHANGELOG.md](CHANGELOG.md).

---

## Vergleich

| | Bootstrap | Tailwind | Shoelace | **VelinStyle** |
| --- | :---: | :---: | :---: | :---: |
| HTML-Lesbarkeit | Mittel | Niedrig | Mittel | **Hoch** |
| Klassen-Vorhersagbarkeit | Mittel | Niedrig | Mittel | **`velin-btn--primary`** |
| Utility-Wucher | Niedrig | **Hoch** | Niedrig | **Kontrolliert** |
| Override-Story | Schwer | Config-Datei | Shadow DOM | **CSS-Layer + Tokens** |
| Barrierefreiheit | Teilweise | DIY | Gute WC | **WCAG 2.2 AAA-Tokens** |
| Dark Mode | Manuell | `dark:` überall | Theme-Attribut | **Token-Tausch** |
| App-Chrome | Legacy-JS | BYO | nur WC | **CSS + optionale WCs** |
| Liefergeschwindigkeit | Schnell | Schnell (mit Build) | Schnell | **CDN, kein Build nötig** |
| Runtime-Module | — | — | — | **Search, Motion, Meta, …** |

---

## Live-Demos

Vollständige Anwendungsseiten auf [velinstyle.info/demos/](https://velinstyle.info/demos/) — [Crypto](https://velinstyle.info/demos/showcase-crypto.html) · [E-Commerce](https://velinstyle.info/demos/showcase-ecommerce.html) · [Dashboard](https://velinstyle.info/demos/showcase-dashboard.html) · [Alle Demos](https://velinstyle.info/demos/) · [showcase-demos forken](https://github.com/SkyliteDesign/velinstyle/tree/main/showcase-demos)

<p align="center">
  <a href="https://velinstyle.info/demos/showcase-crypto.html">
    <img src=".github/assets/readme/hero-demo.webp" alt="VelinStyle Crypto-Dashboard-Demo" width="720">
  </a>
</p>

---

## Mitwirken

PRs sind willkommen.

1. Repository forken
2. `npm install && npm run build`
3. Änderung umsetzen · `npm test`, `npm run test:a11y` und `npm run test:e2e` ausführen (nach `npm run build`)
4. Pull Request öffnen

Details: [CONTRIBUTING.de.md](CONTRIBUTING.de.md)

---

## Lizenz

[MIT](LICENSE) — Copyright © 2026 VelinStyle

<div align="center">

Mit Sorgfalt fürs Web von [SkyliteDesign](https://github.com/SkyliteDesign)

</div>
