/** @import { Token } from '../types.js' */

/**
 * @param {string} code
 * @param {Array<{ type: Token['type']; re: RegExp }>} rules
 * @returns {Token[]}
 */
export function tokenize(code, rules) {
  /** @type {Token[]} */
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    let matched = false;
    for (const { type, re } of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m.index === i) {
        tokens.push({ type, value: m[0] });
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const next = tokens[tokens.length - 1];
      if (next?.type === 'plain') {
        next.value += code[i];
      } else {
        tokens.push({ type: 'plain', value: code[i] });
      }
      i += 1;
    }
  }
  return tokens;
}

/**
 * @param {string} code
 * @param {Record<string, string>} keywords
 * @param {Array<{ type: Token['type']; re: RegExp }>} baseRules
 */
export function tokenizeWithKeywords(code, keywords, baseRules) {
  const rules = [
    ...baseRules,
    {
      type: 'keyword',
      re: new RegExp(`\\b(${Object.keys(keywords).join('|')})\\b`, 'y'),
    },
    { type: 'identifier', re: /\b[A-Za-z_$][\w$]*\b/y },
  ];
  return tokenize(code, rules);
}
