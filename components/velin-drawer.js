import { trapFocus, saveFocus, restoreFocus, getFocusableElements } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: contents; }
  .overlay {
    position: fixed;
    inset: 0;
    z-index: var(--velin-z-overlay, 400);
    background: var(--velin-color-overlay, rgba(0,0,0,0.4));
    opacity: 0;
    visibility: hidden;
    transition: opacity 200ms ease, visibility 200ms ease;
  }
  :host([open]) .overlay { opacity: 1; visibility: visible; }
  .drawer {
    position: fixed;
    z-index: var(--velin-z-modal, 500);
    background: var(--velin-color-surface-bright, #fff);
    box-shadow: var(--velin-shadow-xl, 0 20px 25px rgba(0,0,0,0.1));
    display: flex;
    flex-direction: column;
    transition: transform 250ms ease;
    overflow: hidden;
  }
  /* Side positioning -- default = start */
  .drawer { inset-block: 0; inset-inline-start: 0; inset-inline-end: auto; inline-size: min(20rem, 85vw); transform: translateX(-100%); }
  :host([open]) .drawer, :host([open][side="start"]) .drawer { transform: translateX(0); }
  :host([side="end"]) .drawer { inset-inline-start: auto; inset-inline-end: 0; transform: translateX(100%); }
  :host([open][side="end"]) .drawer { transform: translateX(0); }
  :host([side="top"]) .drawer { inset-inline: 0; inset-inline-start: 0; inset-block-start: 0; inset-block-end: auto; block-size: min(50vh, 24rem); inline-size: 100%; transform: translateY(-100%); }
  :host([open][side="top"]) .drawer { transform: translateY(0); }
  :host([side="bottom"]) .drawer { inset-inline: 0; inset-inline-start: 0; inset-block-start: auto; inset-block-end: 0; block-size: min(50vh, 24rem); inline-size: 100%; transform: translateY(100%); }
  :host([open][side="bottom"]) .drawer { transform: translateY(0); }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--velin-space-4, 1rem) var(--velin-space-5, 1.25rem);
    border-bottom: 1px solid var(--velin-color-border, #ddd);
  }
  .title { font-size: var(--velin-text-lg, 1.25rem); font-weight: var(--velin-weight-semibold, 600); margin: 0; }
  .close-btn {
    min-width: 2.75rem; min-height: 2.75rem; display: inline-flex; align-items: center; justify-content: center;
    background: none; border: none; border-radius: var(--velin-radius-md, 0.5rem); cursor: pointer;
    color: var(--velin-color-text-muted, #666); font-size: 1.5rem; line-height: 1;
  }
  .close-btn:hover { background: var(--velin-color-surface-dim, #eee); color: var(--velin-color-text, #111); }
  .body { flex: 1; padding: var(--velin-space-5, 1.25rem); overflow-y: auto; }
  @media (prefers-reduced-motion: reduce) { .overlay, .drawer { transition: none; } }
`;

class VelinDrawer extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._prev = null;
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    const title = this.getAttribute('title') || '';
    const safeTitle = escapeHTML(title);
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="overlay" part="overlay"></div>
      <div class="drawer" role="dialog" aria-modal="true" aria-label="${safeTitle}" part="drawer">
        <div class="header" part="header">
          <h2 class="title">${safeTitle}</h2>
          <button class="close-btn" aria-label="Close" part="close">&#215;</button>
        </div>
        <div class="body" part="body"><slot></slot></div>
      </div>
    `;
    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.overlay').addEventListener('click', () => this.close());
  }

  attributeChangedCallback(name) {
    if (name === 'open') this.hasAttribute('open') ? this._open() : this._close();
  }

  open() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); this.dispatchEvent(new CustomEvent('velin-close', { bubbles: true })); }

  _open() {
    this._prev = saveFocus();
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

customElements.define('velin-drawer', VelinDrawer);
export default VelinDrawer;
