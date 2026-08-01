import { findSkillById } from './registry.js';

function visitSkill(registry, skillId, visiting, visited, ordered, issues) {
  if (visited.has(skillId)) return;
  if (visiting.has(skillId)) {
    issues.push(`Dependency cycle detected at ${skillId}`);
    return;
  }
  const skill = findSkillById(registry, skillId);
  if (!skill) {
    issues.push(`Unknown skill reference: ${skillId}`);
    return;
  }
  visiting.add(skillId);
  for (const dep of skill.dependsOn || []) visitSkill(registry, dep, visiting, visited, ordered, issues);
  visiting.delete(skillId);
  visited.add(skillId);
  ordered.push(skillId);
}

export function resolveSkillGraph(registry, skillId) {
  const issues = [];
  const ordered = [];
  visitSkill(registry, skillId, new Set(), new Set(), ordered, issues);
  return { orderedSkillIds: ordered, issues };
}

export function resolveWorkflowGraph(registry, workflowId) {
  const graph = (registry.workflowGraphs || []).find((item) => item.id === workflowId);
  if (!graph) return { orderedSteps: [], issues: [`Unknown workflow graph: ${workflowId}`] };
  const nodeMap = new Map(Object.entries(graph.nodes || {}));
  const inDegree = new Map();
  for (const [nodeId] of nodeMap.entries()) inDegree.set(nodeId, 0);
  for (const edge of graph.edges || []) {
    if (!inDegree.has(edge.from) || !inDegree.has(edge.to)) {
      return { orderedSteps: [], issues: [`Invalid edge ${edge.from} -> ${edge.to}`] };
    }
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  }
  const queue = [];
  for (const [nodeId, deg] of inDegree.entries()) if (deg === 0) queue.push(nodeId);
  const orderedNodes = [];
  while (queue.length) {
    const nodeId = queue.shift();
    orderedNodes.push(nodeId);
    for (const edge of graph.edges || []) {
      if (edge.from !== nodeId) continue;
      const next = (inDegree.get(edge.to) || 0) - 1;
      inDegree.set(edge.to, next);
      if (next === 0) queue.push(edge.to);
    }
  }
  if (orderedNodes.length !== nodeMap.size) {
    return { orderedSteps: [], issues: [`Workflow graph has a cycle: ${workflowId}`] };
  }
  const orderedSteps = [];
  const issues = [];
  for (const nodeId of orderedNodes) {
    const node = nodeMap.get(nodeId);
    if (!node?.skill) continue;
    const resolved = resolveSkillGraph(registry, node.skill);
    issues.push(...resolved.issues);
    for (const depSkill of resolved.orderedSkillIds) {
      if (!orderedSteps.includes(depSkill)) orderedSteps.push(depSkill);
    }
  }
  return { orderedSteps, issues };
}
