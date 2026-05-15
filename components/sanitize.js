const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const ESCAPE_RE = /[&<>"']/g;

export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch]);
}

export function sanitizeURL(url) {
  if (typeof url !== 'string') return '';
  try {
    const parsed = new URL(url, location.href);
    if (['http:', 'https:', 'data:'].includes(parsed.protocol)) return url;
    return '';
  } catch { return ''; }
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
