---
name: velin-testing-visual-smoke
description: Runs visual smoke checks across key breakpoints.
---

# Testing Visual Smoke

## Goal
Deliver testing visual smoke outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: test, review.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: test:e2e
- Dependencies: velin-dev-page-scaffold

## Workflow
1. Validate inputs: html, screenshot.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: report.

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
- Prompt example: "Run velin-testing-visual-smoke for this page."
- CLI bridge example: `velinstyle test:e2e`

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
- Primary outputs: report.
