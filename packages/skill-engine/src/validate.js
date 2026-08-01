import { findSkillById } from './registry.js';
import { resolveWorkflowGraph } from './resolve.js';

const allowedPriority = new Set(['core', 'recommended', 'advanced', 'experimental']);
const allowedStatus = new Set(['draft', 'experimental', 'beta', 'stable', 'deprecated', 'legacy']);

export function validateRegistry(registry) {
  const errors = [];
  const warnings = [];
  const ids = new Set();
  for (const skill of registry.skills || []) {
    if (!skill.id) errors.push('Skill without id');
    if (ids.has(skill.id)) errors.push(`Duplicate skill id: ${skill.id}`);
    ids.add(skill.id);
    if (!allowedPriority.has(skill.priority)) errors.push(`Invalid priority for ${skill.id}`);
    if (!allowedStatus.has(skill.status)) errors.push(`Invalid status for ${skill.id}`);
    for (const dep of skill.dependsOn || []) {
      if (!findSkillById(registry, dep)) errors.push(`Unknown dependency ${dep} in ${skill.id}`);
    }
  }

  for (const wf of registry.workflowGraphs || []) {
    const resolved = resolveWorkflowGraph(registry, wf.id);
    errors.push(...resolved.issues);
  }

  for (const pack of registry.packs || []) {
    for (const skillId of pack.skills || []) {
      if (!findSkillById(registry, skillId)) errors.push(`Pack ${pack.id} references unknown skill ${skillId}`);
    }
  }

  for (const project of registry.projects || []) {
    if (project.workflowGraph && !(registry.workflowGraphs || []).some((wf) => wf.id === project.workflowGraph)) {
      errors.push(`Project ${project.id} references unknown workflow graph ${project.workflowGraph}`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
