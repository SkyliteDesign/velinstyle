import { SHADOW_A11Y_STYLES } from './shadow-a11y-styles.js';

/**
 * Heuristic password strength meter (same scoring as Atelier showcases).
 * Not a substitute for server-side policy or entropy libraries.
 */
export function scorePassword(pw) {
  const value = String(pw || '');
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  const labels = ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent', 'Excellent'];
  return {
    score,
    label: labels[score] || 'Too weak',
    pct: Math.min(100, score * 20),
  };
}

const styles = `
  ${SHADOW_A11Y_STYLES}
  :host { display: block; }
  .wrap { display: grid; gap: var(--velin-space-2, 0.5rem); }
  .meter {
    inline-size: 100%;
    block-size: 0.5rem;
    background: var(--velin-color-surface-dim, #eee);
    border-radius: var(--velin-radius-full, 999px);
    overflow: hidden;
  }
  .bar {
    block-size: 100%;
    inline-size: 0%;
    border-radius: inherit;
    background: var(--velin-color-danger, #dc2626);
    transition: inline-size 160ms ease, background-color 160ms ease;
  }
  :host([data-score="2"]) .bar,
  :host([data-score="3"]) .bar { background: var(--velin-color-warning, #f59e0b); }
  :host([data-score="4"]) .bar,
  :host([data-score="5"]) .bar { background: var(--velin-color-success, #16a34a); }
  .label {
    margin: 0;
    font-size: var(--velin-text-sm, 0.875rem);
    color: var(--velin-color-text-muted, #666);
  }
  @media (prefers-reduced-motion: reduce) {
    .bar { transition: none; }
  }
`;

class VelinPasswordStrength extends HTMLElement {
  static get observedAttributes() {
    return ['for', 'value', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onTargetInput = this._onTargetInput.bind(this);
    this._target = null;
  }

  connectedCallback() {
    if (!this.shadowRoot.querySelector('.wrap')) {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <div class="wrap" part="wrap">
          <div class="meter" part="meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="bar" part="bar"></div>
          </div>
          <p class="label" part="label" aria-live="polite"></p>
        </div>
      `;
    }
    this._bindTarget();
    this._render(this._currentValue());
  }

  disconnectedCallback() {
    this._unbindTarget();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'for') {
      this._bindTarget();
      this._render(this._currentValue());
    } else if (name === 'value' || name === 'label') {
      this._render(this._currentValue());
    }
  }

  _currentValue() {
    if (this._target) return this._target.value || '';
    return this.getAttribute('value') || '';
  }

  _unbindTarget() {
    if (this._target) {
      this._target.removeEventListener('input', this._onTargetInput);
      this._target = null;
    }
  }

  _bindTarget() {
    this._unbindTarget();
    const id = this.getAttribute('for');
    if (!id || typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el && 'value' in el) {
      this._target = el;
      this._target.addEventListener('input', this._onTargetInput);
    }
  }

  _onTargetInput(e) {
    this._render(e.target.value || '');
  }

  _render(pw) {
    const result = scorePassword(pw);
    const meter = this.shadowRoot?.querySelector('.meter');
    const bar = this.shadowRoot?.querySelector('.bar');
    const label = this.shadowRoot?.querySelector('.label');
    if (!meter || !bar || !label) return;

    bar.style.inlineSize = `${result.pct}%`;
    meter.setAttribute('aria-valuenow', String(result.pct));
    meter.setAttribute('aria-valuetext', result.label);
    const prefix = this.getAttribute('label');
    label.textContent = prefix ? `${prefix}: ${result.label}` : result.label;
    this.setAttribute('data-score', String(result.score));

    this.dispatchEvent(new CustomEvent('velin-strength', {
      bubbles: true,
      composed: true,
      detail: result,
    }));
  }
}

customElements.define('velin-password-strength', VelinPasswordStrength);
export default VelinPasswordStrength;
