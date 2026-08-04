/**
 * Atelier Library pull: resolve curated num/id → copy or HTTPS fetch showcase assets.
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { emitFormatShell, buildPullReadme, normalizeFormat } from './atelier-formats.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CATALOG_PATH = join(__dirname, 'atelier-catalog.json');
const DEFAULT_BASE_URL = 'https://velinstyle.info/atelier/library/';
const ASSET_NAMES = ['index.html', 'app.js', 'app.css'];

/**
 * @param {string} [catalogPath]
 */
export function loadCatalog(catalogPath = DEFAULT_CATALOG_PATH) {
  const full = resolve(catalogPath);
  if (!existsSync(full)) {
    return { ok: false, error: `Catalog not found: ${full}`, items: [] };
  }
  const data = JSON.parse(readFileSync(full, 'utf-8'));
  return { ok: true, items: data.items || [], meta: data };
}

/**
 * Resolve query like "36", "036", "36-calendar", or "calendar" (unique suffix).
 * SEO ids (e.g. 3600-…) are not matched by short number lookup.
 * @param {string} query
 * @param {{ catalogPath?: string, items?: object[] }} [opts]
 */
export function resolveAtelierEntry(query, opts = {}) {
  const q = String(query || '').trim();
  if (!q) return { ok: false, error: 'Empty atelier query' };

  const items = opts.items || loadCatalog(opts.catalogPath).items;
  if (!items?.length) return { ok: false, error: 'Atelier catalog is empty' };

  // Exact id
  const byId = items.find((it) => it.id === q);
  if (byId) return { ok: true, entry: byId };

  // Numeric: 36 / 036 → num pad match only (not 3600)
  if (/^\d{1,3}$/.test(q)) {
    const n = String(Number(q));
    const entry = items.find((it) => String(Number(it.num)) === n);
    if (entry) return { ok: true, entry };
    return { ok: false, error: `Unknown atelier number "${q}". Try: velinstyle atelier list` };
  }

  // id prefix or slug contains
  const lower = q.toLowerCase();
  const matches = items.filter(
    (it) => it.id.toLowerCase() === lower
      || it.id.toLowerCase().startsWith(lower + '-')
      || it.id.toLowerCase().endsWith('-' + lower)
      || it.id.toLowerCase().includes('-' + lower),
  );
  if (matches.length === 1) return { ok: true, entry: matches[0] };
  if (matches.length > 1) {
    return {
      ok: false,
      error: `Ambiguous "${q}": ${matches.slice(0, 8).map((m) => m.id).join(', ')}${matches.length > 8 ? '…' : ''}`,
    };
  }
  return { ok: false, error: `Unknown atelier id "${q}". Try: velinstyle atelier list` };
}

/**
 * @param {string} listStr comma-separated queries
 * @param {{ catalogPath?: string, items?: object[] }} [opts]
 */
