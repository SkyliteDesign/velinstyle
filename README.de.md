<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-banner-dark.svg">
  <img src=".github/assets/readme-banner.svg" alt="VelinStyle — CSS-System für Entwickler" width="100%">
</picture>

# VelinStyle

**Das CSS-System für Entwickler.**

Saubere Interfaces.  
Ohne Utility-Chaos.

<br>

[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-2563eb?style=flat-square)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v0.8.0-2563eb?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.8.0)
[![npm version](https://img.shields.io/npm/v/@birdapi/velinstyle?style=flat-square)](https://www.npmjs.com/package/@birdapi/velinstyle)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-16a34a?style=flat-square)](https://velinstyle.info/docs/)
[![GitHub Stars](https://img.shields.io/github/stars/SkyliteDesign/velinstyle?style=flat-square)](https://github.com/SkyliteDesign/velinstyle/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-willkommen-2563eb?style=flat-square)](CONTRIBUTING.de.md)

<br>

```bash
npm install @birdapi/velinstyle
```

<br>

**[Live-Demos](https://velinstyle.info/demos/)** · **[Doku](https://velinstyle.info/docs/)** · **[Stern auf GitHub](https://github.com/SkyliteDesign/velinstyle)** · **[npm](https://www.npmjs.com/package/@birdapi/velinstyle)**

**[English](README.md)** · **Deutsch**

</div>

---

## Das Problem

Moderne UI-Stacks tauschen Lesbarkeit gegen Geschwindigkeit.

| | Schmerz |
| --- | --- |
| **Tailwind** | Utility-Spam. Unlesbares Markup. Endlose `dark:`-Präfixe. |
| **Bootstrap** | Schwer zu überschreiben. Legacy-Gewicht. Alles sieht gleich aus. |
| **Shoelace** | Web-Component-Overhead. Shadow-DOM-Styling-Kämpfe. |

Du lieferst schnell. Dann kämpfst du mit deinem HTML.

---

## Die Lösung

**VelinStyle** ist ein schlankes CSS- + Web-Component-System für Entwickler, die **Struktur statt Spreu** wollen.

- **Semantische Komponenten** — `velin-btn`, `velin-card`, `velin-table`. Namen, die du per Suche findest.
- **Vorhersagbare BEM-ähnliche Klassen** — keine generierte Utility-Suppe.
- **CSS-Cascade-Layer** — Tokens → Base → Components → Utilities. Overrides bleiben beherrschbar.
- **Optionale Web Components** — 32 interaktive Widgets bei Bedarf, plain CSS wenn nicht.
- **OKLCH-Design-Tokens + 13 Themes** — `data-velin-theme` tauschen, `dark:`-Hölle vermeiden.
- **Ohne Build-Pflicht liefern** — CSS + ESM per npm oder CDN. CLI bei Bedarf.
- **WCAG 2.2 AA by design** — Fokus, ARIA, Tastatur-Muster eingebaut.

---

## Schnellbeispiel

Lesbares HTML. Echte Komponenten. Keine `<div>`-Tags mit 40 Klassen.

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle.min.css">

<div class="velin-container velin-p-6">
  <div class="velin-grid velin-grid--cols-3 velin-gap-4">
    <article class="velin-card">
      <div class="velin-card__body">
        <h2 class="velin-card__title">Umsatz</h2>
        <p class="velin-card__text velin-text-3xl velin-font-bold">24,8k €</p>
        <button type="button" class="velin-btn velin-btn--primary velin-btn--sm">Details</button>
      </div>
    </article>
    <article class="velin-card">
      <div class="velin-card__body">
        <h2 class="velin-card__title">Nutzer</h2>
        <p class="velin-card__text velin-text-3xl velin-font-bold">1.284</p>
        <button type="button" class="velin-btn velin-btn--outline velin-btn--sm">Details</button>
      </div>
    </article>
    <article class="velin-card">
      <div class="velin-card__body">
        <h2 class="velin-card__title">Conversion</h2>
        <p class="velin-card__text velin-text-3xl velin-font-bold">3,2 %</p>
        <button type="button" class="velin-btn velin-btn--ghost velin-btn--sm">Details</button>
      </div>
    </article>
  </div>
</div>
```

So sieht Tailwind **nicht** aus.

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

Version pinnen. Heute ausliefern.

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle.min.css">
<script type="module" src="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle-components.min.js"></script>
```

### Download / Klonen

`dist/` liegt nicht im Git. Nach dem Klonen:

```bash
git clone https://github.com/SkyliteDesign/velinstyle.git
cd velinstyle
npm install && npm run build
```

**Ohne Build:** [showcase-demos](showcase-demos/) forken und HTML-Dateien öffnen — nur unpkg CDN.

---

## Schnellstart

Minimale Seite. Ein Button. Fertig.

```html
<!DOCTYPE html>
<html lang="de" data-velin-theme="ocean">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meine App</title>
  <link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle.min.css">
  <script type="module" src="https://unpkg.com/@birdapi/velinstyle@0.8.0/dist/velinstyle-components.min.js"></script>
</head>
<body>
  <div class="velin-container velin-p-6">
    <button type="button" class="velin-btn velin-btn--primary">Loslegen</button>
  </div>
</body>
</html>
```

**Weiter:** [Einstieg in der Doku](https://velinstyle.info/docs/) · [Vite-Starter](templates/vite-velinstyle) · [React-Starter](templates/vite-react-velinstyle)

---

## Philosophie

Vier Regeln. Keine Ausnahmen.

1. **Sauberes HTML** — Struktur zuerst, Dekoration zweitens.
2. **Vorhersagbare Klassen** — `velin-*`-Benennung, die du und deine IDE verstehen.
3. **Lesbarer UI-Code** — Diffs bleiben klein. Reviews bleiben schnell.
4. **KI-freundliche Struktur** — konsistente Muster für Code-Generation; CLI `scaffold` und `blueprint` zum Bootstrappen.

---

## Features

| | |
| --- | --- |
| **Grid & Layout** | `velin-grid`, Container Queries, responsive Utilities |
| **Komponenten** | 35+ CSS-Komponenten + 32 Web Components |
| **Themes** | 13 OKLCH-Presets per `data-velin-theme` |
| **Footprint** | ~150 KB CSS + ~111 KB JS (min, Full Bundle) |
| **Barrierefreiheit** | WCAG 2.2 AA, RTL, `prefers-reduced-motion` |
| **Motion (0.8.0)** | Sparkline, Counter, Live-Dot, FLIP-Helper, Reveal |
| **CLI** | `init`, `build`, `scan`, `scaffold`, `layout`, `blueprint`, `icons`, `prefix` |

**Fortgeschritten:** [CLI & Architektur im CHANGELOG](CHANGELOG.md#080---2026-05-16) · [Vollständige Doku](https://velinstyle.info/docs/)

---

## Vergleich

| | Bootstrap | Tailwind | Shoelace | **VelinStyle** |
| --- | :---: | :---: | :---: | :---: |
| HTML-Lesbarkeit | Mittel | Niedrig | Mittel | **Hoch** |
| Klassen-Vorhersagbarkeit | Mittel | Niedrig | Mittel | **`velin-btn--primary`** |
| Utility-Spreu | Niedrig | **Hoch** | Niedrig | **Kontrolliert** |
| Override-Story | Schwer | Config-Datei | Shadow DOM | **CSS-Layer + Tokens** |
| Barrierefreiheit | Teilweise | DIY | Gute WC | **WCAG 2.2 AA** |
| Dark Mode | Manuell | `dark:` überall | Theme-Attr | **Token-Swap** |
| App-Chrome | Legacy JS | Eigenes JS | Nur WC | **CSS + optionale WCs** |
| Liefergeschwindigkeit | Schnell | Schnell (mit Build) | Schnell | **CDN, kein Build nötig** |
| Full-Page-Demos | Basis | Keine offiziellen | Storybook | **[Live-Showcases](https://velinstyle.info/demos/)** |

---

## Live-Demos

Vollständige Anwendungsseiten — keine Spielzeug-Snippets.

<p align="center">
  <a href="https://velinstyle.info/demos/showcase-crypto.html">
    <img src=".github/assets/readme/hero-demo.webp" alt="VelinStyle Crypto-Dashboard-Demo" width="100%">
  </a>
</p>

<table>
<tr>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-crypto.html"><img src=".github/assets/readme/demo-crypto.webp" alt="Crypto-Dashboard" width="100%"></a>

**[Crypto →](https://velinstyle.info/demos/showcase-crypto.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-ecommerce.html"><img src=".github/assets/readme/demo-ecommerce.webp" alt="E-Commerce-Demo" width="100%"></a>

**[E-Commerce →](https://velinstyle.info/demos/showcase-ecommerce.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-dashboard.html"><img src=".github/assets/readme/demo-dashboard.webp" alt="Dashboard-Demo" width="100%"></a>

**[Dashboard →](https://velinstyle.info/demos/showcase-dashboard.html)**

</td>
</tr>
<tr>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-saas.html"><img src=".github/assets/readme/demo-saas.webp" alt="SaaS-Marketing" width="100%"></a>

**[SaaS →](https://velinstyle.info/demos/showcase-saas.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-interactive.html"><img src=".github/assets/readme/demo-interactive.webp" alt="Interaktive Komponenten" width="100%"></a>

**[Interactive →](https://velinstyle.info/demos/showcase-interactive.html)**

</td>
<td width="33%" valign="top">

<a href="https://velinstyle.info/demos/showcase-forum.html"><img src=".github/assets/readme/demo-forum.webp" alt="Forum-Community" width="100%"></a>

**[Forum →](https://velinstyle.info/demos/showcase-forum.html)**

</td>
</tr>
</table>

<p align="center">
  <a href="https://velinstyle.info/demos/"><strong>Alle Demos →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/SkyliteDesign/velinstyle/tree/main/showcase-demos"><strong>showcase-demos forken →</strong></a>
</p>

---

## Mitwirken

PRs willkommen. Jede Größe.

1. Repository forken
2. `npm install && npm run build` (`dist/` ist gitignored)
3. Änderung umsetzen · `npm test` und `npm run test:a11y` ausführen
4. Pull Request öffnen

Siehe [CONTRIBUTING.de.md](CONTRIBUTING.de.md) für Code-Stil, Branch-Regeln und Review-Prozess.

---

## Roadmap

Richtung, kein festes Versprechen. Siehe [CHANGELOG](CHANGELOG.md) für Geliefertes.

| Phase | Fokus |
| --- | --- |
| **Jetzt (0.8.0)** | Motion-Tokens, Sparkline / Counter / Live-Dot, FLIP-Helper, Filter-Utilities, `scaffold` + `layout` CLI |
| **Als Nächstes** | Kleinere optionale Bundles, mehr Blueprint-Packs, erweiterte Scaffold-Intents |
| **In Erkundung** | Framework-Adapter, Design-Token-Export, weitere Theme-Presets |

---

## Community

| | |
| --- | --- |
| **Issues & Bugs** | [github.com/SkyliteDesign/velinstyle/issues](https://github.com/SkyliteDesign/velinstyle/issues) |
| **Releases** | [github.com/SkyliteDesign/velinstyle/releases](https://github.com/SkyliteDesign/velinstyle/releases) |
| **Produkt-Site** | [velinstyle.info](https://velinstyle.info) |
| **Dokumentation** | [velinstyle.info/docs/](https://velinstyle.info/docs/) |

**VelinStyle sichtbar machen:** [Stern dalassen](https://github.com/SkyliteDesign/velinstyle) · [Live-Demo testen](https://velinstyle.info/demos/) · [showcase-demos forken](https://github.com/SkyliteDesign/velinstyle/tree/main/showcase-demos)

---

## Lizenz

[MIT](LICENSE) — Copyright © 2026 VelinStyle

<div align="center">

Mit Sorgfalt fürs Web von [SkyliteDesign](https://github.com/SkyliteDesign)

</div>
