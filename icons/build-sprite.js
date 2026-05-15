import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const SVG_DIR = join(import.meta.dirname, 'svg');
const OUTPUT = join(import.meta.dirname, 'velin-icons.svg');
const DIST_OUTPUT = join(import.meta.dirname, '..', 'dist', 'velin-icons.svg');

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg')).sort();

const symbols = files.map((file) => {
  const id = basename(file, '.svg');
  let content = readFileSync(join(SVG_DIR, file), 'utf-8');

  content = content
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  return `  <symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n    ${content}\n  </symbol>`;
});

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join('\n')}\n</svg>\n`;

writeFileSync(OUTPUT, sprite, 'utf-8');
console.log(`Generated sprite with ${files.length} icons: ${OUTPUT}`);

try {
  mkdirSync(join(import.meta.dirname, '..', 'dist'), { recursive: true });
  writeFileSync(DIST_OUTPUT, sprite, 'utf-8');
  console.log(`Copied to: ${DIST_OUTPUT}`);
} catch (e) {
  console.warn(`Could not copy to dist: ${e.message}`);
}
