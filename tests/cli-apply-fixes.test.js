import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  fixSafeExternalLinkLine,
  fixHtmlLangContent,
  fixSkipLinkContent,
  fixZIndexLine,
  pickClosestZToken,
  applyFixes,
} from '../cli/apply-fixes.js';

describe('fixSafeExternalLinkLine', () => {
  it('adds rel when target=_blank and no rel', () => {
    const line = '<a href="https://x" target="_blank">x</a>';
    expect(fixSafeExternalLinkLine(line)).toContain('rel="noopener noreferrer"');
  });

  it('merges noopener into existing double-quoted rel', () => {
    const line = '<a href="u" target="_blank" rel="nofollow">x</a>';
    const out = fixSafeExternalLinkLine(line);
    expect(out).toMatch(/noopener/);
    expect(out).toMatch(/nofollow/);
  });

  it('fixes two blank targets on one line', () => {
    const line =
      '<a target="_blank" href="a">a</a> <a target="_blank" href="b">b</a>';
    const out = fixSafeExternalLinkLine(line);
    expect((out.match(/noopener/g) || []).length).toBeGreaterThanOrEqual(2);
  });
});

describe('fixHtmlLangContent', () => {
  it('inserts lang on first html tag', () => {
    const html = '<!DOCTYPE html>\n<html>\n<head></head><body></body></html>';
    expect(fixHtmlLangContent(html, 'de')).toMatch(/<html lang="de">/);
  });

  it('uses custom fixLang', () => {
    const html = '<html class="x">';
    expect(fixHtmlLangContent(html, 'en-GB')).toMatch(/lang="en-GB"/);
  });

  it('is no-op when lang already set', () => {
    const html = '<html lang="fr">';
    expect(fixHtmlLangContent(html, 'de')).toBe(html);
  });
});

describe('fixSkipLinkContent', () => {
  it('inserts skip link after body when id=main exists', () => {
    const html = '<html lang="en"><body><main id="main">Hi</main></body></html>';
    const out = fixSkipLinkContent(html);
    expect(out).toContain('velin-skip-link');
    expect(out).toContain('#main');
  });

  it('is no-op without id=main', () => {
    const html = '<html><body><div id="x"></div></body></html>';
    expect(fixSkipLinkContent(html)).toBe(html);
  });

  it('is no-op when skip link already present', () => {
    const html =
      '<body><a class="velin-skip-link" href="#main">s</a><main id="main"></main></body>';
    expect(fixSkipLinkContent(html)).toBe(html);
  });
});

describe('fixZIndexLine', () => {
  it('replaces raw z-index with var token', () => {
    expect(fixZIndexLine('.x { z-index: 100; }')).toMatch(
      /z-index:\s*var\(--velin-z-dropdown,\s*100\)/,
    );
  });

  it('is no-op when velin z var already used', () => {
    const line = '.x { z-index: var(--velin-z-modal); }';
    expect(fixZIndexLine(line)).toBe(line);
  });
});

describe('pickClosestZToken', () => {
  it('maps 99 to dropdown (closest to 100)', () => {
    expect(pickClosestZToken(99)[0]).toBe('--velin-z-dropdown');
  });
});

describe('applyFixes', () => {
  it('writes z-index fix for fixable css issue', () => {
    const dir = mkdtempSync(join(tmpdir(), 'vs-fix-'));
    try {
      const file = join(dir, 't.css');
      writeFileSync(file, '.a { z-index: 100; }\n', 'utf-8');
      const issues = [
        {
          file,
          line: 1,
          severity: 1,
          rule: 'css/z-index-token',
          fixable: true,
          fix: (line) => fixZIndexLine(line),
        },
      ];
      const { changedRelPaths } = applyFixes(dir, issues, { dryRun: false, fixLang: 'de' });
      expect(changedRelPaths).toContain('t.css');
      expect(readFileSync(file, 'utf-8')).toMatch(/--velin-z-dropdown/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not write when dryRun', () => {
    const dir = mkdtempSync(join(tmpdir(), 'vs-fixd-'));
    try {
      const file = join(dir, 't.css');
      const before = '.a { z-index: 50; }\n';
      writeFileSync(file, before, 'utf-8');
      const issues = [
        {
          file,
          line: 1,
          severity: 1,
          rule: 'css/z-index-token',
          fixable: true,
          fix: (line) => fixZIndexLine(line),
        },
      ];
      applyFixes(dir, issues, { dryRun: true, fixLang: 'de' });
      expect(readFileSync(file, 'utf-8')).toBe(before);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
