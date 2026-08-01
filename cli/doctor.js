/**
 * Environment / install health checks for VelinStyle consumers.
 */
import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

/**
 * @param {{ cwd?: string, pkgRoot?: string }} opts
 */
export async function runDoctor(opts = {}) {
  const cwd = resolve(opts.cwd || process.cwd());
  const pkgRoot = opts.pkgRoot ? resolve(opts.pkgRoot) : null;
  const issues = [];
  const ok = [];

  const checkFile = (label, path, severity = 'error') => {
    if (existsSync(path) && statSync(path).isFile()) {
      ok.push(`${label}: ${path}`);
      return true;
    }
    issues.push({ severity, message: `Missing ${label}`, path, fix: `Provide ${label} at ${path}` });
    return false;
  };

  const checkDir = (label, path, severity = 'warning') => {
    if (existsSync(path) && statSync(path).isDirectory()) {
      ok.push(`${label}: ${path}`);
      return true;
    }
    issues.push({ severity, message: `Missing ${label}`, path, fix: `Create or copy ${label}` });
    return false;
  };

  // Consumer project
  checkFile('velinstyle.config.js', join(cwd, 'velinstyle.config.js'), 'info');
  const vendorCandidates = [
    join(cwd, 'vendor', 'velinstyle'),
    join(cwd, 'public', 'vendor', 'velinstyle'),
    join(cwd, 'dist'),
  ];
  let vendorHit = false;
  for (const v of vendorCandidates) {
    if (existsSync(join(v, 'velinstyle.min.css')) || existsSync(join(v, 'velinstyle.css'))) {
      ok.push(`CSS found under ${v}`);
      vendorHit = true;
      const sprite = join(v, 'velin-icons.svg');
      if (existsSync(sprite)) ok.push(`Icon sprite: ${sprite}`);
      else issues.push({ severity: 'warning', message: 'Icon sprite not found next to CSS', path: sprite, fix: 'Copy velin-icons.svg or set meta name="velin-icon-sprite"' });
      const themes = join(v, 'themes');
      if (existsSync(themes)) ok.push(`Themes: ${themes}`);
      break;
    }
  }
  if (!vendorHit) {
    issues.push({
      severity: 'warning',
      message: 'No local VelinStyle CSS found (vendor/velinstyle or dist)',
      fix: 'Copy framework dist/ into vendor/velinstyle or npm i @birdapi/velinstyle',
    });
  }

  // Framework package (when doctor runs from monorepo / linked package)
  if (pkgRoot) {
    checkFile('Framework CSS (min)', join(pkgRoot, 'dist', 'velinstyle.min.css'));
    checkFile('Framework components (min)', join(pkgRoot, 'dist', 'velinstyle-components.min.js'));
    checkFile('Framework icon sprite', join(pkgRoot, 'dist', 'velin-icons.svg'), 'warning');
    checkDir('Framework themes', join(pkgRoot, 'dist', 'themes'), 'warning');
  }

  // Windows ESM config smoke
  const configPath = join(cwd, 'velinstyle.config.js');
  if (existsSync(configPath)) {
    try {
      await import(pathToFileURL(configPath).href);
      ok.push('Config import via pathToFileURL succeeded (Windows-safe)');
    } catch (err) {
      issues.push({
        severity: 'error',
        message: `Failed to import velinstyle.config.js: ${err?.message || err}`,
        fix: 'Ensure the CLI uses pathToFileURL for dynamic imports on Windows',
      });
    }
  }

  if (process.platform === 'win32') {
    ok.push('Platform: Windows — use pathToFileURL for ESM config; avoid raw d:\\ imports');
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;

  return {
    ok: errors === 0,
    cwd,
    summary: { errors, warnings, infos: issues.filter((i) => i.severity === 'info').length, passed: ok.length },
    okLines: ok,
    issues,
  };
}

export function formatDoctorReport(report) {
  const lines = [`VelinStyle doctor — ${report.cwd}`, ''];
  for (const line of report.okLines) lines.push(`  OK  ${line}`);
  if (report.issues.length) {
    lines.push('');
    for (const i of report.issues) {
      lines.push(`  [${i.severity}] ${i.message}`);
      if (i.fix) lines.push(`         fix: ${i.fix}`);
    }
  }
  lines.push('');
  lines.push(
    report.ok
      ? `Pass (${report.summary.passed} checks, ${report.summary.warnings} warning(s))`
      : `Fail (${report.summary.errors} error(s), ${report.summary.warnings} warning(s))`,
  );
  return lines.join('\n');
}
