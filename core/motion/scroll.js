export function smoothScrollTo(target, options = {}) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  el.scrollIntoView({
    behavior: reduced || options.instant ? 'auto' : 'smooth',
    block: options.block || 'start',
    inline: options.inline || 'nearest',
  });
  if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '-1');
  }
  el.focus({ preventScroll: true });
}

export function bindSmoothScroll(root = document) {
  root.querySelectorAll('[velin-scroll]').forEach((link) => {
    if (link.dataset.velinScrollBound) return;
    link.dataset.velinScrollBound = '1';
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target);
    });
  });
}
