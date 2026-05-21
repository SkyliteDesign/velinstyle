/**
 * Build CSS custom properties from a JSON token file.
 * Schema (minimal):
 * {
 *   "tokens": { "color-primary": "oklch(0.6 0.2 250)", "--velin-radius-lg": "1rem" },
 *   "themes": { "dark": { "color-primary": "oklch(0.75 0.18 250)" } },
 *   "displayP3": { "color-primary": "color(display-p3 0.4 0.5 1)" }
 * }
 */
import { readFileSync, existsSync } from 'fs';

function varName(key) {
  if (key.startsWith('--')) return key;
  if (key.startsWith('velin-')) return `--${key}`;
  return `--velin-${key}`;
}

function emitBlock(indent, obj) {
  if (!obj || typeof obj !== 'object') return [];
  const lines = [];
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string') {
      lines.push(`${indent}${varName(k)}: ${v};`);
    }
  }
  return lines;
}

export function buildTokensFromJson(filePath) {
  if (!existsSync(filePath)) return null;
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }

  const rootTokens =
    data.tokens !== undefined
      ? data.tokens
      : (() => {
          const { themes: _th, displayP3: _p3, ...rest } = data;
          return rest;
        })();
  const lines = ['@layer tokens {', '  :root {'];
  lines.push(...emitBlock('    ', rootTokens));
  lines.push('  }');

  if (data.themes && typeof data.themes === 'object') {
    for (const [themeName, themeObj] of Object.entries(data.themes)) {
      lines.push(`  [data-velin-theme="${themeName}"], .velin-theme-${themeName} {`);
      lines.push(...emitBlock('    ', themeObj));
      lines.push('  }');
    }
  }

  if (data.displayP3 && typeof data.displayP3 === 'object') {
    lines.push('  @supports (color: color(display-p3 1 1 1)) {');
    lines.push('    :root {');
    lines.push(...emitBlock('      ', data.displayP3));
    lines.push('    }');
    lines.push('  }');
  }

  if (data.fonts && typeof data.fonts === 'object') {
    lines.push('  :root {');
    lines.push(...emitBlock('    ', data.fonts));
    lines.push('  }');
  }

  if (data.motion && typeof data.motion === 'object') {
    lines.push('  :root {');
    lines.push(...emitBlock('    ', data.motion));
    lines.push('  }');
  }

  if (data.zIndex && typeof data.zIndex === 'object') {
    lines.push('  :root {');
    lines.push(...emitBlock('    ', data.zIndex));
    lines.push('  }');
  }

  lines.push('}');
  return `${lines.join('\n')}\n`;
}
