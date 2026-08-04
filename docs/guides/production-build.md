# Production Builder

**Build only what your project actually uses.**

Do not ship the full framework blindly. Content-aware trim for CSS, JS (Web Components), themes, icons, fonts, and motion — with a size report.

```bash
npx velinstyle build --production
# alias:
npx velinstyle production .
```

## Output

Default directory: `./dist/velin-production/`

| File | Purpose |
|------|---------|
| `velinstyle.css` | Trimmed + LightningCSS-bundled CSS |
| `velinstyle.js` | `register([...detected])` runtime stub |
| `velin-icons.svg` | Subset sprite |
| `themes/*.css` | Only themes found in content / config |
| `production-report.txt` / `.json` | Size report |
| `used.json` | Extract + graph closure |

## Flags

```bash
velinstyle production [path] \
  --out ./dist/velin-production \
  --explain \
  --watch \
  --report ./report.json \
  --safelist modal.css,nordic,check \
  --no-js --no-icons --no-themes --no-motion --no-minify
```

## Config (`velinstyle.config.js`)

```js
export default {
  production: {
    out: './dist/velin-production',
    content: ['./**/*.{html,js,jsx,ts,tsx,vue}'],
    safelist: [],
    themes: 'auto', // or ['nordic']
  },
};
```

## vs `--preset lite`

| | Lite | Production |
|--|------|------------|
| Scan | No | Yes (your HTML/JS) |
| Scope | Layer subset | CSS + JS + themes + icons + motion |
| Go-live | Good start | Preferred publish path |

## Review

`velinstyle review` includes `scores.optimization` and soft warnings when pages still link the full CDN bundle.

## Go-live checklist

1. `velinstyle doctor`
2. `velinstyle production . --explain -o ./dist/velin-production`
3. Point HTML at `dist/velin-production/velinstyle.css` + `velinstyle.js` (+ themes/icons from that folder)
4. `velinstyle review .` — check `scores.optimization`
5. `velinstyle check . --profile marketing` (or `app` / `docs`)
6. Deploy the site **with** the production assets; pin package **1.2.2+**
