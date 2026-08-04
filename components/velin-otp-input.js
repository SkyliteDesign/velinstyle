import { escapeHTML } from './sanitize.js';
import { SHADOW_A11Y_STYLES } from './shadow-a11y-styles.js';

const styles = `
  ${SHADOW_A11Y_STYLES}
  :host { display: block; }
  .group {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--velin-space-2, 0.5rem);
  }
  input {
    inline-size: 2.75rem;
    block-size: 2.75rem;
    text-align: center;
    font: inherit;
    font-size: var(--velin-text-lg, 1.25rem);
    font-weight: var(--velin-weight-semibold, 600);
    color: var(--velin-color-text, #111);
    background: var(--velin-color-surface-bright, #fff);
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    padding: 0;
  }
  input:focus-visible {
    outline: 3px solid var(--velin-color-focus, #2563eb);
    outline-offset: 2px;
  }
  input:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  @media (forced-colors: active) {
    input { border: 1px solid ButtonText; }
  }
`;

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

class VelinOtpInput extends HTMLElement {
  static get observedAttributes() {
    return ['length', 'value', 'disabled', 'name', 'autocomplete', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onInput = this._onInput.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onPaste = this._onPaste.bind(this);
    this._onFocus = this._onFocus.bind(this);
  }

  connectedCallback() {
    if (!this.shadowRoot.querySelector('.group')) this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (!this.shadowRoot.querySelector('.group')) return;
    if (name === 'length') this._render();
    else if (name === 'value') this._applyValue(this.getAttribute('value') || '', false);
    else if (name === 'disabled') this._syncDisabled();
    else if (name === 'label' || name === 'autocomplete' || name === 'name') this._syncMeta();
  }

  get value() {
    return this._readValue();
  }

  set value(v) {
    this.setAttribute('value', digitsOnly(v).slice(0, this._length()));
  }

  focus() {
    const inputs = this._inputs();
    const firstEmpty = inputs.find((i) => !i.value) || inputs[0];
    firstEmpty?.focus();
  }

  _length() {
    const n = parseInt(this.getAttribute('length') || '6', 10);
    return Number.isFinite(n) && n > 0 ? Math.min(n, 12) : 6;
  }

  _inputs() {
    return [...(this.shadowRoot?.querySelectorAll('input') || [])];
  }

  _readValue() {
    return this._inputs().map((i) => i.value).join('');
  }

  _render() {
    const len = this._length();
    const label = escapeHTML(this.getAttribute('label') || 'One-time password');
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="group" role="group" aria-label="${label}" part="group"></div>
    `;
    const group = this.shadowRoot.querySelector('.group');
    for (let i = 0; i < len; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.pattern = '[0-9]*';
      input.maxLength = 1;
      input.setAttribute('aria-label', `Digit ${i + 1} of ${len}`);
      input.dataset.index = String(i);
      input.part = 'digit';
      input.addEventListener('input', this._onInput);
      input.addEventListener('keydown', this._onKeydown);
      input.addEventListener('paste', this._onPaste);
      input.addEventListener('focus', this._onFocus);
      group.appendChild(input);
    }
    this._syncMeta();
    this._syncDisabled();
    this._applyValue(this.getAttribute('value') || '', false);
  }

  _syncMeta() {
    const group = this.shadowRoot?.querySelector('.group');
    if (!group) return;
    group.setAttribute('aria-label', this.getAttribute('label') || 'One-time password');
    const autocomplete = this.getAttribute('autocomplete') || 'one-time-code';
    const name = this.getAttribute('name') || '';
    this._inputs().forEach((input, i) => {
      input.autocomplete = i === 0 ? autocomplete : 'off';
      input.name = name ? `${name}-${i + 1}` : '';
    });
  }

  _syncDisabled() {
    const disabled = this.hasAttribute('disabled');
    this._inputs().forEach((input) => {
      input.disabled = disabled;
    });
  }

  _applyValue(raw, emit) {
    const digits = digitsOnly(raw).slice(0, this._length()).split('');
    const inputs = this._inputs();
    inputs.forEach((input, i) => {
      input.value = digits[i] || '';
    });
    if (emit) this._emit();
  }

  _emit() {
    const value = this._readValue();
    if (this.getAttribute('value') !== value) {
      this.setAttribute('value', value);
    }
    this.dispatchEvent(new CustomEvent('velin-change', {
      bubbles: true,
      composed: true,
      detail: { value },
    }));
    if (value.length === this._length()) {
      this.dispatchEvent(new CustomEvent('velin-complete', {
        bubbles: true,
        composed: true,
        detail: { value },
      }));
    }
  }

  _onInput(e) {
    const input = e.target;
    const cleaned = digitsOnly(input.value).slice(-1);
    input.value = cleaned;
    const index = Number(input.dataset.index);
    const inputs = this._inputs();
    if (cleaned && index < inputs.length - 1) inputs[index + 1].focus();
    this._emit();
  }

  _onKeydown(e) {
    const input = e.target;
    const index = Number(input.dataset.index);
    const inputs = this._inputs();
    if (e.key === 'Backspace' && !input.value && index > 0) {
      inputs[index - 1].focus();
      inputs[index - 1].value = '';
      this._emit();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs[index - 1].focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
      inputs[index + 1].focus();
      e.preventDefault();
    }
  }

  _onPaste(e) {
    e.preventDefault();
    const text = digitsOnly(e.clipboardData?.getData('text') || '');
    if (!text) return;
    const index = Number(e.target.dataset.index);
    const inputs = this._inputs();
    const chars = text.split('');
    for (let i = 0; i < chars.length && index + i < inputs.length; i++) {
      inputs[index + i].value = chars[i];
    }
    const next = Math.min(index + chars.length, inputs.length - 1);
    inputs[next]?.focus();
    this._emit();
  }

  _onFocus(e) {
    e.target.select?.();
  }
}

customElements.define('velin-otp-input', VelinOtpInput);
export default VelinOtpInput;