export function resolveAtelierList(listStr, opts = {}) {
  const parts = String(listStr || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return { ok: false, error: 'Empty --atelier list', entries: [] };
  const entries = [];
  for (const p of parts) {
    const r = resolveAtelierEntry(p, opts);
    if (!r.ok) return { ok: false, error: r.error, entries };
    entries.push(r.entry);
  }
  return { ok: true, entries };
}

export function listAtelierEntries(opts = {}) {
  const cat = opts.items ? { ok: true, items: opts.items } : loadCatalog(opts.catalogPath);
  if (!cat.ok) return cat;
  return { ok: true, items: cat.items };
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function libraryRootFromFrom(fromDir) {
  const root = resolve(fromDir);
  // Accept …/library or …/library/showcases or collection root with showcases/
  if (existsSync(join(root, 'showcases'))) return root;
  if (existsSync(join(root, '01-login')) || existsSync(join(root, '04-pricing'))) {
    // already showcases dir
    return dirname(root);
  }
  const parent = join(root, '..');
  if (existsSync(join(parent, 'showcases'))) return parent;
  return root;
}

function localShowcaseDir(libraryRoot, entry) {
  const candidates = [
    join(libraryRoot, 'showcases', entry.id),
    join(libraryRoot, entry.id),
    join(libraryRoot, 'showcases', entry.id.replace(/^0+/, '') || entry.id),
  ];
  for (const c of candidates) {
    if (existsSync(join(c, 'index.html')) || existsSync(join(c, 'app.js'))) return c;
  }
  return null;
}

/**
 * @param {object} entry
 * @param {{ from?: string, baseUrl?: string }} opts
 * @returns {Promise<{ ok: boolean, files?: Record<string,string>, error?: string, source?: string }>}
 */
export async function fetchShowcaseAssets(entry, opts = {}) {
  const from = opts.from || process.env.VELINSTYLE_ATELIER_ROOT || '';
  if (from) {
    const lib = libraryRootFromFrom(from);
    const dir = localShowcaseDir(lib, entry);
    if (!dir) {
      return { ok: false, error: `Local showcase not found for ${entry.id} under ${lib}` };
    }
    const files = {};
    for (const name of ASSET_NAMES) {
      const p = join(dir, name);
      if (existsSync(p)) files[name] = readFileSync(p, 'utf-8');
    }
    if (!Object.keys(files).length) {
      return { ok: false, error: `No assets in ${dir}` };
    }
    return { ok: true, files, source: `local:${dir}` };
  }

  const base = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/?$/, '/');
  const urlBase = `${base}showcases/${entry.id}/`;
  const files = {};
  for (const name of ASSET_NAMES) {
    const url = urlBase + name;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (name === 'index.html') {
          return { ok: false, error: `HTTP ${res.status} fetching ${url}` };
        }
        continue;
      }
      files[name] = await res.text();
    } catch (err) {
      return { ok: false, error: `Fetch failed ${url}: ${err.message}` };
    }
  }
  if (!files['index.html'] && !files['app.js']) {
    return { ok: false, error: `No assets at ${urlBase}` };
  }
  return { ok: true, files, source: urlBase };
}

/**
 * Pull one atelier entry into output directory.
 * @param {string} query
 * @param {{
 *   output?: string,
 *   from?: string,
 *   baseUrl?: string,
 *   format?: string,
 *   catalogPath?: string,
 *   rewriteVendor?: string,
 * }} opts
 */
export async function pullAtelier(query, opts = {}) {
  const resolved = resolveAtelierEntry(query, { catalogPath: opts.catalogPath });
  if (!resolved.ok) return resolved;
  const { entry } = resolved;

  const fmt = normalizeFormat(opts.format || 'html');
  if (!fmt.ok) return fmt;

  const fetched = await fetchShowcaseAssets(entry, {
    from: opts.from,
    baseUrl: opts.baseUrl,
  });
  if (!fetched.ok) return fetched;

  const outRoot = resolve(opts.output || join(process.cwd(), 'velin-atelier', entry.id));
  ensureDir(outRoot);

  const files = { ...fetched.files };
  if (opts.rewriteVendor) {
    const vendor = opts.rewriteVendor.replace(/\\/g, '/').replace(/\/?$/, '/');
    for (const key of Object.keys(files)) {
      if (typeof files[key] !== 'string') continue;
      files[key] = files[key]
        .replace(/\.\.\/\.\.\/vendor\//g, vendor)
        .replace(/\.\.\/vendor\//g, vendor);
    }
  }

  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(outRoot, name), content, 'utf-8');
  }

  const shell = emitFormatShell({
    id: entry.id,
    title: entry.title,
    assetDir: '.',
    format: fmt.format,
  });
  if (!shell.ok) return shell;
  for (const [name, content] of Object.entries(shell.files || {})) {
    writeFileSync(join(outRoot, name), content, 'utf-8');
  }

  const readme = buildPullReadme({
    id: entry.id,
    title: entry.title,
    format: fmt.format,
    sourceHint: fetched.source,
  });
  writeFileSync(join(outRoot, 'README.md'), readme, 'utf-8');

  return {
    ok: true,
    entry,
    path: outRoot,
    format: fmt.format,
    source: fetched.source,
    files: [...Object.keys(files), ...Object.keys(shell.files || {}), 'README.md'],
  };
}

/**
 * Build a composite HTML page that mounts multiple atelier showcases.
 * @param {string[]} queries
 * @param {{
 *   output?: string,
 *   from?: string,
 *   baseUrl?: string,
 *   catalogPath?: string,
 *   assetsSubdir?: string,
 * }} opts
 */
