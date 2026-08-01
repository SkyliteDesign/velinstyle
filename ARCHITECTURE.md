# VelinStyle Architecture

How the stable framework and the 1.2 Design Intelligence / AI Foundation layers fit together.  
Start here after [`GETTING_STARTED.md`](GETTING_STARTED.md). Product north star: [`VELINSTYLE_2030.md`](VELINSTYLE_2030.md).

---

## Layer model

```
Mensch (intent, a11y ownership, product taste)
    ↓
Framework (CSS · WC · Runtime · CLI)     ← Stable
    ↓
Design Intelligence (plan · review · KG · registries · constraints)  ← Beta
    ↓
AI (skills · workflows · agent metadata)  ← Beta / Foundation
```

AI **assists** scaffolding and review. It does not own accessibility or ship decisions.

---

## Stable core

### CSS (`src/`)

- Cascade **layers**, OKLCH **tokens**, BEM components, utilities
- Themes via `data-velin-theme`; contrast via `data-velin-contrast`
- Lite preset (`build --preset lite`) for marketing budgets
- Honesty work: logical spacing, app-shell utilities, unknown-class scanning

### Web Components (`components/`)

- Progressive enhancement over light DOM
- Shared focus / inert helpers; a11y contracts per component
- 40 canonical tags; legacy `*-wc` aliases remain for loaders

### Runtime (`core/` + `runtime-entry`)

| Module | Role |
|--------|------|
| `search` | Fuzzy offline search, optional worker |
| `motion` | Reveal, stagger, scroll-driven, reduced-motion safe |
| `highlight` | Lazy language packs |
| `attributes` | Declarative `velin-*` HTML bridges |
| `meta` | Agent bundle builders |

Tree-shake via package exports; `bootFromDOM()` for attribute-driven pages.

### CLI (`cli/`)

Ship surface: `init`, `create`, `build`, `serve`, `doctor`, `check`, `scan`, plus tokens/docs/perf tooling.  
Intelligence surface: `plan`, `review`, `skills`, `workflow`, `meta`, `wc api`.

---

## Design Intelligence (Beta)

Ordinary CSS frameworks stop at classes. VelinStyle encodes **what a good page is**.

| Piece | Role |
|-------|------|
| **Knowledge Graph** | Seed catalog: components / tokens purpose & compatibility (`core/meta/knowledge/`) |
| **Page Registry** | Page types (landing, docs, dashboard, shop, …) |
| **Section Registry** | Section graphs + blueprints (hero, FAQ, CTA, …) |
| **Design Constraints** | Packs for hero / FAQ / contact patterns |
| **Prompt Engine** | `velinstyle plan` — analyze → plan JSON → render |
| **Review Engine** | `velinstyle review` — heuristic scores + gate by profile |

Profiles: `marketing` · `app` · `docs` · `fragment` · `ecommerce`.  
Thin-content floors prevent junk HTML from scoring conversion/SEO at 10.

Schemas under `schemas/` (validated in `release:check`). North star: [`VELINSTYLE_2030.md`](VELINSTYLE_2030.md). Strategy deep-dives are maintainer-local (`interne_docs/strategy/`).

---

## AI Foundation (Beta / Foundation)

### Why skills exist

Agents and humans need the **same** vocabulary for VelinStyle tasks (scaffold a landing, run a release gate, wire a form summary). Skills are structured records — not prompts pasted into chat.

### Skill system

| Asset | Meaning |
|-------|---------|
| **Skill record** | Capability, I/O, confidence, cost hints, dependencies |
| **Registry** | `@birdapi/velinstyle/skills-registry` + `packages/velinstyle-skills` |
| **Packs / Bundles** | Curated groups of skills |
| **Templates** | Project / page starters tied to skills |
| **Workflow graphs** | Ordered graphs (`landingpage`, `component-ship`, `release-gate`, …) |

CLI: `velinstyle skills …`, `velinstyle workflow …`, `skills doctor` (path integrity).  
Engine: `packages/skill-engine`. Public guide: docs; strategy notes are maintainer-local (`interne_docs/strategy/AI_SKILLS.md`).

### AI Metadata

- Global: `dist/velin-agent.json`, `dist/llms.txt` (`velinstyle meta`)
- Page: `<script type="application/vnd.velinstyle.meta+json" id="velin-meta">`
- Embeds KG / pages / sections / constraints for Cursor, Copilot, custom agents

Guide: [velin-meta](https://velinstyle.info/docs/guides/velin-meta.html)

---

## Quality pipeline

```
doctor → blueprint --strict → scan → review → (optional) skills doctor
                 ↑
            velinstyle check
```

- **Scan** — static a11y / security / CSS honesty / PII  
- **Review** — design-intelligence heuristics (not perceptual QA)  
- **Release sync** — `npm run release:check` keeps version, counts, schemas, site copies honest  

Fit: consumer scaffolds and app pages. Not meant as a single gate over an entire marketing docs monorepo full of demos.

---

## Packages

```
packages/
├── react/                 # @velinstyle/react — typed wrappers
├── skill-engine/          # Skill runtime / graph helpers
└── velinstyle-skills/     # Official skill records + registry
```

---

## Maturity

| Layer | Status |
|-------|--------|
| CSS / Utilities / Runtime / WC / CLI core / Blueprints | **Stable** |
| Review · Prompt · KG · Constraints · AI Metadata | **Beta** |
| Skills · Workflows · Registries | **Foundation** |
| Studio · Utility Engine Generator | **Planned** |

ADRs and experimental inventory: maintainer-local under monorepo `interne_docs/strategy/` (not in this Git repo — see [`docs/strategy/README.md`](docs/strategy/README.md)).

---

## Dogfooding

[velinstyle.info](https://velinstyle.info) runs on VelinStyle. Site sync and release guards live in the sibling `velinstyle-site` repo and `scripts/check-release-sync.mjs`.
