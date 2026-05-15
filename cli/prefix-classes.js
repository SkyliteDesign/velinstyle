import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, relative, resolve, dirname } from 'path';

/** Bootstrap display utilities → VelinStyle (suffix differs from plain `velin-` + token). */
const BOOTSTRAP_DISPLAY_ALIASES = {
  'd-flex': 'velin-flex',
  'd-inline-flex': 'velin-inline-flex',
  'd-block': 'velin-block',
  'd-inline': 'velin-inline',
  'd-inline-block': 'velin-inline-block',
  'd-grid': 'velin-grid',
  'd-inline-grid': 'velin-inline-grid',
  'd-none': 'velin-hidden',
  'd-contents': 'velin-contents',
};

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
]);

const TEXT_EXT = new Set(['.html', '.htm', '.vue', '.svelte', '.php', '.tsx', '.jsx']);

/**
 * Parse a JSON file into token → replacement class strings.
 * Accepts a flat object or `{ "classMap": { "from": "to", … } }`.
 * If `classMap` is present, only its entries are used (other top-level keys are ignored).
 * Skips empty keys/values. Values must be full class names (e.g. `velin-btn--primary`).
 *
 * @param {string} absPath absolute path to JSON
 * @returns {Map<string, string>}
 */
export function loadExplicitPrefixMapFile(absPath) {
  const text = readFileSync(absPath, 'utf-8');
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON in prefix map: ${absPath}\n${/** @type {Error} */ (e).message}`);
  }
  const map = new Map();
  const obj =
    raw && typeof raw === 'object' && raw.classMap && typeof raw.classMap === 'object'
      ? raw.classMap
      : raw;
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error(`Prefix map must be a JSON object (or { "classMap": { … } }): ${absPath}`);
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_') || k.startsWith('$')) continue;
    if (typeof k !== 'string' || !k.trim()) continue;
    if (v === null || v === undefined) continue;
    if (typeof v !== 'string' || !v.trim()) continue;
    map.set(k.trim(), v.trim());
  }
  return map;
}

/**
 * Merge auto-discovered `velinstyle-prefix-map.json` in the migration root with an optional `--map` file.
 * Later sources overwrite keys from earlier ones.
 *
 * @param {string} migrationRoot directory containing the tree being migrated (or parent of a single file)
 * @param {string | null} overridePath absolute path from `--map`, or null
 * @returns {Map<string, string> | null} null if no file contributed entries
 */
export function buildExplicitPrefixMap(migrationRoot, overridePath) {
  const merged = new Map();
  const autoPath = join(resolve(migrationRoot), 'velinstyle-prefix-map.json');
  if (existsSync(autoPath)) {
    for (const [k, v] of loadExplicitPrefixMapFile(autoPath)) merged.set(k, v);
  }
  if (overridePath) {
    if (!existsSync(overridePath)) {
      throw new Error(`Prefix map not found: ${overridePath}`);
    }
    for (const [k, v] of loadExplicitPrefixMapFile(overridePath)) merged.set(k, v);
  }
  return merged.size > 0 ? merged : null;
}

/**
 * Collect every `.velin-*` class name from VelinStyle package CSS under `src/`.
 * @param {string} pkgRoot
 * @returns {Set<string>}
 */
export function collectVelinClasses(pkgRoot) {
  const srcDir = join(pkgRoot, 'src');
  const set = new Set();
  const re = /\.(velin-[a-zA-Z0-9_-]+)/g;

  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (DEFAULT_IGNORE_DIRS.has(ent.name)) continue;
        walk(p);
      } else if (ent.isFile() && ent.name.endsWith('.css')) {
        let text;
        try {
          text = readFileSync(p, 'utf-8');
        } catch {
          continue;
        }
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(text)) !== null) {
          set.add(m[1]);
        }
      }
    }
  }

  if (statSync(srcDir, { throwIfNoEntry: false })?.isDirectory()) {
    walk(srcDir);
  }
  return set;
}

/**
 * @param {string} token
 * @param {Set<string>} catalog
 * @param {{ bootstrapAliases?: boolean, explicitMap?: Map<string, string> | null }} opts
 * @returns {string}
 */
export function mapTokenToVelin(token, catalog, opts = {}) {
  if (!token || token.startsWith('velin-')) return token;

  const explicit = opts.explicitMap;
  if (explicit && explicit.has(token)) return /** @type {string} */ (explicit.get(token));

  const direct = `velin-${token}`;
  if (catalog.has(direct)) return direct;

  if (opts.bootstrapAliases) {
    const alias = BOOTSTRAP_DISPLAY_ALIASES[token];
    if (alias && catalog.has(alias)) return alias;
  }

  return token;
}

/**
 * @param {string} classAttrValue
 * @param {Set<string>} catalog
 * @param {{ bootstrapAliases?: boolean, explicitMap?: Map<string, string> | null }} opts
 * @returns {{ next: string, changed: number }}
 */
export function prefixClassAttributeValue(classAttrValue, catalog, opts = {}) {
  const parts = classAttrValue.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { next: classAttrValue, changed: 0 };

  let changed = 0;
  const out = parts.map((t) => {
    const n = mapTokenToVelin(t, catalog, opts);
    if (n !== t) changed++;
    return n;
  });

  const next = out.join(' ');
  const pad = classAttrValue.match(/^\s*/)?.[0] ?? '';
  const trail = classAttrValue.match(/\s*$/)?.[0] ?? '';
  return { next: pad + next + trail, changed };
}

/**
 * Replace `class="..."` / `class='...'` and `className="..."` / `className='...'`.
 * Skips attributes containing `{{`, `{`, or `}` (likely template / JSX expression).
 * @param {string} content
 * @param {Set<string>} catalog
 * @param {{ bootstrapAliases?: boolean, explicitMap?: Map<string, string> | null }} opts
 * @returns {{ next: string, changed: number }}
 */
export function transformMarkupClassAttributes(content, catalog, opts = {}) {
  let total = 0;

  let next = content.replace(/\b(class|className)\s*=\s*"([^"]*)"/g, (_full, attrName, inner) => {
    if (/[{}]/.test(inner)) return _full;
    const { next: n, changed } = prefixClassAttributeValue(inner, catalog, opts);
    total += changed;
    return `${attrName}="${n}"`;
  });
  next = next.replace(/\b(class|className)\s*=\s*'([^']*)'/g, (_full, attrName, inner) => {
    if (/[{}]/.test(inner)) return _full;
    const { next: n, changed } = prefixClassAttributeValue(inner, catalog, opts);
    total += changed;
    return `${attrName}='${n}'`;
  });

  return { next, changed: total };
}

function walkFiles(rootDir, extensions, ignoreDirs) {
  /** @type {string[]} */
  const out = [];

  function walk(absDir) {
    let entries;
    try {
      entries = readdirSync(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = join(absDir, ent.name);
      if (ent.isDirectory()) {
        if (ignoreDirs.has(ent.name)) continue;
        walk(abs);
      } else if (ent.isFile()) {
        const lower = ent.name.toLowerCase();
        const ext = lower.slice(lower.lastIndexOf('.'));
        if (extensions.has(ext)) out.push(abs);
      }
    }
  }

  walk(resolve(rootDir));
  return out;
}

/**
 * @param {string} targetPath
 * @param {{ write?: boolean, bootstrapAliases?: boolean, extensions?: Set<string>, pkgRoot: string, explicitMap?: Map<string, string> | null }} options
 * @returns {{ filesTouched: number, replacements: number, paths: string[] }}
 */
export function runPrefixCommand(targetPath, options) {
  const pkgRoot = options.pkgRoot;
  if (!pkgRoot) {
    throw new Error('runPrefixCommand: pkgRoot is required');
  }
  const catalog = collectVelinClasses(pkgRoot);
  if (catalog.size === 0) {
    console.warn('No VelinStyle classes found in package src/. Is the CLI installed correctly?');
  }

  const write = !!options.write;
  const bootstrapAliases = !!options.bootstrapAliases;
  const explicitMap = options.explicitMap ?? null;
  const extensions = options.extensions ?? TEXT_EXT;
  const ignoreDirs = new Set(DEFAULT_IGNORE_DIRS);

  const root = resolve(targetPath);
  const files = walkFiles(root, extensions, ignoreDirs);

  let replacements = 0;
  const paths = [];

  for (const file of files) {
    const original = readFileSync(file, 'utf-8');
    const { next, changed } = transformMarkupClassAttributes(original, catalog, {
      bootstrapAliases,
      explicitMap,
    });
    if (changed === 0) continue;

    replacements += changed;
    paths.push(file);
    if (write) {
      writeFileSync(file, next, 'utf-8');
    }
  }

  return { filesTouched: paths.length, replacements, paths };
}

/**
 * @param {string} targetPath
 * @param {{ write?: boolean, bootstrapAliases?: boolean, pkgRoot: string, explicitMap?: Map<string, string> | null }} options
 * @returns {number} exit code (0 always for now)
 */
export function prefixCommandMain(targetPath, options) {
  const pkgRoot = options.pkgRoot;
  if (!pkgRoot) {
    console.error('prefix: missing pkgRoot (CLI bug).');
    return 1;
  }
  const resolved = resolve(targetPath);
  if (options.explicitMap?.size) {
    console.log(`Explicit class map: ${options.explicitMap.size} entr${options.explicitMap.size === 1 ? 'y' : 'ies'} (JSON overrides catalog / Bootstrap display aliases).`);
  }
  const { filesTouched, replacements, paths } = runPrefixCommand(resolved, {
    ...options,
    pkgRoot,
  });

  const rel = (p) => relative(resolved, p) || p;

  if (filesTouched === 0) {
    console.log('No class attributes needed prefixing (or no matching files).');
    return 0;
  }

  console.log(
    `${options.write ? 'Updated' : 'Would update'} ${filesTouched} file(s), ${replacements} class token(s).`,
  );
  for (const p of paths.slice(0, 50)) {
    console.log(`  ${rel(p)}`);
  }
  if (paths.length > 50) {
    console.log(`  … and ${paths.length - 50} more`);
  }
  if (!options.write) {
    console.log('\nRe-run with --write to apply changes.');
  }
  return 0;
}
