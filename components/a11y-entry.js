/**
 * Optional accessibility bootstrap for VelinStyle apps.
 * @example
 * import { initA11y } from '@birdapi/velinstyle/a11y';
 * initA11y({ announcer: true, scrollPadding: true });
 */

import { getAnnouncer } from './a11y-utils.js';

/**
 * @param {{ announcer?: boolean, scrollPadding?: boolean, skipLink?: boolean }} [options]
 */
export function initA11y(options = {}) {
  if (typeof document === 'undefined') return;

  const {
    announcer = true,
    scrollPadding = true,
    skipLink = false,
  } = options;

  if (announcer) getAnnouncer();

  if (scrollPadding) {
    const nav = document.querySelector('.velin-nav, .velin-doc-header, .site-nav, [data-velin-fixed-nav]');
    if (nav) {
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--velin-nav-height', `${Math.ceil(h)}px`);
      document.documentElement.classList.add('velin-scroll-pt-nav');
    }
  }

  if (skipLink && !document.querySelector('.velin-skip-link') && document.getElementById('main')) {
    const a = document.createElement('a');
    a.href = '#main';
    a.className = 'velin-skip-link';
    a.textContent = 'Skip to main content';
    document.body.prepend(a);
  }
}

export { announce, getAnnouncer } from './a11y-utils.js';
