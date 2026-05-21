/*
 * velin-reveal.js — scroll-into-view reveal (delegates to core/motion).
 */
import { initMotion, initReveal as motionInitReveal, velinMotion } from '../core/motion/index.js';

export { initMotion, velinMotion };
export const initReveal = motionInitReveal;

if (typeof document !== 'undefined') {
  const autoInit = () => {
    if (document.documentElement?.hasAttribute('data-velin-reveal-auto')) {
      initMotion();
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }
}

export default { initReveal, initMotion };
