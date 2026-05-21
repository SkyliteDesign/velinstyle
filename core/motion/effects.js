export const VISIBLE_CLASS = 'velin-in-view';

const EFFECT_MAP = {
  reveal: ['velin-animate-on-scroll'],
  fade: ['velin-animate-on-scroll', 'velin-animate-on-scroll--fade'],
  slide: ['velin-animate-on-scroll', 'velin-animate-on-scroll--slide-up'],
  'slide-up': ['velin-animate-on-scroll', 'velin-animate-on-scroll--slide-up'],
  'slide-down': ['velin-animate-on-scroll', 'velin-animate-on-scroll--slide-down'],
  'slide-left': ['velin-animate-on-scroll', 'velin-animate-on-scroll--slide-left'],
  'slide-right': ['velin-animate-on-scroll', 'velin-animate-on-scroll--slide-right'],
  scale: ['velin-animate-on-scroll', 'velin-animate-on-scroll--scale'],
  parallax: ['velin-parallax'],
  'parallax-slow': ['velin-parallax', 'velin-parallax--slow'],
  hover: ['velin-animate-hover'],
  'hover-lift': ['velin-animate-hover'],
  flip: ['velin-animate-scale-in'],
  blur: ['velin-animate-fade-in'],
};

/**
 * Apply motion effect classes from velin-* attribute values.
 * @param {HTMLElement} el
 * @param {Record<string, string>} attrs keyed by effect name
 */
export function applyEffects(el, attrs = {}) {
  const classes = new Set();
  for (const [name, value] of Object.entries(attrs)) {
    if (value === 'false' || value === 'off') continue;
    const mapped = EFFECT_MAP[name];
    if (mapped) mapped.forEach((c) => classes.add(c));
    if (name === 'slide' && value && value !== 'true' && value !== '') {
      const key = `slide-${value}`;
      EFFECT_MAP[key]?.forEach((c) => classes.add(c));
    }
  }
  classes.forEach((c) => el.classList.add(c));
  if (!el.classList.contains('velin-animate-on-scroll') && attrs.reveal !== undefined) {
    el.classList.add('velin-animate-on-scroll');
  }
  return [...classes];
}

export function markVisible(el) {
  el.classList.add(VISIBLE_CLASS);
  el.dataset.velinVisible = 'true';
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
