---
name: velin-components-accessibility-map
description: Maps every chosen component to a11y expectations and test hooks.
---

# Component Accessibility Map

## Goal
Deliver component accessibility map outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: accessibility, documentation.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: docs
- Dependencies: velin-components-api-contract

## Workflow
1. Validate inputs: docs, html.
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
- Prompt example: "Run velin-components-accessibility-map for this page."
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
- Primary outputs: markdown, report.
