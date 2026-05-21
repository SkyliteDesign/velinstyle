import { readFileSync, existsSync } from 'fs';

const OKLCH_RE = /^oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+(?:\s*\/\s*[\d.]+%?)?\s*\)$/i;

export function validateTokensJson(filePath) {
  if (!existsSync(filePath)) {
    return { ok: false, errors: [`File not found: ${filePath}`] };
  }
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${e.message}`] };
  }

  const errors = [];
  const tokens = data.tokens ?? data;

  if (typeof tokens !== 'object' || tokens === null) {
    return { ok: false, errors: ['Root must be an object'] };
  }

  const walk = (obj, path) => {
    for (const [key, val] of Object.entries(obj)) {
      if (key === 'themes' || key === 'displayP3' || key === 'fonts' || key === 'motion' || key === 'zIndex') continue;
      if (typeof val === 'object' && val !== null) {
        walk(val, `${path}.${key}`);
        continue;
      }
      if (typeof val !== 'string') {
        errors.push(`${path}.${key}: must be a string`);
        continue;
      }
      if (key.includes('color') && val.startsWith('oklch') && !OKLCH_RE.test(val.trim())) {
        errors.push(`${path}.${key}: invalid OKLCH syntax`);
      }
    }
  };

  walk(tokens, 'tokens');

  if (data.themes && typeof data.themes === 'object') {
    for (const name of Object.keys(data.themes)) {
      if (!/^[a-z0-9-]+$/i.test(name)) {
        errors.push(`themes.${name}: invalid theme name`);
      }
    }
  }

  if (data.fonts && typeof data.fonts === 'object') {
    for (const [k, v] of Object.entries(data.fonts)) {
      if (typeof v !== 'string') errors.push(`fonts.${k}: must be a string`);
    }
  }

  if (data.motion && typeof data.motion === 'object') {
    for (const [k, v] of Object.entries(data.motion)) {
      if (typeof v !== 'string') errors.push(`motion.${k}: must be a string`);
    }
  }

  if (data.zIndex && typeof data.zIndex === 'object') {
    for (const [k, v] of Object.entries(data.zIndex)) {
      if (typeof v !== 'string') errors.push(`zIndex.${k}: must be a string`);
    }
  }

  return { ok: errors.length === 0, errors, data };
}
