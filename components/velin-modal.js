import { trapFocus, saveFocus, restoreFocus, getFocusableElements } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';

const styles = `
  :host {
    display: contents;
  }
  .overlay {
    position: fixed;
    inset: 0;
    z-index: var(--velin-z-modal, 500);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--velin-space-4, 1rem);
    background: var(--velin-color-overlay, rgba(0,0,0,0.4));
    opacity: 0;
    visibility: hidden;
    transition: opacity 200ms ease, visibility 200ms ease;
  }
  :host([open]) .overlay {
    opacity: 1;
    visibility: visible;
  }
  .dialog {
    position: relative;
    inline-size: min(90vw, 32rem);
    max-block-size: 85vh;
    background: var(--velin-color-surface-bright, #fff);
    border-radius: var(--velin-radius-lg, 0.75rem);
    box-shadow: var(--velin-shadow-xl, 0 20px 25px rgba(0,0,0,0.1));
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transform: scale(0.95) translateY(1rem);
    transition: transform 200ms ease;
  }
  :host([open]) .dialog {
    transform: scale(1) translateY(0);
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--velin-space-4, 1rem) var(--velin-space-6, 1.5rem);
    border-bottom: 1px solid var(--velin-color-border, #ddd);
  }
  .title {
    font-size: var(--velin-text-lg, 1.25rem);
    font-weight: var(--velin-weight-semibold, 600);
    margin: 0;
  }
  .close-btn {
    min-width: 2.75rem;
    min-height: 2.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: var(--velin-radius-md, 0.5rem);
    cursor: pointer;
    color: var(--velin-color-text-muted, #666);
    font-size: 1.5rem;
    line-height: 1;
  }
  .close-btn:hover {
    background: var(--velin-color-surface-dim, #eee);
    color: var(--velin-color-text, #111);
  }
  .body {
    padding: var(--velin-space-6, 1.5rem);
    overflow-y: auto;
    flex-grow: 1;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--velin-space-3, 0.75rem);
    padding: var(--velin-space-4, 1rem) var(--velin-space-6, 1.5rem);
    border-top: 1px solid var(--velin-color-border, #ddd);
  }
  @media (prefers-reduced-motion: reduce) {
    .overlay, .dialog { transition: none; }
  }
`;

class VelinModal extends HTMLElement {
  static get observedAttributes() {
    return ['open'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._previouslyFocused = null;
    this._onKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    const title = this.getAttribute('title') || '';
    const safeTitle = escapeHTML(title);
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="overlay" part="overlay">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="velin-modal-title" part="dialog">
          <div class="header" part="header">
            <h2 class="title" id="velin-modal-title">${safeTitle}</h2>
            <button class="close-btn" aria-label="Close" part="close">&#215;</button>
          </div>
          <div class="body" part="body"><slot></slot></div>
          <div class="footer" part="footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.close();
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open') {
      if (newVal !== null) {
        this._open();
      } else {
        this._close();
      }
    }
  }

  open() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('velin-close', { bubbles: true }));
  }

  _open() {
    this._previouslyFocused = saveFocus();
    document.addEventListener('keydown', this._onKeydown);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      const focusable = getFocusableElements(this.shadowRoot);
      if (focusable.length > 0) focusable[0].focus();
    });
  }

  _close() {
    document.removeEventListener('keydown', this._onKeydown);
    document.body.style.overflow = '';
    restoreFocus(this._previouslyFocused);
  }

  _onKeydown(event) {
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    trapFocus(this.shadowRoot, event);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown);
    document.body.style.overflow = '';
  }
}

customElements.define('velin-modal', VelinModal);
export default VelinModal;
