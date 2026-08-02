# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Current line: **1.2.1** (Transparency Framework). Overview of **1.2.0**: [`RELEASE_NOTES_1.2.0.md`](RELEASE_NOTES_1.2.0.md). Upgrade guidance: [`UPGRADING.md`](UPGRADING.md).

---

## [Unreleased]

### Added

### Changed

### Fixed

---

## [1.2.1](https://github.com/SkyliteDesign/velinstyle/releases/tag/v1.2.1) - 2026-08-02

VelinStyle **1.2.1** ships the **Velin Transparency Framework** foundation: labeling **and** provenance as a subsystem (not an AI badge).

### Added

- Transparency subsystem at `@birdapi/velinstyle/transparency` — Engine, Registry, Policy, Providers, Validator, Doctor, Reporter, Export, Migrate, Renderer
- HTML bridge `velin-transparency` / `velin-disclosure` + provenance attributes
- Claim taxonomy (`ai.generated`, `review.human`, `license.*`, …)
- CLI: `velinstyle transparency doctor|validate|report|export|migrate` (scan alias)
- Integration into `velinstyle check` / review scores (Transparency + pillars)
- CSS marks (badge, overlay, ribbon, inline, footer, panel, tooltip, icon)
- Example policy `examples/transparency.policy.json`
- Docs guides EN/DE: Transparency Framework

### Changed

- Soft default transparency policy so existing `check` runs stay non-breaking; strict media rules via policy file

---

## [1.2.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v1.2.0) - 2026-08-01

VelinStyle **1.2.0** ships Core + Design Intelligence Foundation and the Trust/Ship surface (`create`, `check`, `serve`, `doctor`), trust-oriented scan/review gates, AI skills registry tooling, and new app primitives (calendar, file dropzone, editable data table). Claims stay honest: excellent for landings and docs; not yet a primary multipage shop/enterprise-admin stack.

### 🚀 Highlights

#### Framework
- Logical spacing honesty and denser padding steps for blueprint fidelity
- App-shell layout utilities
- Lite CSS preset for marketing budgets

#### Design Intelligence (Beta)
- Review profiles (`marketing` | `app` | `docs` | `fragment` | `ecommerce`)
- Thin-content floors so junk pages cannot score conversion/SEO at 10

#### AI Foundation (Beta)
- Skill engine + 40 official skill records, packs, bundles, templates, workflows
- `velinstyle skills` / `workflow` CLI; `skills doctor` path integrity

#### CLI
- `create landing|dashboard|docs|auth`, `check` (`--json` / `--sarif`), `serve`, `doctor`
- `wc api <tag>`, `build --preset lite`, `--out` / `-o` aliases

#### Components
- `<velin-calendar>`, `<velin-file-dropzone>`, `<velin-data-table editable>`

#### Blueprints
- `split-hero`, `pricing-band`, `app-chrome`, `ops-console`

#### Quality
- Trust scan rules (nested interactive, contrast-inline, role=button, and more)
- Chaos + misses fixtures; blueprint `--strict` CI
- Windows ESM path fixes; vendor mini-docs on create

### Release Status

| Area | Status |
|------|--------|
| CSS Framework | Stable |
| Utilities | Stable (honesty expansions) |
| Runtime | Stable |
| Web Components | Stable (+ new primitives) |
| CLI | Stable (expanded surface) |
| Blueprints | Stable |
| Review Engine | Beta |
| Prompt Engine | Beta |
| Knowledge Graph | Beta |
| AI Metadata | Beta |
| AI Skills | Beta / Foundation |
| Workflow Graphs | Beta / Foundation |
| Studio | Planned |
| Utility Engine Generator | Planned |

### Added

#### CLI
- `velinstyle serve`, `velinstyle doctor`, `velinstyle create landing|dashboard|docs|auth`
- `blueprint --strict` / `npm run check:blueprints` CI gate
- `velinstyle check` (doctor + blueprint `--strict` + scan + review) with `--json` / `--sarif`
- Aliases: `validate` → `check`, `documentation` → `docs`
- `velinstyle wc api <tag>` (source-backed WC API + examples)
- `velinstyle skills doctor` / `npm run skills:doctor` path integrity
- `velinstyle build --preset lite` marketing layer subset; `--out` / `--output` / `-o` aliases
- `velinstyle skills show <id> --human` Markdown view

