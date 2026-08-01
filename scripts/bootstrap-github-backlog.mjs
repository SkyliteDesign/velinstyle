#!/usr/bin/env node
/**
 * Bootstrap GitHub labels + first 30 strategy issues for VelinStyle.
 *
 * Requires: GitHub CLI authenticated (`gh auth login`) or GH_TOKEN.
 *
 * Usage:
 *   node scripts/bootstrap-github-backlog.mjs
 *   node scripts/bootstrap-github-backlog.mjs --dry-run
 *   node scripts/bootstrap-github-backlog.mjs --labels-only
 *   node scripts/bootstrap-github-backlog.mjs --issues-only
 *   node scripts/bootstrap-github-backlog.mjs --project
 *   node scripts/bootstrap-github-backlog.mjs --issues-only --seed=../interne_docs/strategy/next-30-issues.json --map=../interne_docs/strategy/next-30-issue-map.json
 *
 * Repo defaults to SkyliteDesign/velinstyle (override with --repo owner/name).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const labelsOnly = args.has('--labels-only');
const issuesOnly = args.has('--issues-only');
const wantProject = args.has('--project');
const repoArg = process.argv.find((a) => a.startsWith('--repo='));
const repo = repoArg ? repoArg.slice('--repo='.length) : 'SkyliteDesign/velinstyle';
const seedArg = process.argv.find((a) => a.startsWith('--seed='));
const mapArg = process.argv.find((a) => a.startsWith('--map='));
const seedPath = seedArg
  ? join(root, seedArg.slice('--seed='.length))
  : join(root, '../interne_docs/strategy/first-30-issues.json');
const mapPath = mapArg
  ? join(root, mapArg.slice('--map='.length))
  : join(root, '../interne_docs/strategy/first-30-issue-map.json');

const ghCandidates = [
  process.env.GH_BIN,
  'gh',
  'C:\\Program Files\\GitHub CLI\\gh.exe',
].filter(Boolean);

function findGh() {
  for (const bin of ghCandidates) {
    const probe = spawnSync(bin, ['--version'], { encoding: 'utf8' });
    if (probe.status === 0) return bin;
  }
  return null;
}

const ghBin = findGh();
if (!ghBin) {
  console.error('GitHub CLI not found. Install from https://cli.github.com/ then run: gh auth login');
  process.exit(1);
}

function gh(ghArgs, { input, allowFail = false } = {}) {
  if (dryRun) {
    console.log(`[dry-run] gh ${ghArgs.join(' ')}`);
    return { status: 0, stdout: '', stderr: '' };
  }
  const result = spawnSync(ghBin, ghArgs, {
    encoding: 'utf8',
    input,
    env: process.env,
  });
  if (result.status !== 0 && !allowFail) {
    const err = (result.stderr || result.stdout || '').trim();
    throw new Error(`gh ${ghArgs.join(' ')} failed:\n${err}`);
  }
  return result;
}

function ensureAuth() {
  const status = gh(['auth', 'status'], { allowFail: true });
  if (status.status !== 0 && !process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
    console.error('Not authenticated. Run:\n  gh auth login\nor set GH_TOKEN.');
    process.exit(1);
  }
}

function upsertLabel({ name, color, description }) {
  const view = gh(['label', 'list', '--repo', repo, '--search', name, '--json', 'name'], { allowFail: true });
  let exists = false;
  try {
    const list = JSON.parse(view.stdout || '[]');
    exists = list.some((l) => l.name === name);
  } catch {
    exists = false;
  }

  if (exists) {
    gh([
      'label', 'edit', name,
      '--repo', repo,
      '--color', color,
      '--description', description,
    ], { allowFail: true });
    console.log(`label updated: ${name}`);
  } else {
    gh([
      'label', 'create', name,
      '--repo', repo,
      '--color', color,
      '--description', description,
    ], { allowFail: true });
    console.log(`label created: ${name}`);
  }
}

function buildBody(issue) {
  const acceptance = (issue.acceptance || []).map((a) => `- [ ] ${a}`).join('\n');
  const refs = (issue.refs || []).map((r) => `- \`${r}\``).join('\n');
  return `## Planning-ID
${issue.id}

## Epic
Epic ${issue.epic} — ${issue.epicName}

## Priority
${issue.priority}

## Problem
${issue.problem}

## Outcome
${issue.outcome}

## Acceptance criteria
${acceptance}
- [ ] Docs updated if user-facing
- [ ] Tests or evidence attached if behavioral

## Non-goals
Do not expand scope beyond this planning ID.

## Dependencies
- Blocked by: —
- Blocks: —

## References
${refs}
- \`VELINSTYLE_2030.md\`
- \`interne_docs/strategy/BACKLOG.md\` (local monorepo; not in git)
`;
}

function findExistingByPlanningId(planningId) {
  const result = gh([
    'issue', 'list',
    '--repo', repo,
    '--state', 'all',
    '--limit', '200',
    '--json', 'number,title,body,url',
    '--search', planningId,
  ], { allowFail: true });
  if (result.status !== 0) return null;
  try {
    const issues = JSON.parse(result.stdout || '[]');
    return issues.find((i) => (i.body || '').includes(`## Planning-ID\n${planningId}`) || (i.body || '').includes(planningId)) || null;
  } catch {
    return null;
  }
}

function createIssue(issue) {
  const title = `[EPIC ${issue.epic}] ${issue.title}`;
  const existing = dryRun ? null : findExistingByPlanningId(issue.id);
  if (existing) {
    console.log(`skip existing ${issue.id} -> #${existing.number} ${existing.url}`);
    return { id: issue.id, number: existing.number, url: existing.url, skipped: true };
  }

  const body = buildBody(issue);
  const labelArgs = issue.labels.flatMap((l) => ['--label', l]);
  const created = gh([
    'issue', 'create',
    '--repo', repo,
    '--title', title,
    '--body', body,
    ...labelArgs,
  ]);
  const url = (created.stdout || '').trim();
  console.log(`created ${issue.id}: ${url || title}`);
  const numberMatch = url.match(/\/issues\/(\d+)/);
  return {
    id: issue.id,
    number: numberMatch ? Number(numberMatch[1]) : null,
    url,
    skipped: false,
  };
}

function createProject() {
  // GitHub Projects (v2) via gh project
  const title = 'VelinStyle Strategy Board';
  console.log(`Creating project "${title}" (if supported by auth scopes)…`);
  const created = gh([
    'project', 'create',
    '--owner', repo.split('/')[0],
    '--title', title,
    '--format', 'json',
  ], { allowFail: true });
  if (created.status !== 0) {
    console.warn('Project create failed or needs `project` scope. Create manually:');
    console.warn('  https://github.com/users/SkyliteDesign/projects or org projects');
    console.warn('Columns: Backlog | Ready | In progress | Review | Done');
    return null;
  }
  console.log(created.stdout);
  return created.stdout;
}

function main() {
  ensureAuth();
  const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
  console.log(`Repo: ${repo}`);
  console.log(`Seed: ${seed.issues.length} issues, ${seed.labels.length} labels`);

  if (!issuesOnly) {
    for (const label of seed.labels) upsertLabel(label);
  }

  const map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  if (!labelsOnly) {
    for (const issue of seed.issues) {
      const result = createIssue(issue);
      map[issue.id] = result;
    }
    if (!dryRun) {
      writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`, 'utf8');
      console.log(`Wrote ${mapPath}`);
    }
  }

  if (wantProject) createProject();

  console.log('Done.');
  if (!wantProject) {
    console.log('Tip: re-run with --project after labels/issues to attempt board creation.');
  }
}

main();
