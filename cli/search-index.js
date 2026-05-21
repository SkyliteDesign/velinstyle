import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

const TITLE_RE = /^#\s+<([^>]+)>|^#\s+(.+)$/m;
const H1_RE = /^#\s+(.+)$/m;

function excerptFromMd(text, max = 160) {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('#') || !line.trim() || line.startsWith('|') || line.startsWith('<!--')) continue;
    return line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`/g, '').trim().slice(0, max);
  }
  return '';
}

function slugId(category, name) {
  return `${category}:${name}`.replace(/\s+/g, '-').toLowerCase();
}

function walkFiles(dir, cb) {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(full, cb);
    else cb(full);
  }
}

function collectMarkdown(dir, category, urlPrefix, weight = 1) {
  const entries = [];
  if (!existsSync(dir)) return entries;
  walkFiles(dir, (full) => {
    const name = basename(full);
    if (!name.endsWith('.md') || name === 'README.md') return;
    const text = readFileSync(full, 'utf-8');
    const tagMatch = text.match(TITLE_RE);
    const h1Match = text.match(H1_RE);
    const title = tagMatch
      ? (tagMatch[1] || tagMatch[2] || basename(name, '.md')).trim()
      : (h1Match ? h1Match[1] : basename(name, '.md')).replace(/`/g, '').trim();
    const rel = relative(dir, full).replace(/\\/g, '/');
    const base = basename(name, '.md');
    entries.push({
      id: slugId(category, base),
      title,
      excerpt: excerptFromMd(text),
      url: `${urlPrefix}${rel.replace(/\.md$/, '.html')}`,
      category,
      keywords: [base, category, title],
      weight,
    });
  });
  return entries;
}

function collectHtmlSamples(dirs) {
  const entries = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const walk = (folder) => {
      for (const ent of readdirSync(folder, { withFileTypes: true })) {
        const full = join(folder, ent.name);
        if (ent.isDirectory()) walk(full);
        else if (ent.name.endsWith('.html')) {
          const text = readFileSync(full, 'utf-8');
          const titleM = text.match(/<title>([^<]+)<\/title>/i);
          const h1M = text.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          const title = (h1M?.[1] || titleM?.[1] || ent.name).replace(/<[^>]+>/g, '').trim();
          const rel = relative(PKG_ROOT, full).replace(/\\/g, '/');
          entries.push({
            id: slugId('examples', rel),
            title,
            excerpt: rel,
            url: rel,
            category: 'examples',
            keywords: [ent.name, 'sample', 'example'],
            weight: 0.85,
          });
        }
      }
    };
    walk(dir);
  }
  return entries;
}

function collectCliApi(manifestPath) {
  const entries = [];
  if (!existsSync(manifestPath)) return entries;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  for (const cmd of manifest.commands || []) {
    entries.push({
      id: slugId('api', cmd.name || cmd.id),
      title: `CLI: ${cmd.name || cmd.id}`,
      excerpt: cmd.summary || cmd.description || '',
      url: `docs/generated/cli/commands.html#${cmd.name || cmd.id}`,
      category: 'api',
      keywords: ['cli', cmd.name, ...(cmd.aliases || [])],
      weight: 1.1,
    });
  }
  return entries;
}

/**
 * @param {object} [options]
 * @param {string} [options.outFile]
 * @param {string} [options.generatedDir]
 * @param {string[]} [options.extraHtmlDirs]
 */
export function buildSearchIndex(options = {}) {
  const generatedDir = options.generatedDir || join(PKG_ROOT, 'docs', 'generated');
  const outFile = options.outFile || join(PKG_ROOT, 'dist', 'search-index.json');

  const entries = [
    ...collectMarkdown(join(generatedDir, 'components'), 'components', 'docs/generated/components/', 1.3),
    ...collectMarkdown(join(generatedDir, 'tokens'), 'docs', 'docs/generated/tokens/', 1),
    ...collectMarkdown(join(generatedDir, 'utilities'), 'docs', 'docs/generated/utilities/', 1),
    ...collectMarkdown(join(generatedDir, 'cli'), 'api', 'docs/generated/cli/', 1.15),
    ...collectMarkdown(join(generatedDir, 'rules'), 'docs', 'docs/generated/rules/', 0.95),
    ...collectMarkdown(join(generatedDir, 'a11y'), 'docs', 'docs/generated/a11y/', 1),
    ...collectMarkdown(join(generatedDir, 'attributes'), 'docs', 'docs/generated/attributes/', 1.2),
    ...collectCliApi(join(PKG_ROOT, 'cli', 'cli-manifest.json')),
    ...collectHtmlSamples([
      join(PKG_ROOT, 'samples'),
      join(PKG_ROOT, 'examples'),
      ...(options.extraHtmlDirs || []),
    ]),
  ];

  const seen = new Set();
  const unique = [];
  for (const e of entries) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    unique.push(e);
  }

  unique.sort((a, b) => a.title.localeCompare(b.title));

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    entries: unique,
  };

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');
  return { ok: true, count: unique.length, outFile };
}

export function searchIndexMain(argv = process.argv.slice(2)) {
  const outIdx = argv.indexOf('--out');
  const extraIdx = argv.indexOf('--extra-html');
  const outFile = outIdx !== -1 && argv[outIdx + 1] ? argv[outIdx + 1] : join(PKG_ROOT, 'dist', 'search-index.json');
  const extra = extraIdx !== -1 && argv[extraIdx + 1] ? argv[extraIdx + 1].split(',') : [];
  const result = buildSearchIndex({ outFile, extraHtmlDirs: extra });
  console.log(`Wrote ${result.count} search entries → ${result.outFile}`);
}
