import { highlightElement } from './highlight.js';
import { observeInView } from '../motion/scheduler.js';

/**
 * Lazy-highlight code blocks when they enter the viewport.
 * @param {ParentNode} [root]
 * @param {object} [options]
 * @param {string} [options.selector]
 * @param {boolean} [options.immediate]
 */
export function initHighlight(root = document, options = {}) {
  if (typeof document === 'undefined') return () => {};

  const selector =
    options.selector ||
    [
      'pre[velin-code]',
      'pre[language]',
      'pre[data-language]',
      'pre code[class*="language-"]',
      'velin-code-block pre',
      '.velin-doc-example__code pre',
    ].join(',');

  const nodes = root.querySelectorAll(selector);
  const teardowns = [];

  const reduced =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (const node of nodes) {
    const pre = node.tagName === 'PRE' ? node : node.closest('pre');
    if (!pre || pre.dataset.velinObserve === '1') continue;
    pre.dataset.velinObserve = '1';

    if (reduced || options.immediate) {
      void highlightElement(pre);
      continue;
    }

    pre.classList.add('velin-syntax-pending');
    const stop = observeInView(pre, async (el) => {
      await highlightElement(el);
    });
    teardowns.push(stop);
  }

  return () => teardowns.forEach((fn) => fn());
}

/** @deprecated alias */
export const observeCodeBlocks = initHighlight;
