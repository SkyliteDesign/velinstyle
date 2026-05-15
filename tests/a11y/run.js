import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const DIRS = ['docs', 'samples'];

function findHtmlFiles(dir) {
  const fullPath = join(ROOT, dir);
  if (!existsSync(fullPath)) return [];
  return readdirSync(fullPath)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ dir, file: f, path: join(fullPath, f) }));
}

async function runAxe(htmlPath) {
  const html = readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  const { document } = dom.window;

  // axe-core requires a global window/document — inject into the JSDOM context
  dom.window.eval(readFileSync(resolve(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf-8'));

  const results = await dom.window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  });

  dom.window.close();
  return results;
}

console.log('VelinStyle Accessibility Tests (axe-core + JSDOM)');
console.log('='.repeat(55));

const allFiles = DIRS.flatMap(findHtmlFiles);

if (allFiles.length === 0) {
  console.log('\nNo HTML files found in docs/ or samples/. Skipping.');
  process.exit(0);
}

let totalViolations = 0;
let totalPasses = 0;
let filesWithViolations = 0;

for (const { dir, file, path: filePath } of allFiles) {
  const label = `${dir}/${file}`;
  try {
    const results = await runAxe(filePath);
    const violationCount = results.violations.length;
    const passCount = results.passes.length;
    totalPasses += passCount;

    if (violationCount === 0) {
      console.log(`\n  PASS  ${label} (${passCount} rules passed)`);
    } else {
      filesWithViolations++;
      totalViolations += violationCount;
      console.log(`\n  FAIL  ${label} (${violationCount} violation(s))`);

      for (const v of results.violations) {
        console.log(`    [${v.impact}] ${v.id}: ${v.help}`);
        console.log(`      ${v.helpUrl}`);
        for (const node of v.nodes.slice(0, 3)) {
          console.log(`      - ${node.target.join(' > ')}`);
          if (node.failureSummary) {
            const lines = node.failureSummary.split('\n').map((l) => `          ${l}`);
            console.log(lines.join('\n'));
          }
        }
        if (v.nodes.length > 3) {
          console.log(`      ... and ${v.nodes.length - 3} more node(s)`);
        }
      }
    }
  } catch (err) {
    console.log(`\n  ERROR  ${label}: ${err.message}`);
    totalViolations++;
  }
}

console.log('\n' + '='.repeat(55));
console.log(`Files scanned: ${allFiles.length}`);
console.log(`Rules passed:  ${totalPasses}`);
console.log(`Violations:    ${totalViolations} (in ${filesWithViolations} file(s))`);

if (totalViolations > 0) {
  console.log('\nAccessibility violations detected. Exiting with code 1.');
  process.exit(1);
} else {
  console.log('\nAll checks passed.');
}
