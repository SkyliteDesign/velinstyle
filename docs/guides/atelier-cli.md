# Atelier CLI

Pull curated **Atelier Library** showcases by number or id, and (beta) compose them into a page via Design Intelligence `scaffold` / `plan`.

**Atelier Library ≠ Velin Studio.** Studio Builder remains **planned**.

## Pull

```bash
npx @birdapi/velinstyle atelier list
npx @birdapi/velinstyle atelier 36 -o ./velin-atelier/36-calendar
npx @birdapi/velinstyle atelier 04-pricing --format vue -o ./src/atelier/04-pricing
```

- Short numbers map to curated ids only (`36` → `36-calendar`). SEO variants like `3600-…` are **not** matched.
- Default remote base: `https://velinstyle.info/atelier/library/`
- Local mirror: `--from <library-root>` or `VELINSTYLE_ATELIER_ROOT`

### Formats

| `--format` | Result |
|------------|--------|
| `html` (default) | `index.html`, `app.js`, `app.css` |
| `blade` / `vue` / `react` | Same assets **plus** an **integration shell** that mounts the vanilla showcase |

> **Limitation:** `--format blade|vue|react` writes an integration shell around the original Atelier vanilla showcase (HTML/JS/CSS + Web Components). It does **not** rewrite the template into idiomatic Blade/Vue/React. Native framework blocks are **planned** for a later release / Studio.

Each pull writes a `README.md` with the same limitation text.

## Compose (beta)

```bash
npx @birdapi/velinstyle scaffold --atelier 04,07 -o ./compose.html --from ./path/to/library
npx @birdapi/velinstyle plan --atelier 04,07
```

Composes curated Library showcases into one HTML shell (iframes / assets). Maturity: **beta** (usable; first automated tests cover fixture pulls). Blueprints remain the default for prompt-only `scaffold` when `--atelier` is omitted.

> Compose uses **Atelier Library** elements — not the Velin Studio product (planned).

## Maturity

| Surface | Status |
|---------|--------|
| `atelier` pull (HTML) | Shipped |
| `--format` wrappers | Shipped (wrappers only) |
| `scaffold` / `plan --atelier` compose | **Beta** |
| Native Blade/Vue/React blocks | **Planned** |
| Velin Studio Builder | **Planned** |