#### Components
- `<velin-calendar>` (month picker)
- `<velin-file-dropzone>` (client upload UX)
- `<velin-data-table editable>` inline edit (`velin-data-table-edit` event)

#### Scanner / Review
- Scan rules: `a11y/duplicate-id`, `css/unknown-velin-class`, `wc/invalid-attribute`, HTML `security/no-document-write`, `a11y/target-size-min`, `a11y/nested-interactive`, `a11y/contrast-inline`, `a11y/role-button-contract`
- `check:chaos` covers chaos + `misses.html` (fixtures under `fixtures/`)
- Review thin-content floors (SEO/conversion capped on junk pages)
- Review `--profile marketing|app|docs|fragment|ecommerce`

#### Utilities / Layout
- Spacing: `velin-py-*` (padding-block alias) and denser `velin-pb-*` / `velin-pi-*` steps **10** and **12**
- Logical spacing honesty: `velin-mbe-1/3`, `velin-mbs-1/3`, `velin-pbe-*`, `velin-pbs-*`, `velin-border-inline-end/start`
- App-shell layout utilities

#### Blueprints
- `split-hero`, `pricing-band`, `app-chrome`, `ops-console` (validated classes only)

#### AI Skills
- AI Runtime foundation: `packages/skill-engine` and `packages/velinstyle-skills` (registry-first)
- 40 official skill records across 16 categories (capabilities, compatibility, status, confidence, cost hints, dependency graph metadata, typed inputs/outputs)
- Workflow graph manifests (`landingpage`, `component-ship`, `release-gate`), plus packs, bundles, project templates, and project skill chains
- CLI: `velinstyle skills ...`, `velinstyle workflow ...`
- Schemas: `skill-record`, `skill-registry`, `skill-pack`, `skill-graph`, `skill-bundle`, `skill-template`, `skill-project`

#### Documentation
- Guides: `landing-15-min`, `marketing-lite-css`, `docs/guides/ai-skills.html`, `docs/guides/ecommerce.html`
- Docgen minimal WC copy-paste examples (copy, tooltip, lightbox, icon, command, menubar, form-summary, data-table)
- Strategy/ADR deep-dives remain maintainer-local (monorepo `interne_docs/strategy/`; not published)
- `UPGRADING.md` draft for **1.1.0 → 1.2.0** (publish when cutting the minor)
- `RELEASE_NOTES_1.2.0.md` companion overview

### Changed

#### Security
- Production dependency `isomorphic-dompurify` **3.13 → 3.21.0** (DOMPurify 3.4.x) so `npm audit --omit=dev` reports **0** vulnerabilities before the 1.2.0 upload

#### CLI
- `velinstyle scan` and `velinstyle perf` accept a single HTML/CSS/JS file or a directory (no more `ENOTDIR` on file paths)
- `velinstyle init` copies vendor assets when framework `dist/` is available and scaffolds starter HTML with `data-velin-reveal-auto` + icon sprite meta
- `velinstyle create` emits zero-warning HTML (no inline styles, `label for`/`id`), copies vendor into the target dir, boots via `bootFromDOM` when the package resolves (vendor full-bundle fallback)
- Create vendor copy includes mini WC docs under `vendor/velinstyle/docs/`
- `velinstyle build` invokes local `lightningcss` from the package `node_modules`; `--preset lite` prints size vs `dist/velinstyle.min.css`
- Unknown CLI commands exit **1** with "Did you mean ...?" instead of dumping help with a success-looking exit
- Top-level `--help` / README CLI tables list all create kinds and `wc api` / `skills doctor`
- `velinstyle meta page --write` merges curated `goals`/`intent` and **warns** when dropping non-allowlisted keys

#### Review Engine
- Hero CTA heuristic strips scripts/styles/code-blocks and counts only real `<a>`/`<button>` CTAs in hero scope

#### Components / Runtime
- `velin-icon` default sprite is relative/configurable (`sprite` attr → meta/`data-velin-icon-sprite` → `VelinIcon.defaultSprite` → `velin-icons.svg`) instead of hardcoded `/dist/velin-icons.svg`

