/**
 * Filter CSS source to rules that reference used velin-/expo- classes.
 */
import { join } from 'path';

const CLASS_IN_SEL = /\.(?:velin|expo)-[\w:-]+/g;

const ALWAYS_KEEP_RE = [
  /:root\b/,
  /\[data-velin-/,
  /prefers-reduced-motion/,
  /prefers-contrast/,
  /forced-colors/,
  /@font-face/,
];

function selectorNeedsClass(selector, used) {
  const classes = selector.match(CLASS_IN_SEL);
  if (!classes || !classes.length) return true;
  return classes.some((c) => used.has(c.slice(1)));
}

function shouldAlwaysKeep(block) {
  return ALWAYS_KEEP_RE.some((re) => re.test(block));
}

export function filterCssByUsedClasses(css, usedClasses, { keepAllWithoutVelinClass = true } = {}) {
  const used = usedClasses instanceof Set ? usedClasses : new Set(usedClasses);
  const keptKeyframes = new Set();
  const chunks = [];
  const parts = splitCssTopLevel(css);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('@keyframes') || trimmed.startsWith('@-webkit-keyframes')) {
      const name = trimmed.match(/@[-a-z]*keyframes\s+([\w-]+)/i)?.[1];
      chunks.push({ type: 'keyframes', name, text: ensureBrace(trimmed) });
      continue;
    }

    if (trimmed.startsWith('@media') || trimmed.startsWith('@supports') || trimmed.startsWith('@container')) {
      const innerMatch = trimmed.match(/^(@[^{]+)\{([\s\S]*)\}$/);
      if (!innerMatch) {
        chunks.push({ type: 'raw', text: ensureBrace(trimmed) });
        continue;
      }
      const filteredInner = filterCssByUsedClasses(innerMatch[2], used, { keepAllWithoutVelinClass });
      if (filteredInner.trim()) {
        const block = `${innerMatch[1].trim()} {\n${filteredInner}\n}`;
        chunks.push({ type: 'at', text: block });
        collectAnimationNames(filteredInner, keptKeyframes);
      }
      continue;
    }

    if (shouldAlwaysKeep(trimmed)) {
      chunks.push({ type: 'rule', text: ensureBrace(trimmed) });
      continue;
    }

    const sel = trimmed.split('{')[0] || '';
    CLASS_IN_SEL.lastIndex = 0;
    const hasVelin = CLASS_IN_SEL.test(sel);
    CLASS_IN_SEL.lastIndex = 0;
    if (!hasVelin) {
      if (keepAllWithoutVelinClass) chunks.push({ type: 'rule', text: ensureBrace(trimmed) });
      continue;
    }
    if (selectorNeedsClass(sel, used)) {
      const text = ensureBrace(trimmed);
      chunks.push({ type: 'rule', text });
      collectAnimationNames(text, keptKeyframes);
    }
  }

  const out = [];
  for (const c of chunks) {
    if (c.type === 'keyframes') {
      if (c.name && keptKeyframes.has(c.name)) out.push(c.text);
      continue;
    }
    out.push(c.text);
  }
  return out.join('\n\n') + (out.length ? '\n' : '');
}

function ensureBrace(s) {
  return s.endsWith('}') ? s : `${s}}`;
}

function collectAnimationNames(text, into) {
  for (const m of text.matchAll(/animation(?:-name)?\s*:\s*([^;}+]+)/gi)) {
    for (const name of m[1].split(/[\s,]+/)) {
      if (name && name !== 'none' && !name.startsWith('var(')) into.add(name.trim());
    }
  }
}

function splitCssTopLevel(css) {
  const src = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        parts.push(src.slice(start, i + 1));
        start = i + 1;
      }
    }
  }
  if (start < src.length) {
    const tail = src.slice(start).trim();
    if (tail) parts.push(tail);
  }
  return parts;
}

export function buildProductionCss({
  pkgRoot,
  readFile,
  exists,
  componentFiles = [],
  utilityFiles = [],
  usedClasses,
  includeMotionFiles = true,
  motionUsed = null,
}) {
  const used = usedClasses instanceof Set ? usedClasses : new Set(usedClasses);
  let css = '/* VelinStyle Production Build */\n';
  const included = [];
  const skipped = [];
  const seen = new Set();

  for (const rel of componentFiles) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    const path = join(pkgRoot, 'src', rel);
    if (!exists(path)) {
      skipped.push({ file: rel, reason: 'missing' });
      continue;
    }
    css += readFile(path) + '\n';
    included.push(rel);
  }

  for (const rel of utilityFiles) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    const path = join(pkgRoot, 'src', rel);
    if (!exists(path)) {
      skipped.push({ file: rel, reason: 'missing' });
      continue;
    }
    const isMotion = /animation|motion|view-transition|scroll-animation|chart-animation/.test(rel);
    if (isMotion && !includeMotionFiles) {
      skipped.push({ file: rel, reason: 'motion disabled' });
      continue;
    }
    const raw = readFile(path);
    const filterSet = isMotion && motionUsed ? new Set([...used, ...motionUsed]) : used;
    const filtered = filterCssByUsedClasses(raw, filterSet);
    if (!filtered.trim()) {
      skipped.push({ file: rel, reason: 'no matching utilities' });
      continue;
    }
    css += filtered + '\n';
    included.push(rel);
  }

  return { css, included, skipped };
}
