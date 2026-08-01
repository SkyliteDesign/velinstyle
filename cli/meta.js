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

  // JSON twins for agents (pages, sections, knowledge, constraints)
  const twinDir = join(PKG_ROOT, 'docs', 'generated', 'intelligence');
  mkdirSync(twinDir, { recursive: true });
  const twins = {
    'pages.json': bundle.knowledgeGraph?.pages || [],
    'sections.json': bundle.knowledgeGraph?.sections || [],
    'components.json': bundle.knowledgeGraph?.components || [],
    'design-constraints.json': bundle.knowledgeGraph?.designConstraints || [],
    'index.json': {
      version: bundle.framework.version,
      generatedAt: bundle.generatedAt,
      pageCount: bundle.knowledgeGraph?.pageCount || 0,
      sectionCount: bundle.knowledgeGraph?.sectionCount || 0,
      componentCount: bundle.knowledgeGraph?.componentCount || 0,
      constraintCount: bundle.knowledgeGraph?.designConstraints?.length || 0,
      agentBundle: 'dist/velin-agent.json',
      llmsTxt: 'dist/llms.txt',
    },
  };
  for (const [name, data] of Object.entries(twins)) {
    const target = join(twinDir, name);
    writeFileSync(target, JSON.stringify(data, null, 2), 'utf-8');
    written.push(target);
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
  let meta = buildPageMeta(html, rel, PKG_ROOT);

  // Merge curated fields from existing velin-meta so --write does not clobber goals/intent.
  const existingMatch = html.match(
    /<script[^>]*id=["']velin-meta["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (existingMatch) {
    try {
      const prev = JSON.parse(existingMatch[1]);
      meta = mergePageMeta(prev, meta);
      if (options.write && meta._droppedKeys?.length) {
        console.warn(
          `velin-meta --write: dropping non-allowlisted keys: ${meta._droppedKeys.join(', ')} ` +
            `(kept: ${[...META_MERGE_ALLOWLIST].join(', ')})`,
        );
      }
      delete meta._droppedKeys;
    } catch {
      /* keep generated meta */
    }
  } else {
    delete meta._droppedKeys;
  }

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

/** Keys preserved from previous velin-meta on --write (plus nested page.*). */
const META_MERGE_ALLOWLIST = new Set([
  'page', 'goals', 'intent', 'notes', 'curated', 'id', 'title',
]);

/** Preserve curated page goals/intent while refreshing component inventory. */
function mergePageMeta(prev, next) {
  const out = { ...next };
  const dropped = [];
  if (prev && typeof prev === 'object') {
    for (const key of Object.keys(prev)) {
      if (!META_MERGE_ALLOWLIST.has(key) && !(key in next)) {
        dropped.push(key);
      }
    }
    out.page = { ...(next.page || {}), ...(prev.page || {}), ...(next.page || {}) };
    if (prev.page?.intent) out.page.intent = prev.page.intent;
    if (prev.page?.goals) out.page.goals = prev.page.goals;
    if (prev.page?.title) out.page.title = prev.page.title;
    if (prev.page?.id) out.page.id = prev.page.id;
    if (prev.goals) out.goals = prev.goals;
    if (prev.intent) out.intent = prev.intent;
    if (prev.notes) out.notes = prev.notes;
    if (prev.curated) out.curated = prev.curated;
    if (prev.id && !out.id) out.id = prev.id;
  }
  out.allowed = next.allowed;
  out.attributes = next.attributes;
  out.a11y = next.a11y;
  out.version = next.version;
  out.mime = next.mime;
  out._droppedKeys = dropped;
  return out;
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
