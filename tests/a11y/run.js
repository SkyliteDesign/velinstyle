import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const SCAN_DIRS = ['docs', 'samples'];

function findHtmlFiles(relDir) {
  const fullPath = join(ROOT, relDir);
  if (!existsSync(fullPath)) return [];
  const results = [];
  for (const entry of readdirSync(fullPath, { withFileTypes: true })) {
    const childRel = join(relDir, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(childRel));
    } else if (entry.name.endsWith('.html')) {
      results.push({ label: childRel, path: join(ROOT, childRel) });
    }
  }
  return results;
}

async function hydrateComponents(window) {
  const bundlePath = resolve(ROOT, 'dist', 'velinstyle-components.iife.js');
  if (!existsSync(bundlePath)) return;
  const code = readFileSync(bundlePath, 'utf-8');
  window.eval(code);

  const tags = [
    'velin-modal', 'velin-dropdown', 'velin-accordion', 'velin-tabs', 'velin-toast',
    'velin-drawer', 'velin-popover', 'velin-carousel', 'velin-collapse', 'velin-tooltip-wc',
  ];
  const timeout = new Promise((resolve) => setTimeout(resolve, 2000));
  const defined = Promise.all(
    tags.map((tag) =>
      Promise.race([
        window.customElements.whenDefined(tag),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ])
    )
  );
  await Promise.race([defined, timeout]);
}

function installJsdomPolyfills(window) {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return false; },
    });
  }
}

async function runAxe(htmlPath, html) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;

  installJsdomPolyfills(window);
  window.eval(readFileSync(resolve(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), 'utf-8'));

  if (html.includes('<velin-')) {
    await hydrateComponents(window);
    await new Promise((r) => setTimeout(r, 50));
  }

  const axeRules = {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    rules: {
      'color-contrast': { enabled: false },
      'color-contrast-enhanced': { enabled: false },
    },
  };
  if (html.includes('<velin-tabs')) {
    axeRules.rules['aria-required-parent'] = { enabled: false };
    axeRules.rules['aria-required-children'] = { enabled: false };
  }

  const results = await window.axe.run(window.document, axeRules);

  dom.window.close();
  return results;
}

async function main() {
  console.log('VelinStyle Accessibility Tests (axe-core + JSDOM)');
  console.log('='.repeat(55));

  const allFiles = SCAN_DIRS.flatMap(findHtmlFiles);

  if (allFiles.length === 0) {
    console.log('\nNo HTML files found. Skipping.');
    process.exit(0);
  }

  let totalViolations = 0;
  let filesWithViolations = 0;

  for (const { label, path: filePath } of allFiles) {
    try {
      const html = readFileSync(filePath, 'utf-8');
      const results = await runAxe(filePath, html);
      const violationCount = results.violations.length;

      if (violationCount === 0) {
        console.log(`\n  PASS  ${label} (${results.passes.length} rules passed)`);
      } else {
        filesWithViolations++;
        totalViolations += violationCount;
        console.log(`\n  FAIL  ${label} (${violationCount} violation(s))`);
        for (const v of results.violations) {
          console.log(`    [${v.impact}] ${v.id}: ${v.help}`);
          for (const node of v.nodes.slice(0, 2)) {
            console.log(`      - ${node.target.join(' > ')}`);
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
  console.log(`Violations:    ${totalViolations} (in ${filesWithViolations} file(s))`);
  process.exit(totalViolations > 0 ? 1 : 0);
}

main();
