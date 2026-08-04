import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '__fixtures__', 'atelier-library', 'showcases');
const items = [
  { id: '01-login', title: 'Fixture Login' },
  { id: '04-pricing', title: 'Fixture Pricing' },
  { id: '36-calendar', title: 'Fixture Calendar' },
];

for (const it of items) {
  const d = join(root, it.id);
  mkdirSync(d, { recursive: true });
  writeFileSync(
    join(d, 'index.html'),
    `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${it.title}</title>
<link rel="stylesheet" href="app.css"></head>
<body><div id="root" data-atelier-id="${it.id}"></div>
<script type="module" src="app.js"></script></body></html>
`,
  );
  writeFileSync(
    join(d, 'app.js'),
    `const root = document.getElementById('root');
root.innerHTML = '<section class="velin-section" data-fixture="${it.id}"><h1>${it.title}</h1></section>';
`,
  );
  writeFileSync(join(d, 'app.css'), `[data-fixture="${it.id}"] { padding: 1rem; }\n`);
}

console.log('fixtures at', root);
