import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateRegistry } from '../packages/skill-engine/src/validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const registryPath = join(root, 'packages', 'velinstyle-skills', 'registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
const result = validateRegistry(registry);

if (!result.ok) {
  console.error('Skill registry validation failed:');
  for (const err of result.errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`Skill registry valid (${(registry.skills || []).length} skills).`);
