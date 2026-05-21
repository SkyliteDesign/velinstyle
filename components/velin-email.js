import { escapeHTML, escapeHTMLAttribute } from './sanitize.js';

const styles = `
  :host { display: inline; }
  button {
    font: inherit;
    color: var(--velin-color-primary, #4338ca);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 0.15em;
    min-height: 2.75rem;
    min-width: 2.75rem;
  }
  button:focus-visible {
    outline: 3px solid var(--velin-color-focus, #2563eb);
    outline-offset: 2px;
    border-radius: 2px;
  }
  .revealed { text-decoration: none; user-select: text; }
`;

function decodeObfuscated(raw, method) {
  if (!raw) return '';
  if (method === 'rot13') {
    return raw.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  }
  try {
    return atob(raw);
  } catch {
    return raw;
  }
}

class VelinEmail extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'obfuscate', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._revealed = false;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  get email() {
    const method = this.getAttribute('obfuscate') || '';
    const raw = this.getAttribute('value') || '';
    return method ? decodeObfuscated(raw, method) : raw;
  }

  render() {
    const label = this.getAttribute('label') || 'Show email address';
    const email = this.email;
    const safeEmail = escapeHTML(email);

    if (this._revealed) {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <span class="revealed" part="email"><a href="mailto:${escapeHTMLAttribute(email)}">${safeEmail}</a></span>
      `;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <button type="button" part="reveal" aria-label="${escapeHTMLAttribute(label)}">${escapeHTML(label)}</button>
    `;
    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this._revealed = true;
      this.render();
      this.dispatchEvent(new CustomEvent('velin-email-reveal', { bubbles: true, detail: { email } }));
    });
  }
}

if (!customElements.get('velin-email')) {
  customElements.define('velin-email', VelinEmail);
}

export default VelinEmail;
