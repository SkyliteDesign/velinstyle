const DOCS_MOUNT = '/docs/';

const DOC_ROOT_SEGMENTS = new Set([
  'getting-started',
  'extend',
  'guides',
  'utilities',
  'components',
  'forms',
  'layout',
  'content',
  'customize',
  'animations',
  'about',
  'helpers',
  'generated',
  'migration',
]);

/**
 * Docs root URL (…/docs/) — stable even when &lt;base&gt; mis-resolves the script under …/components/assets/.
 */
export function getDocsBaseUrl() {
  if (typeof document === 'undefined') {
    return 'https://example.invalid/docs/';
  }

  const script = document.querySelector('script[src*="doc-search"]');
  if (script?.src) {
    const u = new URL(script.src);
    const i = u.pathname.indexOf(DOCS_MOUNT);
    if (i !== -1) {
      return u.origin + u.pathname.slice(0, i + DOCS_MOUNT.length);
    }
  }

  const path = window.location.pathname.replace(/\\/g, '/');
  const idx = path.indexOf(DOCS_MOUNT);
  if (idx >= 0) {
    return new URL(path.slice(0, idx + DOCS_MOUNT.length), window.location.origin).href;
  }

  return new URL('./', window.location.href).href;
}

function splitUrlHash(url) {
  const i = url.indexOf('#');
  if (i === -1) return { path: url, hash: '' };
  return { path: url.slice(0, i), hash: url.slice(i) };
}

/** Strip a mistaken current-section prefix (e.g. components/getting-started/…). */
export function relativizeDocsPathname(pathname) {
  const docsIdx = pathname.indexOf(DOCS_MOUNT);
  if (docsIdx < 0) return null;
  const rest = pathname.slice(docsIdx + DOCS_MOUNT.length);
  const parts = rest.split('/').filter(Boolean);
  if (
    parts.length >= 2 &&
    DOC_ROOT_SEGMENTS.has(parts[0]) &&
    DOC_ROOT_SEGMENTS.has(parts[1]) &&
    parts[0] !== parts[1]
  ) {
    return parts.slice(1).join('/');
  }
  return rest;
}

/**
 * Resolve a search-index URL to a full navigable URL under the docs root.
 * @param {string} url
 */
export function resolveDocsSearchUrl(url) {
  if (!url || url === '#') return '';
  if (typeof window === 'undefined') return url;

  const { path, hash } = splitUrlHash(url);
  if (!path) return hash || '';

  let rel = path;
  if (/^https?:\/\//i.test(path)) {
    try {
      const fixed = relativizeDocsPathname(new URL(path).pathname);
      rel = fixed ?? path;
    } catch {
      return '';
    }
  }

  try {
    const target = new URL(rel || '', getDocsBaseUrl());
    return target.href + (hash && !target.href.includes('#') ? hash : '');
  } catch {
    return '';
  }
}
