# Deploying a VelinStyle project

How to put a VelinStyle site online. Not a hosting vendor guide — patterns that work with static hosts and common stacks.

---

## What to ship

| Asset | Required? |
|-------|-----------|
| Your HTML / app | Yes |
| **Preferred:** `dist/velin-production/` from `velinstyle production` | Yes for go-live |
| Fallback: `velinstyle.min.css` (or lite build) | If not using Production output |
| Themes under `themes/` if you use theme files | Usually |
| `velin-icons.svg` next to CSS (or sprite meta) | If you use `<velin-icon>` |
| Production `velinstyle.js` stub / or full `velinstyle-components.min.js` | If you use WCs / attributes |
| `velin-agent.json` / `llms.txt` | Optional (agents / docs) |

Built npm packages include `dist/`. From source: `npm run build` first. For publish, prefer the Production Builder over shipping the full CDN CSS/IIFE.

---

## Static hosting (Netlify, Cloudflare Pages, GitHub Pages, S3, …)

1. Scaffold or build your site locally.  
2. Run Production Builder and ensure CSS/JS URLs point at that output (or CDN-pinned full assets).  
3. Upload the folder `serve` already previews.

```bash
npx @birdapi/velinstyle create landing ./site
cd site
npx @birdapi/velinstyle production . --explain -o ./dist/velin-production
npx @birdapi/velinstyle check .
# deploy ./site (with production assets linked)
```

**CDN pin** (production — full bundle fallback):

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.2.2/dist/velinstyle.min.css">
```

Prefer a fixed version — never `@latest` in production. Prefer self-hosted `dist/velin-production/` when possible.

**Lite CSS** for marketing budgets (no content scan):

```bash
velinstyle build --preset lite -o ./assets/velin-lite.css
```

---

## Vite / React

Use `templates/vite-react-velinstyle` or `@velinstyle/react`. Deploy the Vite `dist/` output as usual (`vite build`). Import CSS once in the app entry:

```js
import '@birdapi/velinstyle/css';
```

---

## WordPress / Laravel

See site guides:

- [WordPress](https://velinstyle.info/docs/guides/wordpress.html)  
- [Laravel](https://velinstyle.info/docs/guides/laravel.html)

Enqueue built CSS/JS from `vendor` or npm; don’t point production at an unfinished monorepo `src/`.

---

## Pre-deploy checklist

```bash
velinstyle doctor
velinstyle production . --explain -o ./dist/velin-production
velinstyle review .          # scores.optimization
velinstyle check . --profile marketing   # or app / docs
```

- [ ] HTML links `dist/velin-production/` (not blind full CDN) when publishing trimmed assets  
- [ ] No unknown `velin-*` classes on critical pages  
- [ ] Theme + contrast attributes set on `<html>`  
- [ ] Icons sprite reachable (production subset or full)  
- [ ] Images have dimensions / lazy loading where appropriate (`perf audit`)  
- [ ] Version pins match what you tested (**1.2.2+**)  

See also: [`docs/guides/production-build.md`](docs/guides/production-build.md).

---

## Common deploy failures

| Symptom | Fix |
|---------|-----|
| Unstyled HTML | Missing CSS path or forgot `production` / `npm run build` |
| Icons empty | Sprite 404 — copy `velin-icons.svg` from production out or dist |
| Components inert | JS stub/bundle not loaded / wrong `type="module"` |
| Broken theme switch | `themes/` not deployed or wrong `themes-base` |
| CI red on `check` | Fix markup; don’t disable trust rules |

More: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
