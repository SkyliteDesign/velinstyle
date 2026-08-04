/**
 * Content extract for Production Builder — used classes, WC tags, themes, icons, motion, fonts.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, extname, resolve, relative } from 'path';

export const DEFAULT_IGNORE = [
  'node_modules', 'dist', '.git', '.next', '.nuxt', 'vendor', 'build', 'coverage',
];

export const CONTENT_EXTS = new Set([
  '.html', '.htm', '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.md', '.css',
]);

const CLASS_ATTR_RE = /class(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/gi;
const CLASS_TOKEN_RE = /\b((?:velin|expo)-[\w:-]+)\b/g;
const TAG_RE = /<(velin-[a-z0-9-]+)\b/gi;
const DATA_COMPONENT_RE = /data-velin-component\s*=\s*["'](velin-[a-z0-9-]+)["']/gi;
const THEME_RE = /data-velin-theme\s*=\s*["']([^"']+)["']/gi;
const THEMES_LIST_RE = /themes\s*[:=]\s*\[([^\]]+)\]/gi;
const ICON_NAME_RE = /(?:name|icon)\s*=\s*["']([a-z0-9][a-z0-9_-]*)["']/gi;
const ICON_HASH_RE = /velin-icons\.svg#([a-z0-9][a-z0-9_-]*)/gi;
const MOTION_ATTR_RE = /data-velin-(?:animate|motion|scroll)\s*=\s*["']([^"']+)["']/gi;
const FONT_FACE_RE = /@font-face\s*\{([\s\S]*?)\}/gi;
const FONT_WEIGHT_RE = /font-weight\s*:\s*([0-9]+|normal|bold)/gi;

function shouldIgnore(name, ignore) {
  return ignore.includes(name);
}

export function walkContentFiles(dir, { ignore = DEFAULT_IGNORE, out = [], root = dir } = {}) {
  if (!existsSync(dir)) return out;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (shouldIgnore(entry.name, ignore)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkContentFiles(full, { ignore, out, root });
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (!CONTENT_EXTS.has(ext)) continue;
    out.push(full);
  }
  return out;
}

export function collectContentFiles(targetPath, { ignore = DEFAULT_IGNORE, extraIgnore = [] } = {}) {
  const abs = resolve(targetPath);
  const ignoreList = [...new Set([...ignore, ...extraIgnore])];
  if (!existsSync(abs)) return [];
  const st = statSync(abs);
  if (st.isFile()) {
    const ext = extname(abs).toLowerCase();
    return CONTENT_EXTS.has(ext) ? [abs] : [];
  }
  return walkContentFiles(abs, { ignore: ignoreList });
}

function addClassTokens(text, classes) {
  for (const m of String(text || '').matchAll(CLASS_TOKEN_RE)) {
    classes.add(m[1]);
    // Responsive / state variants: velin-md:flex → also keep flex base if present as velin-flex
    const bare = m[1].replace(/^(?:velin|expo)-(?:sm|md|lg|xl|2xl):/, (pref) => {
      const ns = pref.startsWith('expo') ? 'expo-' : 'velin-';
      return ns;
    });
    if (bare !== m[1] && bare.startsWith('velin-')) classes.add(bare);
  }
}

/**
 * @param {string} content
 * @param {{ isCss?: boolean }} [opts]
 */