export async function composeAtelierPage(queries, opts = {}) {
  const list = resolveAtelierList(Array.isArray(queries) ? queries.join(',') : String(queries), {
    catalogPath: opts.catalogPath,
  });
  if (!list.ok) return list;

  const outFile = opts.output
    ? resolve(opts.output)
    : resolve(process.cwd(), 'velin-atelier', 'compose.html');
  const outDir = dirname(outFile);
  const assetsSub = opts.assetsSubdir || 'atelier-assets';
  const assetsRoot = join(outDir, assetsSub);
  ensureDir(assetsRoot);

  const sections = [];
  const planSections = [];

  for (const entry of list.entries) {
    const fetched = await fetchShowcaseAssets(entry, {
      from: opts.from,
      baseUrl: opts.baseUrl,
    });
    if (!fetched.ok) return { ok: false, error: fetched.error, entry: entry.id };

    const dest = join(assetsRoot, entry.id);
    ensureDir(dest);
    for (const [name, content] of Object.entries(fetched.files)) {
      writeFileSync(join(dest, name), content, 'utf-8');
    }

    const rel = `${assetsSub}/${entry.id}`.replace(/\\/g, '/');
    sections.push(`
  <section class="velin-atelier-compose__block" data-atelier-id="${entry.id}" aria-label="${entry.title || entry.id}">
    <h2 class="velin-atelier-compose__title">${entry.title || entry.id} <span class="velin-text-muted">#${entry.num}</span></h2>
    <iframe class="velin-atelier-compose__frame" title="${entry.id}" src="${rel}/index.html" loading="lazy"></iframe>
  </section>`);
    planSections.push({
      atelierId: entry.id,
      num: entry.num,
      title: entry.title,
      href: entry.href,
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VelinStyle Atelier compose (beta)</title>
  <style>
    .velin-atelier-compose__frame { width: 100%; min-height: 70vh; border: 1px solid #ccc; border-radius: 8px; }
    .velin-atelier-compose__block { margin-block: 2rem; }
  </style>
</head>
<body>
  <!-- Generated by velinstyle scaffold --atelier (beta). Atelier Library compose — not Velin Studio. -->
  <!-- Limitation: mounts original vanilla showcases; native Blade/Vue/React rewrites are planned. -->
  <main class="velin-atelier-compose">
    <header>
      <h1>Atelier compose (beta)</h1>
      <p>Composed from Library ids: ${list.entries.map((e) => e.id).join(', ')}. Studio Builder remains planned.</p>
    </header>
${sections.join('\n')}
  </main>
</body>
</html>
`;

  ensureDir(outDir);
  writeFileSync(outFile, html, 'utf-8');
  writeFileSync(
    join(outDir, 'README.md'),
    buildPullReadme({
      id: list.entries.map((e) => e.id).join('+'),
      title: 'Atelier compose (beta)',
      format: 'html',
      sourceHint: 'scaffold --atelier',
    }),
    'utf-8',
  );

  return {
    ok: true,
    path: outFile,
    entries: list.entries,
    planSections,
    mode: 'atelier-compose',
    html,
  };
}

/**
 * Plan payload when --atelier is set.
 * @param {string} listStr
 * @param {{ catalogPath?: string, prompt?: string }} opts
 */
export function planFromAtelierList(listStr, opts = {}) {
  const list = resolveAtelierList(listStr, { catalogPath: opts.catalogPath });
  if (!list.ok) return list;
  return {
    ok: true,
    analysis: {
      intent: 'atelier-compose',
      confidence: 'high',
      pageId: 'atelier-compose',
      prompt: opts.prompt || '',
    },
    plan: {
      page: { id: 'atelier-compose', title: 'Atelier compose (beta)' },
      sections: list.entries.map((e) => ({
        id: e.id,
        atelierId: e.id,
        num: e.num,
        title: e.title,
        blueprint: null,
        source: 'atelier-library',
      })),
      maturity: 'beta',
      note: 'Composes Atelier Library showcases. Velin Studio Builder is planned — not shipped.',
    },
  };
}
