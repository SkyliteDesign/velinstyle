/** @import { LexerFn } from '../types.js' */

/** @type {LexerFn} */
export default function lexPlain(code) {
  if (!code) return [];
  return [{ type: 'plain', value: code }];
}