export function extractFromText(content, { isCss = false } = {}) {
  const classes = new Set();
  const tags = new Set();
  const themes = new Set();
  const icons = new Set();
  const motion = new Set();
  const fontWeights = new Set();
  const attrs = new Set();

  const text = String(content || '');

  if (!isCss) {
    for (const m of text.matchAll(CLASS_ATTR_RE)) {
      addClassTokens(m[1], classes);
    }
  }
  addClassTokens(text, classes);

  for (const m of text.matchAll(TAG_RE)) tags.add(m[1].toLowerCase());
  for (const m of text.matchAll(DATA_COMPONENT_RE)) tags.add(m[1].toLowerCase());

  for (const m of text.matchAll(THEME_RE)) {
    for (const t of m[1].split(/[\s,|]+/)) {
      if (t) themes.add(t.trim().toLowerCase());
    }
  }
  for (const m of text.matchAll(THEMES_LIST_RE)) {
    for (const part of m[1].split(/[,'"`\s]+/)) {
      if (part && /^[a-z][a-z0-9_-]*$/i.test(part)) themes.add(part.toLowerCase());
    }
  }

  for (const m of text.matchAll(ICON_NAME_RE)) icons.add(m[1].toLowerCase());
  for (const m of text.matchAll(ICON_HASH_RE)) icons.add(m[1].toLowerCase());

  for (const m of text.matchAll(MOTION_ATTR_RE)) {
    for (const part of m[1].split(/[\s,]+/)) {
      if (part) motion.add(part.trim());
    }
  }
  for (const cls of classes) {
    if (cls.includes('animate') || cls.includes('motion') || cls.startsWith('velin-scroll-')) {
      motion.add(cls);
    }
  }

  for (const cls of classes) {
    if (cls.startsWith('velin-font-') || cls.startsWith('velin-text-')) {
      fontWeights.add(cls);
    }
  }

  for (const m of text.matchAll(FONT_FACE_RE)) {
    for (const w of m[1].matchAll(FONT_WEIGHT_RE)) fontWeights.add(String(w[1]));
  }

  for (const m of text.matchAll(/data-velin-([\w-]+)/gi)) {
    attrs.add(`data-velin-${m[1].toLowerCase()}`);
  }

  return { classes, tags, themes, icons, motion, fontWeights, attrs };
}

/**
 * Scan a project path and merge all extracts.
 * @returns {{
 *   files: string[],
 *   classes: Set<string>,
 *   tags: Set<string>,
 *   themes: Set<string>,
 *   icons: Set<string>,
 *   motion: Set<string>,
 *   fontWeights: Set<string>,
 *   attrs: Set<string>,
 * }}
 */
export function extractProject(targetPath, options = {}) {
  const {
    ignore = DEFAULT_IGNORE,
    contentGlobs, // reserved
    safelist = [],
    outDir,
    cwd = process.cwd(),
  } = options;

  const extraIgnore = [];
  if (outDir) {
    try {
      const rel = relative(resolve(cwd), resolve(outDir)).split(/[/\\]/)[0];
      if (rel && rel !== '..' && rel !== '.') extraIgnore.push(rel);
    } catch { /* ignore */ }
  }

  const files = collectContentFiles(targetPath, { ignore, extraIgnore });
  const merged = {
    files,
    classes: new Set(),
    tags: new Set(),
    themes: new Set(),
    icons: new Set(),
    motion: new Set(),
    fontWeights: new Set(),
    attrs: new Set(),
  };

  for (const file of files) {
    let body = '';
    try {
      body = readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    const isCss = extname(file).toLowerCase() === '.css';
    const part = extractFromText(body, { isCss });
    for (const c of part.classes) merged.classes.add(c);
    for (const t of part.tags) merged.tags.add(t);
    for (const t of part.themes) merged.themes.add(t);
    for (const i of part.icons) merged.icons.add(i);
    for (const m of part.motion) merged.motion.add(m);
    for (const f of part.fontWeights) merged.fontWeights.add(f);
    for (const a of part.attrs) merged.attrs.add(a);
  }

  for (const item of safelist) {
    const s = String(item).trim();
    if (!s) continue;
    if (s.startsWith('velin-') && !s.includes('.')) {
      if (s.includes('-') && /^velin-[a-z]+-[a-z]/.test(s) && !s.includes('--') && s.split('-').length >= 3 && !s.startsWith('velin-btn') && !s.startsWith('velin-card')) {
        // could be tag or class — add both conservatively
        merged.tags.add(s);
        merged.classes.add(s);
      } else {
        merged.classes.add(s);
      }
    } else if (s.endsWith('.css') || s.includes('/')) {
      // handled by trim safelist files
    } else if (/^[a-z][a-z0-9_-]*$/i.test(s)) {
      merged.themes.add(s.toLowerCase());
      merged.icons.add(s.toLowerCase());
    }
  }

  return merged;
}

export function extractToPlain(extracted) {
  return {
    files: extracted.files,
    classes: [...extracted.classes].sort(),
    tags: [...extracted.tags].sort(),
    themes: [...extracted.themes].sort(),
    icons: [...extracted.icons].sort(),
    motion: [...extracted.motion].sort(),
    fontWeights: [...extracted.fontWeights].sort(),
    attrs: [...extracted.attrs].sort(),
  };
}
