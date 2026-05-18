import { rovingTabindex } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';
import { SHADOW_A11Y_STYLES } from './shadow-a11y-styles.js';

const styles = `
  ${SHADOW_A11Y_STYLES}
  :host { display: block; }
  .menubar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--velin-space-1, 0.25rem);
    padding: var(--velin-space-2, 0.5rem);
    background: var(--velin-color-surface-bright, #fff);
    border-bottom: 1px solid var(--velin-color-border, #ddd);
  }
  ::slotted([role="menuitem"]) {
    min-inline-size: 2.75rem;
    min-block-size: 2.75rem;
    padding: var(--velin-space-2, 0.5rem) var(--velin-space-4, 1rem);
    background: none;
    border: none;
    border-radius: var(--velin-radius-sm, 0.25rem);
    cursor: pointer;
    font-size: var(--velin-text-base, 1rem);
    color: var(--velin-color-text, #111);
  }
  ::slotted([role="menuitem"]:hover) {
    background: var(--velin-color-surface-dim, #eee);
  }
`;

class VelinMenubar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    const label = escapeHTML(this.getAttribute('aria-label') || 'Menu bar');
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="menubar" role="menubar" aria-label="${label}"><slot></slot></div>
    `;
    this.addEventListener('keydown', this._onKey);
    this.shadowRoot.querySelector('slot')?.addEventListener('slotchange', () => this._init());
    this._init();
  }

  _getItems() {
    const slot = this.shadowRoot.querySelector('slot');
    return slot ? slot.assignedElements().filter((el) => !el.hasAttribute('disabled')) : [];
  }

  _init() {
    const items = this._getItems();
    items.forEach((el, i) => {
      if (!el.hasAttribute('role')) el.setAttribute('role', 'menuitem');
      el.setAttribute('tabindex', i === 0 ? '0' : '-1');
    });
  }

  _onKey(e) {
    const items = this._getItems();
    if (items.includes(e.target)) rovingTabindex(this, items, e);
  }

  static get observedAttributes() { return ['aria-label']; }

  attributeChangedCallback(name) {
    if (name === 'aria-label') {
      const bar = this.shadowRoot?.querySelector('.menubar');
      if (bar) bar.setAttribute('aria-label', escapeHTML(this.getAttribute('aria-label') || 'Menu bar'));
    }
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKey);
  }
}

customElements.define('velin-menubar', VelinMenubar);
export default VelinMenubar;
