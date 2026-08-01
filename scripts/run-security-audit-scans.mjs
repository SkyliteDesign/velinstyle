import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const OUT = join(
  ROOT,
  'interne_docs',
  'gesamtbestandsaufnahme',
  'v1.2.0',
  'security-audit'
);
mkdirSync(OUT, { recursive: true });

function extractJson(stdout) {
  const text = stdout || '';
  const start = text.indexOf('{');
  if (start < 0) throw new Error('no JSON object in stdout');
  return JSON.parse(text.slice(start));
}

function run(name, args) {
  const r = spawnSync(process.execPath, ['cli/index.js', ...args], {
    cwd: join(ROOT, 'velinstyle'),
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  writeFileSync(join(OUT, name + '.raw.txt'), r.stdout || '', 'utf8');
  writeFileSync(join(OUT, name + '.stderr.txt'), r.stderr || '', 'utf8');
  writeFileSync(join(OUT, name + '.exit.txt'), String(r.status), 'utf8');
  let j;
  try {
    j = extractJson(r.stdout || '');
    writeFileSync(join(OUT, name + '.json'), JSON.stringify(j, null, 2), 'utf8');
  } catch (e) {
    console.log(name, 'PARSE_FAIL', e.message, 'status', r.status);
    return null;
  }
  const by = {};
  for (const i of j.issues || []) by[i.rule] = (by[i.rule] || 0) + 1;
  console.log(
    name,
    'exit=' + r.status,
    'total=' + j.total,
    'E=' + j.errors,
    'W=' + j.warnings,
    'I=' + j.infos
  );
  console.log(
    '  top:',
    Object.entries(by)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k, v]) => k + ':' + v)
      .join(', ') || '(none)'
  );
  return j;
}

run('03-scan-samples-security', ['scan', 'samples', '--only', 'security', '--format', 'json']);
run('04-scan-samples-pii', ['scan', 'samples', '--only', 'pii', '--format', 'json']);
run('05-scan-components-security', ['scan', 'components', '--only', 'security', '--format', 'json']);
run('06-scan-core-security', ['scan', 'core', '--only', 'security', '--format', 'json']);
run('07-scan-cli-security', ['scan', 'cli', '--only', 'security', '--format', 'json']);
