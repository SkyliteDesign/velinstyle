#!/usr/bin/env node
/**
 * skills doctor — fail if registry/template demo & docs paths are missing on disk.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {string} [root]
 * @returns {{ ok: boolean, errors: string[], checked: number }}
 */
export function doctorSkillPaths(root = ROOT) {
  const registry = JSON.parse(readFileSync(join(root, 'packages/velinstyle-skills/registry.json'), 'utf-8'));
  const errors = [];
  let checked = 0;

  function checkPath(label, rel) {
    if (!rel || typeof rel !== 'string') return;
    if (/^https?:\/\//i.test(rel)) return;
    checked += 1;
    if (!existsSync(join(root, rel))) errors.push(`${label}: missing ${rel}`);
  }

  for (const t of registry.templates || []) {
    checkPath(`template:${t.id}/demo`, t.demo);
    for (const d of t.docs || []) checkPath(`template:${t.id}/docs`, d);
    for (const s of t.starterFiles || []) checkPath(`template:${t.id}/starter`, s);
  }
  for (const b of registry.bundles || []) {
    for (const d of b.docs || []) checkPath(`bundle:${b.id}/docs`, d);
  }
  for (const skill of registry.skills || []) {
    if (skill.prosePath) {
      checkPath(`skill:${skill.id}/prose`, join('packages/velinstyle-skills', skill.prosePath).replace(/\\/g, '/'));
    }
  }

  return { ok: errors.length === 0, errors, checked };
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked) {
  const result = doctorSkillPaths();
  if (!result.ok) {
    console.error(`skills doctor FAILED (${result.errors.length} missing, ${result.checked} checked):`);
    for (const e of result.errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`skills doctor OK (${result.checked} paths).`);
}
