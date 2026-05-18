# Mitwirken bei VelinStyle

Vielen Dank fuer dein Interesse am Mitwirken! VelinStyle wird von der Community gebaut, und wir freuen uns ueber Beitraege jeder Groesse.

**[English Version](CONTRIBUTING.md)**

## Erste Schritte

1. Forke das Repository
2. Klone deinen Fork:
   ```bash
   git clone https://github.com/DEIN_BENUTZERNAME/velinstyle.git
   cd velinstyle
   ```
3. Installiere Abhaengigkeiten:
   ```bash
   npm install
   ```
4. Starte den Dev-Server:
   ```bash
   npm run dev
   ```
5. Baue das Projekt:
   ```bash
   npm run build
   ```

### Warum `npm run build` wichtig ist

Der Ordner `dist/` steht in `.gitignore` und ist **nicht** im Repository. Nach `git clone` musst du `npm run build` (oder einzelne `npm run build:*`-Skripte) ausfuehren, bevor du `docs/*.html`, `samples/*.html` oeffnest oder Tests nutzt, die gebaute Artefakte erwarten. Veroeffentlichte npm-Pakete enthalten `dist/` aus dem Release-Tarball.

## Projektstruktur

```
velinstyle/
├── src/                  # Quell-CSS (Tokens, Base, A11y, Layout, Components, Utilities)
├── components/           # Web Components (JS-Quellcode)
├── cli/                  # VelinStyle-CLI (init, build, icons, scan, prefix, …)
├── icons/                # SVG-Icon-Quelldateien + Sprite-Builder
├── dist/                 # Build-Ausgabe (generiert; nicht direkt bearbeiten)
├── docs/                 # Dokumentationsseiten (Kurzreferenz im Repo)
├── samples/              # Beispielseiten
├── scripts/              # Build-Skripte
└── tests/                # Testdateien (`tests/setup.js` — Vitest/jsdom-Helfer)
```

Die Marketing-Site und erweiterte Doku unter [velinstyle.info](https://velinstyle.info) liegen in einem **eigenen Repository** (`velinstyle-site`). Issues und PRs dafuer gehoeren dorthin, nicht hierher.

Forkbare Full-Page-Demos: **[velinstyle-demos](https://github.com/SkyliteDesign/velinstyle-demos)**. Nach Aenderungen unter `velinstyle-site/demos/`: `npm run demos:sync` ausfuehren und das Demos-Repo pushen. README-Screenshots: `npm run readme:capture` und optional `npm run readme:assets:webp`.

## Entwicklungs-Workflow

### CSS-Aenderungen

Alles CSS lebt in `src/` und ist nach `@layer` organisiert:

```
@layer tokens, reset, base, a11y, layout, components, utilities, themes;
```

Bearbeite die Quelldateien in `src/`, dann fuehre `npm run build:css:dev` aus.

### Web Components

Web Components leben in `components/`. Jede Komponente ist eine einzelne Datei mit einem Custom Element.

Fuehre nach Aenderungen `npm run build:js:dev` aus. Vor einem Release oder zum Testen der `docs/` offline **`npm run build`** ausfuehren, damit `dist/velinstyle-components.iife.js` existiert (wird von einigen HTML-Demos ohne `type="module"` genutzt). CI auf `main` spiegelt die Build-Schritte in [.github/workflows/ci.yml](.github/workflows/ci.yml), inklusive IIFE-Bundle.

### Icons

Fuege neue SVG-Icons zu `icons/svg/` hinzu. Stelle sicher:
- `viewBox="0 0 24 24"`
- `fill="none"` und `stroke="currentColor"`
- Einheitlich `stroke-width="2"` und `stroke-linecap="round"`

Fuehre `npm run build:icons` aus, um den Sprite neu zu generieren.

## Richtlinien

### Code-Stil

- **CSS**: Halte dich an die `velin-`-Praefix-Konvention fuer alle Klassen, Variablen und Keyframes
- **JavaScript**: Verwende Vanilla JS, keine externen Abhaengigkeiten in Komponenten
- **HTML**: Verwende semantische Elemente, stelle korrekte ARIA-Attribute sicher

### Barrierefreiheits-Anforderungen

Das ist nicht verhandelbar. Jeder Beitrag muss:

- WCAG AA Farbkontrast einhalten (mindestens 4.5:1)
- Tastaturnavigation unterstuetzen
- Korrekte `:focus-visible`-Styles enthalten
- Mit `prefers-reduced-motion: reduce` funktionieren
- Passende ARIA-Attribute enthalten
- `forced-colors` (Windows Hochkontrast-Modus) unterstuetzen

### Commit-Nachrichten

Verwende klare, beschreibende Commit-Nachrichten:

```
feat: velin-dialog Komponente hinzufuegen
fix: Focus-Trap in velin-modal korrigieren
docs: Tastaturnavigations-Anleitung hinzufuegen
style: velin-btn Padding-Tokens anpassen
```

## Aenderungen einreichen

1. Basis ist der Branch **`main`** (GitHub Actions laeuft auf `main`).
2. Erstelle einen Feature-Branch: `git checkout -b feat/mein-feature`
3. Mache deine Aenderungen
4. Vor dem PR **alle** Checks ausfuehren:
   - `npm run lint`
   - `npm test`
   - `npm run test:a11y`
   - `npm run build`
5. Committe und pushe
6. Oeffne einen Pull Request

## Mobile-Smoke-Test (manuell)

Wenn deine Aenderung Layout, Navigation oder Doku-Seiten betrifft, kurz auf **schmalem Viewport** pruefen (DevTools Geraetemodus oder echtes Handy):

- [ ] Kein ungewollter horizontaler Seiten-Scroll bei `docs/*.html` oder `samples/*.html` (ausser Demo absichtlich breit).
- [ ] **`.velin-nav`**-Hamburger oeffnet/schliesst das Menue; Links gut antippbar (ca. 44×44px).
- [ ] Bei Seiten mit **`.velin-doc-layout`** ist die Sidebar **„On this page“** auf kleinen Screens sichtbar oder scrollbar (nicht spurlos ausgeblendet).
- [ ] Eine **Web-Component**-Interaktion (z. B. Modal oder Theme-Toggle) funktioniert mit Touch.

## Bugs melden

Verwende das [Bug-Report-Template](https://github.com/SkyliteDesign/velinstyle/issues/new?template=bug_report.md) und gib an:

- Browser und Version
- Schritte zur Reproduktion
- Erwartetes vs. tatsaechliches Verhalten
- Screenshots falls moeglich

## Features anfragen

Verwende das [Feature-Request-Template](https://github.com/SkyliteDesign/velinstyle/issues/new?template=feature_request.md).

## Lizenz

Durch dein Mitwirken stimmst du zu, dass deine Beitraege unter der MIT-Lizenz lizenziert werden.
