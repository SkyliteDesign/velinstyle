---
name: velin-ai-plan-scaffold-review
description: Runs the canonical AI workflow from prompt to reviewed HTML.
---

# AI Plan Scaffold Review

## Goal
Deliver ai plan scaffold review outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: ai-orchestration, build, review.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: plan, scaffold, review
- Dependencies: velin-dev-plan-first, velin-dev-page-scaffold, velin-review-page-gate

## Workflow
1. Validate inputs: prompt.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: html, review-json.

## Rules
- Respect status: beta.
- Respect priority: core.
- Respect confidence: high.
- Do not contradict DESIGN_RULES or DESIGN_INTELLIGENCE.

## Best Practices
- Keep changes scoped to one goal per section.
- Prefer deterministic CLI output over ad-hoc edits.
- Validate before release with review/security/perf gates.

## Examples
- Prompt example: "Run velin-ai-plan-scaffold-review for this page."
- CLI bridge example: `velinstyle plan`

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
- Primary outputs: html, review-json.
