import { escapeHTML } from './sanitize.js';
import { trapFocus, saveFocus, restoreFocus, getFocusableElements } from './focus-manager.js';

const styles = `
  :host { position: relative; display: inline-block; }
  .popover {
    position: absolute; z-index: var(--velin-z-dropdown, 200);
    background: var(--velin-color-surface-bright, #fff);
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-lg, 0.75rem);
    box-shadow: var(--velin-shadow-lg, 0 10px 15px rgba(0,0,0,0.08));
    padding: var(--velin-space-4, 1rem);
    min-inline-size: 12rem; max-inline-size: 20rem;
    opacity: 0; visibility: hidden;
    transition: opacity 150ms ease, visibility 150ms ease;
  }
  :host([open]) .popover { opacity: 1; visibility: visible; }
  .popover--top { inset-block-end: calc(100% + 0.5rem); inset-inline-start: 50%; transform: translateX(-50%); }
  .popover--bottom { inset-block-start: calc(100% + 0.5rem); inset-inline-start: 50%; transform: translateX(-50%); }
  .popover--start { inset-inline-end: calc(100% + 0.5rem); inset-block-start: 50%; transform: translateY(-50%); }
  .popover--end { inset-inline-start: calc(100% + 0.5rem); inset-block-start: 50%; transform: translateY(-50%); }
  .popover__title {
    font-size: var(--velin-text-sm, 0.875rem); font-weight: var(--velin-weight-semibold, 600);
    margin-block-end: var(--velin-space-2, 0.5rem);
    padding-block-end: var(--velin-space-2, 0.5rem);
    border-bottom: 1px solid var(--velin-color-border, #ddd);
  }
  @media (prefers-reduced-motion: reduce) { .popover { transition: none; } }
`;

let popoverId = 0;

class VelinPopover extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._popoverId = `velin-popover-${++popoverId}`;
    this._onOutside = this._onOutside.bind(this);
    this._onKey = this._onKey.bind(this);
    this._prevFocus = null;
    this._isDialog = false;
  }

  connectedCallback() {
    const placement = this.getAttribute('placement') || 'bottom';
    const triggerType = this.getAttribute('trigger') || 'click';
    const title = this.getAttribute('title') || '';
    const role = triggerType === 'hover' ? 'tooltip' : 'dialog';
    this._isDialog = role === 'dialog';

    const titleId = title ? `${this._popoverId}-title` : '';
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot name="trigger"></slot>
      <div class="popover popover--${placement}" id="${this._popoverId}" role="${role}" part="popover"${titleId ? ` aria-labelledby="${titleId}"` : ''}>
        ${title ? `<div class="popover__title" id="${titleId}" part="title">${escapeHTML(title)}</div>` : ''}
        <slot></slot>
      </div>
    `;
    const popoverEl = this.shadowRoot.querySelector('.popover');
    if (!title && popoverEl) {
      const fallback =
        this.getAttribute('aria-label') ||
        (role === 'tooltip' ? 'Tooltip' : 'Popover');
      popoverEl.setAttribute('aria-label', fallback);
    }

    const triggerSlot = this.shadowRoot.querySelector('slot[name="trigger"]');
    triggerSlot.addEventListener('slotchange', () => this._wireTrigger(triggerType));
    this._wireTrigger(triggerType);
  }

  _ensureTriggerInteractive(trigger) {
    const tag = trigger.tagName;
    if (tag !== 'BUTTON' && tag !== 'A' && trigger.getAttribute('role') !== 'button') {
      trigger.setAttribute('role', 'button');
      if (!trigger.hasAttribute('tabindex')) trigger.setAttribute('tabindex', '0');
    }
  }

  _onTriggerKey(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
  }

  _wireTrigger(triggerType) {
    const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
    if (!trigger) return;

    this._ensureTriggerInteractive(trigger);
    const isHover = triggerType === 'hover';
    trigger.setAttribute('aria-haspopup', isHover ? 'true' : 'dialog');
    trigger.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
    if (this._isDialog) {
      trigger.setAttribute('aria-controls', this._popoverId);
    }

    trigger.removeEventListener('keydown', this._onTriggerKeyBound);
    this._onTriggerKeyBound = this._onTriggerKeyBound || this._onTriggerKey.bind(this);
    trigger.addEventListener('keydown', this._onTriggerKeyBound);

    if (triggerType === 'click') {
      trigger.onclick = () => this.toggle();
    } else if (triggerType === 'hover') {
      this.onmouseenter = () => this.open();
      this.onmouseleave = () => this.close();
      this.onfocusin = () => this.open();
      this.onfocusout = (e) => { if (!this.contains(e.relatedTarget)) this.close(); };
    } else if (triggerType === 'focus') {
      trigger.onfocusin = () => this.open();
      trigger.onfocusout = () => this.close();
    }
  }

  open() {
    this.setAttribute('open', '');
    const trigger = this.querySelector('[slot="trigger"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onOutside, true);
    document.addEventListener('keydown', this._onKey);

    if (this._isDialog) {
      this._prevFocus = saveFocus();
      requestAnimationFrame(() => {
        const focusable = getFocusableElements(this.shadowRoot.querySelector('.popover'));
        if (focusable.length) focusable[0].focus();
        else this.shadowRoot.querySelector('.popover')?.focus();
      });
    }
  }

  close() {
    this.removeAttribute('open');
    const trigger = this.querySelector('[slot="trigger"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._onOutside, true);
    document.removeEventListener('keydown', this._onKey);
    if (this._isDialog && this._prevFocus) {
      restoreFocus(this._prevFocus);
      this._prevFocus = null;
    }
  }

  toggle() { this.hasAttribute('open') ? this.close() : this.open(); }

  _onOutside(e) { if (!this.contains(e.target)) this.close(); }

  _onKey(e) {
    if (e.key === 'Escape') {
      this.close();
      const trigger = this.querySelector('[slot="trigger"]');
      if (trigger) trigger.focus();
      return;
    }
    if (this._isDialog && this.hasAttribute('open')) {
      trapFocus(this.shadowRoot.querySelector('.popover'), e);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onOutside, true);
    document.removeEventListener('keydown', this._onKey);
  }
}

customElements.define('velin-popover', VelinPopover);
export default VelinPopover;
