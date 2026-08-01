import { readFileSync } from 'fs';

export function loadRegistry(registryPath) {
  return JSON.parse(readFileSync(registryPath, 'utf-8'));
}

export function listSkills(registry, filters = {}) {
  const {
    capability,
    status,
    priority,
    origin,
    category,
  } = filters;
  return (registry.skills || []).filter((skill) => {
    if (capability && !(skill.capabilities || []).includes(capability)) return false;
    if (status && skill.status !== status) return false;
    if (priority && skill.priority !== priority) return false;
    if (origin && skill.origin !== origin) return false;
    if (category && skill.category !== category) return false;
    return true;
  });
}

export function findSkillById(registry, skillId) {
  return (registry.skills || []).find((skill) => skill.id === skillId) || null;
}
