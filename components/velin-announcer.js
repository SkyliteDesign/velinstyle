const styles = `
  :host { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
`;

class VelinAnnouncer extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    const live = this.getAttribute('polite') === 'false' ? 'assertive' : 'polite';
    this.shadowRoot.innerHTML =
      '<style>' + styles + '</style>' +
      '<div role="status" aria-live="' + live + '" aria-atomic="true" part="region"></div>';
    this._region = this.shadowRoot.querySelector('[role="status"]');
  }

  announce(message, { assertive = false } = {}) {
    if (!this._region) this.connectedCallback();
    this._region.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    this._region.textContent = '';
    requestAnimationFrame(() => {
      this._region.textContent = typeof message === 'string' ? message : '';
    });
  }

  static announceGlobal(message, options) {
    let el = document.querySelector('velin-announcer');
    if (!el) {
      el = document.createElement('velin-announcer');
      document.body.appendChild(el);
    }
    el.announce(message, options);
  }
}

customElements.define('velin-announcer', VelinAnnouncer);
export default VelinAnnouncer;
