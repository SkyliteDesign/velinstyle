# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **`velinstyle prefix` JSON maps:** optional `velinstyle-prefix-map.json` next to the migrated tree (or `--map <file>`) supplies explicit `token` → `velin-class` replacements; merged after auto map, overrides catalog and `--bootstrap-display`. Keys `_*` / `$*` ignored. Sample: `examples/velinstyle-prefix-map.sample.json`. Documented in README, README.de, `docs/migration.html`, `docs/guides/existing-project.html`.

## [0.6.1](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.6.1) - 2026-05-11

### Fixed
- **Vitest / jsdom**: `tests/setup.js` mocks `window.matchMedia` for `velin-theme-toggle` tests; `velin-popover` test now sets `trigger="hover"` so `role="tooltip"` is asserted correctly.
- **Drawer CSS**: Fixed `side="end"` drawer showing content and not closing due to `inset-inline-start: 0` leaking to all sides. Each side now explicitly resets opposing inset values.
- **FOUC Protection**: Added `:not(:defined)` rule in `reset.css` hiding VelinStyle custom elements until they are registered, preventing flash of unstyled content.
- **CLI `require()` bug**: Replaced CJS `require('fs').unlinkSync` with ESM `unlinkSync` import in `cli/index.js`.
- **CLI version**: Updated help text to v0.6.1.
- **CLI a11y layer**: `security.css` now included in the `a11y` layer file list.

### Added
- **CLI blueprints**: 11 additional static HTML snippets (`navbar-header`, `footer-simple`, `hero-section`, `card-grid`, `form-contact`, `breadcrumb-bar`, `sidebar-layout`, `table-responsive`, `alert-stack`, `search-field`, `pagination-bar`) — run `velinstyle blueprint list`.
- **Multi-Provider Icon System**: `<velin-icon>` now supports a `provider` attribute for CDN-based icons from Lucide, Heroicons, Bootstrap Icons, Material Symbols, Font Awesome, and Tabler Icons.
- **`VelinIcon.registerProvider()`**: Static method to register custom icon providers at runtime.
- **`cli/icon-providers.js`**: Provider registry with CDN URL mappings, variant support, license info, and homepage links for 6 providers.
- **`velinstyle icons` CLI commands**: `list` (show providers), `add` (download SVGs), `remove` (delete provider icons), `build` (rebuild sprite).
- **`cli/scanner.js`**: Security, Accessibility, and CSS lint scanner engine with 20+ rules.
- **`velinstyle scan` CLI command**: On-demand project scanning with colored terminal output, JSON format for CI/CD, `--fix` for auto-fixable issues, `--severity` filtering.
- **Build-integrated scanning**: `scan.enabled: true` in `velinstyle.config.js` runs scanner after each build.

## [0.6.0] - 2026-05-11

### Security
- **XSS Protection**: New `components/sanitize.js` with `escapeHTML()` and `sanitizeURL()` functions
- **9 Web Components hardened**: All dynamic content rendering now uses `escapeHTML()` (velin-toast, velin-dialog, velin-lightbox, velin-countdown, velin-stepper-wc, velin-tooltip-wc, velin-popover, velin-drawer, velin-modal)
- **Event listener leak fix**: `velin-lightbox.js` no longer accumulates keydown listeners on repeated `open()` calls
- **CSS Security Utilities**: New `src/a11y/security.css` with `.velin-user-content` (content sandboxing), `.velin-secure-frame` (clickjacking protection), autofill protection, external link indicators
- **velin-persist.js hardened**: Storage key validation (regex), 64KB size limit, `QuotaExceededError` handling, `storage="session"` option for sessionStorage
- **Trusted Types support**: Optional `getTrustedPolicy()` for CSP-enforced environments
- **URL validation**: `sanitizeURL()` blocks JavaScript protocol URLs in lightbox

