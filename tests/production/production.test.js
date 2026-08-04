import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractFromText, extractProject } from '../../cli/production/extract.js';
import { resolveClosure, loadGraph } from '../../cli/production/graph.js';
import { filterCssByUsedClasses } from '../../cli/production/trim-css.js';
import { buildProductionJs } from '../../cli/production/trim-js.js';
import { buildExplain } from '../../cli/production/explain.js';
import { buildReport } from '../../cli/production/report.js';
import { buildIconSpriteSubset } from '../../cli/production/trim-icons.js';
import { runProduction, PKG_ROOT } from '../../cli/production/run.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(__dirname, 'fixtures/sample.html');
const OUT = join(__dirname, 'fixtures/.out-production');

describe('production extract', () => {
  it('extracts classes, tags, themes, icons, motion', () => {
    const html = readFileSync(FIXTURE, 'utf-8');
    const ex = extractFromText(html);
    expect(ex.classes.has('velin-btn')).toBe(true);
    expect(ex.classes.has('velin-btn--primary')).toBe(true);
    expect(ex.tags.has('velin-modal')).toBe(true);
    expect(ex.tags.has('velin-icon')).toBe(true);
    expect(ex.themes.has('nordic')).toBe(true);
    expect(ex.icons.has('check')).toBe(true);
    expect(ex.icons.has('menu')).toBe(true);
    expect([...ex.motion].some((m) => String(m).includes('animate'))).toBe(true);
  });

  it('extractProject scans fixture dir', () => {
    const ex = extractProject(join(__dirname, 'fixtures'), {
      ignore: ['node_modules', 'dist', '.git', '.out-production'],
    });
    expect(ex.files.some((f) => f.endsWith('sample.html'))).toBe(true);
    expect(ex.tags.has('velin-modal')).toBe(true);
  });
});

describe('production graph', () => {
  it('loads graph and closes modal → button css + icon peer', () => {
    const graph = loadGraph();
    expect(graph.wc['velin-modal']).toBeTruthy();
    const closure = resolveClosure({
      classes: new Set(['velin-btn--primary', 'velin-card']),
      tags: new Set(['velin-modal']),
    });
    expect(closure.cssFiles.some((f) => f.includes('modal.css'))).toBe(true);
    expect(closure.cssFiles.some((f) => f.includes('button.css'))).toBe(true);
    expect(closure.cssFiles.some((f) => f.includes('card.css'))).toBe(true);
    expect(closure.tags).toContain('velin-modal');
    expect(closure.tags).toContain('velin-icon');
  });
});

describe('production css filter', () => {
  it('keeps used utility classes only', () => {
    const css = `
.velin-p-4 { padding: 1rem; }
.velin-p-8 { padding: 2rem; }
.velin-mt-4 { margin-top: 1rem; }
`;
    const out = filterCssByUsedClasses(css, new Set(['velin-p-4']));
    expect(out).toContain('velin-p-4');
    expect(out).not.toContain('velin-p-8');
    expect(out).not.toContain('velin-mt-4');
  });
});

describe('production js stub', () => {
  it('emits register list for tags', () => {
    const js = buildProductionJs({ tags: ['velin-modal', 'velin-icon'] });
    expect(js).toContain('velin-modal');
    expect(js).toContain('velin-icon');
    expect(js).toContain('register');
  });
});

describe('production report + explain', () => {
  it('builds report shape', () => {
    const report = buildReport({
      originalBytes: 289 * 1024,
      productionBytes: 71 * 1024,
      breakdown: { CSS: 62 * 1024, JS: 94 * 1024 },
      themes: ['nordic'],
      icons: ['check'],
      tags: ['velin-modal'],
      components: ['components/button.css'],
      filesScanned: 1,
    });
    expect(report.savedPercent).toBeGreaterThan(70);
    expect(report.text).toContain('Velin Production Report');
    expect(report.version).toBe(1);
  });

  it('explain lists removals', () => {
    const ex = buildExplain({
      skippedCss: [{ file: 'modal.css', reason: 'Nicht benutzt' }],
      skippedThemes: ['ocean'],
      skippedIcons: ['unused-icon'],
    });
    expect(ex.text).toContain('Entfernt');
    expect(ex.text).toContain('ocean.theme.css');
  });
});

describe('production icons', () => {
  it('subsets sprite to requested icons', () => {
    const dir = join(__dirname, 'fixtures/.icon-out');
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const result = buildIconSpriteSubset({
      pkgRoot: PKG_ROOT,
      outDir: dir,
      iconNames: ['check', 'menu'],
    });
    expect(existsSync(result.outFile)).toBe(true);
    const sprite = readFileSync(result.outFile, 'utf-8');
    expect(sprite).toContain('id="check"');
    expect(sprite).toContain('id="menu"');
    expect(result.included.length).toBeGreaterThanOrEqual(1);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('production run', () => {
  it('writes production output for fixture', async () => {
    rmSync(OUT, { recursive: true, force: true });
    const result = await runProduction({
      args: [join(__dirname, 'fixtures'), '--out', OUT, '--explain', '--no-minify'],
      cwd: join(__dirname, 'fixtures'),
      helpers: {
        getArg: (flag, alias) => {
          const a = [join(__dirname, 'fixtures'), '--out', OUT, '--explain', '--no-minify'];
          const i = a.indexOf(flag);
          const j = alias ? a.indexOf(alias) : -1;
          const idx = i !== -1 ? i : j;
          return idx !== -1 && a[idx + 1] ? a[idx + 1] : null;
        },
        hasFlag: (flag) => [join(__dirname, 'fixtures'), '--out', OUT, '--explain', '--no-minify'].includes(flag),
        C: { green: (s) => s, yellow: (s) => s, cyan: (s) => s, dim: (s) => s, bold: (s) => s, red: (s) => s },
      },
    });
    expect(existsSync(join(OUT, 'velinstyle.css'))).toBe(true);
    expect(existsSync(join(OUT, 'velinstyle.js'))).toBe(true);
    expect(existsSync(join(OUT, 'production-report.json'))).toBe(true);
    expect(existsSync(join(OUT, 'velin-icons.svg'))).toBe(true);
    expect(result.closure.tags).toContain('velin-modal');
    const css = readFileSync(join(OUT, 'velinstyle.css'), 'utf-8');
    expect(css.length).toBeGreaterThan(100);
    rmSync(OUT, { recursive: true, force: true });
  }, 60000);
});
