/**
 * Shared accessibility helpers for VelinStyle web components.
 */

let _announcer;

export function getAnnouncer() {
  if (typeof document === 'undefined') return null;
  if (_announcer?.isConnected) return _announcer;
  _announcer = document.querySelector('velin-announcer');
  if (!_announcer) {
    _announcer = document.createElement('velin-announcer');
    document.body.appendChild(_announcer);
  }
  return _announcer;
}

/**
 * @param {string} message
 * @param {'polite' | 'assertive'} [priority]
 */
export function announce(message, priority = 'polite') {
  const el = getAnnouncer();
  if (!el || typeof el.announce !== 'function') return;
  el.announce(message, { assertive: priority === 'assertive' });
}

/**
 * @param {HTMLElement} trigger
 * @param {HTMLElement | null} panel
 */
export function syncExpanded(trigger, panel) {
  if (!trigger || !panel) return;
  const open = trigger.getAttribute('aria-expanded') === 'true';
  panel.hidden = !open;
  if (panel.id) trigger.setAttribute('aria-controls', panel.id);
}

/**
 * @param {HTMLElement} el
 * @param {string} label
 */
export function ensureAriaLabel(el, label) {
  if (!el || !label) return;
  if (!el.getAttribute('aria-label')?.trim()) el.setAttribute('aria-label', label);
}

/**
 * @param {() => void} fn
 * @param {() => void} [fallback]
 */
export function respectReducedMotion(fn, fallback) {
  const reduced = typeof matchMedia === 'function'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced && fallback) fallback();
  else fn();
}

/**
 * @param {string} [status] live|idle|error
 */
export function liveDotLabel(status) {
  const map = {
    live: 'Live',
    idle: 'Idle',
    error: 'Error',
    offline: 'Offline',
    connecting: 'Connecting',
  };
  return map[String(status || 'live').toLowerCase()] || status || 'Live';
}
