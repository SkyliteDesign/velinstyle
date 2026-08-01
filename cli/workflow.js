import { loadRegistry, resolveWorkflowGraph } from '../packages/skill-engine/src/index.js';
import { getRegistryPathForMeta } from './skills.js';

function hasFlag(argv, flag) {
  return argv.includes(flag);
}

export function workflowCommand(argv = []) {
  const workflowId = argv[0];
  if (!workflowId || workflowId === '--help' || workflowId === '-h') {
    console.log(`Usage: velinstyle workflow <graph-id|project:id> [--json]

Examples:
  velinstyle workflow landingpage
  velinstyle workflow project:marketing-site --json
`);
    process.exit(0);
  }
  const registry = loadRegistry(getRegistryPathForMeta());
  let resolved;
  if (workflowId.startsWith('project:')) {
    const projectId = workflowId.replace('project:', '');
    const project = (registry.projects || []).find((item) => item.id === projectId);
    if (!project) {
      console.error(`Unknown project: ${projectId}`);
      process.exit(1);
    }
    resolved = resolveWorkflowGraph(registry, project.workflowGraph);
  } else {
    resolved = resolveWorkflowGraph(registry, workflowId);
  }
  if (resolved.issues.length) {
    for (const issue of resolved.issues) console.error(issue);
    process.exit(1);
  }
  if (hasFlag(argv, '--json')) {
    console.log(JSON.stringify(resolved, null, 2));
    return;
  }
  console.log(`Workflow steps (${resolved.orderedSteps.length}):`);
  for (const step of resolved.orderedSteps) console.log(`- ${step}`);
}
