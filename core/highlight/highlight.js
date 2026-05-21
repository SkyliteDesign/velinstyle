/** @import { LexerFn } from './types.js' */
import { getLanguage, lazyLoadLanguage, normalizeLanguage } from './registry.js';
import { applyHighlight } from './render.js';

/**
 * @param {Element} el
 * @returns {string}
 */
export function resolveLanguage(el) {
  const pre = el.tagName === 'PRE' ? el : el.closest('pre');
  const code = el.tagName === 'CODE' ? el : pre?.querySelector('code') || el;
  const host = pre || code;

  const fromAttr =
    host.getAttribute('language') ||
    host.getAttribute('data-language') ||
    host.getAttribute('velin-code') ||
    '';

  if (fromAttr && fromAttr !== 'true') return normalizeLanguage(fromAttr);

  const cls = code?.className || '';
  const langMatch = cls.match(/\blanguage-([\w-]+)\b/i);
  if (langMatch) return normalizeLanguage(langMatch[1]);

  return '';
}

/**
 * @param {Element} el
 * @returns {string}
 */
export function getSourceText(el) {
  const code = el.tagName === 'CODE' ? el : el.querySelector('code');
  const target = code || el;
  if (target.dataset.velinSource != null) return target.dataset.velinSource;
  const html = target.innerHTML;
  if (html && /&lt;|&gt;|&amp;/.test(html)) {
    const ta = document.createElement('textarea');
    ta.innerHTML = html.replace(/<br\s*\/?>/gi, '\n');
    if (ta.value) return ta.value;
  }
  return target.textContent || '';
}

/**
 * @param {Element} el
 * @param {object} [options]
 * @param {string} [options.language]
 * @param {LexerFn} [options.lexer]
 */
export async function highlightElement(el, options = {}) {
  if (el.dataset.velinHighlighted === '1') return;
  const pre = el.tagName === 'PRE' ? el : el.closest('pre') || el;
  const codeEl =
    el.tagName === 'CODE' ? el : pre.querySelector('code') || document.createElement('code');

  if (!pre.querySelector('code') && codeEl !== el) {
    const text = getSourceText(pre);
    codeEl.textContent = text;
    pre.textContent = '';
    pre.appendChild(codeEl);
  }

  if (!codeEl.dataset.velinSource) {
    codeEl.dataset.velinSource = codeEl.textContent || '';
  }

  const lang = options.language || resolveLanguage(pre);
  if (!lang) return;

  pre.classList.add('velin-syntax-pending');
  codeEl.classList.add('velin-syntax-pending');

  let lexer = options.lexer || getLanguage(lang);
  if (!lexer) lexer = await lazyLoadLanguage(lang);
  if (!lexer) {
    lexer = getLanguage('text') || (await lazyLoadLanguage('text'));
  }

  const source = codeEl.dataset.velinSource || getSourceText(codeEl) || '';
  if (!lexer) {
    codeEl.textContent = source;
    pre.classList.remove('velin-syntax-pending');
    codeEl.classList.remove('velin-syntax-pending');
    pre.classList.add('velin-syntax-ready');
    codeEl.classList.add('velin-syntax-ready');
    return;
  }

  try {
    const tokens = lexer(source);
    applyHighlight(codeEl, tokens);
    codeEl.dataset.velinHighlighted = '1';
    pre.dataset.velinHighlighted = '1';
  } catch (err) {
    console.warn('[velin-highlight]', lang, err);
    codeEl.textContent = source;
  }
  pre.classList.remove('velin-syntax-pending');
  codeEl.classList.remove('velin-syntax-pending');
  pre.classList.add('velin-syntax-ready');
  codeEl.classList.add('velin-syntax-ready');
}

/**
 * @param {ParentNode} [root]
 */
export async function highlightAll(root = document) {
  const blocks = root.querySelectorAll(
    'pre[velin-code], pre[data-language], pre code[class*="language-"], [velin-code-block] pre, .velin-doc-example__code pre',
  );
  await Promise.all([...blocks].map((el) => highlightElement(el)));
}
