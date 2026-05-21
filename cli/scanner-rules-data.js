/**
 * Scanner rule metadata for documentation and tooling.
 * Scan logic lives in scanner.js / pii-scanner.js / perf-audit.js.
 */

/** @typedef {{ id: string, category: string, severity: string, message: string, fixHint?: string }} ScannerRuleMeta */

/** @type {ScannerRuleMeta[]} */
export const SCANNER_RULES = [
  // Security — HTML
  { id: 'security/no-inline-handler', category: 'security', severity: 'warning', message: 'Inline event handler found. Use addEventListener() instead.', fixHint: 'Move handler to JS module.' },
  { id: 'security/no-javascript-url', category: 'security', severity: 'error', message: 'javascript: URL detected. XSS vector.', fixHint: 'Use button + script or href to safe URL.' },
  { id: 'security/safe-external-link', category: 'security', severity: 'warning', message: 'target="_blank" without rel="noopener noreferrer".', fixHint: 'Add rel="noopener noreferrer" — auto-fix with --fix.' },
  { id: 'security/no-meta-refresh', category: 'security', severity: 'error', message: '<meta http-equiv="refresh"> can redirect without consent.', fixHint: 'Use server redirect or JS with user action.' },
  { id: 'security/no-inline-style', category: 'security', severity: 'warning', message: 'Inline style attribute increases XSS surface.', fixHint: 'Use VelinStyle utility classes.' },
  { id: 'security/no-data-html-uri', category: 'security', severity: 'error', message: 'data:text/html URI can execute script.', fixHint: 'Avoid data: HTML URIs in href/src.' },
  { id: 'security/dangerous-target', category: 'security', severity: 'warning', message: '<form target="_blank"> is unusual.', fixHint: 'Use same-tab navigation.' },
  { id: 'security/integrity-missing', category: 'security', severity: 'info', message: 'External <script> without integrity (SRI).', fixHint: 'Add integrity + crossorigin for CDN scripts.' },
  { id: 'security/csp-meta', category: 'security', severity: 'info', message: 'No CSP meta tag found.', fixHint: 'Add Content-Security-Policy header or meta.' },
  // Security — JS
  { id: 'security/no-raw-innerhtml', category: 'security', severity: 'warning', message: 'Direct innerHTML without sanitization.', fixHint: 'Use escapeHTML() from @birdapi/velinstyle/sanitize.' },
  { id: 'security/no-document-write', category: 'security', severity: 'error', message: 'document.write() is dangerous.', fixHint: 'Use DOM APIs or template elements.' },
  { id: 'security/no-eval', category: 'security', severity: 'error', message: 'eval() is a critical risk.', fixHint: 'Never use eval in production code.' },
  { id: 'security/no-function-constructor', category: 'security', severity: 'error', message: 'new Function() equals eval().', fixHint: 'Refactor to static functions.' },
  { id: 'security/postmessage-wildcard', category: 'security', severity: 'warning', message: 'postMessage with targetOrigin "*".', fixHint: 'Specify exact target origin.' },
  // PII
  { id: 'pii/hardcoded-email', category: 'pii', severity: 'warning', message: 'Hardcoded email in source.', fixHint: 'Use env/config or <velin-email>. --fix masks to placeholder.' },
  { id: 'pii/mailto-in-source', category: 'pii', severity: 'info', message: 'mailto: exposes email in HTML.', fixHint: 'Consider <velin-email> obfuscation.' },
  { id: 'pii/hardcoded-secret', category: 'pii', severity: 'error', message: 'Possible API key or secret in source.', fixHint: 'Use environment variables or secret manager.' },
  { id: 'pii/localstorage-pii', category: 'pii', severity: 'warning', message: 'Email-like data in Web Storage.', fixHint: 'Avoid storing PII in localStorage.' },
  // A11y
  { id: 'a11y/html-lang', category: 'a11y', severity: 'error', message: '<html> missing lang attribute.', fixHint: 'Add lang="de" or appropriate locale — --fix.' },
  { id: 'a11y/img-alt', category: 'a11y', severity: 'error', message: '<img> without alt.', fixHint: 'Add alt text or alt="" for decorative images.' },
  { id: 'a11y/img-decorative', category: 'a11y', severity: 'warning', message: 'Decorative <img alt=""> without aria-hidden.', fixHint: 'Add aria-hidden="true" when visible text carries the meaning.' },
  { id: 'a11y/velin-icon-label', category: 'a11y', severity: 'warning', message: 'velin-icon in icon-only button without label.', fixHint: 'Add label="…" on <velin-icon>.' },
  { id: 'a11y/sparkline-label', category: 'a11y', severity: 'warning', message: 'velin-sparkline without accessible name.', fixHint: 'Add label attribute or wrap in <figure><figcaption>.' },
  { id: 'a11y/skeleton-text', category: 'a11y', severity: 'warning', message: 'velin-skeleton on non-empty element.', fixHint: 'Use skeleton only on empty placeholders.' },
  { id: 'a11y/button-label', category: 'a11y', severity: 'warning', message: '<button> without visible text or aria-label.', fixHint: 'Add text or aria-label.' },
  { id: 'a11y/input-label', category: 'a11y', severity: 'warning', message: '<input> without label association.', fixHint: 'Use <label for> or aria-label.' },
  { id: 'a11y/skip-link', category: 'a11y', severity: 'warning', message: 'No skip link for keyboard users.', fixHint: 'Add .velin-skip-link to #main — --fix when id="main" exists.' },
  { id: 'a11y/landmark-main', category: 'a11y', severity: 'warning', message: 'No <main> landmark.', fixHint: 'Wrap primary content in <main>.' },
  { id: 'a11y/heading-order', category: 'a11y', severity: 'warning', message: 'Heading levels skip (e.g. h2 → h4).', fixHint: 'Use sequential heading levels.' },
  { id: 'a11y/interactive-aria-hidden', category: 'a11y', severity: 'error', message: 'Interactive element with aria-hidden="true".', fixHint: 'Remove aria-hidden or use inert.' },
  { id: 'a11y/iframe-title', category: 'a11y', severity: 'error', message: '<iframe> without title.', fixHint: 'Add descriptive title attribute.' },
  { id: 'a11y/autocomplete-auth', category: 'a11y', severity: 'warning', message: 'Auth field missing autocomplete (WCAG 2.2).', fixHint: 'Add autocomplete="username" or "current-password".' },
  { id: 'a11y/invalid-describedby', category: 'a11y', severity: 'warning', message: 'aria-invalid without aria-describedby.', fixHint: 'Link to error message element id.' },
  // CSS
  { id: 'css/var-fallback', category: 'css', severity: 'info', message: 'CSS variable without fallback in var().', fixHint: 'Use var(--velin-*, fallback).' },
  { id: 'css/z-index-token', category: 'css', severity: 'warning', message: 'Raw z-index instead of --velin-z-* token.', fixHint: 'Use tokens from z-index.css — --fix suggests token.' },
  { id: 'css/no-important', category: 'css', severity: 'info', message: '!important usage.', fixHint: 'Prefer @layer and specificity.' },
  { id: 'css/vendor-prefix', category: 'css', severity: 'info', message: 'Unnecessary vendor prefix.', fixHint: 'Lightning CSS handles autoprefixing.' },
];

/** @type {ScannerRuleMeta[]} */
export const PERF_RULES = [
  { id: 'perf/img-missing-dimensions', category: 'perf', severity: 'warning', message: '<img> without width/height causes CLS.', fixHint: 'Add width and height attributes — perf fix.' },
  { id: 'perf/img-no-lazy', category: 'perf', severity: 'info', message: 'Consider loading="lazy" for below-fold images.', fixHint: 'Add loading="lazy".' },
  { id: 'perf/script-no-defer', category: 'perf', severity: 'warning', message: 'External script without defer/async.', fixHint: 'Add defer or type="module".' },
  { id: 'perf/large-inline-style', category: 'perf', severity: 'info', message: 'Large inline style block.', fixHint: 'Move to external CSS.' },
  { id: 'perf/font-display-swap', category: 'perf', severity: 'info', message: '@font-face without font-display: swap.', fixHint: 'Add font-display: swap.' },
  { id: 'perf/unused-velin-import', category: 'perf', severity: 'info', message: 'Full component bundle loaded.', fixHint: 'Use @birdapi/velinstyle/runtime for tree-shaking.' },
];
