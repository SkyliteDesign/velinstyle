import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { buildAgentBundle, buildLlmsTxt, buildPageMeta, serializePageMetaScript } from '../core/meta/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

/**
 * @param {object} [options]
 * @param {string} [options.outFile]
 * @param {string} [options.llmsFile]
 * @param {string} [options.baseUrl]
 * @param {boolean} [options.llms]
 */
export async function buildMeta(options = {}) {
  const outFile = options.outFile || join(PKG_ROOT, 'dist', 'velin-agent.json');
  const llmsFile = options.llmsFile || join(PKG_ROOT, 'dist', 'llms.txt');
  const bundle = await buildAgentBundle({ pkgRoot: PKG_ROOT });

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(bundle, null, 2), 'utf-8');

  const written = [outFile];

  if (options.llms !== false) {
    const llms = buildLlmsTxt(bundle, options.baseUrl || 'https://velinstyle.info');
    writeFileSync(llmsFile, llms, 'utf-8');
    written.push(llmsFile);
  }

  return { ok: true, bundle, written, count: written.length };
}

/**
 * @param {string} htmlPath
 * @param {object} [options]
 */
export function metaPage(htmlPath, options = {}) {
  const abs = resolve(htmlPath);
  if (!existsSync(abs)) {
    return { ok: false, error: `File not found: ${abs}` };
  }
  const html = readFileSync(abs, 'utf-8');
  const rel = htmlPath.replace(/\\/g, '/');
  const meta = buildPageMeta(html, rel, PKG_ROOT);
  const script = serializePageMetaScript(meta);

  if (options.write) {
    if (html.includes('id="velin-meta"')) {
      const updated = html.replace(
        /<script[^>]*id=["']velin-meta["'][^>]*>[\s\S]*?<\/script>/i,
        script,
      );
      writeFileSync(abs, updated, 'utf-8');
    } else if (/<\/head>/i.test(html)) {
      writeFileSync(abs, html.replace(/<\/head>/i, `  ${script}\n</head>`), 'utf-8');
    } else {
      return { ok: false, error: 'No </head> or existing velin-meta block found' };
    }
  }

  return { ok: true, meta, script };
}

export async function metaMain(argv = process.argv.slice(2)) {
  const pageIdx = argv.indexOf('page');
  if (pageIdx !== -1 && argv[pageIdx + 1]) {
    const write = argv.includes('--write');
    const result = metaPage(argv[pageIdx + 1], { write });
    if (!result.ok) {
      console.error(result.error);
      process.exit(1);
    }
    if (write) {
      console.log(`Updated velin-meta in ${argv[pageIdx + 1]}`);
    } else {
      console.log(result.script);
    }
    return;
  }

  const outIdx = argv.indexOf('--out');
  const llmsIdx = argv.indexOf('--llms-out');
  const baseIdx = argv.indexOf('--base-url');
  const noLlms = argv.includes('--no-llms');

  const result = await buildMeta({
    outFile: outIdx !== -1 && argv[outIdx + 1] ? resolve(argv[outIdx + 1]) : undefined,
    llmsFile: llmsIdx !== -1 && argv[llmsIdx + 1] ? resolve(argv[llmsIdx + 1]) : undefined,
    baseUrl: baseIdx !== -1 && argv[baseIdx + 1] ? argv[baseIdx + 1] : undefined,
    llms: !noLlms,
  });

  console.log(`Velin-Meta: wrote ${result.count} file(s)`);
  for (const p of result.written) console.log(`  ${p}`);
}
