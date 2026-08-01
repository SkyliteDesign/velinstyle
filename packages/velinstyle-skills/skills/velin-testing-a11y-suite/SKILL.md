---
name: velin-testing-a11y-suite
description: Runs accessibility test suite and triages regressions.
---

# Testing A11y Suite

## Goal
Deliver testing a11y suite outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: test, accessibility.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: test:a11y
- Dependencies: velin-a11y-scan-fix

## Workflow
1. Validate inputs: html.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: report.

## Rules
- Respect status: stable.
- Respect priority: recommended.
- Respect confidence: high.
- Do not contradict DESIGN_RULES or DESIGN_INTELLIGENCE.

## Best Practices
- Keep changes scoped to one goal per section.
- Prefer deterministic CLI output over ad-hoc edits.
- Validate before release with review/security/perf gates.

## Examples
- Prompt example: "Run velin-testing-a11y-suite for this page."
- CLI bridge example: `velinstyle test:a11y`

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
