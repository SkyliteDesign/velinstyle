import { rovingTabindex } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';
import { SHADOW_A11Y_STYLES } from './shadow-a11y-styles.js';

const styles = `
  ${SHADOW_A11Y_STYLES}
  :host { display: block; }
  .group {
    display: inline-flex;
    gap: var(--velin-space-1, 0.25rem);
    padding: var(--velin-space-1, 0.25rem);
    background: var(--velin-color-surface-dim, #eee);
    border-radius: var(--velin-radius-md, 0.5rem);
  }
  ::slotted(button) {
    min-inline-size: 2.75rem;
    min-block-size: 2.75rem;
    padding: var(--velin-space-2, 0.5rem) var(--velin-space-4, 1rem);
    border: none;
    border-radius: var(--velin-radius-sm, 0.25rem);
    background: transparent;
    color: var(--velin-color-text-muted, #666);
    cursor: pointer;
    font-size: var(--velin-text-sm, 0.875rem);
  }
  ::slotted(button[aria-pressed="true"]) {
    background: var(--velin-color-surface-bright, #fff);
    color: var(--velin-color-text, #111);
    font-weight: var(--velin-weight-semibold, 600);
    box-shadow: var(--velin-shadow-sm, 0 1px 2px rgba(0,0,0,0.06));
  }
`;

class VelinSegmentedControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._onClick = this._onClick.bind(this);
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    const label = escapeHTML(this.getAttribute('aria-label') || 'Segmented control');
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="group" role="group" aria-label="${label}"><slot></slot></div>
    `;
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKey);
    this.shadowRoot.querySelector('slot')?.addEventListener('slotchange', () => this._init());
    this._init();
  }

  _getButtons() {
    const slot = this.shadowRoot.querySelector('slot');
    return slot ? slot.assignedElements().filter((el) => el.tagName === 'BUTTON') : [];
  }

  _init() {
    const buttons = this._getButtons();
    const selected = buttons.find((b) => b.hasAttribute('selected')) || buttons[0];
    buttons.forEach((btn, i) => {
      btn.setAttribute('aria-pressed', btn === selected ? 'true' : 'false');
      btn.setAttribute('tabindex', btn === selected ? '0' : '-1');
    });
  }

  _onClick(e) {
    const btn = e.target.closest('button');
    if (!btn || !this.contains(btn)) return;
    this._select(btn);
  }

  _select(btn) {
    this._getButtons().forEach((b) => {
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      b.setAttribute('tabindex', b === btn ? '0' : '-1');
    });
    this.dispatchEvent(new CustomEvent('velin-change', { bubbles: true, detail: { value: btn.value || btn.textContent?.trim() } }));
  }

  _onKey(e) {
    const buttons = this._getButtons();
    if (!buttons.includes(e.target)) return;
    rovingTabindex(this, buttons, e);
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const focused = buttons.find((b) => b.getAttribute('tabindex') === '0');
      if (focused) this._select(focused);
    }
  }

  static get observedAttributes() { return ['aria-label']; }

  attributeChangedCallback(name) {
    if (name === 'aria-label') {
      const group = this.shadowRoot?.querySelector('.group');
      if (group) group.setAttribute('aria-label', escapeHTML(this.getAttribute('aria-label') || 'Segmented control'));
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKey);
  }
}

customElements.define('velin-segmented-control', VelinSegmentedControl);
export default VelinSegmentedControl;
