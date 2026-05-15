# Contributing to VelinStyle

Thank you for your interest in contributing! VelinStyle is built by the community, and we welcome contributions of all sizes.

**[Deutsche Version / German Version](CONTRIBUTING.de.md)**

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/velinstyle.git
   cd velinstyle
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Build the project:
   ```bash
   npm run build
   ```

### Why `npm run build` matters

The `dist/` directory is listed in `.gitignore` and is **not** in the repository. After `git clone`, you must run `npm run build` (or individual `npm run build:*` scripts) before opening `samples/*.html`, or running tests that expect built assets. Published npm packages include `dist/` from the release tarball.

For **local docs** or to mirror the GitHub Pages layout, run `npm run docs:prepare` (builds, patches doc asset paths, copies `dist/` to `docs/dist/`). Live docs: https://skylitedesign.github.io/velinstyle/

## Project structure

```
velinstyle/
├── src/                  # Source CSS (tokens, base, a11y, layout, components, utilities)
├── components/           # Web Components (JS source)
├── cli/                  # VelinStyle CLI (init, build, icons, scan, prefix, …)
├── icons/                # SVG icon source files + sprite builder
├── dist/                 # Built output (generated; do not edit directly)
├── docs/                 # Documentation pages (in-repo quick reference)
├── samples/              # Example pages
├── scripts/              # Build scripts
└── tests/                # Test files (`tests/setup.js` — Vitest/jsdom helpers)
```

The marketing site and extended docs at [velinstyle.info](https://velinstyle.info) live in a **separate repository** (`velinstyle-site`). Issues and PRs for that site belong there, not in this repo.

## Development Workflow

### CSS Changes

All CSS lives in `src/` and is organized by `@layer`:

```
@layer tokens, reset, base, a11y, layout, components, utilities, themes;
```

Edit source files in `src/`, then run `npm run build:css:dev` to rebuild.

### Web Components

Web Components live in `components/`. Each component is a single file defining a Custom Element.

Run `npm run build:js:dev` after small component edits. Before a release or when validating `docs/` offline, run **`npm run build`** so `dist/velinstyle-components.iife.js` exists (used by several HTML demos without `type="module"`). CI on `main` mirrors the build steps in [.github/workflows/ci.yml](.github/workflows/ci.yml), including the IIFE bundle.

### Icons

Add new SVG icons to `icons/svg/`. Ensure:
- `viewBox="0 0 24 24"`
- `fill="none"` and `stroke="currentColor"`
- Consistent `stroke-width="2"` and `stroke-linecap="round"`

Run `npm run build:icons` to regenerate the sprite.

## Guidelines

### Code Style

- **CSS**: Follow the `velin-` prefix convention for all classes, variables, and keyframes
- **JavaScript**: Use vanilla JS, no external dependencies in components
- **HTML**: Use semantic elements, ensure ARIA attributes are correct

### Accessibility Requirements

This is non-negotiable. Every contribution must:

- Maintain WCAG AA color contrast (4.5:1 minimum)
- Support keyboard navigation
- Include proper `:focus-visible` styles
- Work with `prefers-reduced-motion: reduce`
- Include appropriate ARIA attributes
- Support `forced-colors` (Windows High Contrast Mode)

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add velin-dialog component
fix: correct focus trap in velin-modal
docs: add keyboard navigation guide
style: adjust velin-btn padding tokens
```

## Submitting Changes

1. Use the **`main`** branch as the base (GitHub Actions runs on `main`).
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run **all** checks before opening a PR:
   - `npm run lint`
   - `npm test`
   - `npm run test:a11y`
   - `npm run build`
5. Commit and push
6. Open a Pull Request

## Mobile smoke test (manual)

If your change affects layout, navigation, or documentation pages, quickly verify on a **narrow viewport** (browser DevTools device mode or a real phone):

- [ ] No horizontal page scroll on `docs/*.html` or `samples/*.html` (unless a demo intentionally scrolls).
- [ ] Top **`.velin-nav`** hamburger opens/closes the menu; links are tappable (approx. 44×44px targets).
- [ ] For pages with **`.velin-doc-layout`**, the **“On this page”** sidebar is visible or scrollable on small screens (not `display: none` without replacement).
- [ ] One **Web Component** interaction (e.g. modal or theme toggle) still works with touch.

## Reporting Bugs

Use the [Bug Report template](https://github.com/SkyliteDesign/velinstyle/issues/new?template=bug_report.md) and include:

- Browser and version
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

## Requesting Features

Use the [Feature Request template](https://github.com/SkyliteDesign/velinstyle/issues/new?template=feature_request.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
