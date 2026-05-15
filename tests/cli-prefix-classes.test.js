import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  collectVelinClasses,
  mapTokenToVelin,
  transformMarkupClassAttributes,
  runPrefixCommand,
  loadExplicitPrefixMapFile,
  buildExplicitPrefixMap,
} from '../cli/prefix-classes.js';

const pkgRoot = process.cwd();

describe('collectVelinClasses', () => {
  it('finds utilities and components from src/', () => {
    const c = collectVelinClasses(pkgRoot);
    expect(c.size).toBeGreaterThan(100);
    expect(c.has('velin-p-4')).toBe(true);
    expect(c.has('velin-flex')).toBe(true);
    expect(c.has('velin-btn')).toBe(true);
  });
});

describe('mapTokenToVelin', () => {
  const catalog = new Set(['velin-p-4', 'velin-flex']);

  it('adds velin- when velin-{token} exists in catalog', () => {
    expect(mapTokenToVelin('p-4', catalog)).toBe('velin-p-4');
  });

  it('leaves unknown tokens unchanged', () => {
    expect(mapTokenToVelin('my-app-widget', catalog)).toBe('my-app-widget');
  });

  it('does not double-prefix', () => {
    expect(mapTokenToVelin('velin-p-4', catalog)).toBe('velin-p-4');
  });

  it('maps Bootstrap d-* when --bootstrapAliases and target exists', () => {
    expect(mapTokenToVelin('d-flex', catalog, { bootstrapAliases: true })).toBe('velin-flex');
    expect(mapTokenToVelin('d-flex', catalog, { bootstrapAliases: false })).toBe('d-flex');
  });

  it('explicit JSON map wins over catalog and bootstrap aliases', () => {
    const explicit = new Map([['btn', 'velin-btn--primary'], ['d-flex', 'velin-flex']]);
    const cat = new Set(['velin-btn', 'velin-flex']);
    expect(mapTokenToVelin('btn', cat, { explicitMap: explicit })).toBe('velin-btn--primary');
    expect(mapTokenToVelin('d-flex', cat, { bootstrapAliases: true, explicitMap: explicit })).toBe(
      'velin-flex',
    );
  });
});

describe('transformMarkupClassAttributes', () => {
  it('rewrites class and className string attributes', () => {
    const c = collectVelinClasses(pkgRoot);
    const src =
      '<div class="p-4 flex"></div><span className=\'btn gap-2\'></span>';
    const { next, changed } = transformMarkupClassAttributes(src, c);
    expect(changed).toBeGreaterThanOrEqual(3);
    expect(next).toContain('velin-p-4');
    expect(next).toContain('velin-flex');
    expect(next).toContain('velin-btn');
    expect(next).toContain('velin-gap-2');
  });

  it('uses explicit map for Bootstrap-style tokens', () => {
    const c = collectVelinClasses(pkgRoot);
    const explicit = new Map([
      ['btn', 'velin-btn'],
      ['btn-primary', 'velin-btn--primary'],
    ]);
    const src = '<button class="btn btn-primary">x</button>';
    const { next, changed } = transformMarkupClassAttributes(src, c, { explicitMap: explicit });
    expect(changed).toBe(2);
    expect(next).toContain('velin-btn velin-btn--primary');
  });

  it('skips attributes that look like templates', () => {
    const c = collectVelinClasses(pkgRoot);
    const src = '<div class="{{ dynamic }}"></div><x class="p-4"></x>';
    const { next } = transformMarkupClassAttributes(src, c);
    expect(next).toContain('class="{{ dynamic }}"');
    expect(next).toMatch(/class="velin-p-4"/);
  });
});

describe('loadExplicitPrefixMapFile', () => {
  const tmp = join(pkgRoot, 'tests', '.tmp-prefix-map.json');

  it('reads flat object; skips _ and $ keys', () => {
    writeFileSync(
      tmp,
      JSON.stringify({
        _comment: 'ignore',
        $schema: 'ignore',
        foo: 'velin-p-4',
      }),
      'utf-8',
    );
    const m = loadExplicitPrefixMapFile(tmp);
    expect(m.get('foo')).toBe('velin-p-4');
    expect(m.has('_comment')).toBe(false);
    rmSync(tmp, { force: true });
  });

  it('uses only classMap when that key is present', () => {
    writeFileSync(
      tmp,
      JSON.stringify({
        ignoredTop: 'velin-p-1',
        classMap: { only: 'velin-p-2' },
      }),
      'utf-8',
    );
    const m = loadExplicitPrefixMapFile(tmp);
    expect(m.has('ignoredTop')).toBe(false);
    expect(m.get('only')).toBe('velin-p-2');
    rmSync(tmp, { force: true });
  });
});

describe('buildExplicitPrefixMap', () => {
  const dir = join(pkgRoot, 'tests', '.tmp-prefix-map-dir');

  it('merges auto file and --map override path', () => {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'velinstyle-prefix-map.json'),
      JSON.stringify({ shared: 'velin-p-4', onlyAuto: 'velin-m-1' }),
      'utf-8',
    );
    const override = join(dir, 'override.json');
    writeFileSync(override, JSON.stringify({ shared: 'velin-m-2', onlyOverride: 'velin-p-2' }), 'utf-8');

    const m = buildExplicitPrefixMap(dir, override);
    expect(m?.get('shared')).toBe('velin-m-2');
    expect(m?.get('onlyAuto')).toBe('velin-m-1');
    expect(m?.get('onlyOverride')).toBe('velin-p-2');

    rmSync(dir, { recursive: true, force: true });
  });

  it('returns null when no files', () => {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    expect(buildExplicitPrefixMap(dir, null)).toBe(null);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('runPrefixCommand', () => {
  const tmp = join(pkgRoot, 'tests', '.tmp-prefix-test');

  it('writes only with --write', () => {
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const f = join(tmp, 'a.html');
    writeFileSync(f, '<main class="p-4 d-flex"></main>', 'utf-8');

    const dry = runPrefixCommand(tmp, { write: false, bootstrapAliases: true, pkgRoot });
    expect(dry.filesTouched).toBe(1);
    expect(readFileSync(f, 'utf-8')).toContain('class="p-4 d-flex"');

    runPrefixCommand(tmp, { write: true, bootstrapAliases: true, pkgRoot });
    const body = readFileSync(f, 'utf-8');
    expect(body).toContain('velin-p-4');
    expect(body).toContain('velin-flex');

    rmSync(tmp, { recursive: true, force: true });
  });
});
