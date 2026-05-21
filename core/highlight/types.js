/** @typedef {'keyword'|'identifier'|'string'|'comment'|'number'|'operator'|'punctuation'|'tag'|'attr-name'|'attr-value'|'builtin'|'regex'|'plain'} TokenType */

/**
 * @typedef {object} Token
 * @property {TokenType} type
 * @property {string} value
 */

/** @type {TokenType[]} */
export const TOKEN_TYPES = [
  'keyword',
  'identifier',
  'string',
  'comment',
  'number',
  'operator',
  'punctuation',
  'tag',
  'attr-name',
  'attr-value',
  'builtin',
  'regex',
  'plain',
];

/**
 * @typedef {(code: string) => Token[]} LexerFn
 */
