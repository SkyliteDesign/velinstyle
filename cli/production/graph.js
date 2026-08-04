/**
 * Component dependency graph — closure over used classes/tags → CSS files + WC tags.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GRAPH_PATH = join(__dirname, 'component-graph.json');

let _graphCache = null;

export function loadGraph(path = GRAPH_PATH) {
  if (_graphCache && path === GRAPH_PATH) return _graphCache;
  const graph = JSON.parse(readFileSync(path, 'utf-8'));
  if (path === GRAPH_PATH) _graphCache = graph;
  return graph;
}

function longestPrefixMatch(className, prefixes) {
  let best = null;
  let bestLen = -1;
  for (const prefix of Object.keys(prefixes)) {
    if (className === prefix || className.startsWith(`${prefix}-`) || className.startsWith(`${prefix}--`)) {
      if (prefix.length > bestLen) {
        best = prefix;
        bestLen = prefix.length;
      }
    }
  }
  return best;
}

/**
 * @param {{ classes: Iterable<string>, tags: Iterable<string> }} used
 * @param {{ graph?: object, safelistFiles?: string[] }} [opts]
 */
export function resolveClosure(used, opts = {}) {
  const graph = opts.graph || loadGraph();
  const cssFiles = new Set(graph.alwaysCss || []);
  const tags = new Set();
  const matchedPrefixes = new Set();
  const explain = [];

  for (const f of opts.safelistFiles || []) {
    const norm = String(f).replace(/^src\//, '');
    cssFiles.add(norm);
    explain.push({ keep: norm, reason: 'safelist' });
  }

  for (const cls of used.classes || []) {
    const prefix = longestPrefixMatch(cls, graph.classPrefixes || {});
    if (!prefix) continue;
    matchedPrefixes.add(prefix);
    const entry = graph.classPrefixes[prefix];
    for (const file of entry.css || []) {
      cssFiles.add(file);
      explain.push({ keep: file, reason: `class ${cls} → ${prefix}` });
    }
  }

  const queue = [...(used.tags || [])];
  const seen = new Set();

  while (queue.length) {
    const tag = queue.shift();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.add(tag);
    const entry = graph.wc?.[tag];
    if (!entry) {
      explain.push({ keep: tag, reason: 'unknown WC — keep tag, no CSS edges' });
      continue;
    }
    for (const file of entry.css || []) {
      cssFiles.add(file);
      explain.push({ keep: file, reason: `wc ${tag}` });
    }
    for (const peer of entry.peers || []) {
      if (!seen.has(peer)) queue.push(peer);
    }
  }

  return {
    cssFiles: [...cssFiles].sort(),
    tags: [...tags].sort(),
    matchedPrefixes: [...matchedPrefixes].sort(),
    utilityFiles: [...(graph.utilityFiles || [])],
    motionFiles: [...(graph.motionFiles || [])],
    alwaysCss: [...(graph.alwaysCss || [])],
    explain,
  };
}

export function listKnownThemeNames(pkgRoot) {
  const dir = join(pkgRoot, 'src', 'themes');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => f.replace(/\.css$/, ''))
    .sort();
}
