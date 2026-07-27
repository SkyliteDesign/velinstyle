/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /\/\/[^\n]*/y },
  { type: 'comment', re: /\/\*[\s\S]*?\*\//y },
  // Raw strings may span lines.
  { type: 'string', re: /`[^`]*`/y },
  { type: 'string', re: /"(?:\\.|[^"\\\n])*"/y },
  { type: 'string', re: /'(?:\\.|[^'\\\n])*'/y },
  { type: 'number', re: /\b0[xX][\da-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?i?\b/y },
  {
    type: 'keyword',
    re: /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/y,
  },
  {
    type: 'builtin',
    re: /\b(?:append|bool|byte|cap|clear|close|complex|complex64|complex128|copy|delete|error|float32|float64|imag|int|int8|int16|int32|int64|len|make|max|min|new|nil|panic|print|println|real|recover|rune|string|true|false|iota|uint|uint8|uint16|uint32|uint64|uintptr|any)\b/y,
  },
  { type: 'operator', re: /:=|\.\.\.|&&|\|\||<-|\+\+|--|<<=?|>>=?|&\^=?|[-+*/%&|^<>!=]=?|~/y },
  { type: 'punctuation', re: /[[\]{}(),;:.]/y },
  { type: 'identifier', re: /\b[A-Za-z_]\w*\b/y },
];

/** @type {LexerFn} */
export default function lexGo(code) {
  return tokenize(code, RULES);
}
