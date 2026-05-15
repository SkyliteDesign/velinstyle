import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: contents; }
  dialog {
    border: none; border-radius: var(--velin-radius-lg, 0.75rem);
    box-shadow: var(--velin-shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1));
    padding: 0; max-inline-size: min(28rem, 90vw); inline-size: 100%;
    background: var(--velin-color-surface-bright, #fff);
    color: var(--velin-color-text, #1a1a2e);
  }
  dialog::backdrop { background: rgba(0,0,0,0.5); }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--velin-space-4, 1rem) var(--velin-space-6, 1.5rem);
    border-bottom: 1px solid var(--velin-color-border, #e5e5e5);
  }
  .title { font-size: var(--velin-text-lg, 1.125rem); font-weight: 600; margin: 0; }
  .close {
    background: none; border: none; cursor: pointer; font-size: 1.25rem;
    color: var(--velin-color-text-muted, #888); min-width: 2.75rem; min-height: 2.75rem;
    display: flex; align-items: center; justify-content: center;
    border-radius: var(--velin-radius-sm, 0.25rem);
  }
  .close:hover { background: var(--velin-color-surface-dim, #f5f5f5); }
  .close:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  .body { padding: var(--velin-space-6, 1.5rem); }
  .footer {
    display: flex; justify-content: flex-end; gap: var(--velin-space-2, 0.5rem);
    padding: var(--velin-space-4, 1rem) var(--velin-space-6, 1.5rem);
    border-top: 1px solid var(--velin-color-border, #e5e5e5);
  }
  .btn {
    padding: var(--velin-space-2, 0.5rem) var(--velin-space-4, 1rem);
    border-radius: var(--velin-radius-md, 0.375rem);
    font-size: var(--velin-text-base, 1rem); cursor: pointer;
    min-height: 2.75rem; border: 1px solid var(--velin-color-border, #ddd);
    background: var(--velin-color-surface-bright, #fff);
    color: var(--velin-color-text, #1a1a2e);
  }
  .btn--primary {
    background: var(--velin-color-primary, #2563eb);
    color: var(--velin-color-on-primary, #fff);
    border-color: var(--velin-color-primary, #2563eb);
  }
  .btn--danger {
    background: var(--velin-color-danger, #dc2626);
    color: #fff; border-color: var(--velin-color-danger, #dc2626);
  }
  .btn:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  .input {
    inline-size: 100%; padding: var(--velin-space-3, 0.75rem);
    border: 2px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.375rem);
    font-size: var(--velin-text-base, 1rem); margin-top: var(--velin-space-3, 0.75rem);
    background: var(--velin-color-surface-bright, #fff);
    color: var(--velin-color-text, #1a1a2e);
  }
  .input:focus { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 0; border-color: var(--velin-color-primary, #2563eb); }
`;

class VelinDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._resolve = null;
    this._previousFocus = null;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${styles}</style><dialog part="dialog"></dialog>`;
  }

  alert(message, { title = 'Alert', confirmText = 'OK' } = {}) {
    return this._show('alert', message, { title, confirmText });
  }

  confirm(message, { title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = {}) {
    return this._show('confirm', message, { title, confirmText, cancelText, danger });
  }

  prompt(message, { title = 'Input', confirmText = 'Submit', cancelText = 'Cancel', placeholder = '', defaultValue = '' } = {}) {
    return this._show('prompt', message, { title, confirmText, cancelText, placeholder, defaultValue });
  }

  _show(type, message, opts) {
    const dialog = this.shadowRoot.querySelector('dialog');
    this._previousFocus = document.activeElement;
    const safeTitle = escapeHTML(opts.title);
    const safeMsg = escapeHTML(message);
    const safeConfirm = escapeHTML(opts.confirmText);
    const safeCancel = escapeHTML(opts.cancelText || '');
    const safePlaceholder = escapeHTML(opts.placeholder || '');
    const safeDefault = escapeHTML(opts.defaultValue || '');

    const footerBtns = type === 'alert'
      ? `<button class="btn btn--primary" data-action="confirm">${safeConfirm}</button>`
      : `<button class="btn" data-action="cancel">${safeCancel}</button>
         <button class="btn ${opts.danger ? 'btn--danger' : 'btn--primary'}" data-action="confirm">${safeConfirm}</button>`;

    const input = type === 'prompt'
      ? `<input class="input" placeholder="${safePlaceholder}" value="${safeDefault}" part="input">`
      : '';

    dialog.innerHTML = `
      <div class="header"><h3 class="title">${safeTitle}</h3><button class="close" aria-label="Close">&times;</button></div>
      <div class="body"><p>${safeMsg}</p>${input}</div>
      <div class="footer">${footerBtns}</div>
    `;

    dialog.showModal();
    if (type !== 'prompt') {
      const firstBtn = dialog.querySelector('[data-action]');
      if (firstBtn) firstBtn.focus();
    }

    return new Promise((resolve) => {
      this._resolve = resolve;
      dialog.querySelector('.close').addEventListener('click', () => this._dismiss(type, false, dialog));
      dialog.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => this._dismiss(type, btn.dataset.action === 'confirm', dialog));
      });
      dialog.addEventListener('cancel', (e) => { e.preventDefault(); this._dismiss(type, false, dialog); });
      if (type === 'prompt') {
        const inp = dialog.querySelector('.input');
        inp.focus();
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._dismiss(type, true, dialog); });
      }
    });
  }

  _dismiss(type, confirmed, dialog) {
    if (!this._resolve) return;
    let value;
    if (type === 'alert') value = true;
    else if (type === 'confirm') value = confirmed;
    else value = confirmed ? dialog.querySelector('.input')?.value ?? '' : null;
    dialog.close();
    if (this._previousFocus) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }
    this._resolve(value);
    this._resolve = null;
    this.dispatchEvent(new CustomEvent('velin-dialog-close', { bubbles: true, detail: { value } }));
  }
}

customElements.define('velin-dialog', VelinDialog);
export default VelinDialog;
