import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const comps = join('D:/ideen/velinstyle_projekt/velinstyle-site/docs/components');
const src = readFileSync(join(comps, 'form-summary.html'), 'utf8');

function make(file, title, tag, body) {
  let t = src;
  t = t.replaceAll('form-summary.html', file);
  t = t.replaceAll('Form summary', title);
  t = t.replaceAll('form-summary', file.replace('.html', ''));
  t = t.replace(/<title>[^<]*<\/title>/, `<title>${title} · Components · VelinStyle</title>`);
  t = t.replace(
    /docs\/components\/form-summary\.html/g,
    `docs/components/${file}`,
  );
  const start = t.indexOf('<main class="velin-doc-main"');
  const end = t.indexOf('</main>', start);
  if (start < 0 || end < 0) throw new Error('main missing');
  const main = `<main class="velin-doc-main" id="main-content">
      <ol class="velin-doc-breadcrumb"><li><a href="../getting-started/introduction.html">Docs</a></li><li><a href="../components/accordion.html">Components</a></li><li>${title}</li></ol>
      ${body}
    `;
  t = t.slice(0, start) + main + t.slice(end);
  writeFileSync(join(comps, file), t);
  console.log('wrote', file);
}

make(
  'calendar.html',
  'Calendar',
  'velin-calendar',
  `<h1>Calendar <span class="velin-badge">1.2.0</span></h1>
<p class="lead">Month picker Web Component. Emits <code>velin-change</code> with an ISO date. Optional <code>min</code> / <code>max</code>.</p>
<div class="velin-alert velin-alert--info" role="status"><div class="velin-alert__content"><strong>Maturity:</strong> stable primitive in 1.2.0.</div></div>
<h2 id="basic">Basic</h2>
<div class="velin-doc-example"><div class="velin-doc-example__panel active"><div class="velin-doc-example__preview">
  <velin-calendar label="Pick a date"></velin-calendar>
</div></div></div>
<pre><code>&lt;velin-calendar label="Pick a date"&gt;&lt;/velin-calendar&gt;</code></pre>
<h2 id="api">API</h2>
<ul>
  <li>Attributes: <code>value</code>, <code>min</code>, <code>max</code>, <code>label</code></li>
  <li>Event: <code>velin-change</code></li>
  <li>Keyboard: arrows, Home/End, PageUp/Down, Enter/Space</li>
</ul>
<p>Offline: <code>velinstyle wc api velin-calendar</code> · Generated: <a href="../generated/components/velin-calendar.md">velin-calendar.md</a></p>`,
);

make(
  'file-dropzone.html',
  'File dropzone',
  'velin-file-dropzone',
  `<h1>File dropzone <span class="velin-badge">1.2.0</span></h1>
<p class="lead">Client-side file picker / drop target. Emits <code>velin-files</code> / <code>velin-error</code>. Does <strong>not</strong> upload to a server.</p>
<div class="velin-alert velin-alert--info" role="status"><div class="velin-alert__content"><strong>Maturity:</strong> stable primitive in 1.2.0.</div></div>
<h2 id="basic">Basic</h2>
<div class="velin-doc-example"><div class="velin-doc-example__panel active"><div class="velin-doc-example__preview">
  <velin-file-dropzone label="Drop files here" multiple accept="image/*,.pdf"></velin-file-dropzone>
</div></div></div>
<pre><code>&lt;velin-file-dropzone label="Drop files here" multiple accept="image/*,.pdf"&gt;&lt;/velin-file-dropzone&gt;</code></pre>
<h2 id="api">API</h2>
<ul>
  <li>Attributes: <code>accept</code>, <code>multiple</code>, <code>label</code>, <code>progress</code></li>
  <li>Events: <code>velin-files</code>, <code>velin-error</code></li>
  <li>Property: <code>files</code></li>
</ul>
<p>Offline: <code>velinstyle wc api velin-file-dropzone</code> · Generated: <a href="../generated/components/velin-file-dropzone.md">velin-file-dropzone.md</a></p>`,
);
