import { trapFocus, setBackgroundInert, clearBackgroundInert } from './focus-manager.js';
import { announce } from './a11y-utils.js';
import { escapeHTML, sanitizeURL } from './sanitize.js';

const styles = `
  :host { display: contents; }
  .overlay {
    position: fixed; inset: 0; z-index: var(--velin-z-modal, 500);
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.85); opacity: 0; visibility: hidden;
    transition: opacity 200ms ease, visibility 200ms ease;
  }
  :host([open]) .overlay { opacity: 1; visibility: visible; }
  .content {
    position: relative; max-inline-size: 90vw; max-block-size: 90vh;
  }
  .content img, .content video {
    max-inline-size: 100%; max-block-size: 85vh; object-fit: contain;
    border-radius: var(--velin-radius-md, 0.375rem);
  }
  .close {
    position: absolute; top: -2.5rem; right: 0;
    background: none; border: none; color: #fff; font-size: 1.5rem;
    cursor: pointer; min-width: 2.75rem; min-height: 2.75rem;
    display: flex; align-items: center; justify-content: center;
  }
  .close:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  .nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.15); border: none; color: #fff;
    font-size: 1.5rem; cursor: pointer; border-radius: 50%;
    min-width: 2.75rem; min-height: 2.75rem;
    display: flex; align-items: center; justify-content: center;
  }
  .nav:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  .nav--prev { left: -3.5rem; }
  .nav--next { right: -3.5rem; }
  .counter { position: absolute; bottom: -2rem; left: 50%; transform: translateX(-50%); color: #ccc; font-size: 0.875rem; }
  @media (prefers-reduced-motion: reduce) { .overlay { transition: none; } }
  @media (max-width: 48rem) {
    .nav--prev { left: 0.5rem; }
    .nav--next { right: 0.5rem; }
  }
`;

class VelinLightbox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._index = 0;
    this._items = [];
    this._previousFocus = null;
    this._onTrapKey = (e) => { if (e.key === 'Tab') trapFocus(this.shadowRoot, e); };
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot></slot>
      <div class="overlay" role="dialog" aria-modal="true" aria-label="Image lightbox" aria-roledescription="lightbox" part="overlay">
        <button class="nav nav--prev" aria-label="Previous">&#8249;</button>
        <div class="content" part="content"></div>
        <button class="nav nav--next" aria-label="Next">&#8250;</button>
        <button class="close" aria-label="Close">&times;</button>
        <div class="counter" part="counter" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;

    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => {
      this._items = slot.assignedElements().filter(el => el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.dataset.velinLightbox);
      this._items.forEach((item, i) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => this.open(i));
      });
    });

    this.shadowRoot.querySelector('.close').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.nav--prev').addEventListener('click', () => this._prev());
    this.shadowRoot.querySelector('.nav--next').addEventListener('click', () => this._next());
    this.shadowRoot.querySelector('.overlay').addEventListener('click', (e) => { if (e.target.classList.contains('overlay')) this.close(); });
    this.shadowRoot.querySelector('.overlay').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this._prev();
      if (e.key === 'ArrowRight') this._next();
    });
  }

  open(index = 0) {
    this._previousFocus = document.activeElement;
    this._index = index;
    this.setAttribute('open', '');
    setBackgroundInert(this);
    this._render();
    document.body.style.overflow = 'hidden';
    const overlay = this.shadowRoot.querySelector('.overlay');
    overlay.removeEventListener('keydown', this._onTrapKey);
    overlay.addEventListener('keydown', this._onTrapKey);
    this.shadowRoot.querySelector('.close').focus();
  }

  close() {
    this.removeAttribute('open');
    clearBackgroundInert();
    document.body.style.overflow = '';
    if (this._previousFocus) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
    this.dispatchEvent(new CustomEvent('velin-close', { bubbles: true }));
  }

  _prev() { this._index = (this._index - 1 + this._items.length) % this._items.length; this._render(); }
  _next() { this._index = (this._index + 1) % this._items.length; this._render(); }

  _render() {
    const container = this.shadowRoot.querySelector('.content');
    const item = this._items[this._index];
    if (!item) return;
    const src = sanitizeURL(item.dataset.velinLightbox || item.src);
    const alt = escapeHTML(item.alt || '');
    if (item.tagName === 'VIDEO') {
      container.innerHTML = `<video src="${escapeHTML(src)}" controls autoplay></video>`;
    } else {
      container.innerHTML = `<img src="${escapeHTML(src)}" alt="${alt}">`;
    }
    const counter = this.shadowRoot.querySelector('.counter');
    const label = `${this._index + 1} / ${this._items.length}`;
    counter.textContent = label;
    announce(`Slide ${label}`, 'polite');
  }
}

customElements.define('velin-lightbox', VelinLightbox);
export default VelinLightbox;