#### AI Skills
- Skills templates/demos remap to existing files (`samples/ecommerce.html`, `samples/landing.html`, ...)
- `velin-agent.json` and `llms.txt` include AI skills catalog and workflow discovery hints
- Publish inputs include skills packages and schemas; prepublish runs `skills:generate`, `skills:validate`, `skills:doctor`, and `check:blueprints`

#### Documentation
- Docs clarify `<velin-copy>` (`value`/`text` + Shadow button), tooltip `content`, lightbox, icon sprite, attribute vs WC vs `bootFromDOM`, flex `--` naming, breadcrumb `__item`/`__link`, Windows/vendor install, and review CTA semantics
- README fit statement: landing/docs/simple admin yes; multipage shop + enterprise admin primary **not yet**; npm circulation note until 1.2.0 cut

### Fixed

#### Windows
- `velinstyle build`: config import uses `pathToFileURL` (no `ERR_UNSUPPORTED_ESM_URL_SCHEME` on drive-letter paths)

#### Scanner
- Duplicate IDs, unknown `velin-*` classes, invalid WC attributes, and inline `document.write` in HTML are detected
- Nested interactive / inline contrast / role=button contract gaps from Round-4 `misses.html`
- `scan` / `perf` no longer fail with `ENOTDIR` on a single `.html` file

#### CLI
- Subcommand `--help` for `skills`, `workflow`, `blueprint` (no longer treated as unknown ids)
- `build --out` alias honored alongside `--output`/`-o`
- Doctor resolves config from parent dir when given a file path
- Lite preset appeared larger than full min CSS when `npx lightningcss` failed in consumer CWDs (now uses package-local CLI)

#### Blueprints
- Class drift: `process-steps`, notification/filter/settings flex naming, cookie `mbe`, settings switch markup
- Offline blueprints no longer reference `../../dist/...`
- Sample `velin-py-*` classes had no CSS rules (section spacing appeared broken)

#### Components
- Offline/vendor icon installs broke when the sprite default pointed at absolute `/dist/...`
- `<velin-accordion>`: summary/panel styles via light-DOM CSS (`::slotted()` cannot style descendants of slotted `<details>`); `aria-expanded` sync; panel background prefers `--velin-color-surface-dim` (dark-safe)
- `<velin-command>`: closed overlay `pointer-events: none`; backdrop click closes; `toggle()`; inert cleanup host-scoped
- `<velin-calendar>` day grid overflow in narrow sidebars; cells fluid with `minmax(0,1fr)`

#### Review Engine
- `design.hero-cta-max` false positives from Velin-Meta JSON and demo snippets in the HTML prefix
- Empty/junk pages no longer score conversion/SEO at 10
- `app`/`docs` profiles no longer advise "H1 in the hero"; conversion soft-capped for app/docs
- Review catches missing `lang`, img without `alt`, and unlabeled placeholder-only inputs (static HTML)

#### AI Skills / Documentation
- Broken skills template paths (`samples/shop.html`, `examples/landing-demo.html`, missing guides) remapped / guides added


### Also included (Design Intelligence Foundation)

Merged from the in-repo foundation draft previously dated 2026-07-28:

- Knowledge graph seed, page registry (17 types), section/blueprint system, design constraints (hero/FAQ/contact)
- Prompt Engine (`velinstyle plan`) and Review Engine baseline (`velinstyle review`)
- Schemas under `schemas/` for design intelligence; intelligence twins under `docs/generated/intelligence/`
- Overlay inert cleanup, dark shadow parity, dialog `velin-close` canonical event, responsive display ownership
- Release framed as Core + Design Intelligence Foundation (Studio / full Utility Engine generator remain planned)

### Breaking Changes

No breaking changes in Unreleased relative to 1.1.0 public API contracts. Stricter scan/review may newly fail previously green pages (intentional trust improvement).

### Migration Notes

See [`UPGRADING.md`](UPGRADING.md) (1.1.0 → 1.2.0). After install: refresh vendor copies if vendored, run `doctor` + `check` (use `--profile app` for admin shells).

