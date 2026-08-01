/**
 * Shared WCAG contrast math for token checks and HTML scan (inline styles).
 */

const AA_NORMAL = 4.5;
const AA_LARGE = 3;

export function parseOklch(str) {
  const m = String(str).match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
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

export function parseHex(str) {
  const m = String(str).trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return { x: 0, y: 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b), z: 0, _lum: 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) };
}

export function relLuminance(xyz) {
  if (xyz && typeof xyz._lum === 'number') return xyz._lum;
  const { x, y, z } = xyz;
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const r = lin(3.2406 * x - 1.5372 * y - 0.4986 * z);
  const g = lin(-0.9689 * x + 1.8758 * y + 0.0415 * z);
  const b = lin(0.0557 * x - 0.204 * y + 1.057 * z);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(l1, l2) {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export function parseColor(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (s.startsWith('#')) return parseHex(s);
  if (/^oklch\(/i.test(s)) return parseOklch(s);
  const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgb) {
    const r = Number(rgb[1]) / 255;
    const g = Number(rgb[2]) / 255;
    const b = Number(rgb[3]) / 255;
    const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return { x: 0, y: 0, z: 0, _lum: 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) };
  }
  return null;
}

export function styleDecl(style, prop) {
  const re = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i');
  const m = String(style).match(re);
  return m ? m[1].trim() : null;
}

/** Returns ratio or null if colors cannot be parsed. */
export function contrastFromInlineStyle(style, { largeText = false } = {}) {
  const fgRaw = styleDecl(style, 'color');
  const bgRaw = styleDecl(style, 'background-color') || styleDecl(style, 'background');
  if (!fgRaw || !bgRaw) return null;
  // Ignore gradients / images
  if (/gradient|url\(/i.test(bgRaw)) return null;
  const fg = parseColor(fgRaw.split(/\s+/)[0] === 'url' ? null : fgRaw);
  const bg = parseColor(bgRaw.split(/\s/)[0]);
  if (!fg || !bg) return null;
  const ratio = contrastRatio(relLuminance(fg), relLuminance(bg));
  const min = largeText ? AA_LARGE : AA_NORMAL;
  return { ratio, min, pass: ratio >= min, fg: fgRaw, bg: bgRaw };
}

export { AA_NORMAL, AA_LARGE };
