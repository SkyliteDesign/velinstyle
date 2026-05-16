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

let collapseId = 0;

function isButtonLike(el) {
  const tag = el.tagName;
  return tag === 'BUTTON' || (tag === 'A' && el.hasAttribute('href')) || el.getAttribute('role') === 'button';
}

class VelinCollapse extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._contentId = `velin-collapse-panel-${++collapseId}`;
    this._onTriggerKey = this._onTriggerKey.bind(this);
  }

  connectedCallback() {
    const panelId = this._contentId;
    this.shadowRoot.innerHTML =
      '<style>' + styles + '</style>' +
      '<slot name="trigger"></slot>' +
      '<div class="content" id="' + panelId + '" part="content">' +
      '<div class="inner"><slot></slot></div>' +
      '</div>';

    const triggerSlot = this.shadowRoot.querySelector('slot[name="trigger"]');
    triggerSlot.addEventListener('slotchange', () => this._wireTrigger());
    this._wireTrigger();
  }

  _wireTrigger() {
    const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
    if (!trigger) return;

    if (!isButtonLike(trigger)) {
      trigger.setAttribute('role', 'button');
      if (!trigger.hasAttribute('tabindex')) trigger.setAttribute('tabindex', '0');
    }

    trigger.setAttribute('aria-controls', this._contentId);
    trigger.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');

    trigger.removeEventListener('click', this._onClick);
    trigger.removeEventListener('keydown', this._onTriggerKey);
    this._onClick = () => this.toggle();
    trigger.addEventListener('click', this._onClick);
    trigger.addEventListener('keydown', this._onTriggerKey);
  }

  _onTriggerKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggle();
    }
  }

  attributeChangedCallback(name) {
    if (name === 'open') {
      const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
      if (trigger) trigger.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
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