### Developer Notes

1.2.0 prioritizes **trust and ship DX**: gates that catch real defects, scaffolds that pass `check`, discoverable WC APIs offline, and honest maturity labels for Design Intelligence / AI foundation surfaces.

---

## [1.1.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v1.1.0) - 2026-07-27

VelinStyle 1.1 ships accessible form/table primitives, expands React wrappers to the full canonical set, and adds release-sync guards so docs, agent metadata, and package version cannot drift. No breaking changes; deprecated `<velin-tooltip-wc>` and `<velin-stepper-wc>` aliases still work.

### 🚀 Highlights

#### Components
- `<velin-data-table>` progressive enhancement
- `<velin-form-summary>` accessible error summary

#### Framework
- Official `@velinstyle/react` coverage for all canonical tags
- Release sync guard (`release:check` / `release:sync`)

#### Quality
- Docs/version/count drift fixes across framework and site
- Highlight lexers: Python, YAML, Go, Rust

### Release Status

| Area | Status |
|------|--------|
| CSS / WC / Runtime | Stable |
| React wrappers | Stable (full coverage) |
| CLI | Stable |
| Design Intelligence | Not yet (arrives in 1.2) |

### Added

#### Components
- **`<velin-data-table>`:** progressive enhancement for a light-DOM `<table>` -- sortable columns via real `<button>` headers with `aria-sort`, text/number/date sort types (`data-sort`, `data-sort-value`), substring filtering bound to any input (`filter-input`), optional pagination (`page-size`), and an empty state (`empty-text`). Sort, filter and page changes are announced; filtered and off-page rows use `hidden` so they leave the accessibility tree. Requires a `<caption>`, `aria-label`, or `label` attribute.
- **`<velin-form-summary>`:** accessible error summary for any `<form>`. Replaces the transient native validation bubble with a focusable `role="alert"` panel listing every invalid field, wires `aria-invalid` and `aria-describedby` to per-field messages, moves focus to the offending field from summary links, and clears each error as soon as the field becomes valid. Supports `data-error-message`, `data-error-label`, `data-error-ignore` and author-supplied `[data-velin-error-for]` containers.

#### Runtime / Highlight
- **Highlight languages:** Python, YAML, Go and Rust lexers, lazy-loaded like the existing ones. Aliases `py`, `python3`, `yml`, `golang`, `rs` resolve to them; `yaml` previously fell back to plain text.

#### Quality / Process
- **Release sync guard:** `npm run release:check` compares every machine-readable version surface (CLI manifest, a11y contracts, `velin-agent.json`, doc header badges, landing-page version badges, `velin-meta` blocks, JSON-LD `softwareVersion`, npm/CDN install pins, generated docs, changelog copies) against `package.json`. It also checks the component counts quoted in prose across both repos -- English and German -- against `components.count` / `components.loaderCount` in `velin-agent.json`, so adding a component cannot leave the docs claiming the old number. `npm run release:sync` rewrites the mechanical ones. Wired into `ci:checks` and the site build; site checks are skipped when the sibling repo is absent.
- **WCAG matrix:** 3.3.1 Error Identification and 3.3.3 Error Suggestion are now tracked and owned by `velin-form-summary`.

### Changed

#### React
- **`@velinstyle/react` is official (1.1.0):** wrappers now cover **all 38 canonical** `velin-*` elements instead of 12, generated from the component registry so CI fails when they drift. Props map correctly for custom elements -- booleans become presence attributes, objects and arrays are assigned as element properties instead of being stringified, and `onVelin*` handlers bind the matching custom event (`onVelinSearchSelect` → `velin-search-select`). Ships TypeScript definitions and `createVelinComponent` for your own tags. Deprecated `*-wc` aliases are intentionally excluded.

#### CLI
- **CLI version:** `velinstyle --help` reads the version from `package.json` instead of a hardcoded string that had drifted to 0.9.0.

#### Tooling
- **Demo sync:** `tools/sync-demos-to-repo.mjs` derives its unpkg pin from `package.json` rather than a hardcoded 0.9.0.

### Fixed

