/**
 * CLI: velinstyle transparency doctor|validate|report|export|migrate|scan
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve, extname, basename } from 'path';
import {
  createTransparencyEngine,
  normalizePolicy,
} from '../core/transparency/index.js';

function loadPolicy(policyPath) {
  if (!policyPath) return normalizePolicy({});
  const abs = resolve(policyPath);
  if (!existsSync(abs)) throw new Error(`Policy not found: ${abs}`);
  return normalizePolicy(JSON.parse(readFileSync(abs, 'utf-8')));
}

function collectHtmlFiles(target) {
  const abs = resolve(target || '.');
  if (!existsSync(abs)) throw new Error(`Path not found: ${abs}`);
  const st = statSync(abs);
  if (st.isFile()) return [abs];
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
      const p = join(dir, name);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.html?$/i.test(name)) out.push(p);
    }
  };
  walk(abs);
  return out;
}

function printScores(scores, C) {
  if (!scores) return;
  console.log(C.bold('\nScores'));
  for (const [k, v] of Object.entries(scores)) {
    console.log(`  ${k.padEnd(14)} ${v}%`);
  }
}

/**
 * @param {string[]} args process.argv slice after "transparency"
 * @param {{ C: object, getArg: Function, hasFlag: Function }} util
 */
export async function transparencyCmd(args, util) {
  const { C, getArg, hasFlag } = util;
  const sub = args[0] || 'doctor';
  const rest = args.slice(1);
  const target = rest.find((a) => !a.startsWith('-')) || '.';
  const policyPath = getArg('--policy');
  const policy = loadPolicy(policyPath);
  const asJson = hasFlag('--json');
  const engine = createTransparencyEngine({ policy });

  if (sub === 'scan') {
    return runDoctor(target, engine, { asJson, C });
  }
  if (sub === 'doctor') {
    return runDoctor(target, engine, { asJson, C });
  }
  if (sub === 'validate') {
    return runValidate(target, engine, { asJson, C });
  }
  if (sub === 'report') {
    return runReport(target, engine, { C, getArg });
  }
  if (sub === 'export') {
    return runExport(target, engine, { C, getArg });
  }
  if (sub === 'migrate') {
    return runMigrate(target, engine, { C, hasFlag, getArg });
  }
  if (sub === 'suggest') {
    return runMigrate(target, engine, { C, hasFlag, getArg, forceDry: true });
  }
  if (sub === 'apply') {
    return runMigrate(target, engine, { C, hasFlag, getArg, forceApply: true });
  }

  console.log(`Unknown transparency subcommand: ${sub}
Usage:
  velinstyle transparency doctor|validate|report|export|migrate|scan [path]
`);
  process.exitCode = 1;
}

async function runDoctor(target, engine, { asJson, C }) {
  const files = collectHtmlFiles(target);
  if (!files.length) {
    console.log(C.yellow('No HTML files found.'));
    process.exitCode = 1;
    return;
  }
  const reports = [];
  let failed = 0;
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    const report = await engine.doctor(html, { file });
    reports.push(report);
    if (!report.ok) failed += 1;
    if (!asJson) {
      console.log(C.bold(`\n── ${basename(file)} ──`));
      console.log(report.ok ? C.green('PASS') : C.red('FAIL'));
      console.log(`disclosures=${report.summary.disclosures} errors=${report.summary.errors} warnings=${report.summary.warnings}`);
      printScores(report.scores, C);
      for (const f of report.findings.slice(0, 40)) {
        const color = f.severity === 'error' ? C.red : f.severity === 'warning' ? C.yellow : C.dim;
        console.log(color(`  [${f.severity}] ${f.code}: ${f.message}`));
      }
      if (report.findings.length > 40) console.log(C.dim(`  … ${report.findings.length - 40} more`));
    }
  }
  if (asJson) {
    console.log(JSON.stringify(files.length === 1 ? reports[0] : { reports }, null, 2));
  } else {
    console.log(failed ? C.red(`\ntransparency doctor: ${failed} file(s) failed`) : C.green('\ntransparency doctor: ok'));
  }
  if (failed) process.exitCode = 1;
  return reports;
}

