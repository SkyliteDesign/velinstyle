# `@velinstyle/skill-engine`

Internal runtime helpers for VelinStyle **AI Skills** (registry resolution, workflow graphs, install/run orchestration).

**Consumers:** `packages/velinstyle-skills` and the `velinstyle skills` / `workflow` CLI.

**Status:** Foundation / beta — not a standalone public product API yet.

## Docs

- Beginner: [`../../docs/guides/ai-skills.md`](../../docs/guides/ai-skills.md)
- Strategy: [`../../../interne_docs/strategy/AI_SKILLS.md`](../../../interne_docs/strategy/AI_SKILLS.md) (local monorepo)
- Architecture: [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)

## Usage

Prefer the CLI:

```bash
velinstyle skills list
velinstyle workflow landingpage --json
```

Direct imports are for framework tooling and advanced integrations — expect breaking changes until skills leave Foundation.
