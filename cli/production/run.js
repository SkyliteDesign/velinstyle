/**
 * Production Builder orchestration.
 */
import {
  existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, statSync, readdirSync,
} from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { extractProject, extractToPlain, DEFAULT_IGNORE } from './extract.js';
import { resolveClosure, listKnownThemeNames } from './graph.js';
import { buildProductionCss } from './trim-css.js';
import { buildProductionJs, detectRuntimeFeatures } from './trim-js.js';
import { resolveUsedThemes, writeThemes } from './trim-themes.js';
import { buildIconSpriteSubset } from './trim-icons.js';
import { shouldIncludeMotion, motionClassSet } from './trim-motion.js';
import { buildReport } from './report.js';
import { buildExplain } from './explain.js';
import { watchProduction } from './watch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PKG_ROOT = join(__dirname, '../..');

function parseSafelist(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  const s = String(raw);
  if (existsSync(s) && statSync(s).isFile()) {
    return readFileSync(s, 'utf-8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
  }
  return s.split(/[,]+/).map((x) => x.trim()).filter(Boolean);
}

async function loadUserConfig(cwd) {
  const configPath = resolve(cwd, 'velinstyle.config.js');
  if (!existsSync(configPath)) return {};
  try {
    const mod = await import(pathToFileURL(configPath).href);
    return mod.default || {};
  } catch {
    return {};
  }
}

function lightningBundle(css, outFile, { minify = true } = {}) {
  mkdirSync(dirname(outFile), { recursive: true });
  const tmpPath = resolve(dirname(outFile), '.velin-production-tmp.css');
  writeFileSync(tmpPath, css);
  let ok = false;
  try {
    const binName = process.platform === 'win32' ? 'lightningcss.cmd' : 'lightningcss';
    const localBin = join(PKG_ROOT, 'node_modules', '.bin', binName);
    const cli = existsSync(localBin) ? `"${localBin}"` : 'npx lightningcss';
    const minifyFlag = minify ? '--minify' : '';
    execSync(`${cli} --bundle ${minifyFlag} "${tmpPath}" -o "${outFile}"`, {
      stdio: 'pipe',
      cwd: PKG_ROOT,
      shell: true,
    });
    ok = true;
  } catch {
    writeFileSync(outFile, css);
  } finally {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
  }
  return ok;
}

function originalBytesEstimate() {
  let n = 0;
  const css = join(PKG_ROOT, 'dist', 'velinstyle.min.css');
  const js = join(PKG_ROOT, 'dist', 'velinstyle-components.min.js');
  const icons = join(PKG_ROOT, 'dist', 'velin-icons.svg');
  for (const f of [css, js, icons]) {
    if (existsSync(f)) n += statSync(f).size;
  }
  const themeDir = join(PKG_ROOT, 'dist', 'themes');
  if (existsSync(themeDir)) {
    for (const f of readdirSync(themeDir)) {
      if (f.endsWith('.css')) n += statSync(join(themeDir, f)).size;
    }
  }
  return n;
}

/**
 * @param {object} opts
 * @param {string[]} [opts.args] raw CLI args after command
 * @param {object} [opts.helpers] { getArg, hasFlag, C }
 */
export async function runProduction(opts = {}) {
  const {
    args = [],
    helpers = {},
    cwd = process.cwd(),
  } = opts;
  const getArg = helpers.getArg || ((flag, alias) => {
    const i = args.indexOf(flag);
    const a = alias ? args.indexOf(alias) : -1;
    const idx = i !== -1 ? i : a;
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  });
  const hasFlag = helpers.hasFlag || ((flag, alias) => args.includes(flag) || (alias && args.includes(alias)));
  const C = helpers.C || {
    green: (s) => s, yellow: (s) => s, cyan: (s) => s, dim: (s) => s, bold: (s) => s, red: (s) => s,
  };

  const config = await loadUserConfig(cwd);
  const prodCfg = config.production || {};

  const pathArg = args.find((a) => a && !a.startsWith('-')) || '.';
  const targetPath = resolve(cwd, pathArg);
  const outDir = resolve(cwd, getArg('--out', '-o') || prodCfg.out || './dist/velin-production');
  const explain = hasFlag('--explain');
  const doWatch = hasFlag('--watch');
  const reportPath = getArg('--report') || null;
  const safelist = [
    ...parseSafelist(prodCfg.safelist),
    ...parseSafelist(getArg('--safelist')),
  ];
  const noJs = hasFlag('--no-js');
  const noIcons = hasFlag('--no-icons');
  const noThemes = hasFlag('--no-themes');
  const noMotion = hasFlag('--no-motion');
  const minify = !hasFlag('--no-minify');

  const once = async () => {
    mkdirSync(outDir, { recursive: true });

    const extracted = extractProject(targetPath, {
      ignore: DEFAULT_IGNORE,
      safelist,
      outDir,
      cwd,
    });

    const closure = resolveClosure(
      { classes: extracted.classes, tags: extracted.tags },
      {
        safelistFiles: safelist.filter((s) => s.endsWith('.css') || s.includes('/')),
      },
    );

    const includeMotion = shouldIncludeMotion(extracted, { force: noMotion ? false : null });
    const motionUsed = motionClassSet(extracted);

    const utilitySet = new Set(closure.utilityFiles);
    const componentFiles = closure.cssFiles.filter((f) => !utilitySet.has(f));
    const utilityFiles = closure.utilityFiles.filter((f) => {
      if (!includeMotion && /animation|view-transition|scroll-animation|chart-animation/.test(f)) return false;
      return true;
    });

    const cssResult = buildProductionCss({
      pkgRoot: PKG_ROOT,
      readFile: (p) => readFileSync(p, 'utf-8'),
      exists: existsSync,
      componentFiles,
      utilityFiles,
      usedClasses: extracted.classes,
      includeMotionFiles: includeMotion,
      motionUsed,
    });

    const cssOut = join(outDir, 'velinstyle.css');
    const bundled = lightningBundle(cssResult.css, cssOut, { minify });
    const cssBytes = existsSync(cssOut) ? statSync(cssOut).size : Buffer.byteLength(cssResult.css);

    let jsBytes = 0;
    let jsOut = null;
    const features = detectRuntimeFeatures(extracted);
    if (!noJs) {
      jsOut = join(outDir, 'velinstyle.js');
      const js = buildProductionJs({ tags: closure.tags, features });
      writeFileSync(jsOut, js);
      jsBytes = Buffer.byteLength(js);
    }

    let themeMeta = { selected: [], skipped: [], written: [] };
    if (!noThemes) {
      const resolved = resolveUsedThemes(extracted, {
        configThemes: prodCfg.themes ?? 'auto',
        pkgRoot: PKG_ROOT,
        defaultThemes: [],
      });
      const written = writeThemes({
        pkgRoot: PKG_ROOT,
        outDir,
        themes: resolved.selected,
        minifyPrefer: minify,
      });
      themeMeta = { ...resolved, ...written };
    } else {
      themeMeta.skipped = listKnownThemeNames(PKG_ROOT);
    }

    let iconMeta = { included: [], skipped: [], bytes: 0, availableCount: 0 };
    if (!noIcons) {
      iconMeta = buildIconSpriteSubset({
        pkgRoot: PKG_ROOT,
        outDir,
        iconNames: extracted.icons,
      });
    }

    const themeBytes = (themeMeta.written || []).reduce((n, w) => {
      try { return n + statSync(w.file).size; } catch { return n; }
    }, 0);

    const productionBytes = cssBytes + jsBytes + (iconMeta.bytes || 0) + themeBytes;
    const original = originalBytesEstimate();

    const fullCss = existsSync(join(PKG_ROOT, 'dist', 'velinstyle.min.css'))
      ? statSync(join(PKG_ROOT, 'dist', 'velinstyle.min.css')).size : 0;
    const fullJs = existsSync(join(PKG_ROOT, 'dist', 'velinstyle-components.min.js'))
      ? statSync(join(PKG_ROOT, 'dist', 'velinstyle-components.min.js')).size : 0;
    const fullIcons = existsSync(join(PKG_ROOT, 'dist', 'velin-icons.svg'))
      ? statSync(join(PKG_ROOT, 'dist', 'velin-icons.svg')).size : 0;

    let themeSaved = 0;
    for (const name of themeMeta.skipped || []) {
      const p = join(PKG_ROOT, 'dist', 'themes', `${name}.min.css`);
      if (existsSync(p)) themeSaved += statSync(p).size;
    }

    const report = buildReport({
      originalBytes: original || (fullCss + fullJs + fullIcons),
      productionBytes,
      breakdown: {
        CSS: Math.max(0, fullCss - cssBytes),
        JS: Math.max(0, fullJs - jsBytes),
        Icons: Math.max(0, fullIcons - (iconMeta.bytes || 0)),
        Themes: themeSaved,
        Motion: includeMotion ? 0 : 8 * 1024,
        Fonts: 2 * 1024,
      },
      themes: themeMeta.selected || [],
      icons: iconMeta.included || [],
      components: cssResult.included,
      tags: closure.tags,
      filesScanned: extracted.files.length,
      imagesSkipped: true,
    });

    writeFileSync(join(outDir, 'production-report.json'), JSON.stringify(report, null, 2));
    writeFileSync(join(outDir, 'production-report.txt'), report.text);
    writeFileSync(join(outDir, 'used.json'), JSON.stringify({
      ...extractToPlain(extracted),
      closure: {
        cssFiles: closure.cssFiles,
        tags: closure.tags,
        matchedPrefixes: closure.matchedPrefixes,
      },
    }, null, 2));

    if (reportPath) {
      const absReport = resolve(cwd, reportPath);
      mkdirSync(dirname(absReport), { recursive: true });
      if (absReport.endsWith('.md') || absReport.endsWith('.txt')) {
        writeFileSync(absReport, report.text);
      } else {
        writeFileSync(absReport, JSON.stringify(report, null, 2));
      }
    }

    let explainOut = null;
    if (explain) {
      explainOut = buildExplain({
        skippedCss: cssResult.skipped,
        skippedThemes: themeMeta.skipped || [],
        skippedIcons: iconMeta.skipped || [],
        skippedMotion: !includeMotion,
        graphExplain: closure.explain,
      });
      writeFileSync(join(outDir, 'explain.txt'), explainOut.text);
      console.log(`\n${explainOut.text}`);
    }

    console.log(C.green(`\nProduction build → ${outDir}`));
    console.log(report.text);
    console.log(C.dim(`\nCSS: ${cssOut}${bundled ? ' (lightningcss)' : ' (raw)'}`));
    if (jsOut) console.log(C.dim(`JS:  ${jsOut} (${closure.tags.length} components)`));
    if (!noIcons) console.log(C.dim(`Icons: ${iconMeta.included.length} / ${iconMeta.availableCount || '?'}`));
    if (!noThemes) console.log(C.dim(`Themes: ${(themeMeta.selected || []).join(', ') || '(none)'}`));

    return {
      outDir,
      report,
      explain: explainOut,
      extracted,
      closure,
      cssOut,
      jsOut,
    };
  };

  const result = await once();

  if (doWatch) {
    console.log(C.cyan(`\nWatching ${targetPath} … (Ctrl+C to stop)`));
    watchProduction(targetPath, async () => {
      console.log(C.dim('\n[watch] rebuild…'));
      await once();
    });
    await new Promise(() => {});
  }

  return result;
}
