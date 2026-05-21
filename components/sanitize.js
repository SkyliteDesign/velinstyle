const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const ESCAPE_RE = /[&<>"']/g;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:', 'data:', 'mailto:', 'tel:']);
const BLOCKED_DATA_MIME = /^data:(?:text\/html|image\/svg\+xml|application\/xml)/i;
const ALLOWED_DATA_IMAGE = /^data:image\/(png|jpeg|jpg|gif|webp|avif);base64,/i;

const SECURE_INPUT_TYPES = new Set(['text', 'password', 'email', 'search', 'tel', 'url', 'number']);

export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch]);
}

export function stripControlChars(str) {
  if (typeof str !== 'string') return '';
  return str.replace(CONTROL_RE, '');
}

export function escapeHTMLAttribute(str) {
  return escapeHTML(stripControlChars(str));
}

/**
 * @param {string} url
 * @param {string} [base]
 */
export function sanitizeURL(url, base) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^\s*javascript:/i.test(trimmed) || /^\s*vbscript:/i.test(trimmed)) return '';
  if (BLOCKED_DATA_MIME.test(trimmed)) return '';
  if (/^data:/i.test(trimmed) && !ALLOWED_DATA_IMAGE.test(trimmed)) return '';
  try {
    const parsed = new URL(trimmed, base || (typeof location !== 'undefined' ? location.href : 'https://example.invalid/'));
    if (!ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) return '';
    if (parsed.protocol === 'data:' && !ALLOWED_DATA_IMAGE.test(parsed.href)) return '';
    return parsed.href;
  } catch {
    if (trimmed.startsWith('#') || trimmed.startsWith('/')) return trimmed;
    return '';
  }
}

/**
 * @param {string} url
 * @param {string} [base]
 */
export function sanitizeSearchUrl(url, base) {
  if (typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';
  if (trimmed.startsWith('#')) return trimmed;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  // Index paths like getting-started/foo.html — must stay relative (resolved at navigation).
  if (!/^https?:\/\//i.test(trimmed)) {
    if (/^\s*javascript:/i.test(trimmed) || /^\s*vbscript:/i.test(trimmed)) return '#';
    return trimmed;
  }
  const safe = sanitizeURL(trimmed, base);
  return safe || '#';
}

export function sanitizeInputType(type) {
  const t = String(type || 'text').toLowerCase();
  return SECURE_INPUT_TYPES.has(t) ? t : 'text';
}

let _purify = null;

async function loadPurify() {
  if (_purify) return _purify;
  try {
    const mod = await import('isomorphic-dompurify');
    _purify = mod.default || mod;
  } catch {
    _purify = null;
  }
  return _purify;
}

const SVG_ALLOWED_TAGS = ['svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'defs', 'use', 'symbol', 'title', 'desc', 'clipPath', 'mask', 'linearGradient', 'radialGradient', 'stop', 'pattern', 'text', 'tspan'];
const SVG_ALLOWED_ATTR = ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'opacity', 'class', 'id', 'href', 'xlink:href', 'aria-hidden', 'aria-label', 'aria-labelledby', 'role', 'focusable', 'clip-path', 'mask', 'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'gradientTransform', 'spreadMethod', 'fx', 'fy', 'patternUnits', 'patternContentUnits', 'preserveAspectRatio'];

/**
 * @param {string} svgMarkup
 */
export async function sanitizeSVG(svgMarkup) {
  if (typeof svgMarkup !== 'string') return '';
  const DOMPurify = await loadPurify();
  if (DOMPurify?.sanitize) {
    return DOMPurify.sanitize(svgMarkup, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: SVG_ALLOWED_TAGS,
      ADD_ATTR: SVG_ALLOWED_ATTR,
      FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover'],
    });
  }
  return svgMarkup
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
}

/**
 * @param {string} html
 */
export async function sanitizeHTML(html) {
  if (typeof html !== 'string') return '';
  const DOMPurify = await loadPurify();
  if (DOMPurify?.sanitize) return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return escapeHTML(html);
}

let _policy = null;

export function getTrustedPolicy() {
  if (_policy) return _policy;
  if (typeof window !== 'undefined' && window.trustedTypes?.createPolicy) {
    _policy = window.trustedTypes.createPolicy('velinstyle', {
      createHTML: (input) => escapeHTML(input),
    });
  }
  return _policy;
}

export function createSafeHTML(str) {
  const policy = getTrustedPolicy();
  const safe = escapeHTML(stripControlChars(str));
  if (policy?.createHTML) return policy.createHTML(safe);
  return safe;
}
