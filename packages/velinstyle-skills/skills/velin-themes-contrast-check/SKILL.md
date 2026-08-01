---
name: velin-themes-contrast-check
description: Checks token contrast and theme compatibility for WCAG goals.
---

# Theme Contrast Check

## Goal
Deliver theme contrast check outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: accessibility, theme, review.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: review, scan
- Dependencies: velin-themes-apply-token

## Workflow
1. Validate inputs: html, screenshot, tokens.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: report, review-json.

## Rules
- Respect status: beta.
- Respect priority: recommended.
- Respect confidence: high.
- Do not contradict DESIGN_RULES or DESIGN_INTELLIGENCE.

## Best Practices
- Keep changes scoped to one goal per section.
- Prefer deterministic CLI output over ad-hoc edits.
- Validate before release with review/security/perf gates.

## Examples
- Prompt example: "Run velin-themes-contrast-check for this page."
- CLI bridge example: `velinstyle review`

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
- Primary outputs: report, review-json.
