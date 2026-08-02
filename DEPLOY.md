# Deploying a VelinStyle project

How to put a VelinStyle site online. Not a hosting vendor guide — patterns that work with static hosts and common stacks.

---

## What to ship

| Asset | Required? |
|-------|-----------|
| Your HTML / app | Yes |
| `velinstyle.min.css` (or lite build) | Yes |
| Themes under `themes/` if you use theme files | Usually |
| `velin-icons.svg` next to CSS (or sprite meta) | If you use `<velin-icon>` |
| `velinstyle-components.min.js` (or tree-shaken imports) | If you use WCs / attributes |
| `velin-agent.json` / `llms.txt` | Optional (agents / docs) |

Built npm packages include `dist/`. From source: `npm run build` first.

---

## Static hosting (Netlify, Cloudflare Pages, GitHub Pages, S3, …)

1. Scaffold or build your site locally.  
2. Ensure CSS/JS URLs are **relative** or CDN-pinned.  
3. Upload the folder `serve` already previews.

```bash
npx @birdapi/velinstyle create landing ./site
cd site
npx @birdapi/velinstyle check .
# deploy ./site (or your build output)
```

**CDN pin** (production):

```html
<link rel="stylesheet" href="https://unpkg.com/@birdapi/velinstyle@1.2.1/dist/velinstyle.min.css">
```

Prefer a fixed version — never `@latest` in production.

**Lite CSS** for marketing budgets:

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
velinstyle check . --profile marketing   # or app / docs
```

- [ ] No unknown `velin-*` classes on critical pages  
- [ ] Theme + contrast attributes set on `<html>`  
- [ ] Icons sprite reachable  
- [ ] Images have dimensions / lazy loading where appropriate (`perf audit`)  
- [ ] Version pins match what you tested  

---

## Common deploy failures

| Symptom | Fix |
|---------|-----|
| Unstyled HTML | Missing CSS path or forgot `npm run build` |
| Icons empty | Sprite 404 — copy `velin-icons.svg` |
| Components inert | JS bundle not loaded / wrong `type="module"` |
| Broken theme switch | `themes/` not deployed or wrong `themes-base` |
| CI red on `check` | Fix markup; don’t disable trust rules |

More: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
