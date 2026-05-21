import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: inline-flex; }
  button {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem;
    min-width: 2.75rem; min-height: 2.75rem; padding: 0.375rem 0.625rem;
    background: var(--velin-color-surface-dim, #f0f0f0);
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem); cursor: pointer;
    color: var(--velin-color-text-muted, #666);
    font-size: var(--velin-text-sm, 0.875rem);
    transition: background 150ms ease, color 150ms ease;
  }
  button:hover { background: var(--velin-color-surface, #e0e0e0); color: var(--velin-color-text, #111); }
  button:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  button[data-copied] { color: var(--velin-color-success, #16a34a); border-color: var(--velin-color-success, #16a34a); }
  svg { width: 1rem; height: 1rem; flex-shrink: 0; }
  .check { display: none; }
  button[data-copied] .copy-icon { display: none; }
  button[data-copied] .check { display: block; }
  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
`;

class VelinCopy extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const label = escapeHTML(this.getAttribute('label') || '');
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <button part="button" aria-label="Copy">
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ${label ? `<span>${label}</span>` : ''}
      </button>
    `;

    this.shadowRoot.querySelector('button').addEventListener('click', () => this._copy());
  }

  _getCopyText() {
    return (
      this.getAttribute('value') ||
      this.getAttribute('text') ||
      this.dataset.source ||
      ''
    );
  }

  async _copy() {
    const value = this._getCopyText();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }

    const btn = this.shadowRoot.querySelector('button');
    btn.setAttribute('data-copied', '');
    btn.setAttribute('aria-label', 'Copied');
    this.dispatchEvent(new CustomEvent('velin-copied', { bubbles: true, detail: { value } }));

    setTimeout(() => {
      btn.removeAttribute('data-copied');
      btn.setAttribute('aria-label', 'Copy');
    }, 2000);
  }
}

if (!customElements.get('velin-copy')) {
  customElements.define('velin-copy', VelinCopy);
}
export default VelinCopy;
