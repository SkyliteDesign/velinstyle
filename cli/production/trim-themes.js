/**
 * Theme trim — copy only used theme CSS into production output.
 */
import { existsSync, readFileSync, copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { listKnownThemeNames } from './graph.js';

export function resolveUsedThemes(extracted, { configThemes = 'auto', pkgRoot, defaultThemes = ['dark'] } = {}) {
  const known = new Set(listKnownThemeNames(pkgRoot));
  const used = new Set();

  if (Array.isArray(configThemes)) {
    for (const t of configThemes) used.add(String(t).toLowerCase());
  } else {
    for (const t of extracted.themes || []) used.add(String(t).toLowerCase());
  }

  // Always allow dark / light token paths if referenced via contrast toggles
  for (const d of defaultThemes) {
    if (known.has(d)) used.add(d);
  }

  // If nothing detected and auto — keep no optional themes (tokens cover default)
  const selected = [...used].filter((t) => known.has(t)).sort();
  const skipped = [...known].filter((t) => !used.has(t)).sort();
  return { selected, skipped, known: [...known].sort() };
}

export function writeThemes({ pkgRoot, outDir, themes, minifyPrefer = true }) {
  const themeOut = join(outDir, 'themes');
  mkdirSync(themeOut, { recursive: true });
  const written = [];
  const missing = [];

  for (const name of themes) {
    const distMin = join(pkgRoot, 'dist', 'themes', `${name}.min.css`);
    const src = join(pkgRoot, 'src', 'themes', `${name}.css`);
    const dest = join(themeOut, minifyPrefer && existsSync(distMin) ? `${name}.min.css` : `${name}.css`);
    if (minifyPrefer && existsSync(distMin)) {
      copyFileSync(distMin, dest);
      written.push({ name, file: dest, source: 'dist' });
    } else if (existsSync(src)) {
      writeFileSync(dest, readFileSync(src, 'utf-8'));
      written.push({ name, file: dest, source: 'src' });
    } else {
      missing.push(name);
    }
  }
  return { written, missing, themeOut };
}
