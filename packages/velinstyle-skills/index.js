import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';
import { buildCatalogProjection } from '../skill-engine/src/catalog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getRegistryPath() {
  return join(__dirname, 'registry.json');
}

export function loadVelinSkillsRegistry() {
  return JSON.parse(readFileSync(getRegistryPath(), 'utf-8'));
}

export function writeCatalogFile() {
  const registry = loadVelinSkillsRegistry();
  const catalog = buildCatalogProjection(registry);
  const outPath = join(__dirname, 'catalog.json');
  writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf-8');
  return { outPath, count: catalog.totals.skills };
}