#### Documentation
- **Docs drift:** stale `@birdapi/velinstyle@0.9.0` install snippets and `velin-meta` version blocks across the site, plus a `@0.4.0` CDN example in the framework docs landing page. The site guide generators now read the framework version instead of embedding it.
- **Component counts:** the docs claimed 36 canonical components and 38 loader entries in 20+ places; both repos now report 38 and 40, and the guard keeps them honest.
- **Duplicate heading:** the site accessibility page shipped the "Component contracts" section twice with the same `id="contracts"`, because a one-shot patch script had been applied twice.
- **Site changelog copy:** the a11y bulk-patch script rewrote a link inside the copied `CHANGELOG.md`, which made the copy permanently differ from the framework original. Verbatim copies (`CHANGELOG.md`, `docs/generated/`) are now excluded from that script.
- **Docs coverage audit:** `audit-docs-coverage.py` crashed on Windows consoles because its report contains `→`; it now forces UTF-8 output, and recognises the two new component pages.

#### Quality / Process
- **Release guard robustness:** the repo walk crashed with `ENOENT` when a file disappeared mid-scan, which made the check fail intermittently alongside tests that use temporary directories. Dot-directories are now skipped and vanished files are ignored.

### Build
- `npm run build` regenerates the React wrapper sources; `npm run build:react` also bundles the package.
- New CI gates: React wrapper drift and release sync.
- The loader-count gate now derives its minimum from `component-contracts.json` instead of a hardcoded 36.
- Full-bundle JS budget raised from 200 KB to 215 KB (209.4 KB actual, 46.9 KB brotli) to cover the two new components. Applications using `register()` / `bootFromDOM()` pay only for what they load.

### Breaking Changes

No breaking changes.

### Migration Notes

No required migration. Optional: adopt `<velin-form-summary>` on forms and `<velin-data-table>` for progressive table UX.

### Developer Notes

1.1.0 hardens the **docs <→ package truth** loop and ships two high-leverage a11y components so forms and data UIs can meet WCAG error-identification patterns without custom scaffolding.

---

<!-- Older releases (1.0.0 and below) retain their historical Keep a Changelog sections. Content is unchanged. -->

## [1.0.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v1.0.0) - 2026-05-29

### Fixed
- **Search:** Worker mode now requires an explicit `workerUrl` (prevents broken defaults in non-ESM/IIFE builds).
- **Build:** IIFE bundle no longer emits `import.meta` warnings during build.

### Changed
- **CI:** runs on Linux, Windows, and macOS; Playwright full cross-browser only on Linux (Chromium smoke elsewhere).

## [0.9.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.9.0) - 2026-05-19

### Breaking
- **Component names:** canonical tags are `<velin-tooltip>` and `<velin-stepper>`; source files `components/velin-tooltip.js` and `components/velin-stepper.js`. `<velin-tooltip-wc>` and `<velin-stepper-wc>` remain as **deprecated** aliases (console warning once).
- **Spacing:** `.velin-mb-*` is margin-bottom only; use `.velin-my-*` for block-axis spacing.
- **Visual:** default text/primary tokens are darker for AAA — use `data-velin-contrast="aa"` on `<html>` if you need the previous lighter palette without retuning tokens.

### Migration
- Replace `<velin-tooltip-wc>` → `<velin-tooltip>` and `<velin-stepper-wc>` → `<velin-stepper>` in HTML; legacy tags still work in 0.9.0.
- Imports: `VelinTooltip` / `VelinStepper` from `@birdapi/velinstyle` (or component paths); `VelinTooltipWC` / `VelinStepperWC` re-exported as deprecated.

### Fixed
- **Security:** `velin-secure-field` no longer emits plaintext or AES keys; hardened `sanitizeURL` / `sanitizeSearchUrl`; DOMPurify SVG sanitization in `velin-icon`; search result URLs validated.
- **Runtime:** auto-generated `COMPONENT_LOADERS` (38 tags); `bootFromDOM` scans all `velin-*` elements; stacked modal inert; `velin-copy` `value`/`text` unified; code-block copy fixed.
- **WCAG 2.2:** corrected criterion comments; fixed `wcag22-auth` sample; new `wcag22-dragging` sample and `wcag22-matrix.md`.
- **Utilities:** `.velin-mb-*` margin-bottom semantics corrected.

