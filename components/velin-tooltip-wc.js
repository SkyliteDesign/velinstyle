import { escapeHTML } from './sanitize.js';

const styles = `
  :host { position: relative; display: inline-block; }
  .tip {
    position: absolute; z-index: var(--velin-z-tooltip, 700);
    padding: var(--velin-space-2, 0.5rem) var(--velin-space-3, 0.75rem);
    font-size: var(--velin-text-sm, 0.875rem);
    color: var(--velin-color-on-primary, #fff);
    background: var(--velin-color-text, #1a1a2e);
    border-radius: var(--velin-radius-md, 0.375rem);
    white-space: nowrap; pointer-events: none;
    opacity: 0; transition: opacity 150ms ease;
    max-inline-size: 20rem; white-space: normal;
  }
  :host([visible]) .tip { opacity: 1; }
  .tip[data-placement="top"] { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
  .tip[data-placement="bottom"] { top: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
  .tip[data-placement="start"] { right: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
  .tip[data-placement="end"] { left: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
  @media (prefers-reduced-motion: reduce) { .tip { transition: none; } }
`;

class VelinTooltipWC extends HTMLElement {
  static get observedAttributes() { return ['content', 'placement']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const placement = this.getAttribute('placement') || 'top';
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot></slot>
      <div class="tip" role="tooltip" data-placement="${escapeHTML(placement)}" part="tip">${escapeHTML(this.getAttribute('content') || '')}</div>
    `;

    this.addEventListener('mouseenter', () => this._show());
    this.addEventListener('mouseleave', () => this._hide());
    this.addEventListener('focusin', () => this._show());
    this.addEventListener('focusout', () => this._hide());
    this.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._hide(); });
  }

  _show() {
    this.setAttribute('visible', '');
    this._flip();
  }

  _hide() { this.removeAttribute('visible'); }

  _flip() {
    const tip = this.shadowRoot.querySelector('.tip');
    if (!tip) return;
    const rect = tip.getBoundingClientRect();
    const placement = this.getAttribute('placement') || 'top';
    if (placement === 'top' && rect.top < 0) tip.setAttribute('data-placement', 'bottom');
    else if (placement === 'bottom' && rect.bottom > window.innerHeight) tip.setAttribute('data-placement', 'top');
    else tip.setAttribute('data-placement', placement);
  }

  attributeChangedCallback(name, _, val) {
    const tip = this.shadowRoot?.querySelector('.tip');
    if (!tip) return;
    if (name === 'content') tip.textContent = val;
    if (name === 'placement') tip.setAttribute('data-placement', val);
  }
}

customElements.define('velin-tooltip-wc', VelinTooltipWC);
export default VelinTooltipWC;
