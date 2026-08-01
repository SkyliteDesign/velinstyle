# AI Skills Guide

Registry-first skills for humans and agents. **Foundation / beta** — not an auto-builder for full shop/admin products.

Site twin: [velinstyle.info AI Skills](https://velinstyle.info/docs/guides/ai-skills.html) · Strategy: [`../strategy/AI_SKILLS.md`](../strategy/AI_SKILLS.md)

---

## Why this exists

Without a skill registry, every AI tool invents different VelinStyle advice. Skills give a **shared vocabulary**: capability, inputs/outputs, confidence, and workflow steps.

They **support** developers (Mensch → Framework → KI). They do not replace accessibility ownership or design judgment.

---

## Quick start

```bash
velinstyle skills list
velinstyle skills list --capability review
velinstyle skills show scaffold.landing --human
velinstyle skills doctor
velinstyle workflow landingpage --json
velinstyle skills install frontend
```

---

## Concepts

| Concept | Meaning |
|---------|---------|
| **Skill record** | One capability (scaffold, review, release gate, …) |
| **Registry** | `packages/velinstyle-skills/registry.json` (+ export `@birdapi/velinstyle/skills-registry`) |
| **Pack** | Curated group of skills |
| **Bundle** | Larger installable set |
| **Template** | Project / page starter tied to skills |
| **Workflow graph** | Ordered steps (`landingpage`, `component-ship`, `release-gate`, …) |
| **Skill engine** | Runtime helpers in `packages/skill-engine` |

Human prose for agents: `packages/velinstyle-skills/skills/**/SKILL.md`

---

## How developers use it

1. Discover: `skills list` / `skills show --human`  
2. Integrity: `skills doctor` (fail CI if demo/doc paths break)  
3. Orchestrate: `workflow <id> --json`  
4. Ship HTML with **`create` / `scaffold` / `check`** — not only `skills run`

`skills run` often **inspects** steps (dry-run). It is not a silent HTML rewriter.

---

## How AI tools use it

1. Read `dist/llms.txt` + `dist/velin-agent.json` (`velinstyle meta`)  
2. Consult the skills registry for allowed capabilities  
3. Follow workflow graphs instead of free-form guessing  
4. Prefer official blueprints / create kinds over invented class soup

Page-level: `velinstyle meta page my.html --write`

---

## Lifecycle metadata

- `priority`: core / recommended / advanced / experimental  
- `status`: draft → experimental → beta → stable → deprecated  
- `confidence`: high / medium / low  
- `compatibility`: framework / cli / agent / engine ranges  

---

## Honesty

- Excellent for landings / docs / simple admin starters  
- **Not** a claim that multipage shop + enterprise admin kits are done  
- Path integrity is enforced — broken sample links are a **docs failure**, caught by `skills doctor`

---

## Related

- Design Intelligence: [`design-intelligence.md`](design-intelligence.md)  
- CLI ship surface: [`cli-ship-surface.md`](cli-ship-surface.md)  
- Architecture: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)
