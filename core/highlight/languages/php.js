/** @import { LexerFn } from '../types.js' */
import { tokenizeWithKeywords } from './_utils.js';

const KEYWORDS = {
  function: 1,
  return: 1,
  if: 1,
  else: 1,
  elseif: 1,
  foreach: 1,
  while: 1,
  class: 1,
  new: 1,
  public: 1,
  private: 1,
  protected: 1,
  static: 1,
  namespace: 1,
  use: 1,
  true: 1,
  false: 1,
  null: 1,
};

const RULES = [
  { type: 'comment', re: /\/\/[^\n]*/y },
  { type: 'comment', re: /#[^\n]*/y },
  { type: 'comment', re: /\/\*[\s\S]*?\*\//y },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /'(?:\\.|[^'\\])*'/y },
  { type: 'number', re: /\b\d+(?:\.\d+)?\b/y },
  { type: 'operator', re: /=>|\+\+|--|===|!==|==|!=|<=|>=|->|\?\?|[=+\-*/%.<>!&|^~?:]/y },
  { type: 'punctuation', re: /[{}[\]();,.]/y },
];

/** @type {LexerFn} */
export default function lexPhp(code) {
  return tokenizeWithKeywords(code, KEYWORDS, RULES);
}