async function runValidate(target, engine, { asJson, C }) {
  const files = collectHtmlFiles(target);
  const all = [];
  let failed = 0;
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    const result = await engine.validate(html, { file });
    all.push({ file, ...result });
    if (!result.ok) failed += 1;
    if (!asJson) {
      console.log(`${basename(file)}: ${result.ok ? C.green('valid') : C.red('invalid')} (${result.findings.length} findings)`);
    }
  }
  if (asJson) console.log(JSON.stringify(all, null, 2));
  if (failed) process.exitCode = 1;
}

async function runReport(target, engine, { C, getArg }) {
  const outDir = resolve(getArg('--out') || 'transparency-report');
  mkdirSync(outDir, { recursive: true });
  const files = collectHtmlFiles(target);
  const combined = { schema: 'velinstyle.transparency.report.bundle', version: 1, files: [] };
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    const artifacts = await engine.report(html, { file, title: `Transparency — ${basename(file)}` });
    const base = basename(file, extname(file));
    writeFileSync(join(outDir, `${base}.report.json`), JSON.stringify(artifacts.json, null, 2));
    writeFileSync(join(outDir, `${base}.report.sarif`), JSON.stringify(artifacts.sarif, null, 2));
    writeFileSync(join(outDir, `${base}.report.html`), artifacts.html);
    combined.files.push({ file, scores: artifacts.json.scores, ok: artifacts.json.ok });
  }
  writeFileSync(join(outDir, 'index.json'), JSON.stringify(combined, null, 2));
  console.log(C.green(`Wrote transparency reports to ${outDir}`));
}

async function runExport(target, engine, { C, getArg }) {
  const format = getArg('--format') || 'json';
  const out = getArg('--output') || getArg('-o');
  const files = collectHtmlFiles(target);
  const fresh = createTransparencyEngine({ policy: engine.policy });
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    const { records } = await createTransparencyEngine({ policy: engine.policy }).ingest(html, { file });
    for (const r of records) fresh.registry.register(r);
  }
  const body = fresh.export(format);
  if (out) {
    writeFileSync(resolve(out), body);
    console.log(C.green(`Exported ${format} → ${out}`));
  } else {
    console.log(body);
  }
}

async function runMigrate(target, engine, { C, hasFlag, getArg, forceDry, forceApply }) {
  const apply = forceApply || hasFlag('--apply') || hasFlag('--write');
  const dryRun = forceDry || (!apply);
  const files = collectHtmlFiles(target);
  let total = 0;
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    const result = await engine.migrate(html, { file, apply: apply && !dryRun, dryRun });
    total += result.suggestions.length;
    console.log(C.bold(`\n── ${basename(file)} ──`));
    console.log(`${result.suggestions.length} suggestion(s)${apply && !dryRun ? `, applied ${result.applied}` : ' (dry-run)'}`);
    for (const s of result.suggestions.slice(0, 30)) {
      console.log(C.dim(`  • ${s.id || s.field || s.kind}: ${s.reason}`));
    }
    if (apply && !dryRun && result.applied) {
      writeFileSync(file, result.html);
      console.log(C.green(`  wrote ${file}`));
    }
  }
  if (!total) console.log(C.green('\nNo migration suggestions.'));
}

/**
 * Lightweight doctor for velinstyle check integration.
 */
export async function transparencyCheckStep(path, { policyPath, quiet, C } = {}) {
  const policy = loadPolicy(policyPath);
  const engine = createTransparencyEngine({ policy });
  const files = collectHtmlFiles(path);
  if (!files.length) return { ok: true, skipped: true, scores: null };
  let failed = 0;
  let lastScores = null;
  for (const file of files.slice(0, 20)) {
    const report = await engine.doctor(readFileSync(file, 'utf-8'), { file });
    lastScores = report.scores;
    if (!report.ok) failed += 1;
    if (!quiet) {
      console.log(`  ${basename(file)}: transparency ${report.scores?.transparency ?? '—'}% (${report.summary.errors} errors)`);
    }
  }
  return { ok: failed === 0, failed, scores: lastScores };
}
