# Upgrading VelinStyle

## 1.2.0 → 1.2.1

**Status:** Current (`package.json` / Changelog = **1.2.1**).

### What you get

- **Transparency Framework (beta):** `@birdapi/velinstyle/transparency`, HTML bridge `velin-transparency`, claim taxonomy, CLI `transparency doctor|validate|report|export|migrate`
- Soft default policy (non-breaking for existing `check`); strict media rules via `--policy`

### Suggested upgrade steps

1. Bump to `@birdapi/velinstyle@1.2.1`.
2. Optionally label media with `velin-transparency` (or run `transparency migrate` dry-run first).
3. Run `npx velinstyle transparency doctor .` and `npx velinstyle check .`.

Full delta: [`CHANGELOG.md`](CHANGELOG.md) → `[1.2.1]`.

---

## 1.1.0 → 1.2.0

**Status:** Shipped. Current line is **1.2.1**.

Friendly overview: [`RELEASE_NOTES_1.2.0.md`](RELEASE_NOTES_1.2.0.md) · first build: [`GETTING_STARTED.md`](GETTING_STARTED.md) · full delta: [`CHANGELOG.md`](CHANGELOG.md).

### What you get

- **Design Intelligence Foundation (beta):** `velinstyle plan`, `velinstyle review`, knowledge graph seed, page/section registry, richer `velin-agent.json` / `llms.txt`
- **Ship surface:** `create landing|dashboard|docs|auth`, `serve`, `doctor`, `check` (`--json` / `--sarif`)
- **Trust scan:** nested interactive, inline contrast, role=button contract, unknown classes, invalid WC attrs, …
- **New WCs:** `<velin-calendar>`, `<velin-file-dropzone>`, `<velin-data-table editable>`
- **DX:** `wc api <tag>`, `skills doctor`, create vendor mini-docs under `vendor/velinstyle/docs/`
- **Review profiles:** `marketing` | `app` | `docs` | `fragment` | `ecommerce`

### Suggested upgrade steps

1. Bump dependency to `@birdapi/velinstyle@1.2.1` when published.
2. Rebuild / re-copy vendor assets if you used `create` / `init` offline copies.
3. Run `npx velinstyle doctor` and `npx velinstyle check .` (use `--profile app` for admin shells).
4. Skim CHANGELOG `[1.2.0]` for scan rules that may newly fail CI.

### Breaking / caution

- Stricter static scan/review may fail previously green pages (good — fix markup).
- Icon sprite default is relative/configurable (no hard-coded `/dist/velin-icons.svg`).
- Skills `run` remains dry-run/inspect — not an apply loop.
- Multipage **shop/admin kits are not included**; samples + custom CSS still required.

### Fit statement

**Yes** for marketing landings, docs, simple admin starters.  
**Not yet** as the sole primary stack for large ecommerce + enterprise admin products.
