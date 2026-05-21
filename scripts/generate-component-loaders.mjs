import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = join(ROOT, 'components');

/** @type {{ tag: string, file: string }[]} */
const tagFiles = [];

for (const name of readdirSync(COMPONENTS)) {
  if (!name.startsWith('velin-') || !name.endsWith('.js')) continue;
  const content = readFileSync(join(COMPONENTS, name), 'utf-8');
  const matches = [...content.matchAll(/customElements\.define\(\s*['"](velin-[^'"]+)['"]/g)];
  for (const m of matches) {
    tagFiles.push({ tag: m[1], file: name });
  }
}

tagFiles.sort((a, b) => a.tag.localeCompare(b.tag));

const lines = tagFiles.map(({ tag, file }) => `  '${tag}': () => import('../${file}'),`);

const out = `/**
 * AUTO-GENERATED — run: node scripts/generate-component-loaders.mjs
 */
export const COMPONENT_LOADERS = {
${lines.join('\n')}
};
`;

writeFileSync(join(ROOT, 'components', 'runtime', 'component-loaders.js'), out);
console.log(`Wrote ${tagFiles.length} loaders`);
