import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { listBlueprints } = await import(pathToFileURL(join(root, 'cli/blueprint.js')).href);
const ids = listBlueprints();

const siteTpl = join(root, '../velinstyle-site/docs/guides/ai-skills.html');
const { readFileSync } = await import('fs');
let t = readFileSync(siteTpl, 'utf8');
const file = 'blueprints.html';
const title = 'Blueprints';
t = t.replaceAll('ai-skills.html', file);
t = t.replaceAll('AI Skills · VelinStyle', `${title} · VelinStyle`);
t = t.replace(/<title>[^<]*<\/title>/, `<title>${title} · VelinStyle</title>`);
const start = t.indexOf('<main class="velin-doc-main"');
const end = t.indexOf('</main>', start);
const lis = ids.map((id) => `<li><code>${id}</code></li>`).join('\n');
const main = `<main class="velin-doc-main" id="main-content">
      <ol class="velin-doc-breadcrumb"><li><a href="../getting-started/introduction.html">Docs</a></li><li><a href="../guides/index.html">Guides</a></li><li>Blueprints</li></ol>
      <h1>Blueprints <span class="velin-badge velin-badge--primary">1.2.0</span></h1>
      <p class="velin-lead">HTML snippets with validated <code>velin-*</code> classes. Use for scaffolds and CI (<code>--strict</code>).</p>
      <h2>CLI</h2>
      <pre><code>velinstyle blueprint list
velinstyle blueprint hero-section -o snippet.html --strict
velinstyle check .   # includes blueprint --strict</code></pre>
      <h2>Catalog (${ids.length})</h2>
      <ul>
${lis}
      </ul>
      <p>Related: <a href="cli-ship-surface.html">CLI ship surface</a> · <a href="design-intelligence.html">Design Intelligence</a></p>
    `;
t = t.slice(0, start) + main + t.slice(end);
writeFileSync(join(root, '../velinstyle-site/docs/guides', file), t);
console.log('wrote blueprints.html', ids.length);
