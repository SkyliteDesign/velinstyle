/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /--[^\n]*/y },
  { type: 'comment', re: /\/\*[\s\S]*?\*\//y },
  { type: 'string', re: /'(?:''|[^'])*'/y },
  { type: 'number', re: /\b\d+(?:\.\d+)?\b/y },
  {
    type: 'keyword',
    re: /\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|CREATE|TABLE|INDEX)\b/yi,
  },
  { type: 'operator', re: /[=<>!]+|,/y },
  { type: 'punctuation', re: /[();]/y },
];

/** @type {LexerFn} */
export default function lexSql(code) {
  return tokenize(code, RULES);
}
