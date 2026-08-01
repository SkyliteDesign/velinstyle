---
name: velin-themes-apply-token
description: Applies built-in themes through token-safe patterns.
---

# Theme Apply Token

## Goal
Deliver theme apply token outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: theme, build.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: themes, tokens
- Dependencies: none

## Workflow
1. Validate inputs: tokens, html.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: css, html.

## Rules
- Respect status: stable.
- Respect priority: core.
- Respect confidence: high.
- Do not contradict DESIGN_RULES or DESIGN_INTELLIGENCE.

## Best Practices
- Keep changes scoped to one goal per section.
- Prefer deterministic CLI output over ad-hoc edits.
- Validate before release with review/security/perf gates.

## Examples
- Prompt example: "Run velin-themes-apply-token for this page."
- CLI bridge example: `velinstyle themes`

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
- Primary outputs: css, html.
