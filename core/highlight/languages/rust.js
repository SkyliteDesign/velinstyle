/** @import { LexerFn } from '../types.js' */
import { tokenize } from './_utils.js';

const RULES = [
  { type: 'comment', re: /\/\/\/?[^\n]*/y },
  { type: 'comment', re: /\/\*[\s\S]*?\*\//y },
  // Raw strings close on the same number of hashes they opened with.
  { type: 'string', re: /b?r(#*)"[\s\S]*?"\1/y },
  { type: 'string', re: /b?"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /b?'(?:\\.|[^'\\])'/y },
  // Attributes such as #[derive(Debug)] read as annotations.
  { type: 'builtin', re: /#!?\[[^\]]*\]/y },
  { type: 'number', re: /\b0[xXbo][\da-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?(?:[iuf](?:8|16|32|64|128|size))?\b/y },
  {
    type: 'keyword',
    re: /\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|type|unsafe|use|where|while)\b/y,
  },
  {
    type: 'builtin',
    re: /\b(?:bool|char|f32|f64|i8|i16|i32|i64|i128|isize|str|u8|u16|u32|u64|u128|usize|String|Vec|Option|Result|Some|None|Ok|Err|Box|Rc|Arc|true|false)\b/y,
  },
  // Lifetimes such as 'a must not be read as an unterminated char literal.
  { type: 'operator', re: /'[a-z_]\w*\b/y },
  { type: 'operator', re: /=>|->|::|\.\.=?|&&|\|\||<<=?|>>=?|[-+*/%&|^<>!=]=?|[?@]/y },
  { type: 'punctuation', re: /[[\]{}(),;:.#]/y },
  { type: 'identifier', re: /\b[A-Za-z_]\w*!?\b/y },
];

/** @type {LexerFn} */
export default function lexRust(code) {
  return tokenize(code, RULES);
}