### Added
- **`docs/security.html`**: Dedicated security documentation page with CSP guide, XSS protection details, best practices
- **`docs/css-components.html`**: New page with live demos for breadcrumb, chip, divider, input-group, list-group, pagination, spinner, stat, stepper (CSS), timeline, tooltip (CSS), drawer (CSS)
- **`docs/components.html` rewritten**: All 22 Web Components now documented with live interactive demos, attribute/method/event/slot API tables
- **`docs/utilities.html` expanded**: 10 new utility sections (anchor positioning, color-mix, container-style, divide, responsive, @scope, scroll, scroll-animation, state, view-transitions)
- **`docs/tokens.html` expanded**: Aspect Ratio, Z-Index, and Motion token sections with previews
- **`docs/themes.html` expanded**: All 13 themes now shown with live preview cards
- **IIFE build**: `dist/velinstyle-components.iife.js` for `file://` compatibility (no `type="module"` needed)

### Fixed
- **`docs/404.html`**: CSS path fixed (`dist/` to `../dist/`)
- **Version numbers**: All docs pages unified to v0.6.0
- **Navigation**: All docs pages now link to CSS Components and Security pages

## [0.5.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.5.0) - 2026-05-11

### Added

- **CSS @scope Integration**: Scoped styles fuer Card, Modal, Drawer, Nav + `.velin-scope` / `.velin-scope-island` Utilities
- **Auto-Contrast Utility**: `.velin-auto-text--*` nutzt `color-contrast()` fuer automatische Textfarbe auf farbigen Hintergruenden (OKLCH)
- **Native Anchor Positioning**: `.velin-anchor` / `.velin-anchored--*` fuer CSS-native Tooltip/Popover-Positionierung ohne JS
- **Fluid Typography**: Alle `--velin-text-*` Tokens auf `clamp()` umgestellt -- stufenlose Skalierung 320px bis 1440px
- **Smart User-Preference Queries**: `prefers-contrast: more/less` und `prefers-reduced-transparency` Support
- **CSS-only Filter**: `.velin-filter-group` mit `:has()` fuer JS-freies Listen-Filtern ueber Checkboxen
- **Adaptive @container Style Queries**: `.velin-density-compact/normal/comfortable` + `.velin-style-professional/playful`
- **Luminance-Aware P3 Gradients**: `.velin-gradient-p3-*` mit `color(display-p3)` fuer Wide-Gamut Displays
- **State-driven Utilities**: `.velin-is-loading/empty/error/success/disabled` mit automatischen Icons/Overlays
- **Morph Transitions**: `.velin-morph-source/target` fuer View Transitions API-basierte Komponenten-Morphs
- **Haptics API**: `vibrate()`, `applyHaptic()`, `VelinHapticObserver` -- Vibrationspatterns fuer mobile Interaktion
- **`<velin-persist>`**: Zero-JS Form Persistence Web Component -- auto-save/restore via localStorage
- **A11y Dashboard**: Interaktive Seite auf velinstyle.info mit ARIA Inspector, Keyboard Visualizer, Contrast Checker
- **10 neue Themes**: Neon, Earth, Ocean, Sunset, Nordic, Retro, Corporate, Pastel, Midnight, Forest (13 total)
- **VelinStyle CLI**: `velinstyle init/build/themes/add` fuer CSS Tree-Shaking und Custom Builds

### Fixed

- **39 Accessibility Issues** behoben:
  - Carousel: Keyboard-Navigation, `aria-roledescription`, Dot-Indicators Touch-Target
  - Countdown: `role="timer"`, `aria-live="polite"`, `aria-atomic`
  - Lightbox: Focus-Trap, Focus-Restore, `aria-roledescription="lightbox"`
  - Dropdown/Popover: `aria-expanded`, `aria-haspopup` auf Trigger
  - Stepper: `role="list"` / `role="listitem"`, `aria-current="step"`
  - Progress-Ring: Host-Level `role="progressbar"` + ARIA values
  - Dialog: Focus-Restore, Autofocus
  - Chip: Touch-Target auf 44px erweitert
  - Switch/Progress/Spinner: `forced-colors: active` Support

- **11 velinstyle-site Frontend Issues** behoben:
  - Navigation zwischen index.html und Docs verbunden
  - GitHub URL vereinheitlicht (SkyliteDesign)
  - Dark-Mode Attribut auf `data-velin-theme` vereinheitlicht
  - Absolute Pfade zu relativen konvertiert
  - Bootstrap-Klassen in introduction.html durch VelinStyle ersetzt
  - Mobile Hamburger-Menu hinzugefuegt
  - Footer auf allen Doc-Seiten
  - Prism.js Dark-Mode verbessert

