/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /{{--[\s\S]*?--}}/y },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /'(?:\\.|[^'\\])*'/y },
  { type: 'keyword', re: /@(?:vite|csrf|auth|guest|section|endsection|yield|extends|include|push|endpush|stack|once|endonce|forelse|empty|endempty|can|endcan|cannot|endcannot)\b/y },
  { type: 'operator', re: /{{|}}|{!!|!!}|@[{}]/y },
  { type: 'punctuation', re: /[()[\],]/y },
];

/** @type {LexerFn} */
export default function lexBlade(code) {
  return tokenize(code, RULES);
}