### Added
- **Audit follow-up:** `velin-scroll-top` declarative attribute; `src/base/wc-placeholder.css` CLS guards for all loader tags; `velin-persist` in `component-contracts.json`; Playwright cross-browser smoke (`npm run test:e2e`); shared docs theme picker assets (`docs/assets/theme-picker.*`).
- **Velin-Meta:** `velinstyle meta` builds `dist/velin-agent.json` and `dist/llms.txt` for AI assistants; MIME `application/vnd.velinstyle.meta+json`; page-level `<script id="velin-meta">`; `velinstyle meta page <file> --write`; `docs generate --scope meta`; export `@birdapi/velinstyle/meta`.
- **WCAG 2.2 AAA defaults:** OKLCH color tokens (`:root`, dark, 13 themes) validated at 7:1 via `npm run test:contrast`; `data-velin-contrast="aa"` opt-down to AA palette.
- **A11y runtime:** `@birdapi/velinstyle/a11y` with `initA11y()` (live announcer, scroll padding); `core/a11y/component-contracts.json`; `docs/generated/a11y/wcag22-aaa-matrix.md`; `npm run test:a11y:coverage`.
- **Component a11y:** `a11y-utils.js`, fixes for `velin-icon`, `velin-search`, `velin-theme-toggle`, `velin-popover` (`aria-labelledby`), dialogs, toasts, and more; scanner rules `velin-icon-label`, `sparkline-label`, `skeleton-text`.
- **VelinHighlight:** `core/highlight/` (`velinSyntax`, `highlightElement`, `highlightAll`, `initHighlight`, `registerLanguage`, `lazyLoadLanguage`); lexers for JS/TS, HTML, CSS, JSON, Markdown, Shell, SQL, PHP, Blade; `highlight.css` with OKLCH/P3 token colors and reduced-motion fade.
- **`<velin-code-block>`** Web Component (copy, line numbers, line highlight, collapsible); `velin-code` attribute bridge with lazy in-view highlighting.
- **Export:** `@birdapi/velinstyle/highlight`; `bootFromDOM({ highlight: true })`; sample `samples/velin-code-block.html`; guide `docs/guides/syntax-highlight.html`.
- **VelinSearch:** `core/search/` API (`velinSearch`, `createSearch`, `registerSearchProvider`), fuzzy offline search, highlight, category filters; optional Web Worker (`core/search/worker.js`).
- **`<velin-search>`** Web Component with autocomplete, keyboard navigation, grouped results.
- **Search benchmark:** `tests/search-benchmark.test.js` — fuzzy query over 10k entries (main thread under 400ms, worker under 500ms in CI); `npm run test:search:bench`.
- **Motion runtime:** `core/motion/` (`initMotion`, `velinMotion`, rAF scheduler, stagger, smooth scroll); unified `.velin-in-view` with scroll-animation CSS fallback.
- **Velin HTML attributes:** `core/attributes/` registry (20+ bridges); `bootFromDOM({ attributes: true })`.
- **CLI:** `velinstyle search index` builds `dist/search-index.json`; `docs generate` emits `docs/generated/` + attributes index.
- **PII scanner:** `hardcoded-email`, `hardcoded-secret`, `mailto-in-source`, `localstorage-pii` rules; `--only pii`; `--fix` masks emails (`cli/pii-scanner.js`).
- **WCAG 2.2 CSS:** `authentication.css`, `consistent-help.css`, `dragging-alternatives.css`, `focus-appearance.css`; scanner rules `a11y/autocomplete-auth`, `a11y/invalid-describedby`.
- **Font tokens:** `tokens/fonts.css`, utilities `.velin-font-display`, `.velin-tabular-nums`, `.velin-text-pretty`; `tokens build` supports `fonts` and `motion` blocks.
- **JS runtime:** `components/runtime/` with `register`, `lazyDefine`, `whenDefined`, `bootFromDOM`; package exports `./runtime`, `./sanitize`, `./email`, `./secure`.
- **CLI `velinstyle perf`:** `audit`, `suggest`, `fix` for images and scripts (`cli/perf-audit.js`).
- **CLI `velinstyle tokens validate`:** JSON validation for OKLCH, themes, fonts (`cli/tokens-validate.js`, `examples/tokens.schema.json`).
- **Web Components:** `<velin-email>` (reveal obfuscation), `<velin-secure-field>` (optional AES-GCM demo; subpath import).
- **Docs:** `guides/performance-audit.html`, `extend/javascript-api.html`; security page PII section.
- **Auto-generated reference:** `velinstyle docs generate` / `npm run docs:generate` writes Markdown to `docs/generated/` (components, tokens, utilities, CLI, scanner rules, a11y modules). CI verifies committed snapshots.
- **Tokens JSON:** `zIndex` block in schema/build/validate; deterministic key order in `tokens build`; `examples/tokens.full.json`.