### Changed

- `components/index.js` exportiert jetzt 22 Module (+ VelinPersist, VelinHapticObserver)
- `package.json`: `bin` Eintrag fuer CLI, Version 0.5.0, `cli/` in files
- `src/velinstyle.css`: 6 neue CSS-Imports (scope, anchor, filter, container-style, state, preferences)
- `scripts/build-themes.js`: Auto-Discovery statt hardcoded Array
- Typography Tokens: Fixed values durch `clamp()` ersetzt

### Metrics

| Metrik | v0.4.0 | v0.5.0 |
|--------|--------|--------|
| CSS (min) | 118.7 KB | 132.1 KB |
| JS (min) | 58.6 KB | 63.7 KB |
| Web Components | 20 | 22 |
| Themes | 3 | 13 |
| CSS Utilities | ~600 | ~700+ |
| A11y Issues | 39 | 0 |
| CLI | - | 4 Commands |
| Doc-Seiten | 108 | ~110 |

## [0.4.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.4.0) - 2026-05-11

### Added

- **Float Utilities**: `.velin-float-start`, `.velin-float-end`, `.velin-float-none`, `.velin-clearfix`
- **Vertical-align Utilities**: `.velin-align-baseline/top/middle/bottom/text-top/text-bottom/sub/super`
- **Helpers-Kategorie** (`src/helpers/helpers.css`): Ratio Container, Stacks, Stretched Link, Vertical Rule, Colored Links, Focus Ring, Icon Link
- **12-Column Flex Grid**: `.velin-row`, `.velin-col-1` bis `-12`, responsive sm/md/lg/xl Varianten, Offsets, Gutters, Row-Columns
- **Content-Styles** (`src/base/content.css`): Typography (h1-h6, display-1-6, lead, blockquote), Images (fluid, thumbnail, rounded), Figures
- **Table-Erweiterungen**: Zeilen-Farbvarianten, `.velin-table--sm`, `.velin-table--borderless`, Caption-Top
- **7 neue Animationen**: flip, drop-in, rubber-band, jello, heartbeat, swing, tada + Stagger + Hover-Trigger
- **6 neue Web Components**: `<velin-tooltip-wc>`, `<velin-lightbox>`, `<velin-stepper-wc>`, `<velin-dialog>`, `<velin-countdown>`, `<velin-progress-ring>`
- **106 Dokumentationsseiten** auf velinstyle.info nach Bootstrap-Vorbild (12 Kategorien)
- **Haupt-Repo Docs Banner** mit Link zur vollstaendigen Dokumentation

### Fixed

- Fehlende `@keyframes velin-spin` Definition

### Changed

- `components/index.js` exportiert jetzt alle 20 Web Components
- `src/velinstyle.css` importiert `base/content.css` und `helpers/helpers.css`
- `package.json` Version 0.4.0
- Alle Doc-Seiten auf v0.4.0

## [0.3.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.3.0) - 2026-05-11

### Added

