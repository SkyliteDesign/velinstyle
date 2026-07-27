/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /#[^\n]*/y },
  // Triple-quoted strings first so the single-quote rules cannot split them.
  { type: 'string', re: /[rbfu]{0,2}"""[\s\S]*?"""/y },
  { type: 'string', re: /[rbfu]{0,2}'''[\s\S]*?'''/y },
  { type: 'string', re: /[rbfu]{0,2}"(?:\\.|[^"\\\n])*"/y },
  { type: 'string', re: /[rbfu]{0,2}'(?:\\.|[^'\\\n])*'/y },
  { type: 'number', re: /\b0[xX][\da-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?j?\b/y },
  {
    type: 'keyword',
    re: /\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/y,
  },
  {
    type: 'builtin',
    re: /\b(?:None|True|False|self|cls|abs|all|any|bool|bytes|dict|dir|enumerate|filter|float|format|frozenset|getattr|hasattr|int|isinstance|issubclass|iter|len|list|map|max|min|next|object|open|print|range|repr|reversed|round|set|setattr|sorted|str|sum|super|tuple|type|zip)\b/y,
  },
  // Multi-character operators first so `->` is not split into `-` and `>`.
  { type: 'operator', re: /->|:=|\*\*=?|\/\/=?|<<=?|>>=?|[-+*/%&|^~<>!=]=?/y },
  { type: 'punctuation', re: /[[\]{}(),:;.@]/y },
  { type: 'identifier', re: /\b[A-Za-z_]\w*\b/y },
];

/** @type {LexerFn} */
export default function lexPython(code) {
  return tokenize(code, RULES);
}
