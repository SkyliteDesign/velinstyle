import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: inline-flex; font-variant-numeric: tabular-nums; }
  .wrap { display: inline-flex; gap: var(--velin-space-3, 0.75rem); align-items: flex-start; }
  .segment {
    display: flex; flex-direction: column; align-items: center;
    min-width: 3.5rem;
  }
  .value {
    font-size: var(--velin-text-3xl, 1.953rem);
    font-weight: var(--velin-weight-bold, 700);
    line-height: 1;
    color: var(--velin-color-text, #1a1a2e);
  }
  .label {
    font-size: var(--velin-text-xs, 0.75rem);
    color: var(--velin-color-text-muted, #888);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: var(--velin-space-1, 0.25rem);
  }
  .separator {
    font-size: var(--velin-text-2xl, 1.563rem);
    font-weight: 700;
    color: var(--velin-color-text-muted, #888);
    align-self: flex-start;
    padding-top: 0.2em;
  }
  :host([size="sm"]) .value { font-size: var(--velin-text-xl, 1.25rem); }
  :host([size="sm"]) .segment { min-width: 2.5rem; }
  :host([size="lg"]) .value { font-size: var(--velin-text-5xl, 3.052rem); }
`;

class VelinCountdown extends HTMLElement {
  static get observedAttributes() { return ['datetime']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timer = null;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${styles}</style><div class="wrap"></div>`;
    this._wrap = this.shadowRoot.querySelector('.wrap');
    this.setAttribute('role', 'timer');
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-atomic', 'true');
    this._start();
  }

  _start() {
    this._update();
    this._timer = setInterval(() => this._update(), 1000);
  }

  _update() {
    const target = new Date(this.getAttribute('datetime')).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const showDays = this.getAttribute('show-days') !== 'false';

    const lDays = escapeHTML(this.getAttribute('label-days') || 'Days');
    const lHours = escapeHTML(this.getAttribute('label-hours') || 'Hours');
    const lMin = escapeHTML(this.getAttribute('label-minutes') || 'Min');
    const lSec = escapeHTML(this.getAttribute('label-seconds') || 'Sec');

    let html = '';
    if (showDays) html += `<div class="segment" part="days"><span class="value">${pad(days)}</span><span class="label">${lDays}</span></div><span class="separator">:</span>`;
    html += `<div class="segment" part="hours"><span class="value">${pad(hours)}</span><span class="label">${lHours}</span></div><span class="separator">:</span>`;
    html += `<div class="segment" part="minutes"><span class="value">${pad(minutes)}</span><span class="label">${lMin}</span></div><span class="separator">:</span>`;
    html += `<div class="segment" part="seconds"><span class="value">${pad(seconds)}</span><span class="label">${lSec}</span></div>`;

    if (this._wrap) {
      this._wrap.innerHTML = html;
    }

    const ariaText = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`;
    this.setAttribute('aria-label', ariaText);

    if (diff <= 0) {
      clearInterval(this._timer);
      this.dispatchEvent(new CustomEvent('velin-countdown-end', { bubbles: true }));
    }
  }

  disconnectedCallback() { if (this._timer) clearInterval(this._timer); }

  attributeChangedCallback() { if (this._timer) { clearInterval(this._timer); this._start(); } }
}

customElements.define('velin-countdown', VelinCountdown);
export default VelinCountdown;
