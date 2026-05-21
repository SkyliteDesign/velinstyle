import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { banner, heading, table, bulletList, sortByKey } from './markdown.js';
import { loadComponentContracts, renderComponentA11ySection } from './extract-a11y.js';

function tagFromFile(file) {
  return basename(file, '.js');
}

function parseBlockComment(source) {
  const m = source.match(/^\/\*\*?([\s\S]*?)\*\//);
  if (!m) return null;
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\* ?/, '').trimEnd())
    .join('\n')
    .trim();
}

function parseObservedAttributes(source) {
  const m = source.match(/static\s+get\s+observedAttributes\s*\(\s*\)\s*\{\s*return\s*\[([^\]]*)\]/);
  if (!m) return [];
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
}

function parseEvents(source) {
  const events = new Set();
  const re = /CustomEvent\s*\(\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(source)) !== null) events.add(m[1]);
  return [...events].sort();
}

function parseParts(source) {
  const parts = new Set();
  const re = /part\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(source)) !== null) parts.add(m[1]);
  return [...parts].sort();
}

function parseSlots(source) {
  const slots = [];
  const re = /<slot\b([^>]*)>/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const attrs = m[1];
    const nameM = attrs.match(/name\s*=\s*["']([^"']+)["']/);
    slots.push(nameM ? nameM[1] : '(default)');
  }
  return [...new Set(slots)].sort();
}

function parsePublicApi(source) {
  const methods = new Set();
  const getters = new Set();

  const classM = source.match(/class\s+\w+\s+extends\s+HTMLElement\s*\{([\s\S]*)\n\}/);
  if (!classM) return { methods: [], getters: [] };
  const body = classM[1];

  const methodRe = /^\s{2}([a-zA-Z][\w]*)\s*\([^)]*\)\s*\{/gm;
  let m;
  while ((m = methodRe.exec(body)) !== null) {
    const name = m[1];
    if (name.startsWith('_') || name === 'constructor') continue;
    if (['connectedCallback', 'disconnectedCallback', 'attributeChangedCallback'].includes(name)) continue;
    methods.add(name);
  }

  const getRe = /^\s{2}get\s+([a-zA-Z][\w]*)\s*\(/gm;
  while ((m = getRe.exec(body)) !== null) getters.add(m[1]);

  const setRe = /^\s{2}set\s+([a-zA-Z][\w]*)\s*\(/gm;
  while ((m = setRe.exec(body)) !== null) getters.add(`${m[1]} (setter)`);

  return {
    methods: [...methods].sort(),
    getters: [...getters].sort(),
  };
}

export function extractComponentFile(filePath) {
  const source = readFileSync(filePath, 'utf-8');
  const tag = tagFromFile(filePath);
  const { methods, getters } = parsePublicApi(source);
  return {
    tag,
    file: `components/${basename(filePath)}`,
    description: parseBlockComment(source),
    observedAttributes: parseObservedAttributes(source),
    events: parseEvents(source),
    parts: parseParts(source),
    slots: parseSlots(source),
    methods,
    getters,
  };
}

export function extractComponents(componentsDir) {
  if (!existsSync(componentsDir)) return [];
  const seen = new Set();
  const items = [];
  for (const name of readdirSync(componentsDir)) {
    if (!name.startsWith('velin-') || !name.endsWith('.js')) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(extractComponentFile(join(componentsDir, name)));
  }
  return sortByKey(items, 'tag');
}

export function renderComponent(meta, contracts) {
  let md = banner(meta.file);
  md += heading(1, `<${meta.tag}>`);
  md += `\nSource: \`${meta.file}\`\n\n`;

  if (meta.description) {
    md += heading(2, 'Description');
    md += `${meta.description}\n\n`;
  }

  if (contracts) {
    md += renderComponentA11ySection(meta.tag, contracts);
  }

  md += heading(2, 'Attributes');
  if (meta.observedAttributes.length) {
    md += table(
      ['Attribute', 'Notes'],
      meta.observedAttributes.map((a) => [`\`${a}\``, 'Observed — triggers `attributeChangedCallback` when changed']),
    );
  } else {
    md += '_No `observedAttributes` declared._\n\n';
  }

  md += heading(2, 'Events');
  md += bulletList(meta.events.map((e) => `\`${e}\` (bubbles)`));

  md += heading(2, 'CSS parts');
  md += bulletList(meta.parts.map((p) => `\`${p}\``));

  md += heading(2, 'Slots');
  md += bulletList(meta.slots.map((s) => `\`${s}\``));

  md += heading(2, 'Public API');
  const apiRows = [
    ...meta.methods.map((m) => ['Method', `\`${m}()\``]),
    ...meta.getters.map((g) => ['Property', `\`${g}\``]),
  ];
  if (apiRows.length) {
    md += table(['Kind', 'Name'], apiRows);
  } else {
    md += '_No public methods detected._\n';
  }

  return md;
}

export function renderComponentsIndex(components) {
  let md = banner('components/velin-*.js');
  md += heading(1, 'Web Components');
  md += '\nCustom elements in `components/`. Import via `@birdapi/velinstyle` or lazy-load with `./runtime`.\n\n';
  md += table(
    ['Element', 'Attributes', 'Events', 'Reference'],
    components.map((c) => [
      `\`<${c.tag}>\``,
      String(c.observedAttributes.length),
      String(c.events.length),
      `[${c.tag}.md](./${c.tag}.md)`,
    ]),
  );
  return md;
}
