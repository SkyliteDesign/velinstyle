#!/usr/bin/env node
/** Convert capture PNGs to WebP using sharp (optional). */
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.github/assets/readme');

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('sharp not installed; README will use PNG paths or install: npm i -D sharp');
    return;
  }
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.png'));
  for (const f of files) {
    const base = f.replace(/\.png$/, '');
    await sharp(path.join(DIR, f))
      .resize(1200, 675, { fit: 'cover', position: 'top' })
      .webp({ quality: 82 })
      .toFile(path.join(DIR, `${base}.webp`));
    console.log('webp', base);
  }
}

main();
