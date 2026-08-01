import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const site = join('D:/ideen/velinstyle_projekt/velinstyle-site/docs/guides');
const src = readFileSync(join(site, 'ai-skills.html'), 'utf8');

function make(file, title, crumb, bodyHtml) {
  let t = src;
  t = t.replaceAll('ai-skills.html', file);
  t = t.replaceAll('AI Skills · VelinStyle', `${title} · VelinStyle`);
  t = t.replace(/<title>[^<]*<\/title>/, `<title>${title} · VelinStyle</title>`);
  const start = t.indexOf('<main class="velin-doc-main"');
  const end = t.indexOf('</main>', start);
  if (start < 0 || end < 0) throw new Error(`main not found ${file}`);
  const main = `<main class="velin-doc-main" id="main-content">
      <ol class="velin-doc-breadcrumb"><li><a href="../getting-started/introduction.html">Docs</a></li><li><a href="../guides/index.html">Guides</a></li><li>${crumb}</li></ol>
      ${bodyHtml}
    `;
  t = t.slice(0, start) + main + t.slice(end);
  writeFileSync(join(site, file), t);
  console.log('wrote', file);
}

make(
  'design-intelligence.html',
  'Design Intelligence',
  'Design Intelligence',
  `<h1>Design Intelligence <span class="velin-badge velin-badge--primary">1.2.0</span> <span class="velin-badge">beta</span></h1>
<p class="velin-lead">Plan → registries → constraints → review. Structure beyond CSS classes.</p>
<h2>Quick start</h2>
<pre><code>velinstyle plan "SaaS landing with pricing" --json
velinstyle create landing ./my-site
velinstyle check ./my-site --profile marketing</code></pre>
<h2>Profiles</h2>
<p><code>marketing</code> · <code>app</code> · <code>docs</code> · <code>fragment</code> · <code>ecommerce</code></p>
<p>Full guide: <a href="https://github.com/SkyliteDesign/velinstyle/blob/main/docs/guides/design-intelligence.md">design-intelligence.md</a></p>`,
);

make(
  'cli-ship-surface.html',
  'CLI ship surface',
  'CLI ship surface',
  `<h1>CLI ship surface <span class="velin-badge velin-badge--primary">1.2.0</span></h1>
<p class="velin-lead">create · serve · doctor · check · scan · review · wc api</p>
<pre><code>npx @birdapi/velinstyle create landing ./my-site
cd my-site
npx @birdapi/velinstyle serve .
npx @birdapi/velinstyle check . --profile marketing</code></pre>
<p>Kinds: <code>landing</code> · <code>dashboard</code> · <code>docs</code> · <code>auth</code>. See also <a href="../extend/cli.html">CLI reference</a>.</p>`,
);

make(
  'faq.html',
  'FAQ',
  'FAQ',
  `<h1>FAQ <span class="velin-badge velin-badge--primary">1.2.0</span></h1>
<p>Package name is <strong>@birdapi/velinstyle</strong> (not <code>velinstyle</code>). AAA-oriented defaults do <strong>not</strong> certify your app. Best fit: landings, docs, simple admin — not yet primary for large shop/enterprise admin.</p>
<p>Full FAQ: <a href="https://github.com/SkyliteDesign/velinstyle/blob/main/FAQ.md">FAQ.md</a> · <a href="troubleshooting.html">Troubleshooting</a> · <a href="deploy.html">Deploy</a></p>`,
);

make(
  'troubleshooting.html',
  'Troubleshooting',
  'Troubleshooting',
  `<h1>Troubleshooting <span class="velin-badge velin-badge--primary">1.2.0</span></h1>
<ul>
<li><code>npx velinstyle</code> 404 → use <code>npx @birdapi/velinstyle</code></li>
<li><code>check</code> floods on docs monorepos → gate scaffolds or single HTML files</li>
<li>Use <code>--profile app</code> for dashboards</li>
<li>After clone: <code>npm run build</code> (<code>dist/</code> is generated)</li>
</ul>
<p>Full guide: <a href="https://github.com/SkyliteDesign/velinstyle/blob/main/TROUBLESHOOTING.md">TROUBLESHOOTING.md</a></p>`,
);

make(
  'deploy.html',
  'Deploy',
  'Deploy',
  `<h1>Deploy <span class="velin-badge velin-badge--primary">1.2.0</span></h1>
<p>Ship HTML + CSS (+ optional WC JS, themes, icon sprite). Pin CDN versions. Run <code>doctor</code> + <code>check</code> before upload.</p>
<pre><code>velinstyle create landing ./site
velinstyle check ./site --profile marketing
# deploy ./site to any static host</code></pre>
<p>Full guide: <a href="https://github.com/SkyliteDesign/velinstyle/blob/main/DEPLOY.md">DEPLOY.md</a></p>`,
);
