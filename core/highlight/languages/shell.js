/** @import { LexerFn } from '../types.js' */
import { tokenizeWithKeywords } from './_utils.js';

const KEYWORDS = {
  if: 1,
  then: 1,
  else: 1,
  fi: 1,
  for: 1,
  do: 1,
  done: 1,
  while: 1,
  case: 1,
  esac: 1,
  function: 1,
  return: 1,
  export: 1,
  local: 1,
};

const RULES = [
  { type: 'comment', re: /#[^\n]*/y },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /'[^']*'/y },
  { type: 'number', re: /\b\d+\b/y },
  { type: 'operator', re: /[|&<>]/y },
  { type: 'punctuation', re: /[();]/y },
];

/** @type {LexerFn} */
export default function lexShell(code) {
  return tokenizeWithKeywords(code, KEYWORDS, RULES);
}
