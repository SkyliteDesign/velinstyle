import { trapFocus, saveFocus, restoreFocus, getFocusableElements, setBackgroundInert, clearBackgroundInert } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';
import { SHADOW_A11Y_STYLES } from './shadow-a11y-styles.js';

const styles = `
  ${SHADOW_A11Y_STYLES}
  :host { display: contents; }
  .overlay {
    position: fixed; inset: 0; z-index: var(--velin-z-overlay, 400);
    background: var(--velin-color-overlay, rgba(0,0,0,0.4));
    opacity: 0; visibility: hidden;
    transition: opacity 200ms ease, visibility 200ms ease;
  }
  :host([open]) .overlay { opacity: 1; visibility: visible; }
  .sheet {
    position: fixed; inset-inline: 0; inset-block-end: 0;
    z-index: var(--velin-z-modal, 500);
    max-block-size: min(85vh, 32rem);
    background: var(--velin-color-surface-bright, #fff);
    border-radius: var(--velin-radius-lg, 0.75rem) var(--velin-radius-lg, 0.75rem) 0 0;
    box-shadow: var(--velin-shadow-xl, 0 -4px 24px rgba(0,0,0,0.12));
    display: flex; flex-direction: column;
    transform: translateY(100%);
    transition: transform 250ms ease;
    padding-block-end: env(safe-area-inset-bottom, 0px);
  }
  :host([open]) .sheet { transform: translateY(0); }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--velin-space-4, 1rem) var(--velin-space-5, 1.25rem);
    border-bottom: 1px solid var(--velin-color-border, #ddd);
  }
  .title { font-size: var(--velin-text-lg, 1.25rem); font-weight: 600; margin: 0; }
  .body { flex: 1; overflow-y: auto; padding: var(--velin-space-5, 1.25rem); }
  @media (prefers-reduced-motion: reduce) { .overlay, .sheet { transition: none; } }
`;

class VelinSheet extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._prev = null;
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    const title = escapeHTML(this.getAttribute('title') || this.getAttribute('label') || '');
    const titleId = 'velin-sheet-title';
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="overlay" part="overlay"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="${titleId}" part="sheet">
        <div class="header" part="header">
          <h2 class="title" id="${titleId}">${title}</h2>
          <button class="close-btn" aria-label="Close" part="close">&#215;</button>
        </div>
        <div class="body" part="body"><slot></slot></div>
      </div>
    `;
    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.overlay').addEventListener('click', () => this.close());
    if (this.hasAttribute('open')) this._open();
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
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      const f = getFocusableElements(this.shadowRoot);
      if (f.length) f[0].focus();
    });
  }

  _close() {
    document.removeEventListener('keydown', this._onKey);
    document.body.style.overflow = '';
    clearBackgroundInert();
    restoreFocus(this._prev);
  }

  _onKey(e) {
    if (e.key === 'Escape') { this.close(); return; }
    trapFocus(this.shadowRoot, e);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKey);
    document.body.style.overflow = '';
  }
}

customElements.define('velin-sheet', VelinSheet);
export default VelinSheet;
