/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /<!--[\s\S]*?-->/y },
  { type: 'string', re: /```[\s\S]*?```/y },
  { type: 'string', re: /`[^`\n]+`/y },
  { type: 'keyword', re: /#{1,6}\s[^\n]+/y },
  { type: 'tag', re: /\[[^\]]+\]\([^)]+\)/y },
  { type: 'operator', re: /[*_~]/y },
];

/** @type {LexerFn} */
export default function lexMarkdown(code) {
  return tokenize(code, RULES);
}
