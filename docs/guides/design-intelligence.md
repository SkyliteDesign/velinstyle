# Design Intelligence (Beginner Guide)

**Status:** Beta / Foundation — usable now; schemas and heuristics still expand.  
Strategy deep dive: [`../strategy/DESIGN_INTELLIGENCE.md`](../strategy/DESIGN_INTELLIGENCE.md) · Architecture: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)

Ordinary CSS frameworks give you **classes**. Design Intelligence gives you **structure**: what pages exist, which sections belong together, constraints for heroes/FAQs/contacts, and a **review** gate.

---

## Why it exists

Tailwind/Bootstrap stop at styling. Teams still invent page structure ad hoc. VelinStyle encodes:

1. **Page types** (landing, docs, dashboard, shop, …)  
2. **Section graphs** (hero → benefits → FAQ → CTA)  
3. **Constraints** (e.g. hero needs a real CTA)  
4. **Plan → render → review** so scaffolds are checkable  

AI later consumes the same graphs — **Mensch → Framework → Design Intelligence → AI**.

---

## Pieces

| Piece | What you use | Where it lives |
|-------|----------------|----------------|
| Knowledge Graph | Agent/context seed (components + tokens purpose) | `core/meta/knowledge/` |
| Page Registry | Page-type definitions | `docs/generated/intelligence/pages.json` |
| Section Registry | Section / blueprint graphs | `…/sections.json` |
| Design Constraints | Hero / FAQ / contact packs | `core/meta/design-constraints/` |
| Prompt Engine | `velinstyle plan` / `scaffold` | `cli/prompt-engine.js` |
| Review Engine | `velinstyle review` / `check` | `cli/review.js` |
| Schemas | Contracts for CI | `schemas/` |

---

## Practical workflow

```bash
# 1) Plan only (JSON — no HTML)
velinstyle plan "SaaS landing with pricing and FAQ" --json

# 2) Scaffold HTML from a prompt
velinstyle scaffold "Steuerberater Landingpage mit Kontakt" -o out.html

# 3) Or start from an opinionated project
velinstyle create landing ./my-site

# 4) Review / gate
velinstyle review ./my-site/index.html --profile marketing
velinstyle check ./my-site --profile marketing
```

### Profiles

| Profile | Use when |
|---------|----------|
| `marketing` | Landings, campaign pages |
| `app` | Dashboards / admin shells (no hero-CTA pressure) |
| `docs` | Documentation |
| `fragment` | Partial HTML snippets |
| `ecommerce` | Shop-oriented pages |

Thin-content floors stop junk pages from scoring SEO/conversion at 10.

---

## How this differs from “just CSS”

| Without DI | With DI |
|------------|---------|
| Paste utilities until it looks ok | Plan sections from known page types |
| Hope a11y is fine | `scan` + `review` gates |
| Agents guess class names | Agents read registries + `velin-agent.json` |

---

## Best practices

1. Prefer `create` / `scaffold` over blank files for first pages.  
2. Always run `check` before calling a page “done”.  
3. Pick the **correct review profile** — app pages fail marketing hero rules.  
4. Treat review scores as **heuristics**, not perceptual design QA.  
5. Keep claims honest: DI is beta; studio is planned.

---

## Related

- Prompt scaffolding (site): [prompt-scaffolding](https://velinstyle.info/docs/guides/prompt-scaffolding.html)  
- Landing in 15 min: [landing-15-min](https://velinstyle.info/docs/guides/landing-15-min.html)  
- AI Skills: [`ai-skills.md`](ai-skills.md)  
- Velin-Meta: [velin-meta](https://velinstyle.info/docs/guides/velin-meta.html)
