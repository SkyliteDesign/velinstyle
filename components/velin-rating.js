import { rovingTabindex } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';
import { SHADOW_A11Y_STYLES } from './shadow-a11y-styles.js';

const styles = `
  ${SHADOW_A11Y_STYLES}
  :host { display: inline-block; }
  .stars { display: inline-flex; gap: var(--velin-space-1, 0.25rem); }
  button {
    background: none; border: none; padding: var(--velin-space-1, 0.25rem);
    font-size: 1.5rem; line-height: 1; cursor: pointer;
    color: var(--velin-color-border, #ccc);
  }
  button[aria-checked="true"] { color: var(--velin-color-warning, #f59e0b); }
`;

const MAX = 5;

class VelinRating extends HTMLElement {
  static get observedAttributes() { return ['value']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._onClick = this._onClick.bind(this);
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${styles}</style><div class="stars" role="radiogroup"></div>`;
    this._render();
    this.shadowRoot.querySelector('.stars').addEventListener('click', this._onClick);
    this.shadowRoot.querySelector('.stars').addEventListener('keydown', this._onKey);
  }

  _value() {
    const v = parseInt(this.getAttribute('value') || '0', 10);
    return Math.min(MAX, Math.max(0, Number.isNaN(v) ? 0 : v));
  }

  _render() {
    const group = this.shadowRoot.querySelector('.stars');
    const val = this._value();
    const label = escapeHTML(this.getAttribute('aria-label') || 'Rating');
    group.setAttribute('aria-label', label);
    group.innerHTML = '';
    for (let i = 1; i <= MAX; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', i <= val ? 'true' : 'false');
      btn.setAttribute('aria-label', escapeHTML(`${i} star${i > 1 ? 's' : ''}`));
      btn.setAttribute('tabindex', i === (val || 1) ? '0' : '-1');
      btn.dataset.value = String(i);
      btn.textContent = i <= val ? '\u2605' : '\u2606';
      group.appendChild(btn);
    }
  }

  _getButtons() {
    return [...this.shadowRoot.querySelectorAll('button[role="radio"]')];
  }

  _onClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    this._setValue(parseInt(btn.dataset.value, 10));
  }

  _onKey(e) {
    const buttons = this._getButtons();
    if (!buttons.includes(e.target)) return;
    rovingTabindex(this, buttons, e);
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const focused = buttons.find((b) => b.getAttribute('tabindex') === '0');
      if (focused) this._setValue(parseInt(focused.dataset.value, 10));
    }
  }

  _setValue(n) {
    this.setAttribute('value', String(n));
    this.dispatchEvent(new CustomEvent('velin-change', { bubbles: true, detail: { value: n } }));
  }

  attributeChangedCallback(name) {
    if (name === 'value' && this.shadowRoot?.querySelector('.stars')) this._render();
  }
}

customElements.define('velin-rating', VelinRating);
export default VelinRating;
