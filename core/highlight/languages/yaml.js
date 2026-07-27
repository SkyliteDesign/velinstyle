/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /#[^\n]*/y },
  // Document markers and block scalar indicators.
  { type: 'punctuation', re: /^(?:---|\.\.\.)$/my },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /'(?:''|[^'])*'/y },
  // Keys are the primary structure in YAML, so they get the attr-name colour.
  { type: 'attr-name', re: /^[ \t]*-?[ \t]*[\w.$-]+(?=[ \t]*:(?:[ \t]|$))/my },
  { type: 'punctuation', re: /^[ \t]*-(?=[ \t]|$)/my },
  { type: 'keyword', re: /\b(?:true|false|null|yes|no|on|off|~)\b/yi },
  { type: 'number', re: /\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y },
  // Anchors, aliases, tags and block scalar headers.
  { type: 'operator', re: /[&*]\w+|![\w/!-]*|[|>][+-]?\d*(?=\s*$)/my },
  { type: 'punctuation', re: /[:,[\]{}]/y },
];

/** @type {LexerFn} */
export default function lexYaml(code) {
  return tokenize(code, RULES);
}
