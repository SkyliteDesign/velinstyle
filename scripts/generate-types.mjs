import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = join(ROOT, 'components');
const OUT = join(ROOT, 'dist', 'velinstyle.d.ts');

const tags = [];
for (const name of readdirSync(COMPONENTS)) {
  if (!name.startsWith('velin-') || !name.endsWith('.js')) continue;
  const content = readFileSync(join(COMPONENTS, name), 'utf-8');
  const m = content.match(/customElements\.define\(\s*['"](velin-[^'"]+)['"]/g);
  if (!m) continue;
  for (const def of m) {
    const tag = def.match(/['"](velin-[^'"]+)['"]/)?.[1];
    if (tag) tags.push(tag);
  }
}
const unique = [...new Set(tags)].sort();

const mapEntries = unique.map((t) => `    '${t}': HTMLElement;`).join('\n');

const dts = `/* AUTO-GENERATED — node scripts/generate-types.mjs */

export function register(tagNames: string[]): Promise<unknown[]>;
export function lazyDefine(tagName: string): Promise<unknown>;
export function whenDefined(tagName: string): Promise<CustomElementConstructor>;
export function bootFromDOM(
  root?: ParentNode,
  options?: { attributes?: boolean; highlight?: boolean; haptic?: boolean; tags?: string[] }
): Promise<unknown[]>;

export { escapeHTML, escapeHTMLAttribute, sanitizeURL, sanitizeSearchUrl } from '../components/sanitize.js';

declare global {
  interface HTMLElementTagNameMap {
${mapEntries}
  }
}
`;

mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(OUT, dts);
console.log(`Wrote ${unique.length} tags → ${OUT}`);
