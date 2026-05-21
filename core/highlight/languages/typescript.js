/** @import { LexerFn } from '../types.js' */
import lexJs from './js.js';

const TS_KEYWORDS = new Set([
  'type',
  'interface',
  'enum',
  'implements',
  'declare',
  'namespace',
  'readonly',
  'public',
  'private',
  'protected',
  'abstract',
  'as',
  'satisfies',
  'keyof',
]);

/** @type {LexerFn} */
export default function lexTypeScript(code) {
  return lexJs(code).map((t) =>
    t.type === 'identifier' && TS_KEYWORDS.has(t.value)
      ? { type: 'keyword', value: t.value }
      : t,
  );
}
