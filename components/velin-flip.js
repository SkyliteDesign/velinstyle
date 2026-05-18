/*
 * velin-flip.js — FLIP-style reorder + filter helper.
 *
 * FLIP (First, Last, Invert, Play) measures item rects before and after a
 * DOM mutation, then animates the delta. Used for sorting/filtering UIs
 * where rows reorder visibly. Pair it with the [data-velin-flip] attribute
 * on a container plus [data-velin-filter-value] chips or [data-velin-filter-input]
 * inputs to wire chip/search filtering with zero JS in your demo.
 *
 * API:
 *   flipReorder(container, mutateFn, opts?)
 *   filterList(container, predicateFn, opts?)
 *
 *   opts.duration  ms (default 250); reduced-motion forces 0
 *   opts.easing    CSS timing function (default expo-out token)
 *   opts.itemSelector children selector (default ':scope > *')
 *
 * Auto-init:
 *   <ul data-velin-flip data-velin-filter-attr="tags" id="myList">
 *     <li data-tags="a b">..</li> ...
 *   </ul>
 *   <button data-velin-filter-value="a" data-velin-filter-target="#myList">A</button>
 *   <input data-velin-filter-input data-velin-filter-target="#myList">
 *
 *   Any chip or input with data-velin-filter-target pointing at a flip
 *   container is wired automatically. The active chip carries
 *   data-velin-filter-active so you can style it.
 */

const REDUCED_MOTION_MQ =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

const DEFAULTS = {
  duration: 250,
  easing: 'var(--velin-ease-expo-out, cubic-bezier(0.16, 1, 0.3, 1))',
  itemSelector: ':scope > *',
};

function getItems(container, selector) {
  return Array.from(container.querySelectorAll(selector));
}

export function flipReorder(container, mutateFn, options = {}) {
  if (!container || typeof mutateFn !== 'function') return;
  const opts = { ...DEFAULTS, ...options };
  const reduced = REDUCED_MOTION_MQ && REDUCED_MOTION_MQ.matches;

  const items = getItems(container, opts.itemSelector);
  const before = new Map();
  items.forEach((el) => {
    if (!el.hidden) before.set(el, el.getBoundingClientRect());
  });

  mutateFn();

  if (reduced) return;

  const items2 = getItems(container, opts.itemSelector);
  items2.forEach((el) => {
    if (el.hidden) return;
    const prev = before.get(el);
    const next = el.getBoundingClientRect();
    if (!prev) {
      if (typeof el.animate !== 'function') return;
      el.animate(
        [
          { opacity: 0, transform: 'scale(0.96)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: opts.duration, easing: opts.easing, fill: 'both' },
      );
      return;
    }
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (dx === 0 && dy === 0) return;
    if (typeof el.animate !== 'function') return;
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: opts.duration, easing: opts.easing, fill: 'both' },
    );
  });
}

export function filterList(container, predicate, options = {}) {
  if (!container || typeof predicate !== 'function') return;
  const opts = { ...DEFAULTS, ...options };
  flipReorder(
    container,
    () => {
      getItems(container, opts.itemSelector).forEach((el) => {
        el.hidden = !predicate(el);
      });
    },
    opts,
  );
}

function readTokens(value) {
  if (!value) return [];
  return String(value)
    .toLowerCase()
    .split(/[\s,|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchTokens(itemTokens, queryTokens, mode) {
  if (!queryTokens.length) return true;
  if (mode === 'all') return queryTokens.every((q) => itemTokens.includes(q));
  return queryTokens.some((q) => itemTokens.includes(q));
}

function matchSearch(item, query) {
  if (!query) return true;
  const haystack =
    (item.getAttribute('data-tags') || '') +
    ' ' +
    (item.getAttribute('data-search') || '') +
    ' ' +
    (item.textContent || '');
  return haystack.toLowerCase().includes(query.toLowerCase());
}

class FilterController {
  constructor(container) {
    this.container = container;
    this.tag = '';
    this.search = '';
    this.matchMode = container.getAttribute('data-velin-filter-mode') === 'all' ? 'all' : 'any';
    this.itemSelector = container.getAttribute('data-velin-filter-item') || ':scope > *';
  }

  apply() {
    const queryTokens = readTokens(this.tag);
    const term = this.search;
    filterList(
      this.container,
      (el) => {
        const tokens = readTokens(el.getAttribute('data-tags'));
        return matchTokens(tokens, queryTokens, this.matchMode) && matchSearch(el, term);
      },
      { itemSelector: this.itemSelector },
    );
  }
}

const _controllers = new WeakMap();

function getController(container) {
  let ctrl = _controllers.get(container);
  if (!ctrl) {
    ctrl = new FilterController(container);
    _controllers.set(container, ctrl);
  }
  return ctrl;
}

function resolveTarget(triggerEl) {
  const sel = triggerEl.getAttribute('data-velin-filter-target');
  if (!sel) return null;
  try {
    return document.querySelector(sel);
  } catch {
    return null;
  }
}

function highlightActive(group, active) {
  if (!group) return;
  group.querySelectorAll('[data-velin-filter-value]').forEach((btn) => {
    if (btn === active) btn.setAttribute('data-velin-filter-active', '');
    else btn.removeAttribute('data-velin-filter-active');
  });
}

function autoInit() {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-velin-filter-value]');
    if (!target) return;
    const container = resolveTarget(target);
    if (!container) return;
    const group = target.closest('[data-velin-filter-group]') || target.parentElement;
    highlightActive(group, target);
    const ctrl = getController(container);
    ctrl.tag = target.getAttribute('data-velin-filter-value') || '';
    if (ctrl.tag.toLowerCase() === 'all' || ctrl.tag === '*') ctrl.tag = '';
    ctrl.apply();
  });

  const handleInput = (event) => {
    const input = event.target.closest('[data-velin-filter-input]');
    if (!input) return;
    const container = resolveTarget(input);
    if (!container) return;
    const ctrl = getController(container);
    const raw = input.value || (typeof input.getAttribute === 'function' ? input.getAttribute('value') : '');
    ctrl.search = (raw || '').trim();
    ctrl.apply();
  };
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleInput);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }
}

export default { flipReorder, filterList };
