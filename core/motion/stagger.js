const STAGGER_ATTR = 'velin-stagger';

/**
 * Apply stagger delay to direct children.
 * @param {HTMLElement} listEl
 * @param {string} [value] base delay ms or multiplier
 */
export function applyStagger(listEl, value = 'true') {
  const base = value === 'true' || value === '' ? 60 : parseInt(value, 10) || 60;
  const children = [...listEl.children];
  children.forEach((child, i) => {
    child.style.setProperty('--velin-stagger-delay', `${i * base}ms`);
    child.classList.add('velin-stagger-item');
  });
  listEl.classList.add('velin-stagger');
}

export function enhanceStagger(root = document) {
  root.querySelectorAll(`[${STAGGER_ATTR}]`).forEach((el) => {
    if (el.dataset.velinStaggerDone) return;
    el.dataset.velinStaggerDone = '1';
    applyStagger(el, el.getAttribute(STAGGER_ATTR) || 'true');
  });
}
