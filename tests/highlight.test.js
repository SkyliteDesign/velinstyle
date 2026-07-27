import { describe, it, expect } from 'vitest';
import { renderTokens, escapeHtml } from '../core/highlight/render.js';
import {
  registerLanguage,
  getLanguage,
  normalizeLanguage,
  lazyLoadLanguage,
  listLanguages,
} from '../core/highlight/registry.js';
import lexJs from '../core/highlight/languages/js.js';
import lexHtml from '../core/highlight/languages/html.js';
import lexPython from '../core/highlight/languages/python.js';
import lexYaml from '../core/highlight/languages/yaml.js';
import lexGo from '../core/highlight/languages/go.js';
import lexRust from '../core/highlight/languages/rust.js';

/** Collect the token type carrying a given source snippet. */
function typeOf(tokens, value) {
  return tokens.find((t) => t.value === value)?.type;
}

function types(tokens) {
  return tokens.map((t) => t.type);
}

/** Every lexer must reproduce its input exactly, or code would be corrupted. */
function roundTrips(lexer, code) {
  return lexer(code).map((t) => t.value).join('') === code;
}

describe('highlight render', () => {
  it('escapes HTML in token values', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('wraps tokens in velin-token spans', () => {
    const html = renderTokens([
      { type: 'keyword', value: 'const' },
      { type: 'plain', value: ' ' },
      { type: 'identifier', value: 'x' },
    ]);
    expect(html).toContain('velin-token--keyword');
    expect(html).toContain('>const<');
    expect(html).toContain('>x<');
  });
});

describe('highlight registry', () => {
  it('normalizes language aliases', () => {
    expect(normalizeLanguage('language-html')).toBe('html');
    expect(normalizeLanguage('javascript')).toBe('js');
    expect(normalizeLanguage('typescript')).toBe('ts');
  });

  it('registers custom lexer', () => {
    registerLanguage('demo', () => [{ type: 'plain', value: 'x' }]);
    expect(getLanguage('demo')).toBeTypeOf('function');
  });
});

describe('js lexer', () => {
  it('tokenizes keywords and strings', () => {
    const tokens = lexJs('const msg = "hi";');
    const types = tokens.map((t) => t.type);
    expect(types).toContain('keyword');
    expect(types).toContain('string');
  });
});

describe('html lexer', () => {
  it('tokenizes tags', () => {
    const tokens = lexHtml('<div></div>');
    expect(tokens.some((t) => t.type === 'tag')).toBe(true);
  });
});

describe('python lexer', () => {
  const SOURCE = [
    '# greet everyone',
    'import sys',
    '',
    'def greet(name: str = "world") -> None:',
    '    """Say hello."""',
    '    count = 0x1f',
    '    if name is not None and count > 3.5:',
    '        print(f"hello {name}")',
    '',
  ].join('\n');

  it('tokenizes keywords, builtins, strings, comments and numbers', () => {
    const tokens = lexPython(SOURCE);
    expect(typeOf(tokens, 'def')).toBe('keyword');
    expect(typeOf(tokens, 'import')).toBe('keyword');
    expect(typeOf(tokens, 'print')).toBe('builtin');
    expect(typeOf(tokens, 'None')).toBe('builtin');
    expect(typeOf(tokens, '# greet everyone')).toBe('comment');
    expect(typeOf(tokens, '0x1f')).toBe('number');
    expect(typeOf(tokens, '3.5')).toBe('number');
    expect(typeOf(tokens, '->')).toBe('operator');
  });

  it('keeps triple-quoted strings in one token', () => {
    const tokens = lexPython('x = """line one\nline two"""');
    expect(typeOf(tokens, '"""line one\nline two"""')).toBe('string');
  });

  it('handles f-string and raw string prefixes', () => {
    expect(typeOf(lexPython('f"hi {name}"'), 'f"hi {name}"')).toBe('string');
    expect(typeOf(lexPython("r'\\d+'"), "r'\\d+'")).toBe('string');
  });

  it('round-trips the source', () => {
    expect(roundTrips(lexPython, SOURCE)).toBe(true);
  });
});

describe('yaml lexer', () => {
  const SOURCE = [
    '# deployment',
    '---',
    'name: velinstyle',
    'version: 1.2',
    'strict: true',
    'tags:',
    '  - docs',
    '  - a11y',
    'script: |',
    '  npm run build',
    'env:',
    '  NODE_ENV: "production"',
    '',
  ].join('\n');

  it('marks mapping keys and scalars', () => {
    const tokens = lexYaml(SOURCE);
    expect(typeOf(tokens, 'name')).toBe('attr-name');
    expect(typeOf(tokens, 'true')).toBe('keyword');
    expect(typeOf(tokens, '1.2')).toBe('number');
    expect(typeOf(tokens, '"production"')).toBe('string');
    expect(typeOf(tokens, '# deployment')).toBe('comment');
  });

  it('marks document separators and sequence dashes', () => {
    const tokens = lexYaml(SOURCE);
    expect(typeOf(tokens, '---')).toBe('punctuation');
    expect(types(tokens)).toContain('punctuation');
  });

  it('marks anchors and block scalar headers', () => {
    expect(typeOf(lexYaml('base: &defaults\n'), '&defaults')).toBe('operator');
    expect(typeOf(lexYaml('body: >\n  text\n'), '>')).toBe('operator');
  });

  it('round-trips the source', () => {
    expect(roundTrips(lexYaml, SOURCE)).toBe(true);
  });
});

describe('go lexer', () => {
  const SOURCE = [
    'package main',
    '',
    'import "fmt"',
    '',
    '// Greet prints a name.',
    'func Greet(name string) error {',
    '\tcount := 0',
    '\tif name == "" {',
    '\t\treturn fmt.Errorf("empty")',
    '\t}',
    '\tfmt.Println(name, count)',
    '\treturn nil',
    '}',
    '',
  ].join('\n');

  it('tokenizes keywords, builtins, comments and operators', () => {
    const tokens = lexGo(SOURCE);
    expect(typeOf(tokens, 'func')).toBe('keyword');
    expect(typeOf(tokens, 'package')).toBe('keyword');
    expect(typeOf(tokens, 'string')).toBe('builtin');
    expect(typeOf(tokens, 'nil')).toBe('builtin');
    expect(typeOf(tokens, ':=')).toBe('operator');
    expect(typeOf(tokens, '// Greet prints a name.')).toBe('comment');
  });

  it('keeps raw strings in one token', () => {
    const tokens = lexGo('s := `multi\nline`');
    expect(typeOf(tokens, '`multi\nline`')).toBe('string');
  });

  it('round-trips the source', () => {
    expect(roundTrips(lexGo, SOURCE)).toBe(true);
  });
});

describe('rust lexer', () => {
  const SOURCE = [
    '#[derive(Debug)]',
    'struct Point { x: i32, y: i32 }',
    '',
    '/// Sums a slice.',
    'pub fn total(values: &[i32]) -> Option<i32> {',
    '    let mut sum = 0i32;',
    '    for v in values {',
    '        sum += v;',
    '    }',
    '    Some(sum)',
    '}',
    '',
  ].join('\n');

  it('tokenizes keywords, builtin types, attributes and comments', () => {
    const tokens = lexRust(SOURCE);
    expect(typeOf(tokens, 'fn')).toBe('keyword');
    expect(typeOf(tokens, 'struct')).toBe('keyword');
    expect(typeOf(tokens, 'i32')).toBe('builtin');
    expect(typeOf(tokens, 'Option')).toBe('builtin');
    expect(typeOf(tokens, '#[derive(Debug)]')).toBe('builtin');
    expect(typeOf(tokens, '/// Sums a slice.')).toBe('comment');
    expect(typeOf(tokens, '->')).toBe('operator');
  });

  it('treats lifetimes as operators rather than unterminated chars', () => {
    const tokens = lexRust("fn get<'a>(s: &'a str) -> &'a str { s }");
    expect(tokens.filter((t) => t.value === "'a").every((t) => t.type === 'operator')).toBe(true);
    expect(types(tokens)).not.toContain('string');
  });

  it('keeps raw strings in one token', () => {
    expect(typeOf(lexRust('let s = r#"a "quoted" b"#;'), 'r#"a "quoted" b"#')).toBe('string');
  });

  it('round-trips the source', () => {
    expect(roundTrips(lexRust, SOURCE)).toBe(true);
  });
});

describe('language registry coverage', () => {
  const NEW_LANGUAGES = ['python', 'yaml', 'go', 'rust'];

  it('lists the new languages', () => {
    const listed = listLanguages();
    for (const name of NEW_LANGUAGES) expect(listed).toContain(name);
  });

  it('normalizes the new aliases', () => {
    expect(normalizeLanguage('py')).toBe('python');
    expect(normalizeLanguage('python3')).toBe('python');
    expect(normalizeLanguage('yml')).toBe('yaml');
    expect(normalizeLanguage('golang')).toBe('go');
    expect(normalizeLanguage('rs')).toBe('rust');
    expect(normalizeLanguage('language-rust')).toBe('rust');
  });

  it('lazy-loads each new language', async () => {
    for (const name of [...NEW_LANGUAGES, 'py', 'yml', 'golang', 'rs']) {
      const lexer = await lazyLoadLanguage(name);
      expect(lexer, name).toBeTypeOf('function');
    }
  });
});
