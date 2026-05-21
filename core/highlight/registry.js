/** @import { LexerFn } from './types.js' */

/** @type {Map<string, LexerFn>} */
const languages = new Map();

/** @type {Map<string, Promise<LexerFn>>} */
const loading = new Map();

const LAZY_LOADERS = {
  js: () => import('./languages/js.js'),
  javascript: () => import('./languages/js.js'),
  ts: () => import('./languages/typescript.js'),
  typescript: () => import('./languages/typescript.js'),
  html: () => import('./languages/html.js'),
  xml: () => import('./languages/html.js'),
  css: () => import('./languages/css.js'),
  json: () => import('./languages/json.js'),
  md: () => import('./languages/markdown.js'),
  markdown: () => import('./languages/markdown.js'),
  shell: () => import('./languages/shell.js'),
  bash: () => import('./languages/shell.js'),
  sh: () => import('./languages/shell.js'),
  sql: () => import('./languages/sql.js'),
  text: () => import('./languages/plain.js'),
  plain: () => import('./languages/plain.js'),
  txt: () => import('./languages/plain.js'),
  markup: () => import('./languages/html.js'),
  console: () => import('./languages/plain.js'),
  php: () => import('./languages/php.js'),
  blade: () => import('./languages/blade.js'),
};

/** @param {string} name */
export function normalizeLanguage(name) {
  const n = (name || '').trim().toLowerCase();
  if (!n) return '';
  if (n.startsWith('language-')) return normalizeLanguage(n.slice(9));
  const map = {
    javascript: 'js',
    jsx: 'js',
    typescript: 'ts',
    tsx: 'ts',
    markup: 'html',
    xml: 'html',
    svg: 'html',
    bash: 'shell',
    sh: 'shell',
    zsh: 'shell',
    md: 'markdown',
    plaintext: 'text',
    'plain-text': 'text',
    yml: 'text',
    yaml: 'text',
    toml: 'text',
    ini: 'text',
    php8: 'php',
  };
  return map[n] || n;
}

/**
 * @param {string} name
 * @param {LexerFn} lexerFn
 */
export function registerLanguage(name, lexerFn) {
  languages.set(normalizeLanguage(name), lexerFn);
}

/**
 * @param {string} name
 * @returns {LexerFn|undefined}
 */
export function getLanguage(name) {
  return languages.get(normalizeLanguage(name));
}

/**
 * @param {string} name
 * @returns {Promise<LexerFn|undefined>}
 */
export async function lazyLoadLanguage(name) {
  const key = normalizeLanguage(name);
  if (!key) return undefined;
  if (languages.has(key)) return languages.get(key);
  if (loading.has(key)) return loading.get(key);

  const loader = LAZY_LOADERS[key];
  if (!loader) return undefined;

  const p = loader().then((mod) => {
    const fn = mod.default;
    languages.set(key, fn);
    loading.delete(key);
    return fn;
  });
  loading.set(key, p);
  return p;
}

/** @returns {string[]} */
export function listLanguages() {
  return [...new Set([...languages.keys(), ...Object.keys(LAZY_LOADERS)])];
}

// Eager-register JS for zero-config demos
import lexJs from './languages/js.js';
registerLanguage('js', lexJs);
