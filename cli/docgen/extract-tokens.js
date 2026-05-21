import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { banner, heading, table, sortByKey } from './markdown.js';

const VAR_RE = /(--velin-[\w-]+)\s*:\s*([^;]+);/g;

export function parseTokenCss(content) {
  const tokens = [];
  let m;
  const re = new RegExp(VAR_RE.source, 'g');
  while ((m = re.exec(content)) !== null) {
    tokens.push({ name: m[1], value: m[2].trim() });
  }
  return tokens;
}

export function extractTokens(srcDir) {
  const tokensDir = join(srcDir, 'tokens');
  if (!existsSync(tokensDir)) return { categories: [], byCategory: {} };

  const files = readdirSync(tokensDir).filter((f) => f.endsWith('.css')).sort();
  const byCategory = {};

  for (const file of files) {
    const content = readFileSync(join(tokensDir, file), 'utf-8');
    const category = basename(file, '.css');
    const tokens = sortByKey(parseTokenCss(content), 'name');
    byCategory[category] = { file: `src/tokens/${file}`, tokens };
  }

  return { categories: Object.keys(byCategory).sort(), byCategory };
}

export function renderTokenCategory(category, data) {
  let md = banner(`src/tokens/${category}.css`);
  md += heading(1, `Tokens: ${category}`);
  md += `\nSource: \`${data.file}\`\n\n`;
  if (!data.tokens.length) {
    md += '_No \`--velin-*\` variables found._\n';
    return md;
  }
  md += table(
    ['Token', 'Value'],
    data.tokens.map((t) => [`\`${t.name}\``, `\`${t.value}\``]),
  );
  if (category === 'color') {
    md += '\n## Contrast (WCAG 2.2 AAA)\n\n';
    md += 'VelinStyle defaults target **7:1** for body text on `--velin-color-surface-bright` and semantic text tokens. ';
    md += 'CI runs `npm run test:contrast` across `:root`, dark mode, and all 13 theme presets.\n\n';
    md += 'For **AA (4.5:1)** body text (migration from pre-0.9 palettes), set `data-velin-contrast="aa"` on `<html>` ';
    md += '(see `src/a11y/high-contrast-aaa.css`). AAA remains the default when the attribute is omitted.\n\n';
    md += 'See [WCAG 2.2 AAA matrix](../a11y/wcag22-aaa-matrix.md) and [Accessibility guide](../../../docs/a11y.html).\n';
  }
  return md;
}

export function renderTokensIndex(extracted) {
  let md = banner('src/tokens/*.css');
  md += heading(1, 'Design tokens');
  md += '\nCSS custom properties from `src/tokens/`. Use with `var(--velin-*, fallback)`.\n\n';
  md += 'See also: [`examples/tokens.full.json`](../../examples/tokens.full.json) for JSON `tokens build` input.\n\n';
  md += table(
    ['Category', 'Variables', 'Reference'],
    extracted.categories.map((cat) => {
      const n = extracted.byCategory[cat].tokens.length;
      return [cat, String(n), `[${cat}.md](./${cat}.md)`];
    }),
  );
  return md;
}

export function renderJsonSchema(schemaPath, schemaContent) {
  let md = banner(schemaPath);
  md += heading(1, 'Tokens JSON schema');
  md += `\nSchema file: \`${schemaPath}\`\n\n`;
  md += 'Supported top-level blocks: `tokens`, `themes`, `fonts`, `motion`, `zIndex`, `displayP3`.\n\n';
  md += '```json\n' + JSON.stringify(JSON.parse(schemaContent), null, 2) + '\n```\n';
  return md;
}
