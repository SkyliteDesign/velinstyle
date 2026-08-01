---
name: velin-utilities-token-map
description: Documents how utility usage maps to token taxonomy.
---

# Utilities Token Map

## Goal
Deliver utilities token map outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: theme, documentation.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: tokens
- Dependencies: velin-utilities-layout-apply

## Workflow
1. Validate inputs: tokens, css.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: markdown, report.

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
- Prompt example: "Run velin-utilities-token-map for this page."
- CLI bridge example: `velinstyle tokens`

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
- Primary outputs: markdown, report.
