import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { SCANNER_RULES, PERF_RULES } from '../scanner-rules-data.js';
import { banner, heading, table, sortByKey } from './markdown.js';

const VELIN_SELECTOR_RE = /\.(velin-[\w-]+)/g;

function firstComment(content) {
  const m = content.match(/\/\*\s*([^*]+?)\s*\*\//);
  return m ? m[1].trim() : null;
}

export function extractA11yModules(srcDir) {
  const a11yDir = join(srcDir, 'a11y');
  if (!existsSync(a11yDir)) return [];
  const modules = [];
  for (const file of readdirSync(a11yDir).filter((f) => f.endsWith('.css')).sort()) {
    const content = readFileSync(join(a11yDir, file), 'utf-8');
    const selectors = new Set();
    let m;
    const re = new RegExp(VELIN_SELECTOR_RE.source, 'g');
    while ((m = re.exec(content)) !== null) selectors.add(m[1]);
    modules.push({
      name: basename(file, '.css'),
      file: `src/a11y/${file}`,
      description: firstComment(content),
      selectors: [...selectors].sort(),
    });
  }
  return modules;
}

export function renderScannerRules() {
  const all = sortByKey([...SCANNER_RULES, ...PERF_RULES], 'id');
  let md = banner('cli/scanner-rules-data.js');
  md += heading(1, 'Scanner rules');
  md += '\nRun `velinstyle scan [path]` for security, a11y, CSS, and PII checks. `velinstyle perf audit` for performance.\n\n';
  md += '```bash\nvelinstyle scan . --severity warning\nvelinstyle scan . --only pii --fix-dry-run\nvelinstyle perf audit samples/\n```\n\n';

  const categories = [...new Set(all.map((r) => r.category))].sort();
  for (const cat of categories) {
    const rules = all.filter((r) => r.category === cat);
    md += heading(2, cat);
    md += table(
      ['Rule ID', 'Severity', 'Message', 'Fix hint'],
      rules.map((r) => [`\`${r.id}\``, r.severity, r.message, r.fixHint || '—']),
    );
  }
  return md;
}

export function renderA11yModules(modules) {
  let md = banner('src/a11y/*.css');
  md += heading(1, 'Accessibility CSS modules');
  md += '\nImported in `@layer a11y` from `src/velinstyle.css`.\n\n';
  md += table(
    ['Module', 'Selectors', 'Reference'],
    modules.map((m) => [m.name, String(m.selectors.length), `\`${m.file}\``]),
  );
  md += '\n';
  for (const m of modules) {
    md += heading(2, m.name);
    if (m.description) md += `${m.description}\n\n`;
    md += `Source: \`${m.file}\`\n\n`;
    if (m.selectors.length) {
      md += bulletListSelectors(m.selectors);
    } else {
      md += '_No `.velin-*` class selectors (may use element/attribute selectors)._\n\n';
    }
  }
  return md;
}

function bulletListSelectors(items) {
  return `${items.map((s) => `- \`.${s}\``).join('\n')}\n\n`;
}
