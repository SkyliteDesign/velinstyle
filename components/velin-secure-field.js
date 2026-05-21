import { escapeHTML, escapeHTMLAttribute, sanitizeInputType } from './sanitize.js';

const styles = `
  :host { display: block; }
  label { display: block; font-size: var(--velin-text-sm); margin-block-end: var(--velin-space-1); }
  input {
    width: 100%;
    min-height: 2.75rem;
    padding: var(--velin-space-2) var(--velin-space-3);
    font: inherit;
    border: 1px solid var(--velin-color-border);
    border-radius: var(--velin-radius-md);
  }
  input:focus-visible {
    outline: 3px solid var(--velin-color-focus);
    outline-offset: 2px;
  }
  .velin-field-help {
    font-size: var(--velin-text-xs);
    color: var(--velin-color-text-muted);
    margin-block-start: var(--velin-space-1);
  }
`;

async function encryptValue(plain, mode) {
  if (mode !== 'aes-gcm' || !globalThis.crypto?.subtle) {
    return JSON.stringify({ encoding: 'base64', payload: btoa(unescape(encodeURIComponent(plain))) });
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const encoded = new TextEncoder().encode(plain);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return JSON.stringify({
    encoding: 'aes-gcm',
    iv: Array.from(iv),
    cipher: Array.from(new Uint8Array(cipher)),
  });
}

class VelinSecureField extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'name', 'label', 'mode', 'autocomplete'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onChange = null;
  }

  connectedCallback() {
    if (!this._onChange) this.render();
  }

  disconnectedCallback() {
    const input = this.shadowRoot?.querySelector('input');
    if (input && this._onChange) input.removeEventListener('change', this._onChange);
    this._onChange = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const type = sanitizeInputType(this.getAttribute('type'));
    const name = this.getAttribute('name') || 'secure';
    const label = this.getAttribute('label') || 'Secure field';
    const autocomplete = escapeHTMLAttribute(this.getAttribute('autocomplete') || 'off');
    const id = `velin-secure-${Math.random().toString(36).slice(2, 9)}`;

    const input = this.shadowRoot?.querySelector('input');
    if (input && this._onChange) input.removeEventListener('change', this._onChange);

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <label for="${id}">${escapeHTML(label)}</label>
      <input id="${id}" type="${type}" autocomplete="${autocomplete}" part="input" />
      <p class="velin-field-help">Demo-only client encoding — use HTTPS and server-side crypto for real secrets.</p>
    `;

    const newInput = this.shadowRoot.querySelector('input');
    this._onChange = async () => {
      const mode = this.getAttribute('mode') || 'aes-gcm';
      const payload = await encryptValue(newInput.value, mode);
      this.dispatchEvent(new CustomEvent('velin-secure-submit', {
        bubbles: true,
        detail: { name, payload },
      }));
    };
    newInput.addEventListener('change', this._onChange);
  }
}

if (!customElements.get('velin-secure-field')) {
  customElements.define('velin-secure-field', VelinSecureField);
}

export default VelinSecureField;
