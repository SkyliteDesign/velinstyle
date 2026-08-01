import { cpSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { findSkillById } from './registry.js';
import { resolveSkillGraph, resolveWorkflowGraph } from './resolve.js';

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function copySkillFromRegistry(registry, skillsRoot, targetRoot, skillId) {
  const skill = findSkillById(registry, skillId);
  if (!skill || !skill.prosePath) return false;
  const prosePath = join(skillsRoot, skill.prosePath);
  const targetDir = join(targetRoot, skillId);
  ensureDir(targetDir);
  cpSync(prosePath, join(targetDir, 'SKILL.md'));
  return true;
}

export function installSelection(registry, options) {
  const { selection, skillsRoot, targetRoot, includeDependencies = true } = options;
  ensureDir(targetRoot);
  const installed = [];
  const issues = [];

  const addSkill = (skillId) => {
    if (installed.includes(skillId)) return;
    if (includeDependencies) {
      const resolved = resolveSkillGraph(registry, skillId);
      issues.push(...resolved.issues);
      for (const dep of resolved.orderedSkillIds) {
        if (copySkillFromRegistry(registry, skillsRoot, targetRoot, dep)) installed.push(dep);
      }
      return;
    }
    if (copySkillFromRegistry(registry, skillsRoot, targetRoot, skillId)) installed.push(skillId);
  };

  if (selection.startsWith('bundle:')) {
    const bundleId = selection.replace('bundle:', '');
    const bundle = (registry.bundles || []).find((item) => item.id === bundleId);
    if (!bundle) issues.push(`Unknown bundle ${bundleId}`);
    for (const packId of bundle?.packs || []) {
      const pack = (registry.packs || []).find((item) => item.id === packId);
      for (const skillId of pack?.skills || []) addSkill(skillId);
    }
  } else if (selection.startsWith('project:')) {
    const projectId = selection.replace('project:', '');
    const project = (registry.projects || []).find((item) => item.id === projectId);
    if (!project) issues.push(`Unknown project ${projectId}`);
    for (const skillId of project?.skills || []) addSkill(skillId);
    if (project?.workflowGraph) {
      const resolved = resolveWorkflowGraph(registry, project.workflowGraph);
      issues.push(...resolved.issues);
      for (const skillId of resolved.orderedSteps) addSkill(skillId);
    }
  } else {
    const pack = (registry.packs || []).find((item) => item.id === selection);
    if (pack) {
      for (const skillId of pack.skills || []) addSkill(skillId);
    } else {
      addSkill(selection);
    }
  }

  const indexPath = join(targetRoot, 'README.md');
  ensureDir(dirname(indexPath));
  return { installed, issues };
}
