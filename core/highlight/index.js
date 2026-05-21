export {
  registerLanguage,
  getLanguage,
  lazyLoadLanguage,
  listLanguages,
  normalizeLanguage,
} from './registry.js';
export { escapeHtml, renderTokens, applyHighlight } from './render.js';
export {
  resolveLanguage,
  getSourceText,
  highlightElement,
  highlightAll,
} from './highlight.js';
export { initHighlight, observeCodeBlocks } from './observe.js';

import { highlightElement, highlightAll } from './highlight.js';
import { initHighlight, observeCodeBlocks } from './observe.js';
import { registerLanguage, lazyLoadLanguage, listLanguages } from './registry.js';

export const velinSyntax = {
  highlightElement,
  highlightAll,
  initHighlight,
  observeCodeBlocks,
  registerLanguage,
  lazyLoadLanguage,
  listLanguages,
};
