---
name: velin-components-api-contract
description: Validates component contracts and event/API usage.
---

# API Contract

## Goal
Deliver api contract outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: documentation, review.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: review
- Dependencies: velin-components-select-compose

## Workflow
1. Validate inputs: html, docs.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: markdown, report.

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
- Prompt example: "Run velin-components-api-contract for this page."
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
- Primary outputs: markdown, report.
