import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AAA_MIN = 7;
const AA_MIN = 4.5;

function parseOklch(str) {
  const m = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return null;
  const L = m[1].includes('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  const C = parseFloat(m[2]);
  const H = (parseFloat(m[3]) * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  return oklabToXyz(L, a, b);
}

function oklabToXyz(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return {
    x: 1.2268798758 * l - 0.557814996 * m + 0.2813910455 * s,
    y: -0.0405801784 * l + 1.1122568696 * m - 0.0717110581 * s,
    z: -0.0192546317 * l - 0.2163216959 * m + 1.5169393792 * s,
  };
}

function relLuminance({ x, y, z }) {
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const r = lin(3.2406 * x - 1.5372 * y - 0.4986 * z);
  const g = lin(-0.9689 * x + 1.8758 * y + 0.0415 * z);
  const b = lin(0.0557 * x - 0.204 * y + 1.057 * z);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(l1, l2) {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function extractVars(css, scopeLabel) {
  const vars = {};
  const re = /(--velin-color-[\w-]+)\s*:\s*(oklch\([^;]+)\)/gi;
  let m;
  while ((m = re.exec(css)) !== null) vars[m[1]] = m[2];
  return { vars, scopeLabel };
}

function checkPairs(vars, pairs, scope) {
  let failed = 0;
  for (const pair of pairs) {
    const fg = vars[pair.fg] ? parseOklch(vars[pair.fg]) : null;
    const bg = vars[pair.bg] ? parseOklch(vars[pair.bg]) : null;
    if (!fg || !bg) {
      console.log(`  SKIP  [${scope}] ${pair.label}`);
      continue;
    }
    const ratio = contrastRatio(relLuminance(fg), relLuminance(bg));
    const ok = ratio >= pair.min;
    if (!ok) failed++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  [${scope}] ${pair.label}: ${ratio.toFixed(2)}:1 (min ${pair.min}:1)`);
  }
  return failed;
}

const AAA_PAIRS = [
  { fg: '--velin-color-text', bg: '--velin-color-surface-bright', min: AAA_MIN, label: 'text on surface-bright' },
  { fg: '--velin-color-text-muted', bg: '--velin-color-surface-bright', min: AAA_MIN, label: 'muted on surface-bright' },
  { fg: '--velin-color-primary-text', bg: '--velin-color-surface-bright', min: AAA_MIN, label: 'primary-text on surface-bright' },
  { fg: '--velin-color-success-text', bg: '--velin-color-surface-bright', min: AAA_MIN, label: 'success-text on surface-bright' },
  { fg: '--velin-color-danger-text', bg: '--velin-color-surface-bright', min: AAA_MIN, label: 'danger-text on surface-bright' },
  { fg: '--velin-color-on-primary', bg: '--velin-color-primary', min: AAA_MIN, label: 'on-primary on primary' },
  { fg: '--velin-color-on-danger', bg: '--velin-color-danger', min: AAA_MIN, label: 'on-danger on danger' },
];

const AA_PAIRS = [
  { fg: '--velin-color-text-subtle', bg: '--velin-color-surface-bright', min: AA_MIN, label: 'subtle on surface-bright (AA)' },
];

function loadScope(cssPath, label) {
  const css = readFileSync(cssPath, 'utf-8');
  return extractVars(css, label);
}

let totalFailed = 0;
console.log('VelinStyle contrast check (WCAG 2.2 AAA token pairs)\n');

const colorPath = join(ROOT, 'src/tokens/color.css');
const colorCss = readFileSync(colorPath, 'utf-8');
const rootBlock = colorCss.match(/:root\s*\{([^}]+)\}/s)?.[1] || '';
const darkBlock = colorCss.match(/\[data-velin-theme="dark"\]\s*\{([^}]+)\}/s)?.[1] || '';

totalFailed += checkPairs(extractVars(rootBlock, ':root').vars, [...AAA_PAIRS, ...AA_PAIRS], ':root');
if (darkBlock) {
  const base = extractVars(rootBlock, ':root').vars;
  const dark = extractVars(darkBlock, 'dark').vars;
  totalFailed += checkPairs({ ...base, ...dark }, AAA_PAIRS, 'dark');
}

const themesDir = join(ROOT, 'src/themes');
if (existsSync(themesDir)) {
  for (const file of readdirSync(themesDir).filter((f) => f.endsWith('.css'))) {
    const themeCss = readFileSync(join(themesDir, file), 'utf-8');
    const themeName = file.replace('.css', '');
    const merged = { ...extractVars(rootBlock, ':root').vars, ...extractVars(themeCss, themeName).vars };
    const themePairs = [
      { fg: '--velin-color-text', bg: '--velin-color-surface-bright', min: AAA_MIN, label: 'text on surface-bright' },
      { fg: '--velin-color-on-primary', bg: '--velin-color-primary', min: AAA_MIN, label: 'on-primary on primary' },
    ];
    totalFailed += checkPairs(merged, themePairs, `theme:${themeName}`);
  }
}

console.log(totalFailed ? `\n${totalFailed} pair(s) below minimum.` : '\nAll checked token pairs meet requirements.');
process.exit(totalFailed ? 1 : 0);
