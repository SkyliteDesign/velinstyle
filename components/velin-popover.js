import { escapeHTML } from './sanitize.js';

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
  /* Placement */
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

class VelinPopover extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onOutside = this._onOutside.bind(this);
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    const placement = this.getAttribute('placement') || 'bottom';
    const triggerType = this.getAttribute('trigger') || 'click';
    const title = this.getAttribute('title') || '';
    const role = triggerType === 'hover' ? 'tooltip' : 'dialog';

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot name="trigger"></slot>
      <div class="popover popover--${placement}" role="${role}" part="popover">
        ${title ? `<div class="popover__title" part="title">${escapeHTML(title)}</div>` : ''}
        <slot></slot>
      </div>
    `;

    const triggerSlot = this.shadowRoot.querySelector('slot[name="trigger"]');
    triggerSlot.addEventListener('slotchange', () => {
      const trigger = triggerSlot.assignedElements()[0];
      if (!trigger) return;
      trigger.setAttribute('aria-haspopup', role === 'tooltip' ? 'true' : 'dialog');
      trigger.setAttribute('aria-expanded', 'false');

      if (triggerType === 'click') {
        trigger.addEventListener('click', () => this.toggle());
      } else if (triggerType === 'hover') {
        this.addEventListener('mouseenter', () => this.open());
        this.addEventListener('mouseleave', () => this.close());
        this.addEventListener('focusin', () => this.open());
        this.addEventListener('focusout', (e) => { if (!this.contains(e.relatedTarget)) this.close(); });
      } else if (triggerType === 'focus') {
        trigger.addEventListener('focusin', () => this.open());
        trigger.addEventListener('focusout', () => this.close());
      }
    });
  }

  open() {
    this.setAttribute('open', '');
    const trigger = this.querySelector('[slot="trigger"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onOutside, true);
    document.addEventListener('keydown', this._onKey);
  }
  close() {
    this.removeAttribute('open');
    const trigger = this.querySelector('[slot="trigger"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._onOutside, true);
    document.removeEventListener('keydown', this._onKey);
  }
  toggle() { this.hasAttribute('open') ? this.close() : this.open(); }

  _onOutside(e) { if (!this.contains(e.target)) this.close(); }
  _onKey(e) { if (e.key === 'Escape') this.close(); }

  disconnectedCallback() {
    document.removeEventListener('click', this._onOutside, true);
    document.removeEventListener('keydown', this._onKey);
  }
}

customElements.define('velin-popover', VelinPopover);
export default VelinPopover;
