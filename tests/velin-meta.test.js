import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeEntry } from '../core/search/types.js';
import { sanitizeSearchUrl } from '../components/sanitize.js';
import {
  buildAgentBundle,
  buildLlmsTxt,
  buildPageMeta,
  relativizeDocsPathname,
  VELIN_META_MIME,
} from '../core/meta/index.js';
import { buildMeta } from '../cli/meta.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8')).version;

describe('velin-meta', () => {
  it('sanitizeSearchUrl keeps relative index paths', () => {
    expect(sanitizeSearchUrl('getting-started/contents.html#cli')).toBe(
      'getting-started/contents.html#cli',
    );
  });

  it('normalizeEntry does not resolve against location', () => {
    const prev = globalThis.location;
    // @ts-expect-error test stub
    globalThis.location = new URL('http://localhost/docs/components/buttons/');
    const entry = normalizeEntry({
      id: 'x',
      title: 'CLI',
      url: 'getting-started/contents.html#cli',
    });
    globalThis.location = prev;
    expect(entry.url).toBe('getting-started/contents.html#cli');
  });

  it('relativizeDocsPathname strips mistaken section prefix', () => {
    expect(
      relativizeDocsPathname('/docs/components/getting-started/contents.html'),
    ).toBe('getting-started/contents.html');
    expect(relativizeDocsPathname('/docs/components/velin-code-block.html')).toBe(
      'components/velin-code-block.html',
    );
  });

  it('buildAgentBundle includes framework and components', async () => {
    const bundle = await buildAgentBundle({ pkgRoot: ROOT });
    expect(bundle.mime).toBe(VELIN_META_MIME);
    expect(bundle.framework.version).toBe(PKG_VERSION);
    expect(bundle.components.count).toBe(36);
    expect(bundle.components.loaderCount).toBe(38);
    expect(bundle.components.legacyAliases).toEqual(
      expect.arrayContaining(['velin-stepper-wc', 'velin-tooltip-wc']),
    );
    expect(bundle.components.helpers).toEqual(
      expect.arrayContaining(['velin-flip', 'velin-haptic', 'velin-reveal']),
    );
    expect(bundle.cli.commands.length).toBeGreaterThan(5);
  });

  it('buildLlmsTxt references agent json', async () => {
    const bundle = await buildAgentBundle({ pkgRoot: ROOT });
    const txt = buildLlmsTxt(bundle);
    expect(txt).toContain('velin-agent.json');
    expect(txt).toContain('Velin-Meta');
  });

  it('buildPageMeta extracts velin components from html', () => {
    const html = '<velin-code-block language="js"></velin-code-block><div class="velin-mt-4">';
    const meta = buildPageMeta(html, 'components/demo.html', ROOT);
    expect(meta.allowed.components).toContain('velin-code-block');
    expect(meta.mime).toBe(VELIN_META_MIME);
  });

  it('buildMeta writes dist files', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'velinstyle-meta-'));
    try {
      const outFile = join(tmp, 'velin-agent.test.json');
      const llmsFile = join(tmp, 'llms.test.txt');
      const result = await buildMeta({ outFile, llmsFile });
      expect(result.ok).toBe(true);
      expect(existsSync(outFile)).toBe(true);
      const raw = readFileSync(outFile, 'utf-8');
      expect(raw).not.toMatch(/api[_-]?key|password\s*=/i);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('resolveDocsSearchUrl (browser)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <script src="http://localhost/docs/assets/doc-search.iife.js"></script>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves relative index path from docs root', async () => {
    const { resolveDocsSearchUrl } = await import('../core/search/docs-url.js');
    expect(resolveDocsSearchUrl('getting-started/contents.html#cli')).toBe(
      'http://localhost/docs/getting-started/contents.html#cli',
    );
  });

  it('repairs legacy absolute URLs baked under current section', async () => {
    const { resolveDocsSearchUrl } = await import('../core/search/docs-url.js');
    expect(
      resolveDocsSearchUrl('http://localhost/docs/components/getting-started/contents.html#cli'),
    ).toBe('http://localhost/docs/getting-started/contents.html#cli');
  });
});