### Changed
- Documentation and samples: landmark structure (`<header role="banner">`), AAA migration section, updated `docs/getting-started/accessibility.html` (formerly `docs/a11y.html`) and token pages.
- `test:a11y` enables `color-contrast-enhanced`; JSDOM canvas stub for axe in CI.
- Package and CLI version **0.9.0**; CI runs `tokens:validate`, `test:security`, `test:perf`, `ci:checks` (bundle budget, search-index drift, loader drift).
- **Package:** `.` export → `runtime-entry.js`; full bundle at `@birdapi/velinstyle/bundle`; TypeScript `dist/velinstyle.d.ts`. Subpaths: `/search`, `/motion`, `/attributes`, `/highlight`, `/sanitize`. Distribution via [velinstyle.info](https://velinstyle.info).
- `velin-reveal.js` delegates to `core/motion`; attribute bridge uses `<velin-tooltip>` / lazy loaders from renamed component files.
- Generated docs: `velin-tooltip.md`, `velin-stepper.md` (replaces `*-wc.md` filenames).
- `docs:sync-site` uses `velinstyle-site/tools/sync-0.9.0.py`.

## [0.8.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.8.0) - 2026-05-16

### Added
- **Motion tokens:** five new easings (`spring`, `elastic`, `expo-out`, `back-out`, `snappy`) and two new durations (`slowest 800ms`, `cinematic 1200ms`) in `tokens/motion.css`.
- **Filter-effect utilities:** new `utilities/filter-effects.css` with `velin-saturate-*`, `velin-hue-rotate-*`, `velin-contrast-*`, `velin-invert`, `velin-sepia`, `velin-drop-shadow-*`, extended `velin-backdrop-*`, and `velin-glass` / `velin-glass-strong` composites.
- **Chart-animation utilities:** new `utilities/chart-animation.css` with `velin-stroke-draw`, `velin-sparkline-glow`, `velin-value-bump`, `velin-live-pulse`, `velin-count-fade` keyframes and matching `velin-chart-line` / `velin-chart-area` / `velin-chart-glow` / `velin-spark-tick` / `velin-live-pulse` classes &mdash; all reduced-motion safe.
- **Three new Web Components:** `<velin-sparkline>` (animated draw-in + live `update()` API), `<velin-counter>` (rAF + `Intl.NumberFormat` count-up with currency/percent/locale), `<velin-live-dot>` (slotted realtime indicator).
- **Two motion helpers:** `velin-reveal.js` (`initReveal()` plus `[data-velin-reveal-auto]` auto-init) and `velin-flip.js` (`flipReorder()`, `filterList()` plus `[data-velin-flip]` + `[data-velin-filter-value]` / `[data-velin-filter-input]` auto-wiring).
- **Demo upgrades:** crypto dashboard uses sparkline tick + counters + live-dot; forum and shop chips/searches drive real FLIP-animated list filtering; grid/list view toggle on the shop animates layout changes via FLIP.
- **CLI `velinstyle scaffold`:** prompt-based HTML from blueprint composition (`cli/scaffold.js`, `scaffold-recipes.json`); `list-intents`, `-o`, `--json`.
- **CLI `velinstyle layout`:** `audit`, `suggest`, and `fix` for flex/grid/responsive issues (`cli/layout-audit.js`).
- **Docs:** new pages `docs/utilities/motion.html`, `docs/utilities/filter-effects.html`, `docs/utilities/chart-animation.html`, `docs/components/sparkline.html`, `docs/components/counter.html`, `docs/components/live-dot.html`; `docs/guides/prompt-scaffolding.html`, `docs/guides/responsive-layout.html`; layout and getting-started sections for 0.8.0 CLI.

### Changed
- `src/velinstyle.css` imports the new filter-effects + chart-animation utilities.
- `components/index.js` exports the three new WCs and two helpers.
- `index.html` drops the inline scroll-reveal IIFE in favour of the shared `velin-reveal` helper via `data-velin-reveal-auto`.
- CLI help version **0.8.0**; package version **0.8.0**.



### Added
- **`velinstyle prefix` JSON maps:** optional `velinstyle-prefix-map.json` next to the migrated tree (or `--map <file>`) supplies explicit `token` → `velin-class` replacements; merged after auto map, overrides catalog and `--bootstrap-display`. Keys `_*` / `$*` ignored. Sample: `examples/velinstyle-prefix-map.sample.json`. Documented in README, README.de, `docs/migration.html`, `docs/guides/existing-project.html`.

## Unreleased (Internal Publication) → [0.7.5] - 2026-05-16

### Added
- **Security:** hardened `sanitize.js` (`stripControlChars`, `escapeHTMLAttribute`, `createSafeHTML`, stricter `sanitizeURL`); CLI scanner rules (`no-meta-refresh`, `no-inline-style`, `no-data-html-uri`, `dangerous-target`, `integrity-missing`, `postmessage-wildcard`) with `--only` filter; `npm run test:security`.
- **Mobile:** `safe-area.css` utilities (`.velin-pb-safe`, `.velin-mobile-only` / `.velin-desktop-only`).
- **Animations:** 10 utility classes in `animation.css` with `prefers-reduced-motion` and fine-pointer hover gating.
- **Web Components (8):** `velin-combobox`, `velin-bottom-nav`, `velin-sheet`, `velin-segmented-control`, `velin-rating`, `velin-menubar`, `velin-command`, `velin-announcer`; shared `shadow-a11y-styles.js`.
- **CLI blueprints (8):** `bottom-nav-mobile`, `empty-state`, `cookie-consent`, `filter-bar`, `notification-center`, `settings-panel`, `onboarding`, `pricing-table` (22 total).
- **Vite + React:** `templates/vite-react-velinstyle`, expanded `@velinstyle/react` wrappers, `docs/guides/react-vite-starter.html`.

### Changed
- **`components/index.js`:** exports for new WCs and sanitize helpers.
- **`reset.css`:** FOUC guard for new custom element tags.

## [0.7.0](https://github.com/SkyliteDesign/velinstyle/releases/tag/v0.7.0) - 2026-05-16

### Added
- **WCAG 2.2 CSS:** `focus-not-obscured.css`, `target-size.css`, optional AAA contrast via `data-velin-contrast="aaa"`.
- **Expanded `forced-colors` and `preferences.css`** for switch, pagination, tables, stepper, nav.
- **Security layer:** `security.css` moved to dedicated `@layer security` (no longer in `a11y`).
- **CLI scanner:** rules `a11y/heading-order`, `a11y/landmark-main`, `a11y/interactive-aria-hidden`, `a11y/iframe-title`.
- **`npm run test:contrast`:** OKLCH token pair verification script.
- **`docs/assets/docs-a11y.js`:** nav toggle and theme panel without inline handlers.
- **A11y patterns:** menu button, disclosure, data table, loading/busy sections.

### Changed
- **Web Components:** keyboard/ARIA improvements for collapse, popover, tooltip, carousel (pause control), dropdown (type-ahead), drawer (`aria-labelledby`), accordion, modal/drawer (`inert` background).
- **`focus-manager.js`:** visibility-aware focusables, `setBackgroundInert` / `clearBackgroundInert`.
- **`tests/a11y/run.js`:** recursive `docs/**` and `samples/**`, WCAG 2.2 axe tags, IIFE hydration, `matchMedia` polyfill.

### Fixed
- **Target size:** alert/toast close, btn `--sm`, pagination ellipsis meet 44px minimum via `target-size.css`.

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
