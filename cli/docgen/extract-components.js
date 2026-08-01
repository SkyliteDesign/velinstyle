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

const MINIMAL_EXAMPLES = {
  'velin-copy': `<velin-copy value="npm i @birdapi/velinstyle" label="Copy"></velin-copy>
<!-- Shadow button is built-in. Prefer value= or text= (or data-source). Do not use data-velin-copy. -->`,
  'velin-tooltip': `<velin-tooltip content="Save draft">
  <button type="button" class="velin-btn">Save</button>
</velin-tooltip>`,
  'velin-lightbox': `<velin-lightbox>
  <a href="photo.jpg"><img src="photo-thumb.jpg" alt="Gallery photo"></a>
</velin-lightbox>`,
  'velin-icon': `<!-- Set <meta name="velin-icon-sprite" content="vendor/velinstyle/velin-icons.svg"> once -->
<velin-icon name="check" size="20" label="Done"></velin-icon>`,
  'velin-command': `<velin-command>
  <input slot="input" type="search" class="velin-input" placeholder="Jump to…" aria-label="Command">
  <button type="button" data-velin-command-item value="home">Home</button>
  <button type="button" data-velin-command-item value="settings">Settings</button>
</velin-command>`,
  'velin-menubar': `<velin-menubar>
  <button type="button" data-velin-menubar-trigger>File</button>
  <div data-velin-menubar-panel hidden>
    <button type="button" role="menuitem">New</button>
    <button type="button" role="menuitem">Open</button>
  </div>
</velin-menubar>`,
  'velin-form-summary': `<form novalidate>
  <velin-form-summary></velin-form-summary>
  <label class="velin-label" for="email">Email</label>
  <input id="email" class="velin-input" type="email" required>
  <button type="submit" class="velin-btn velin-btn--primary">Send</button>
</form>`,
  'velin-data-table': `<velin-data-table filter-input="#filter" page-size="5" label="Team">
  <label class="velin-label" for="filter">Filter</label>
  <input id="filter" class="velin-input" type="search">
  <table>
    <caption>Team</caption>
    <thead><tr><th data-sort="text">Name</th><th data-sort="number">Score</th></tr></thead>
    <tbody>
      <tr><td>Ada</td><td data-sort-value="98">98</td></tr>
      <tr><td>Grace</td><td data-sort-value="95">95</td></tr>
    </tbody>
  </table>
</velin-data-table>`,
};

export function renderComponent(meta, contracts) {
  let md = banner(meta.file);
  md += heading(1, `<${meta.tag}>`);
  md += `\nSource: \`${meta.file}\`\n\n`;

  const snippet = MINIMAL_EXAMPLES[meta.tag];
  if (snippet) {
    md += heading(2, 'Minimal working example');
    md += 'Copy-paste starter (load CSS + `velinstyle-components` / `bootFromDOM` as needed):\n\n';
    md += '```html\n' + snippet.trim() + '\n```\n\n';
  }

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
      meta.observedAttributes.map((a) => {
        const required = contracts?.requiredAttributes?.includes(a) ? ' (required by a11y contract)' : '';
        return [`\`${a}\``, `Observed — triggers \`attributeChangedCallback\` when changed${required}`];
      }),
    );
  } else {
    md += '_No `observedAttributes` declared._ Author-facing configuration may still use slots, properties, or child markup — see **Slots** / **Public API** below.\n\n';
    if (meta.slots.length) {
      md += table(
        ['Author surface', 'Notes'],
        meta.slots.map((s) => [`slot \`${s}\``, 'Content projection (not an observed attribute)']),
      );
    }
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
