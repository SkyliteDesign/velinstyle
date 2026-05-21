/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'number', re: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/y },
  { type: 'keyword', re: /\b(true|false|null)\b/y },
  { type: 'punctuation', re: /[{}[\]:,]/y },
];

/** @type {LexerFn} */
export default function lexJson(code) {
  return tokenize(code, RULES);
}
