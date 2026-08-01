/**
 * Human-readable WC API from source + generated docs tip.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * @param {string} pkgRoot
 * @param {string} tag
 */
export function describeWcApi(pkgRoot, tag) {
  const name = String(tag || '').replace(/^</, '').replace(/>$/, '').trim();
  if (!name.startsWith('velin-')) {
    return { ok: false, error: `Expected a velin-* tag (got "${tag || ''}"). Example: velinstyle wc api velin-toast` };
  }
  const file = join(pkgRoot, 'components', `${name}.js`);
  if (!existsSync(file)) {
    return { ok: false, error: `No source at components/${name}.js` };
  }
  const src = readFileSync(file, 'utf-8');
  const attrs = [...src.matchAll(/static\s+get\s+observedAttributes\(\)\s*\{\s*return\s*\[([^\]]*)\]/gs)]
    .map((m) => m[1].split(',').map((s) => s.replace(/['"`\s]/g, '')).filter(Boolean))
    .flat();
  const methods = [...src.matchAll(/^\s{2}([a-zA-Z_][\w]*)\s*\([^)]*\)\s*\{/gm)]
    .map((m) => m[1])
    .filter((n) => !['constructor', 'connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 'adoptedCallback'].includes(n));
  const showSig = src.match(/show\s*\(\s*\{([^}]*)\}\s*=\s*\{\s*\}\s*\)/);
  const events = [...src.matchAll(/new\s+CustomEvent\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const unique = (arr) => [...new Set(arr)];

  const docPath = join(pkgRoot, 'docs/generated/components', `${name}.md`);
  const hasDoc = existsSync(docPath);

  let example = '';
  if (name === 'velin-toast' && showSig) {
    example = `<velin-toast></velin-toast>
<script type="module">
  const t = document.querySelector('velin-toast');
  t.show({ message: 'Saved', type: 'success', duration: 4000 });
</script>`;
  } else if (name === 'velin-calendar') {
    example = `<velin-calendar label="Pick a day" value="2026-07-30"></velin-calendar>`;
  } else if (name === 'velin-file-dropzone') {
    example = `<velin-file-dropzone label="Files" accept=".pdf,.png" multiple></velin-file-dropzone>`;
  } else if (name === 'velin-data-table') {
    example = `<velin-data-table label="Rows" page-size="5" filter-input="#q" editable>
  <table>…</table>
</velin-data-table>`;
  }

  return {
    ok: true,
    tag: name,
    source: `components/${name}.js`,
    observedAttributes: unique(attrs),
    methods: unique(methods),
    events: unique(events),
    showSignature: showSig ? `show({ ${showSig[1].trim()} } = {})` : null,
    generatedDoc: hasDoc ? `docs/generated/components/${name}.md` : null,
    example: example || null,
  };
}

export function formatWcApi(report) {
  if (!report.ok) return report.error;
  const lines = [
    `# <${report.tag}>`,
    '',
    `Source: \`${report.source}\``,
    report.generatedDoc ? `Generated docs: \`${report.generatedDoc}\`` : 'Generated docs: (missing — run `velinstyle docs generate`)',
    '',
    '## observedAttributes',
    report.observedAttributes.length ? report.observedAttributes.map((a) => `- \`${a}\``).join('\n') : '_none_',
    '',
    '## Methods (from source)',
    report.methods.length ? report.methods.map((m) => `- \`${m}()\``).join('\n') : '_none detected_',
  ];
  if (report.showSignature) {
    lines.push('', '## Toast show()', `\`${report.showSignature}\``);
  }
  if (report.events.length) {
    lines.push('', '## Custom events', report.events.map((e) => `- \`${e}\``).join('\n'));
  }
  if (report.example) {
    lines.push('', '## Example', '```html', report.example, '```');
  }
  lines.push('', '_Tip: offline create projects include `vendor/velinstyle/docs/` mini copies of core WC markdown._');
  return lines.join('\n');
}
