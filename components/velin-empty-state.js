const styles = `
  :host {
    display: block;
    text-align: center;
    padding: var(--velin-space-8, 2rem) var(--velin-space-4, 1rem);
  }
  .illustration {
    display: flex;
    justify-content: center;
    margin-block-end: var(--velin-space-4, 1rem);
    color: var(--velin-color-text-muted, #666);
  }
  .title {
    margin: 0 0 var(--velin-space-2, 0.5rem);
    font-size: var(--velin-text-xl, 1.25rem);
    font-weight: var(--velin-weight-bold, 700);
    color: var(--velin-color-text, #111);
  }
  .description {
    margin: 0 0 var(--velin-space-4, 1rem);
    color: var(--velin-color-text-muted, #666);
    max-inline-size: 36rem;
    margin-inline: auto;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--velin-space-3, 0.75rem);
    justify-content: center;
  }
`;

class VelinEmptyState extends HTMLElement {
  static get observedAttributes() {
    return ['heading', 'description'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot.querySelector('.root')) {
      this._syncText();
      return;
    }
    const titleId = 'velin-empty-title';
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <section class="root" part="root" role="status" aria-labelledby="${titleId}">
        <div class="illustration" part="illustration"><slot name="illustration"></slot></div>
        <h2 class="title" id="${titleId}" part="title">
          <slot name="title"><span class="heading-fallback"></span></slot>
        </h2>
        <div class="description" part="description">
          <slot name="description"><span class="description-fallback"></span></slot>
        </div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
        <slot></slot>
      </section>
    `;
    this._syncText();
  }

  attributeChangedCallback() {
    this._syncText();
  }

  _syncText() {
    const heading = this.shadowRoot?.querySelector('.heading-fallback');
    const description = this.shadowRoot?.querySelector('.description-fallback');
    if (heading) heading.textContent = this.getAttribute('heading') || 'Nothing here yet';
    if (description) {
      const text = this.getAttribute('description') || '';
      description.textContent = text;
      description.hidden = !text;
    }
  }
}

customElements.define('velin-empty-state', VelinEmptyState);
export default VelinEmptyState;
