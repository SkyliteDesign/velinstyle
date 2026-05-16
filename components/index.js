export { default as VelinModal } from './velin-modal.js';
export { default as VelinDropdown } from './velin-dropdown.js';
export { default as VelinAccordion } from './velin-accordion.js';
export { default as VelinTabs } from './velin-tabs.js';
export { default as VelinToast } from './velin-toast.js';
export { default as VelinIcon } from './velin-icon.js';
export { default as VelinDrawer } from './velin-drawer.js';
export { default as VelinThemeToggle } from './velin-theme-toggle.js';
export { default as VelinPopover } from './velin-popover.js';
export { default as VelinCopy } from './velin-copy.js';
export { default as VelinScrollTop } from './velin-scroll-top.js';
export { default as VelinCarousel } from './velin-carousel.js';
export { default as VelinCollapse } from './velin-collapse.js';
export { default as VelinScrollspy } from './velin-scrollspy.js';
export { default as VelinTooltipWC } from './velin-tooltip-wc.js';
export { default as VelinLightbox } from './velin-lightbox.js';
export { default as VelinStepperWC } from './velin-stepper-wc.js';
export { default as VelinDialog } from './velin-dialog.js';
export { default as VelinCountdown } from './velin-countdown.js';
export { default as VelinProgressRing } from './velin-progress-ring.js';
export { default as VelinPersist } from './velin-persist.js';
export { VelinHapticObserver, vibrate, applyHaptic, PATTERNS as HapticPatterns } from './velin-haptic.js';
export { trapFocus, rovingTabindex, saveFocus, restoreFocus, getFocusableElements, setBackgroundInert, clearBackgroundInert } from './focus-manager.js';

import { VelinHapticObserver } from './velin-haptic.js';
if (typeof document !== 'undefined') {
  const _hapticInit = () => { new VelinHapticObserver().start(document.body); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _hapticInit);
  } else {
    _hapticInit();
  }
}
