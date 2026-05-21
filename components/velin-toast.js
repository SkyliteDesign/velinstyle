import { escapeHTML } from './sanitize.js';

const styles = `
  :host {
    position: fixed;
    z-index: var(--velin-z-toast, 600);
    inset-block-end: var(--velin-space-4, 1rem);
    inset-inline-end: var(--velin-space-4, 1rem);
    display: flex;
    flex-direction: column-reverse;
    gap: var(--velin-space-2, 0.5rem);
    pointer-events: none;
    max-inline-size: min(24rem, calc(100vw - 2rem));
  }
  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--velin-space-3, 0.75rem);
    padding: var(--velin-space-3, 0.75rem) var(--velin-space-4, 1rem);
    background: var(--velin-color-surface-bright, #fff);
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    box-shadow: var(--velin-shadow-lg, 0 10px 15px rgba(0,0,0,0.08));
    pointer-events: auto;
    animation: velin-toast-in 200ms ease forwards;
    font-size: var(--velin-text-base, 1rem);
    color: var(--velin-color-text, #111);
  }
  .toast--success { border-inline-start: 4px solid var(--velin-color-success, #16a34a); }
  .toast--warning { border-inline-start: 4px solid var(--velin-color-warning, #ca8a04); }
  .toast--danger { border-inline-start: 4px solid var(--velin-color-danger, #dc2626); }
  .toast--info { border-inline-start: 4px solid var(--velin-color-info, #2563eb); }
  .toast-content { flex: 1; }
  .toast-close {
    min-width: 2rem;
    min-height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--velin-color-text-muted, #666);
    border-radius: var(--velin-radius-sm, 0.25rem);
    font-size: 1.25rem;
    line-height: 1;
  }
  .toast-close:hover {
    background: var(--velin-color-surface-dim, #eee);
  }
  .toast--out {
    animation: velin-toast-out 200ms ease forwards;
  }
  @keyframes velin-toast-in {
    from { opacity: 0; transform: translateX(1rem); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes velin-toast-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(1rem); }
  }
  @media (prefers-reduced-motion: reduce) {
    .toast, .toast--out { animation: none; }
  }
`;

class VelinToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._container = null;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${styles}</style>`;
    this._container = this.shadowRoot;
    this.setAttribute('role', 'status');
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-atomic', 'true');
  }

  show({ message, type = 'info', duration = 5000 } = {}) {
    const assertive = type === 'error' || type === 'danger';
    this.setAttribute('role', assertive ? 'alert' : 'status');
    this.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', assertive ? 'alert' : 'status');
    toast.innerHTML = `
      <div class="toast-content">${escapeHTML(message)}</div>
      <button class="toast-close" aria-label="Close">&#215;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this._dismiss(toast);
    });

    this._container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this._dismiss(toast), duration);
    }

    return toast;
  }

  _dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 300);
  }
}

customElements.define('velin-toast', VelinToast);
export default VelinToast;
