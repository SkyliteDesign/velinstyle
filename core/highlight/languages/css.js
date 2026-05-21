/** @import { LexerFn } from '../types.js' */
import { tokenizeWithKeywords } from './_utils.js';

const KEYWORDS = {
  important: 1,
  inherit: 1,
  initial: 1,
  unset: 1,
  revert: 1,
};

const RULES = [
  { type: 'comment', re: /\/\*[\s\S]*?\*\//y },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /'(?:\\.|[^'\\])*'/y },
  { type: 'number', re: /#[\da-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:%|[a-z]+)?\b/y },
  { type: 'tag', re: /\.[\w-]+|#[\w-]+/y },
  { type: 'attr-name', re: /[\w-]+(?=\s*:)/y },
  { type: 'punctuation', re: /[{}:;,()]/y },
  { type: 'operator', re: /[+\-*/>~]/y },
];

/** @type {LexerFn} */
export default function lexCss(code) {
  return tokenizeWithKeywords(code, KEYWORDS, RULES);
}
