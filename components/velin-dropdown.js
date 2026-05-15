import { rovingTabindex, getFocusableElements } from './focus-manager.js';

const styles = `
  :host {
    display: inline-block;
    position: relative;
  }
  .menu {
    position: absolute;
    z-index: var(--velin-z-dropdown, 100);
    inset-block-start: 100%;
    inset-inline-start: 0;
    min-inline-size: 12rem;
    padding-block: var(--velin-space-1, 0.25rem);
    background: var(--velin-color-surface-bright, #fff);
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    box-shadow: var(--velin-shadow-lg, 0 10px 15px rgba(0,0,0,0.08));
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.25rem);
    transition: opacity 150ms ease, transform 150ms ease, visibility 150ms ease;
  }
  :host([open]) .menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  .menu-end {
    inset-inline-start: auto;
    inset-inline-end: 0;
  }
  ::slotted([role="menuitem"]),
  ::slotted(a),
  ::slotted(button) {
    display: flex;
    align-items: center;
    gap: var(--velin-space-2, 0.5rem);
    inline-size: 100%;
    padding: var(--velin-space-2, 0.5rem) var(--velin-space-4, 1rem);
    min-block-size: 2.5rem;
    font-size: var(--velin-text-base, 1rem);
    color: var(--velin-color-text, #111);
    background: none;
    border: none;
    text-align: start;
    cursor: pointer;
    text-decoration: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .menu { transition: none; }
  }
`;

class VelinDropdown extends HTMLElement {
  static get observedAttributes() {
    return ['open'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._onDocClick = this._onDocClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    const align = this.getAttribute('align') || 'start';
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot name="trigger"></slot>
      <div class="menu ${align === 'end' ? 'menu-end' : ''}" role="menu" part="menu">
        <slot></slot>
      </div>
    `;

    const triggerSlot = this.shadowRoot.querySelector('slot[name="trigger"]');
    triggerSlot.addEventListener('click', () => this.toggle());
    triggerSlot.addEventListener('slotchange', () => {
      const trigger = triggerSlot.assignedElements()[0];
      if (trigger) {
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
      }
    });
    this.addEventListener('keydown', this._onKeydown);
  }

  toggle() {
    if (this.hasAttribute('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.setAttribute('open', '');
    const trigger = this.querySelector('[slot="trigger"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onDocClick, true);

    requestAnimationFrame(() => {
      const items = this._getMenuItems();
      if (items.length > 0) {
        items[0].focus();
      }
    });
  }

  close() {
    this.removeAttribute('open');
    const trigger = this.querySelector('[slot="trigger"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._onDocClick, true);
    this.dispatchEvent(new CustomEvent('velin-close', { bubbles: true }));
  }

  _getMenuItems() {
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    return slot
      ? slot.assignedElements().filter((el) => !el.hasAttribute('disabled'))
      : [];
  }

  _onDocClick(event) {
    if (!this.contains(event.target)) {
      this.close();
    }
  }

  _onKeydown(event) {
    if (event.key === 'Escape') {
      this.close();
      const trigger = this.querySelector('[slot="trigger"]');
      if (trigger) trigger.focus();
      return;
    }

    const items = this._getMenuItems();
    if (items.length > 0) {
      rovingTabindex(this, items, event);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick, true);
  }
}

customElements.define('velin-dropdown', VelinDropdown);
export default VelinDropdown;
