const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'summary',
  'details',
].join(', ');

function isFocusable(el) {
  if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
  if (el.closest('[inert]')) return false;
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  if (style && (style.visibility === 'hidden' || style.display === 'none')) return false;
  return el.getClientRects().length > 0;
}

export function getFocusableElements(root) {
  return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isFocusable);
}

export function trapFocus(root, event) {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(root);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = root.getRootNode().activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function rovingTabindex(container, items, event) {
  const currentIndex = items.indexOf(event.target);
  if (currentIndex === -1) return;

  let nextIndex;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      nextIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      nextIndex = (currentIndex - 1 + items.length) % items.length;
      break;
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      nextIndex = items.length - 1;
      break;
    default:
      return;
  }

  items.forEach((item, i) => {
    item.setAttribute('tabindex', i === nextIndex ? '0' : '-1');
  });
  items[nextIndex].focus();
}

export function saveFocus() {
  return document.activeElement;
}

export function restoreFocus(element) {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
}

let _inertSiblings = [];

export function setBackgroundInert(except) {
  _inertSiblings = [];
  for (const child of document.body.children) {
    if (child === except || child.contains(except)) continue;
    if (!child.hasAttribute('inert')) {
      child.setAttribute('inert', '');
      _inertSiblings.push(child);
    }
  }
}

export function clearBackgroundInert() {
  for (const el of _inertSiblings) {
    el.removeAttribute('inert');
  }
  _inertSiblings = [];
}
