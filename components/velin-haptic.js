const PATTERNS = {
  tap: [10],
  'double-tap': [10, 50, 10],
  success: [50],
  error: [100, 30, 100],
  warning: [30, 20, 30],
  long: [200],
};

function vibrate(pattern) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (mq?.matches) return;
  const p = typeof pattern === 'string' ? PATTERNS[pattern] || PATTERNS.tap : pattern;
  navigator.vibrate(p);
}

function applyHaptic(element) {
  const pattern = element.getAttribute('haptic') || 'tap';
  element.addEventListener('click', () => vibrate(pattern));
}

class VelinHapticObserver {
  constructor() {
    this._observer = null;
  }

  start(root = document.body) {
    const existing = root.querySelectorAll('[haptic]');
    existing.forEach(applyHaptic);

    this._observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.hasAttribute?.('haptic')) applyHaptic(node);
          node.querySelectorAll?.('[haptic]').forEach(applyHaptic);
        }
      }
    });

    this._observer.observe(root, { childList: true, subtree: true });
  }

  stop() {
    this._observer?.disconnect();
  }
}

export { vibrate, applyHaptic, PATTERNS, VelinHapticObserver };
export default VelinHapticObserver;
