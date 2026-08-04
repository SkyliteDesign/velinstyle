/**
 * Icon sprite trim — subset of icons/svg → production sprite.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

export function buildIconSpriteSubset({ pkgRoot, outDir, iconNames }) {
  const svgDir = join(pkgRoot, 'icons', 'svg');
  const names = new Set([...(iconNames || [])].map((n) => String(n).toLowerCase()));
  const available = existsSync(svgDir)
    ? readdirSync(svgDir).filter((f) => f.endsWith('.svg')).map((f) => basename(f, '.svg'))
    : [];

  const selected = available.filter((id) => names.has(id.toLowerCase()));
  // If icons were requested but none match, still emit empty sprite shell when WC icon used
  const includeAllIfEmptyScan = names.size === 0;
  const ids = includeAllIfEmptyScan ? [] : selected;
  const skipped = available.filter((id) => !ids.includes(id));

  const symbols = ids.map((id) => {
    let content = readFileSync(join(svgDir, `${id}.svg`), 'utf-8');
    content = content.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '').trim();
    return `  <symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n    ${content}\n  </symbol>`;
  });

  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join('\n')}\n</svg>\n`;
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'velin-icons.svg');
  writeFileSync(outFile, sprite, 'utf-8');

  return {
    outFile,
    included: ids,
    skipped,
    availableCount: available.length,
    bytes: Buffer.byteLength(sprite, 'utf-8'),
  };
}
