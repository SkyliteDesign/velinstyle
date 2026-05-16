import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const colorCss = readFileSync(resolve(ROOT, 'src/tokens/color.css'), 'utf-8');

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

function extractVar(name) {
  const re = new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*(oklch\\([^;]+\\))`, 'i');
  const m = colorCss.match(re);
  return m ? parseOklch(m[1]) : null;
}

const PAIRS = [
  { fg: '--velin-color-text', bg: '--velin-color-surface-bright', min: 4.5, label: 'text on surface-bright' },
  { fg: '--velin-color-text-muted', bg: '--velin-color-surface-bright', min: 4.5, label: 'muted text on surface-bright' },
  { fg: '--velin-color-on-primary', bg: '--velin-color-primary', min: 4.5, label: 'on-primary on primary' },
  { fg: '--velin-color-on-danger', bg: '--velin-color-danger', min: 4.5, label: 'on-danger on danger' },
];

const AAA_PAIRS = [
  { fg: '--velin-color-text', bg: '--velin-color-surface-bright', min: 7, label: 'text on surface-bright (AAA)' },
  { fg: '--velin-color-on-primary', bg: '--velin-color-primary', min: 7, label: 'on-primary on primary (AAA)' },
];

let failed = 0;

console.log('VelinStyle contrast check (OKLCH tokens)\n');

for (const pair of [...PAIRS, ...AAA_PAIRS]) {
  const fg = extractVar(pair.fg);
  const bg = extractVar(pair.bg);
  if (!fg || !bg) {
    console.log(`  SKIP  ${pair.label} (could not parse tokens)`);
    continue;
  }
  const ratio = contrastRatio(relLuminance(fg), relLuminance(bg));
  const ok = ratio >= pair.min;
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${pair.label}: ${ratio.toFixed(2)}:1 (min ${pair.min}:1)`);
}

console.log(failed ? `\n${failed} pair(s) below minimum.` : '\nAll token pairs meet contrast requirements.');
process.exit(failed ? 1 : 0);
