---
name: velin-ai-skill-authoring
description: Authors new skills with registry-first metadata quality gates.
---

# AI Skill Authoring

## Goal
Deliver ai skill authoring outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: ai-orchestration, documentation.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: docs, meta
- Dependencies: velin-ai-agent-briefing

## Workflow
1. Validate inputs: markdown, docs, meta-json.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: markdown, registry-json.

## Rules
- Respect status: beta.
- Respect priority: advanced.
- Respect confidence: medium.
- Do not contradict DESIGN_RULES or DESIGN_INTELLIGENCE.

## Best Practices
- Keep changes scoped to one goal per section.
- Prefer deterministic CLI output over ad-hoc edits.
- Validate before release with review/security/perf gates.

## Examples
- Prompt example: "Run velin-ai-skill-authoring for this page."
- CLI bridge example: `velinstyle docs`

## Anti-Patterns
- Skipping dependency skills listed in `dependsOn`.
- Running deprecated/legacy skills by default.
- Ignoring `onlyIf` predicates.

## Checklist
- [ ] Inputs are present and typed.
- [ ] Dependencies resolved.
- [ ] Quality gate passed.
- [ ] Output matches declared format.

## Quality Rules
- Must satisfy a11y basics (labels, focus, contrast).
- Must keep velin-* naming conventions.
- Must avoid one-off undocumented tokens/classes.

## Output Format
- Primary outputs: markdown, registry-json.
