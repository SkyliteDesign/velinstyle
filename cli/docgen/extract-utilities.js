import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { banner, heading, table, sortByKey } from './markdown.js';

const CLASS_RULE_RE = /\.(velin-[\w\\\/:-]+)\s*\{([^}]*)\}/g;
const NESTED_CLASS_RE = /[\s,>+~](\.velin-[\w\\\/:-]+)\s*\{([^}]*)\}/g;

function truncateCss(body, max = 120) {
  const one = body.replace(/\s+/g, ' ').trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 1)}…`;
}

export function parseUtilityCss(content) {
  const classes = [];
  let m;
  const re = new RegExp(CLASS_RULE_RE.source, 'g');
  while ((m = re.exec(content)) !== null) {
    classes.push({ selector: m[1], output: truncateCss(m[2]) });
  }
  const nested = new RegExp(NESTED_CLASS_RE.source, 'g');
  while ((m = nested.exec(content)) !== null) {
    const sel = m[1].replace(/^\./, '');
    if (!classes.some((c) => c.selector === sel)) {
      classes.push({ selector: sel, output: truncateCss(m[2]) });
    }
  }
  return classes;
}

export function extractUtilities(srcDir) {
  const utilDir = join(srcDir, 'utilities');
  if (!existsSync(utilDir)) return { files: [], byFile: {} };

  const files = readdirSync(utilDir).filter((f) => f.endsWith('.css')).sort();
  const byFile = {};

  for (const file of files) {
    const content = readFileSync(join(utilDir, file), 'utf-8');
    const category = basename(file, '.css');
    const classes = sortByKey(parseUtilityCss(content), 'selector');
    byFile[category] = { file: `src/utilities/${file}`, classes };
  }

  return { files: Object.keys(byFile).sort(), byFile };
}

export function renderUtilityFile(category, data) {
  let md = banner(data.file);
  md += heading(1, `Utilities: ${category}`);
  md += `\nSource: \`${data.file}\`\n\n`;
  if (!data.classes.length) {
    md += '_No `.velin-*` utility classes found._\n';
    return md;
  }
  md += table(
    ['Class', 'CSS output'],
    data.classes.map((c) => [`\`.${c.selector}\``, `\`${c.output}\``]),
  );
  return md;
}

export function renderUtilitiesIndex(extracted) {
  let md = banner('src/utilities/*.css');
  md += heading(1, 'Utility classes');
  md += '\nClasses in `@layer utilities` from `src/utilities/`.\n\n';
  md += table(
    ['Category', 'Classes', 'Reference'],
    extracted.files.map((cat) => {
      const n = extracted.byFile[cat].classes.length;
      return [cat, String(n), `[${cat}.md](./${cat}.md)`];
    }),
  );
  return md;
}
