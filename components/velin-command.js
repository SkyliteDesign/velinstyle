import { trapFocus, saveFocus, restoreFocus, getFocusableElements, setBackgroundInert, clearBackgroundInert } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';
import { SHADOW_A11Y_STYLES } from './shadow-a11y-styles.js';

const styles = `
  ${SHADOW_A11Y_STYLES}
  :host { display: contents; }
  .overlay {
    position: fixed; inset: 0; z-index: var(--velin-z-modal, 500);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 10vh var(--velin-space-4, 1rem) var(--velin-space-4, 1rem);
    background: var(--velin-color-overlay, rgba(0,0,0,0.4));
    opacity: 0; visibility: hidden;
    transition: opacity 150ms ease, visibility 150ms ease;
  }
  :host([open]) .overlay { opacity: 1; visibility: visible; }
  .panel {
    inline-size: min(32rem, 100%);
    background: var(--velin-color-surface-bright, #fff);
    border-radius: var(--velin-radius-lg, 0.75rem);
    box-shadow: var(--velin-shadow-xl, 0 20px 25px rgba(0,0,0,0.1));
    overflow: hidden;
  }
  .search {
    inline-size: 100%; padding: var(--velin-space-4, 1rem);
    border: none; border-bottom: 1px solid var(--velin-color-border, #ddd);
    font-size: var(--velin-text-base, 1rem);
    background: transparent;
    color: var(--velin-color-text, #111);
  }
  .results { max-block-size: 20rem; overflow-y: auto; padding: var(--velin-space-2, 0.5rem); }
  ::slotted(button) {
    display: flex; inline-size: 100%;
    padding: var(--velin-space-3, 0.75rem) var(--velin-space-4, 1rem);
    min-block-size: 2.5rem;
    border: none; background: none; text-align: start;
    cursor: pointer; font-size: var(--velin-text-base, 1rem);
    border-radius: var(--velin-radius-sm, 0.25rem);
  }
  ::slotted(button[hidden]) { display: none; }
  ::slotted(button:focus-visible) {
    background: var(--velin-color-surface-dim, #eee);
  }
`;

class VelinCommand extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._prev = null;
    this._onKey = this._onKey.bind(this);
    this._onInput = this._onInput.bind(this);
  }

  connectedCallback() {
    const placeholder = escapeHTML(this.getAttribute('placeholder') || 'Search commands…');
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="overlay" part="overlay">
        <div class="panel" role="dialog" aria-modal="true" aria-label="Command palette" part="panel">
          <input class="search" type="search" autocomplete="off" placeholder="${placeholder}" aria-label="Search" part="search" />
          <div class="results" part="results"><slot></slot></div>
        </div>
      </div>
    `;
    this.shadowRoot.querySelector('.search').addEventListener('input', this._onInput);
    this.shadowRoot.querySelector('slot')?.addEventListener('slotchange', () => this._filter(''));
    this._filter('');
  }

  attributeChangedCallback(name) {
    if (name === 'open') this.hasAttribute('open') ? this._open() : this._close();
  }

  open() { this.setAttribute('open', ''); }
  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('velin-close', { bubbles: true }));
  }

  _open() {
    this._prev = saveFocus();
    setBackgroundInert(this);
    document.addEventListener('keydown', this._onKey);
    requestAnimationFrame(() => {
      this.shadowRoot.querySelector('.search')?.focus();
      this._filter('');
    });
  }

  _close() {
    document.removeEventListener('keydown', this._onKey);
    clearBackgroundInert();
    restoreFocus(this._prev);
    const input = this.shadowRoot.querySelector('.search');
    if (input) input.value = '';
    this._filter('');
  }

  _onInput(e) {
    this._filter(e.target.value);
  }

  _filter(query) {
    const q = query.trim().toLowerCase();
    const slot = this.shadowRoot.querySelector('slot');
    slot?.assignedElements().forEach((btn) => {
      const text = btn.textContent?.trim().toLowerCase() || '';
      const match = !q || text.includes(q);
      btn.hidden = !match;
    });
  }

  _onKey(e) {
    if (e.key === 'Escape') { this.close(); return; }
    trapFocus(this.shadowRoot, e);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKey);
  }
}

customElements.define('velin-command', VelinCommand);
export default VelinCommand;
