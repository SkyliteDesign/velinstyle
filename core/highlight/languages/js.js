/** @import { LexerFn } from '../types.js' */
import { tokenizeWithKeywords } from './_utils.js';

const KEYWORDS = {
  const: 1,
  let: 1,
  var: 1,
  function: 1,
  return: 1,
  if: 1,
  else: 1,
  for: 1,
  while: 1,
  do: 1,
  switch: 1,
  case: 1,
  break: 1,
  continue: 1,
  new: 1,
  class: 1,
  extends: 1,
  import: 1,
  export: 1,
  from: 1,
  default: 1,
  async: 1,
  await: 1,
  try: 1,
  catch: 1,
  finally: 1,
  throw: 1,
  typeof: 1,
  instanceof: 1,
  in: 1,
  of: 1,
  true: 1,
  false: 1,
  null: 1,
  undefined: 1,
  void: 1,
  this: 1,
};

const BASE = [
  { type: 'comment', re: /\/\/[^\n]*/y },
  { type: 'comment', re: /\/\*[\s\S]*?\*\//y },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/y },
  { type: 'string', re: /'(?:\\.|[^'\\])*'/y },
  { type: 'string', re: /`(?:\\.|[^`\\])*`/y },
  { type: 'number', re: /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/y },
  { type: 'operator', re: /[+\-*/%=<>!&|^~?:]+/y },
  { type: 'punctuation', re: /[{}[\]();,.]/y },
];

/** @type {LexerFn} */
export default function lexJs(code) {
  return tokenizeWithKeywords(code, KEYWORDS, BASE);
}
