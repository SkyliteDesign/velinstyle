import { resolve, join, dirname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import {
  loadRegistry,
  listSkills,
  findSkillById,
  validateRegistry,
  resolveSkillGraph,
  installSelection,
} from '../packages/skill-engine/src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const REGISTRY_PATH = join(PKG_ROOT, 'packages', 'velinstyle-skills', 'registry.json');
const SKILLS_ROOT = join(PKG_ROOT, 'packages', 'velinstyle-skills');

function argValue(argv, flag) {
  const idx = argv.indexOf(flag);
  return idx !== -1 ? argv[idx + 1] : null;
}

function hasFlag(argv, flag) {
  return argv.includes(flag);
}

export function loadSkillRegistry() {
  return loadRegistry(REGISTRY_PATH);
}

export function skillsList(argv = []) {
  const registry = loadSkillRegistry();
  const items = listSkills(registry, {
    capability: argValue(argv, '--capability') || undefined,
    status: argValue(argv, '--status') || undefined,
    priority: argValue(argv, '--priority') || undefined,
    origin: argValue(argv, '--origin') || undefined,
    category: argValue(argv, '--category') || undefined,
  });
  if (hasFlag(argv, '--json')) {
    console.log(JSON.stringify(items, null, 2));
    return;
  }
  for (const item of items) {
    console.log(`${item.id}  [${item.category}]  ${item.priority}/${item.status}  capabilities=${(item.capabilities || []).join(',')}`);
  }
  console.log(`\n${items.length} skill(s)`);
}

export function skillsShow(skillId, argv = []) {
  const registry = loadSkillRegistry();
  const skill = findSkillById(registry, skillId);
  if (!skill) {
    console.error(`Unknown skill: ${skillId}`);
    process.exit(1);
  }
  if (hasFlag(argv, '--human')) {
    console.log(formatSkillHuman(skill));
    return;
  }
  console.log(JSON.stringify(skill, null, 2));
}

function formatSkillHuman(skill) {
  const lines = [
    `# ${skill.id}`,
    '',
    skill.title ? `**${skill.title}**` : '',
    skill.summary || skill.description || '',
    '',
    `- Category: ${skill.category || '—'}`,
    `- Status: ${skill.status || '—'}`,
    `- Priority: ${skill.priority || '—'}`,
    `- Capabilities: ${(skill.capabilities || []).join(', ') || '—'}`,
  ];
  if (skill.requiresCli?.length) lines.push(`- CLI: ${skill.requiresCli.join(', ')}`);
  if (skill.inputs?.length) {
    lines.push('', '## Inputs');
    for (const input of skill.inputs) {
      if (typeof input === 'string') {
        lines.push(`- \`${input}\``);
        continue;
      }
      const label = input.name || input.id || input.key || input.type || JSON.stringify(input);
      lines.push(`- \`${label}\`${input.required ? ' (required)' : ''}: ${input.description || input.type || ''}`.trim());
    }
  }
  if (skill.outputs?.length) {
    lines.push('', '## Outputs');
    for (const output of skill.outputs) {
      if (typeof output === 'string') {
        lines.push(`- \`${output}\``);
        continue;
      }
      const label = output.name || output.id || output.key || output.type || JSON.stringify(output);
      lines.push(`- \`${label}\`: ${output.description || output.type || ''}`.trim());
    }
  }
  if (skill.dependsOn?.length) {
    lines.push('', `## Depends on`, skill.dependsOn.map((d) => `- ${d}`).join('\n'));
  }
  lines.push('', '_Tip: blueprints must only emit classes present in CSS (`velinstyle blueprint --strict`)._');
  return lines.filter(Boolean).join('\n');
}

export function skillsInstall(argv = []) {
  const selection = argv[0];
  if (!selection) {
    console.error('Usage: velinstyle skills install <skill-id|pack|bundle:id|project:id>');
    process.exit(1);
  }
  const target = resolve(argValue(argv, '--target') || '.cursor/skills');
  mkdirSync(target, { recursive: true });
  const registry = loadSkillRegistry();
  const result = installSelection(registry, {
    selection,
    skillsRoot: SKILLS_ROOT,
    targetRoot: target,
    includeDependencies: !hasFlag(argv, '--no-deps'),
  });
  for (const installed of result.installed) console.log(`Installed ${installed}`);
  if (result.issues.length) {
    for (const issue of result.issues) console.warn(`Warning: ${issue}`);
  }
  const markerPath = join(target, 'registry-source.json');
  writeFileSync(markerPath, JSON.stringify({ source: REGISTRY_PATH, installed: result.installed }, null, 2), 'utf-8');
}

export function skillsRun(skillId, argv = []) {
  const registry = loadSkillRegistry();
  const resolved = resolveSkillGraph(registry, skillId);
  if (resolved.issues.length) {
    for (const issue of resolved.issues) console.error(issue);
    process.exit(1);
  }
  const steps = [];
  for (const id of resolved.orderedSkillIds) {
    const skill = findSkillById(registry, id);
    if (!skill) continue;
    steps.push({ id: skill.id, requiresCli: skill.requiresCli || [], onlyIf: skill.onlyIf || [] });
  }
  if (hasFlag(argv, '--json')) {
    console.log(JSON.stringify({ steps }, null, 2));
    return;
  }
  for (const step of steps) {
    console.log(`- ${step.id}`);
    if (step.requiresCli.length) console.log(`  cli: ${step.requiresCli.join(', ')}`);
    if (step.onlyIf.length) console.log(`  onlyIf: ${step.onlyIf.join(', ')}`);
  }
}

export function skillsValidate() {
  const registry = loadSkillRegistry();
  const result = validateRegistry(registry);
  if (result.errors.length) {
    for (const error of result.errors) console.error(`Error: ${error}`);
  }
  if (result.warnings.length) {
    for (const warning of result.warnings) console.warn(`Warning: ${warning}`);
  }
  console.log(result.ok ? 'skills registry valid' : 'skills registry invalid');
  process.exit(result.ok ? 0 : 1);
}

export async function skillsDoctor(argv = []) {
  const { doctorSkillPaths } = await import('../scripts/check-skills-paths.mjs');
  const result = doctorSkillPaths(PKG_ROOT);
  if (hasFlag(argv, '--json')) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }
  if (!result.ok) {
    console.error(`skills doctor FAILED (${result.errors.length} missing path(s)):`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`skills doctor OK (${result.checked} paths).`);
}

export function skillsIndex(kind) {
  const registry = loadSkillRegistry();
  const map = {
    packs: registry.packs || [],
    bundles: registry.bundles || [],
    templates: registry.templates || [],
    projects: registry.projects || [],
    graphs: registry.workflowGraphs || [],
  };
  const out = map[kind] || [];
  console.log(JSON.stringify(out, null, 2));
}

export function skillsCommand(argv = []) {
  const sub = argv[0];
  if (!sub || sub === '--help' || sub === '-h') {
    console.log(`Usage: velinstyle skills <subcommand>

Subcommands:
  list [--category <id>] [--status <id>] [--json]
  show <skill-id> [--human]
  install <skill-id|pack:id|bundle:id|template:id>
  run <skill-id> [--json]   (dry-run / inspect — not apply)
  validate
  doctor [--json]           Fail if demo/docs/starter paths missing
  packs | bundles | templates | projects | graphs
`);
    process.exit(0);
  }
  if (sub === 'list') return skillsList(argv.slice(1));
  if (sub === 'show') return skillsShow(argv[1], argv.slice(2));
  if (sub === 'install') return skillsInstall(argv.slice(1));
  if (sub === 'run') return skillsRun(argv[1], argv.slice(2));
  if (sub === 'validate') return skillsValidate();
  if (sub === 'doctor') return skillsDoctor(argv.slice(1));
  if (sub === 'packs' || sub === 'bundles' || sub === 'templates' || sub === 'projects' || sub === 'graphs') return skillsIndex(sub);
  console.error(`Unknown skills subcommand: ${sub}`);
  process.exit(1);
}

export function getRegistryPathForMeta() {
  return REGISTRY_PATH;
}