- **Responsive Utility-Varianten**: Vollstaendige `sm`/`md`/`lg`/`xl` Varianten fuer Spacing, Text, Flex, Sizing, Display, Visibility (~300 neue Klassen)
- **Input Group Komponente**: `.velin-input-group` mit Text/Icon Prepend/Append und Groessen-Varianten
- **Floating Labels**: `.velin-float-label` mit animierter Transition fuer Inputs, Selects und Textareas
- **Collapse Komponente**: Standalone Content-Toggle mit CSS-only smooth height Animation
- **Button Toolbar**: `.velin-btn-toolbar` fuer gruppierte Button-Gruppen
- **Navbar Mega-Menu**: `.velin-nav__mega` Multi-Column Dropdown in Navigation
- **Form Validation**: `.velin-form--validated` mit `:valid`/`:invalid` Pseudo-Klassen und visuellem Feedback
- **color-mix() Utilities**: Dynamische Farb-Abstufungen (5%-90%) fuer Primary, Secondary, Success, Danger, Warning, Info -- einzigartig gegenueber Bootstrap/Tailwind
- **Scroll-driven Animations**: `.velin-animate-on-scroll`, `.velin-scroll-progress`, `.velin-parallax` ohne JS
- **View Transitions API**: `.velin-vt-`* Utilities fuer `view-transition-name`, Morph-Uebergaenge, Cross-Fade und Slide Pseudo-Element-Styles
- **Subgrid Support**: `.velin-subgrid` und `.velin-subgrid-rows` in Grid-System
- **Ring Utilities**: `.velin-ring-`* mit Varianten fuer Farben (primary, secondary, success, danger) und Groessen (1-4px, inset)
- **Divide Utilities**: `.velin-divide-y`, `.velin-divide-x` fuer Kind-Element-Trenner
- **Columns Utilities**: `.velin-columns-1/2/3/4` fuer Multi-Column-Layout
- **Order Utilities**: `.velin-order-first/last/none/1-12` fuer Flex/Grid-Reihenfolge
- **Object-position Utilities**: `.velin-object-center/top/bottom/left/right` fuer Bilder
- **Flex-basis Utilities**: `.velin-basis-`* mit Bruch-Varianten (1/2, 1/3, 2/3, 1/4, 3/4, 1/5)
- **Scroll-snap Utilities**: `.velin-snap-x/y`, `.velin-snap-start/center/end`, Scroll-Padding fuer fixe Header
- **Text-wrap Utilities**: `.velin-text-balance`, `.velin-text-pretty`, `.velin-text-nowrap`
- **Isolation/Blend Utilities**: `.velin-isolate`, `.velin-blend-multiply/screen/overlay/difference`
- **Touch-action Utilities**: `.velin-touch-none/pan-x/pan-y/manipulation`
- **Overscroll Utilities**: `.velin-overscroll-contain/none/auto`
- **Will-change Utilities**: `.velin-will-change-transform/opacity/scroll`
- **Hyphens Utilities**: `.velin-hyphens-auto/none`
- **3 neue Web Components**: `<velin-carousel>` (Touch-Swipe, Auto-Play, Indikatoren, `aria-roledescription`), `<velin-collapse>` (grid-row Animation), `<velin-scrollspy>` (IntersectionObserver)
- **8 neue Sample-Seiten**: Login, Signup (Multi-Step), E-Commerce (Sharp), Settings, Pricing (Soft), Chat, Email (Sharp), Kanban
- **Docs-Homepage**: Komplett neue Marketing-Landingpage mit Feature-Grid, Vergleichstabelle, Quick-Start, Component-Showcase
- **velinstyle.info**: Separates Marketing-Repository mit Live-Playground, Theme-Showcase, interaktiven Code-Beispielen

### Changed

- Alle Doc-Seiten haben jetzt einheitliche Navigation mit 10 Links
- Alle Versionsangaben auf v0.3.0 aktualisiert
- `components/index.js` exportiert jetzt alle 14 Web Components
- `src/velinstyle.css` importiert 6 neue Utility-Dateien und 2 neue Komponenten
- `package.json` Version auf 0.3.0

### Metrics


| Metrik               | v0.2.0            | v0.3.0                                                    |
| -------------------- | ----------------- | --------------------------------------------------------- |
| CSS-Komponenten      | 22                | 29+                                                       |
| Web Components       | 11                | 14                                                        |
| Utility-Klassen      | ~150              | ~500+                                                     |
| Responsive Variants  | nur Display       | ALLE                                                      |
| Sample-Seiten        | 5                 | 13                                                        |
| Moderne CSS-Features | Container Queries | + color-mix, View Transitions, Scroll Animations, Subgrid |


## [0.2.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.2.0) - 2026-05-11

### Added

