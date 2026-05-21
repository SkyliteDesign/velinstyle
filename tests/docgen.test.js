import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { extractComponentFile, renderComponent } from '../cli/docgen/extract-components.js';
import { parseTokenCss, extractTokens } from '../cli/docgen/extract-tokens.js';
import { parseUtilityCss } from '../cli/docgen/extract-utilities.js';
import { loadCliManifest, validateManifest, REGISTERED_COMMANDS } from '../cli/docgen/extract-cli.js';
import { SCANNER_RULES, PERF_RULES } from '../cli/scanner-rules-data.js';
import { generateDocs } from '../cli/docs-generate.js';
import { buildTokensFromJson } from '../cli/tokens-build.js';
import { validateTokensJson } from '../cli/tokens-validate.js';

const FIXTURE_COMPONENT = `/**
 * Test component for docgen.
 */
class VelinTestDoc extends HTMLElement {
  static get observedAttributes() { return ['open', 'label']; }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('velin-test', { bubbles: true }));
  }

  show() {}
  get value() { return 1; }
}
`;

describe('docgen extractors', () => {
  it('parses component attributes, events, and public API', () => {
    const dir = join(tmpdir(), `velin-docgen-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'velin-test-doc.js');
    writeFileSync(file, FIXTURE_COMPONENT, 'utf-8');
    const meta = extractComponentFile(file);
    expect(meta.tag).toBe('velin-test-doc');
    expect(meta.observedAttributes).toEqual(['open', 'label']);
    expect(meta.events).toContain('velin-test');
    expect(meta.methods).toContain('show');
    expect(meta.getters).toContain('value');
    rmSync(dir, { recursive: true });
  });

  it('renders velin-rating golden snippet', () => {
    const meta = extractComponentFile(join(process.cwd(), 'components', 'velin-rating.js'));
    const md = renderComponent(meta);
    expect(md).toContain('<velin-rating>');
    expect(md).toContain('`value`');
    expect(md).toContain('velin-change');
  });

  it('parses token CSS variables', () => {
    const css = `@layer tokens { :root { --velin-color-primary: oklch(50% 0.1 250); } }`;
    const tokens = parseTokenCss(css);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].name).toBe('--velin-color-primary');
  });

  it('extracts tokens from src/tokens', () => {
    const { categories, byCategory } = extractTokens(join(process.cwd(), 'src'));
    expect(categories).toContain('color');
    expect(byCategory.color.tokens.length).toBeGreaterThan(5);
  });

  it('parses utility classes', () => {
    const css = `@layer utilities { .velin-m-4 { margin: var(--velin-space-4); } }`;
    const classes = parseUtilityCss(css);
    expect(classes[0].selector).toBe('velin-m-4');
    expect(classes[0].output).toContain('margin');
  });

  it('cli manifest matches registered commands', () => {
    const manifest = loadCliManifest();
    const errors = validateManifest(manifest);
    expect(errors).toEqual([]);
    expect(REGISTERED_COMMANDS).toContain('docs');
    expect(manifest.commands.length).toBe(REGISTERED_COMMANDS.length);
  });

  it('scanner rules export is non-empty', () => {
    expect(SCANNER_RULES.length).toBeGreaterThan(20);
    expect(PERF_RULES.length).toBeGreaterThan(3);
    expect(SCANNER_RULES.some((r) => r.id === 'pii/hardcoded-email')).toBe(true);
  });
});

describe('tokens pipeline', () => {
  it('builds zIndex block deterministically sorted', () => {
    const path = join(process.cwd(), 'examples', 'tokens.full.json');
    const css = buildTokensFromJson(path);
    expect(css).toContain('--velin-z-modal');
    const modalIdx = css.indexOf('--velin-z-modal');
    const toastIdx = css.indexOf('--velin-z-toast');
    expect(modalIdx).toBeLessThan(toastIdx);
  });

  it('validates tokens.full.json', () => {
    const result = validateTokensJson(join(process.cwd(), 'examples', 'tokens.full.json'));
    expect(result.ok).toBe(true);
  });
});

describe('docs generate', () => {
  it('writes output to temp directory', async () => {
    const out = join(tmpdir(), `velin-docs-out-${Date.now()}`);
    const result = await generateDocs({ scope: 'cli', outDir: out });
    expect(result.ok).toBe(true);
    const md = readFileSync(join(out, 'cli', 'commands.md'), 'utf-8');
    expect(md).toContain('velinstyle docs generate');
    rmSync(out, { recursive: true });
  });
});
