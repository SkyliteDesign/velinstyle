---
name: velin-components-select-compose
description: Chooses component set that matches page intent and constraints.
---

# Select Components

## Goal
Deliver select components outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: build.

## Prerequisites
- Framework compatibility: 1.2.0 to 2.x
- CLI: blueprint
- Dependencies: none

## Workflow
1. Validate inputs: prompt, docs.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: html, checklist.

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
- Prompt example: "Run velin-components-select-compose for this page."
- CLI bridge example: `velinstyle blueprint`

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
- Primary outputs: html, checklist.
