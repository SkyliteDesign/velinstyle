/** @import { Token } from './types.js' */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/**
 * @param {string} s
 */
export function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ESC[c] || c);
}

/**
 * @param {Token[]} tokens
 * @returns {string}
 */
export function renderTokens(tokens) {
  return tokens
    .map((t) => {
      const type = t.type === 'plain' ? '' : t.type;
      const cls = type ? `velin-token velin-token--${type}` : 'velin-token';
      return `<span class="${cls}">${escapeHtml(t.value)}</span>`;
    })
    .join('');
}

/**
 * @param {HTMLElement} codeEl
 * @param {Token[]} tokens
 */
export function applyHighlight(codeEl, tokens) {
  codeEl.innerHTML = renderTokens(tokens);
  codeEl.classList.add('velin-syntax-ready');
  codeEl.closest('pre')?.classList.add('velin-syntax-ready');
  codeEl.closest('.velin-code-block')?.classList.add('velin-syntax-ready');
}
