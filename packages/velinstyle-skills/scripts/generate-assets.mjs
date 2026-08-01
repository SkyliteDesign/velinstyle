import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf-8'));

const sectionTemplate = (skill) => `---
name: ${skill.id}
description: ${skill.description}
---

# ${skill.name}

## Goal
Deliver ${skill.name.toLowerCase()} outcomes with VelinStyle constraints.

## Description
Use this skill when capability targets include: ${skill.capabilities.join(', ')}.

## Prerequisites
- Framework compatibility: ${skill.compatibility.framework.min} to ${skill.compatibility.framework.max}
- CLI: ${skill.requiresCli.join(', ') || 'none'}
- Dependencies: ${(skill.dependsOn || []).join(', ') || 'none'}

## Workflow
1. Validate inputs: ${skill.inputs.join(', ')}.
2. Apply rules from DESIGN_RULES and registry metadata.
3. Execute required CLI steps when available.
4. Emit outputs: ${skill.outputs.join(', ')}.

## Rules
- Respect status: ${skill.status}.
- Respect priority: ${skill.priority}.
- Respect confidence: ${skill.confidence}.
- Do not contradict DESIGN_RULES or DESIGN_INTELLIGENCE.

## Best Practices
- Keep changes scoped to one goal per section.
- Prefer deterministic CLI output over ad-hoc edits.
- Validate before release with review/security/perf gates.

## Examples
- Prompt example: "Run ${skill.id} for this page."
- CLI bridge example: \`velinstyle ${skill.requiresCli[0] || 'review'}\`

## Anti-Patterns
- Skipping dependency skills listed in \`dependsOn\`.
- Running deprecated/legacy skills by default.
- Ignoring \`onlyIf\` predicates.

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
- Primary outputs: ${skill.outputs.join(', ')}.
`;

mkdirSync(join(root, 'skills'), { recursive: true });

for (const skill of registry.skills || []) {
  const targetPath = join(root, skill.prosePath);
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, sectionTemplate(skill), 'utf-8');
}

mkdirSync(join(root, 'packs'), { recursive: true });
for (const pack of registry.packs || []) {
  const text = `id: ${pack.id}
name: ${pack.name}
version: ${pack.version}
priority: ${pack.priority}
skills:
${(pack.skills || []).map((s) => `  - ${s}`).join('\n')}
`;
  writeFileSync(join(root, 'packs', `${pack.id}.pack.yaml`), text, 'utf-8');
}

mkdirSync(join(root, 'graphs'), { recursive: true });
for (const graph of registry.workflowGraphs || []) {
  const nodes = Object.entries(graph.nodes || {})
    .map(([nodeId, node]) => `  ${nodeId}: { skill: ${node.skill} }`)
    .join('\n');
  const edges = (graph.edges || [])
    .map((edge) => `  - { from: ${edge.from}, to: ${edge.to}${edge.when ? `, when: ${edge.when}` : ''} }`)
    .join('\n');
  const text = `id: ${graph.id}
name: ${graph.name}
entry: ${graph.entry}
nodes:
${nodes}
edges:
${edges}
`;
  writeFileSync(join(root, 'graphs', `${graph.id}.graph.yaml`), text, 'utf-8');
}

mkdirSync(join(root, 'bundles'), { recursive: true });
for (const bundle of registry.bundles || []) {
  const text = `id: ${bundle.id}
origin: ${bundle.origin}
packs:
${(bundle.packs || []).map((v) => `  - ${v}`).join('\n')}
graphs:
${(bundle.graphs || []).map((v) => `  - ${v}`).join('\n')}
templates:
${(bundle.templates || []).map((v) => `  - ${v}`).join('\n')}
docs:
${(bundle.docs || []).map((v) => `  - ${v}`).join('\n')}
`;
  writeFileSync(join(root, 'bundles', `${bundle.id}.bundle.yaml`), text, 'utf-8');
}

mkdirSync(join(root, 'templates'), { recursive: true });
for (const template of registry.templates || []) {
  const text = `id: ${template.id}
workflowGraph: ${template.workflowGraph}
packs:
${(template.packs || []).map((v) => `  - ${v}`).join('\n')}
theme: ${template.theme}
demo: ${template.demo}
docs:
${(template.docs || []).map((v) => `  - ${v}`).join('\n')}
starterFiles:
${(template.starterFiles || []).map((v) => `  - ${v}`).join('\n')}
`;
  writeFileSync(join(root, 'templates', `${template.id}.template.yaml`), text, 'utf-8');
}

mkdirSync(join(root, 'projects'), { recursive: true });
for (const project of registry.projects || []) {
  const text = `id: ${project.id}
name: ${project.name}
priority: ${project.priority}
workflowGraph: ${project.workflowGraph}
packs:
${(project.packs || []).map((v) => `  - ${v}`).join('\n')}
skills:
${(project.skills || []).map((v) => `  - ${v}`).join('\n')}
optimizedFor:
${(project.optimizedFor || []).map((v) => `  - ${v}`).join('\n')}
`;
  writeFileSync(join(root, 'projects', `${project.id}.project.yaml`), text, 'utf-8');
}

const readme = `# VelinStyle Skills Registry

Registry-first skill assets for AI Runtime + Skill Engine.

- Source of truth: \`registry.json\`
- Derived: \`catalog.json\`, \`skills/**/SKILL.md\`, \`packs/*.yaml\`, \`graphs/*.yaml\`, \`bundles/*.yaml\`, \`templates/*.yaml\`, \`projects/*.yaml\`
`;

writeFileSync(join(root, 'README.md'), readme, 'utf-8');
