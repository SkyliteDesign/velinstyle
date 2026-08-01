# VelinStyle 1.2.0 — Release Notes

**Release:** 1.2.0 (2026-08-01)  
**Status:** Cut ready — publish when uploading  
**Companion docs:** [`README.md`](README.md) · [`GETTING_STARTED.md`](GETTING_STARTED.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`CHANGELOG.md`](CHANGELOG.md) · [`UPGRADING.md`](UPGRADING.md)

---

## What is 1.2.0?

VelinStyle 1.2 strengthens the **production CSS + Web Components core** and introduces the first **Design Intelligence** and **AI Foundation** systems. Plan/Review, Knowledge Graph, registries, and skills ship as **Beta / Foundation** — usable now, expanding later. Studio and a full Utility Engine generator remain **planned**.

Product order stays **Mensch → Framework → KI**.

**Best fit today:** marketing landings, documentation shells, and simple admin starters (`create` + `check`).  
**Not yet:** sole primary stack for large multipage shop + enterprise admin without significant custom work.

---

## Highlights

### Framework (Stable)
- OKLCH themes, AAA-oriented defaults, runtime (`bootFromDOM`, search, motion, highlight, attributes)
- Logical spacing honesty, app-shell utilities, lite CSS preset for marketing budgets
- Stronger static gates: nested interactive, inline contrast, role=button, unknown classes, …

### Design Intelligence (Beta)
- **Prompt Engine** — `velinstyle plan` (analyze → plan JSON → render)
- **Review Engine** — `velinstyle review` with profiles (`marketing` | `app` | `docs` | `fragment` | `ecommerce`)
- **Knowledge Graph** seed + **page/section registries** + design constraints (hero / FAQ / contact)

### AI Foundation (Beta)
- **40 skills**, packs, bundles, templates, workflow graphs
- CLI: `velinstyle skills …`, `velinstyle workflow …`, `skills doctor`
- Richer `velin-agent.json` / `llms.txt`

### CLI ship surface
| Command | Role |
|---------|------|
| `create landing\|dashboard\|docs\|auth` | Opinionated scaffolds + vendor copy |
| `check` | doctor + blueprints + scan + review (`--json` / `--sarif`) |
| `serve` / `doctor` | Preview + environment honesty |
| `wc api <tag>` | Human-readable WC API from source |
| `build --preset lite` | Smaller marketing CSS |

### New components
- `<velin-calendar>`
- `<velin-file-dropzone>`
- `<velin-data-table editable>` (plus existing data-table / form-summary from 1.1)

### Blueprints
- Marketing/app additions: `split-hero`, `pricing-band`, `app-chrome`, `ops-console`
- Blueprint `--strict` CI so scaffolds cannot emit dead classes

---

## Maturity

| Area | Status |
|------|--------|
| CSS Framework | Stable |
| Utilities | Stable |
| Runtime | Stable |
| Web Components | Stable |
| CLI | Stable |
| Blueprints | Stable |
| Review Engine | Beta |
| Prompt Engine | Beta |
| Knowledge Graph | Beta |
| AI Metadata | Beta |
| AI Skills / Workflows | Beta / Foundation |
| Studio | Planned |
| Utility Engine Generator | Planned |

---

## Quick start (after publish)

```bash
npm i @birdapi/velinstyle@1.2.0
npx velinstyle create landing ./my-site
cd my-site
npx velinstyle serve .
npx velinstyle check .
```

Offline WC notes land under `vendor/velinstyle/docs/`. Prefer `velinstyle wc api velin-toast` when exploring APIs.

---

## Upgrade from 1.1.0

1. Bump to `@birdapi/velinstyle@1.2.0` when published.  
2. Refresh vendor copies if you use offline `create` / `init` assets.  
3. Run `doctor` + `check` (use `--profile app` for admin shells).  
4. Expect stricter scan/review on previously soft pages — fix markup, don’t weaken gates.

Full steps: [`UPGRADING.md`](UPGRADING.md).

---

## Security

- Bumped **`isomorphic-dompurify` to 3.21.0** (prod tree). Pre-upload gate: `npm run test:security` (16/16) + `npm audit --omit=dev` → **0**.
- Maintainer report (local only): `interne_docs/gesamtbestandsaufnahme/v1.2.0/security-audit/SECURITY_AUDIT_1.2.0.md`

## Breaking changes

**None** for public CSS/JS contracts relative to 1.1.0.  
Deprecated `*-wc` aliases remain available.

---

## Where to dig deeper

| Topic | Link |
|-------|------|
| Full technical delta | [`CHANGELOG.md`](CHANGELOG.md) → Unreleased + `[1.2.0]` |
| Design Intelligence | `interne_docs/strategy/DESIGN_INTELLIGENCE.md` (lokal, nicht im Git) |
| AI Skills strategy | `interne_docs/strategy/AI_SKILLS.md` (lokal, nicht im Git) |
| Landing in 15 minutes | [`docs/guides/landing-15-min.html`](docs/guides/landing-15-min.html) |
| Components | [`docs/components.html`](docs/components.html) |

---

## Why this release

- **Developer experience** — create → serve → check without broken help or dead skill links  
- **Accessibility** — trust rules and form/table primitives that match WCAG intent  
- **Maintainability** — blueprint strictness, release sync, skills path doctor  
- **AI integration** — registry-first skills and agent metadata without overselling apply-loops  
- **Honesty** — beta labels and clear “not yet” for shop/admin primary stacks  