- **15 neue CSS-Komponenten**: Breadcrumb, Pagination, Progress, Spinner, List Group, Avatar (mit Status/Gruppe), Switch/Toggle, Divider, Chip/Tag, Timeline, Stepper, Stat Card, Range Input, File Upload Dropzone, Close Button
- **5 neue Web Components**: `<velin-drawer>` (Offcanvas), `<velin-theme-toggle>` (Dark/Light mit localStorage), `<velin-popover>` (Rich-Content Tooltips), `<velin-copy>` (Click-to-Copy), `<velin-scroll-top>` (Scroll-to-Top)
- **CSS-Animationsbibliothek**: 7 Entrance (fade-in, slide-up/down/left/right, scale-in, zoom-in), 5 Attention (bounce, pulse, shake, wiggle, ping), 2 Exit Animationen mit Duration/Delay/Infinite Modifiern, voll `prefers-reduced-motion`-konform
- **Gradient Utilities**: 6 fertige Gradienten (primary, secondary, surface, hero, sunset, ocean), Gradient-Text, Richtungsmodifier
- **Transform Utilities**: rotate, scale, translate-y mit negativen Varianten
- **Filter/Backdrop Utilities**: blur, backdrop-blur, brightness, grayscale
- **Print Utilities**: print-only, no-print, break-before/after/avoid, automatische Druckoptimierung
- **Layout Patterns**: sidebar, holy-grail, sticky-footer, center, pancake, aside-main
- **Button Erweiterungen**: Success-Variante, Loading-State mit Spinner
- **Docs-Infrastruktur**: Shared `docs.css` mit Sidebar-Layout, Code-Block-Styling, API-Tabellen, Swatch-Komponenten, NEW-Badges
- **5 neue Doc-Seiten**: Getting Started, Layout, Utilities, Forms (alle Controls), Migration Guide (Bootstrap + Tailwind)
- **RTL-Demo**: Vollstaendige arabische Sample-Seite mit gespiegelten Layouts
- **TypeScript-Definitionen**: Vollstaendige `.d.ts` fuer alle 11 Web Components mit HTMLElementTagNameMap
- **GitHub Pages Deployment**: Automatisches Deployment bei Push auf main
- **Custom 404-Seite**: Styled VelinStyle 404 fuer GitHub Pages
- **Testing**: axe-core A11y-Tests, Vitest Web Component Unit-Tests, CI-Integration

### Changed

- `components/index.js` exportiert jetzt alle 11 Web Components
- `src/velinstyle.css` importiert alle neuen Komponenten, Utilities und Layout-Patterns
- `package.json` Version auf 0.2.0, TypeScript-Definitionen als `types` Feld
- CI-Workflow fuehrt jetzt auch Unit-Tests aus

## [0.1.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.1.0) - 2026-05-11

### Added

- **Design Tokens**: OKLCH color palette, spacing scale (4px base), typography scale (1.25x Major Third), border-radius, shadows, motion, z-index, and aspect-ratio tokens
- **Dark Mode**: Automatic via `prefers-color-scheme` and explicit via `data-velin-theme="dark"` attribute
- **Modern CSS Reset**: `box-sizing: border-box`, scroll behavior, motion reduction, min font-size for mobile inputs
- **Accessibility Layer**: `.velin-sr-only`, `.velin-skip-link`, `:focus-visible` outlines, `prefers-reduced-motion` support, `forced-colors` (Windows High Contrast) support, skeleton loading with CLS protection
- **Layout System**: Responsive container with Container Queries, CSS Grid with auto-fit/auto-fill, Flexbox utilities, stack and cluster patterns
- **BEM Components**: Button (6 variants + 4 sizes), Card, Form inputs, Navigation, Alert, Badge, Table, Tooltip, Modal (CSS)
- **Utility Classes**: Flex, spacing, text alignment, display, visibility, color utilities
- **Web Components**: `<velin-modal>`, `<velin-tabs>`, `<velin-accordion>`, `<velin-dropdown>`, `<velin-toast>`, `<velin-icon>` with full keyboard and screen reader support
- **Focus Manager**: Shared module with `trapFocus()`, `rovingTabindex()`, `saveFocus()`, `restoreFocus()`
- **Icon System**: 51 essential SVG icons with sprite builder and `<velin-icon>` component
- **Theme Presets**: Sharp (angular, editorial), Soft (rounded, warm), Brutalist (raw, bold)
- **Documentation**: Token reference, component demos, accessibility guide, theme showcase, icon gallery
- **Sample Pages**: Landing page (default), Dashboard (sharp), Blog (soft), Portfolio (brutalist)
- **Build Tooling**: Lightning CSS for CSS bundling/minification, ESBuild for JS bundling
- **CI/CD**: GitHub Actions workflow for build and a11y tests
- **Linting**: Stylelint configuration enforcing `velin-` prefix convention

