/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /<!--[\s\S]*?-->/y },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /'(?:\\.|[^'\\])*'/y },
  { type: 'tag', re: /<\/?[\w-]+/y },
  { type: 'punctuation', re: /[<>/=]/y },
  { type: 'attr-name', re: /\s[\w-]+(?==)/y },
  { type: 'attr-value', re: /=(?:"[^"]*"|'[^']*'|[^\s>]+)/y },
];

/** @type {LexerFn} */
export default function lexHtml(code) {
  return tokenize(code, RULES);
}
