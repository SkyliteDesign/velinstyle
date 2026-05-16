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
    this._typeahead = '';
    this._typeaheadTimer = null;
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
    const menuSlot = this.shadowRoot.querySelector('slot:not([name])');
    triggerSlot.addEventListener('click', () => this.toggle());
    triggerSlot.addEventListener('slotchange', () => {
      const trigger = triggerSlot.assignedElements()[0];
      if (trigger) {
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
        const menuId = this._menuId || (this._menuId = `velin-dropdown-menu-${Math.random().toString(36).slice(2, 9)}`);
        trigger.setAttribute('aria-controls', menuId);
        this.shadowRoot.querySelector('.menu')?.setAttribute('id', menuId);
      }
    });
    menuSlot?.addEventListener('slotchange', () => this._normalizeMenuItems());
    this._normalizeMenuItems();
    this.addEventListener('keydown', this._onKeydown);
  }

  _normalizeMenuItems() {
    const items = this._getMenuItems();
    items.forEach((el, i) => {
      if (!el.hasAttribute('role')) el.setAttribute('role', 'menuitem');
      el.setAttribute('tabindex', i === 0 ? '0' : '-1');
    });
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
    if (items.length === 0) return;

    if (event.key.length === 1 && /[a-z0-9]/i.test(event.key)) {
      clearTimeout(this._typeaheadTimer);
      this._typeahead += event.key.toLowerCase();
      this._typeaheadTimer = setTimeout(() => { this._typeahead = ''; }, 500);
      const match = items.find((el) =>
        (el.textContent?.trim().toLowerCase() || '').startsWith(this._typeahead)
      );
      if (match) {
        event.preventDefault();
        items.forEach((item) => item.setAttribute('tabindex', item === match ? '0' : '-1'));
        match.focus();
      }
      return;
    }

    rovingTabindex(this, items, event);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick, true);
  }
}

customElements.define('velin-dropdown', VelinDropdown);
export default VelinDropdown;
