import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractComponents, renderComponent, renderComponentsIndex } from './docgen/extract-components.js';
import { extractTokens, renderTokenCategory, renderTokensIndex, renderJsonSchema } from './docgen/extract-tokens.js';
import { extractUtilities, renderUtilityFile, renderUtilitiesIndex } from './docgen/extract-utilities.js';
import { loadCliManifest, validateManifest, renderCliDocs } from './docgen/extract-cli.js';
import { extractA11yModules, renderScannerRules, renderA11yModules } from './docgen/extract-rules.js';
import { loadComponentContracts, renderWcagAaaMatrix } from './docgen/extract-a11y.js';
import { banner, heading } from './docgen/markdown.js';
import { buildSearchIndex } from './search-index.js';
import { writeAttributesDocs } from './docgen/extract-attributes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

const SCOPES = ['all', 'components', 'tokens', 'utilities', 'cli', 'rules', 'a11y', 'attributes', 'meta'];

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf-8');
}

function clearScopeDir(outDir, sub) {
  const dir = join(outDir, sub);
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
}

export async function generateDocs(options = {}) {
  const scope = options.scope || 'all';
  const outDir = options.outDir || join(PKG_ROOT, 'docs', 'generated');
  const srcDir = join(PKG_ROOT, 'src');
  const componentsDir = join(PKG_ROOT, 'components');
  const written = [];

  if (!SCOPES.includes(scope)) {
    return { ok: false, error: `Unknown scope "${scope}". Use: ${SCOPES.join(', ')}` };
  }

  const run = (name) => scope === 'all' || scope === name;

  if (run('components')) {
    clearScopeDir(outDir, 'components');
    const contracts = loadComponentContracts(PKG_ROOT);
    const components = extractComponents(componentsDir);
    for (const c of components) {
      const p = join(outDir, 'components', `${c.tag}.md`);
      writeFile(p, renderComponent(c, contracts));
      written.push(p);
    }
    const indexPath = join(outDir, 'components', 'README.md');
    writeFile(indexPath, renderComponentsIndex(components));
    written.push(indexPath);
  }

  if (run('tokens')) {
    clearScopeDir(outDir, 'tokens');
    const extracted = extractTokens(srcDir);
    for (const cat of extracted.categories) {
      const p = join(outDir, 'tokens', `${cat}.md`);
      writeFile(p, renderTokenCategory(cat, extracted.byCategory[cat]));
      written.push(p);
    }
    const indexPath = join(outDir, 'tokens', 'README.md');
    writeFile(indexPath, renderTokensIndex(extracted));
    written.push(indexPath);

    const schemaPath = join(PKG_ROOT, 'examples', 'tokens.schema.json');
    if (existsSync(schemaPath)) {
      const schemaMd = join(outDir, 'tokens', 'json-schema.md');
      writeFile(
        schemaMd,
        renderJsonSchema('examples/tokens.schema.json', readFileSync(schemaPath, 'utf-8')),
      );
      written.push(schemaMd);
    }
  }

  if (run('utilities')) {
    clearScopeDir(outDir, 'utilities');
    const extracted = extractUtilities(srcDir);
    for (const cat of extracted.files) {
      const p = join(outDir, 'utilities', `${cat}.md`);
      writeFile(p, renderUtilityFile(cat, extracted.byFile[cat]));
      written.push(p);
    }
    const indexPath = join(outDir, 'utilities', 'README.md');
    writeFile(indexPath, renderUtilitiesIndex(extracted));
    written.push(indexPath);
  }

  if (run('cli')) {
    mkdirSync(join(outDir, 'cli'), { recursive: true });
    const manifest = loadCliManifest();
    const errors = validateManifest(manifest);
    if (errors.length) {
      return { ok: false, error: errors.join('; ') };
    }
    const p = join(outDir, 'cli', 'commands.md');
    writeFile(p, renderCliDocs(manifest));
    written.push(p);
  }

  if (run('rules')) {
    mkdirSync(join(outDir, 'rules'), { recursive: true });
    const p = join(outDir, 'rules', 'scanner.md');
    writeFile(p, renderScannerRules());
    written.push(p);
  }

  if (run('a11y')) {
    mkdirSync(join(outDir, 'a11y'), { recursive: true });
    const modules = extractA11yModules(srcDir);
    const p = join(outDir, 'a11y', 'modules.md');
    writeFile(p, renderA11yModules(modules));
    written.push(p);
    const contracts = loadComponentContracts(PKG_ROOT);
    const matrixPath = join(outDir, 'a11y', 'wcag22-aaa-matrix.md');
    writeFile(matrixPath, renderWcagAaaMatrix(contracts));
    written.push(matrixPath);
  }

  if (run('attributes')) {
    mkdirSync(join(outDir, 'attributes'), { recursive: true });
    for (const { path: p, content } of writeAttributesDocs(outDir)) {
      writeFile(p, content);
      written.push(p);
    }
  }

  if (run('meta')) {
    mkdirSync(join(outDir, 'meta'), { recursive: true });
    const { buildAgentBundle } = await import('../core/meta/index.js');
    const { renderMetaReadme } = await import('./docgen/extract-meta.js');
    const bundle = await buildAgentBundle({ pkgRoot: PKG_ROOT });
    const readmePath = join(outDir, 'meta', 'README.md');
    writeFile(readmePath, renderMetaReadme(bundle));
    written.push(readmePath);
    try {
      const { buildMeta } = await import('./meta.js');
      const metaOut = await buildMeta({
        outFile: join(PKG_ROOT, 'dist', 'velin-agent.json'),
        llmsFile: join(PKG_ROOT, 'dist', 'llms.txt'),
      });
      written.push(...metaOut.written);
    } catch (err) {
      console.warn('velin-agent.json:', err.message);
    }
  }

  if (scope === 'all') {
    let root = banner('velinstyle docs generate');
    root += heading(1, 'VelinStyle generated reference');
    root += '\n> **Do not edit manually.** Regenerate with `npm run docs:generate` or `velinstyle docs generate`.\n\n';
    root += '| Section | Description |\n| --- | --- |\n';
    root += '| [components](./components/) | Web Components API |\n';
    root += '| [tokens](./tokens/) | Design tokens (`--velin-*`) |\n';
    root += '| [utilities](./utilities/) | Utility classes |\n';
    root += '| [cli](./cli/) | CLI commands |\n';
    root += '| [rules](./rules/) | Scanner & perf rules |\n';
    root += '| [a11y](./a11y/) | Accessibility CSS modules |\n';
    root += '| [attributes](./attributes/) | Velin HTML attribute extensions |\n';
    root += '| [meta](./meta/) | Velin-Meta agent context (AI assistants) |\n';
    writeFile(join(outDir, 'README.md'), root);
    written.push(join(outDir, 'README.md'));
  }

  if (options.searchIndex !== false && (scope === 'all' || scope === 'components' || scope === 'meta')) {
    try {
      const idx = buildSearchIndex({
        generatedDir: outDir,
        outFile: join(PKG_ROOT, 'dist', 'search-index.json'),
      });
      written.push(idx.outFile);
    } catch (err) {
      console.warn('search index:', err.message);
    }
  }

  return { ok: true, written: written.length, paths: written };
}

export async function docsGenerateMain(argv = process.argv.slice(2)) {
  const scopeIdx = argv.indexOf('--scope');
  const outIdx = argv.indexOf('--out');
  const scope = scopeIdx !== -1 && argv[scopeIdx + 1] ? argv[scopeIdx + 1] : 'all';
  const outDir = outIdx !== -1 && argv[outIdx + 1] ? argv[outIdx + 1] : join(PKG_ROOT, 'docs', 'generated');

  const result = await generateDocs({ scope, outDir });
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(`Generated ${result.written} file(s) in ${outDir}`);
}
