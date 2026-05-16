const styles = `
  :host {
    display: block;
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    overflow: hidden;
  }
  ::slotted(details) {
    border-bottom: 1px solid var(--velin-color-border, #ddd);
  }
  ::slotted(details:last-child) {
    border-bottom: none;
  }
  ::slotted(details > summary) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--velin-space-4, 1rem);
    min-block-size: 2.75rem;
    font-size: var(--velin-text-base, 1rem);
    font-weight: var(--velin-weight-medium, 500);
    cursor: pointer;
    user-select: none;
    list-style: none;
  }
  ::slotted(details > summary::-webkit-details-marker) {
    display: none;
  }
`;

class VelinAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onToggle = this._onToggle.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot></slot>
    `;

    this._exclusive = this.hasAttribute('exclusive');
    this._wireDetails();

    this.addEventListener('toggle', this._onToggle, true);
    this.addEventListener('keydown', this._onKeydown.bind(this));
  }

  _wireDetails() {
    let panelIndex = 0;
    for (const details of this.querySelectorAll('details')) {
      const summary = details.querySelector('summary');
      const panel = details.querySelector(':scope > :not(summary)');
      const panelId = panel?.id || `velin-accordion-panel-${++panelIndex}`;
      if (panel && !panel.id) panel.id = panelId;
      if (summary && panel) {
        summary.setAttribute('aria-controls', panelId);
      }
    }
  }

  _onToggle(event) {
    if (!this._exclusive) return;
    const openedDetail = event.target;
    if (!openedDetail.open) return;

    const details = [...this.querySelectorAll('details')];
    details.forEach((d) => {
      if (d !== openedDetail && d.open) {
        d.open = false;
      }
    });
  }

  _onKeydown(event) {
    const summaries = [...this.querySelectorAll('summary')];
    const currentIndex = summaries.indexOf(event.target);
    if (currentIndex === -1) return;

    let nextIndex;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % summaries.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + summaries.length) % summaries.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = summaries.length - 1;
        break;
      default:
        return;
    }
    summaries[nextIndex].focus();
  }

  disconnectedCallback() {
    this.removeEventListener('toggle', this._onToggle, true);
  }
}

customElements.define('velin-accordion', VelinAccordion);
export default VelinAccordion;
