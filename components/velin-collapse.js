const styles = `
  :host { display: block; }
  .content {
    overflow: hidden;
    transition: grid-template-rows 300ms ease;
    display: grid;
    grid-template-rows: 0fr;
  }
  :host([open]) .content { grid-template-rows: 1fr; }
  .inner { min-height: 0; }
  @media (prefers-reduced-motion: reduce) { .content { transition: none; } }
`;

class VelinCollapse extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot name="trigger"></slot>
      <div class="content" role="region" part="content">
        <div class="inner"><slot></slot></div>
      </div>
    `;

    const triggerSlot = this.shadowRoot.querySelector('slot[name="trigger"]');
    triggerSlot.addEventListener('slotchange', () => {
      const trigger = triggerSlot.assignedElements()[0];
      if (trigger) {
        trigger.addEventListener('click', () => this.toggle());
        trigger.setAttribute('aria-expanded', this.hasAttribute('open'));
      }
    });
  }

  attributeChangedCallback(name) {
    if (name === 'open') {
      const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
      if (trigger) trigger.setAttribute('aria-expanded', this.hasAttribute('open'));
    }
  }

  toggle() {
    if (this.hasAttribute('open')) this.close();
    else this.open();
  }

  open() {
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('velin-open', { bubbles: true }));
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('velin-close', { bubbles: true }));
  }
}

customElements.define('velin-collapse', VelinCollapse);
export default VelinCollapse;
