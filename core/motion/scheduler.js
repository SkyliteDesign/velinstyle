const pending = new Set();
let rafId = 0;

export function scheduleInView(callback) {
  pending.add(callback);
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      const batch = [...pending];
      pending.clear();
      batch.forEach((fn) => fn());
    });
  }
}

let sharedObserver = null;
const observed = new WeakMap();

export function getInViewObserver(options = {}) {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const cb = observed.get(entry.target);
          if (cb) scheduleInView(() => cb(entry.target));
          const once = entry.target.dataset.velinOnce !== 'false';
          if (once) sharedObserver.unobserve(entry.target);
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
      },
    );
  }
  return sharedObserver;
}

export function observeInView(el, onVisible, opts = {}) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionOff = el.closest('[data-velin-motion="off"]') || el.dataset.velinMotion === 'off';

  if (reduced || motionOff) {
    scheduleInView(() => onVisible(el, true));
    return () => {};
  }

  const io = getInViewObserver(opts);
  if (!io) {
    scheduleInView(() => onVisible(el, true));
    return () => {};
  }

  observed.set(el, onVisible);
  io.observe(el);
  return () => {
    observed.delete(el);
    io.unobserve(el);
  };
}

export function disconnectInViewObserver() {
  if (sharedObserver) {
    sharedObserver.disconnect();
    sharedObserver = null;
  }
}
