import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: block; }
  nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: var(--velin-space-2, 0.5rem) var(--velin-space-4, 1rem);
    padding-block-end: max(var(--velin-space-2, 0.5rem), env(safe-area-inset-bottom, 0px));
    background: var(--velin-color-surface-bright, #fff);
    border-block-start: 1px solid var(--velin-color-border, #ddd);
  }
  ::slotted(a), ::slotted(button) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--velin-space-1, 0.25rem);
    min-inline-size: 2.75rem;
    min-block-size: 2.75rem;
    padding: var(--velin-space-2, 0.5rem);
    font-size: var(--velin-text-xs, 0.75rem);
    color: var(--velin-color-text-muted, #666);
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
  }
  ::slotted([current]) {
    color: var(--velin-color-primary, #2563eb);
    font-weight: var(--velin-weight-semibold, 600);
  }
`;

class VelinBottomNav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onSlot = this._onSlot.bind(this);
  }

  connectedCallback() {
    const label = escapeHTML(this.getAttribute('aria-label') || 'Bottom navigation');
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <nav role="navigation" aria-label="${label}"><slot></slot></nav>
    `;
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', this._onSlot);
    this._onSlot();
  }

  _onSlot() {
    this._syncCurrent();
    this._syncSlotLabels();
  }

  _syncSlotLabels() {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return;
    slot.assignedElements().forEach((el) => {
      const text = el.textContent?.replace(/\s+/g, ' ').trim();
      if (!text && !el.getAttribute('aria-label')) {
        const hint =
          el.getAttribute('data-nav') ||
          el.getAttribute('title') ||
          el.getAttribute('aria-labelledby');
        if (hint) el.setAttribute('aria-label', hint);
      }
      if (el.tagName === 'A' && !el.getAttribute('href')) {
        el.setAttribute('role', 'button');
      }
    });
  }

  _syncCurrent() {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return;
    const hostKey = this.getAttribute('current');
    slot.assignedElements().forEach((el) => {
      const active =
        el.hasAttribute('current') ||
        (hostKey && (el.dataset.nav === hostKey || el.getAttribute('data-nav') === hostKey));
      if (active) {
        el.setAttribute('current', '');
        el.setAttribute('aria-current', 'page');
      } else {
        el.removeAttribute('current');
        el.removeAttribute('aria-current');
      }
    });
  }

  static get observedAttributes() {
    return ['aria-label', 'current'];
  }

  attributeChangedCallback(name) {
    if (name === 'aria-label') {
      const nav = this.shadowRoot?.querySelector('nav');
      if (nav) nav.setAttribute('aria-label', escapeHTML(this.getAttribute('aria-label') || 'Bottom navigation'));
    }
    if (name === 'current') this._syncCurrent();
  }
}

customElements.define('velin-bottom-nav', VelinBottomNav);
export default VelinBottomNav;
