const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const ESCAPE_RE = /[&<>"']/g;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:', 'data:', 'mailto:', 'tel:']);
const BLOCKED_DATA_MIME = /^data:text\/html/i;

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

export function sanitizeURL(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^\s*javascript:/i.test(trimmed) || /^\s*vbscript:/i.test(trimmed)) return '';
  if (BLOCKED_DATA_MIME.test(trimmed)) return '';
  try {
    const parsed = new URL(trimmed, typeof location !== 'undefined' ? location.href : 'https://example.invalid/');
    if (!ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) return '';
    if (parsed.protocol === 'data:' && BLOCKED_DATA_MIME.test(trimmed)) return '';
    return trimmed;
  } catch {
    return '';
  }
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
