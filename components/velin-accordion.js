const LIGHT_STYLE_ID = 'velin-accordion-light-css';

/** Light-DOM styles: ::slotted() cannot target descendants of slotted <details>. */
const lightStyles = `
  velin-accordion {
    display: block;
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    overflow: hidden;
  }
  velin-accordion details {
    border-bottom: 1px solid var(--velin-color-border, #ddd);
  }
  velin-accordion details:last-child {
    border-bottom: none;
  }
  velin-accordion details > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--velin-space-3, 0.75rem);
    padding: var(--velin-space-4, 1rem);
    min-block-size: 2.75rem;
    font-size: var(--velin-text-base, 1rem);
    font-weight: var(--velin-weight-medium, 500);
    cursor: pointer;
    user-select: none;
    list-style: none;
  }
  velin-accordion details > summary::-webkit-details-marker {
    display: none;
  }
  velin-accordion details > summary::after {
    content: "";
    flex-shrink: 0;
    inline-size: 0.5rem;
    block-size: 0.5rem;
    border-inline-end: 2px solid currentColor;
    border-block-end: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 150ms ease;
  }
  velin-accordion details[open] > summary {
    background: var(--velin-color-primary-subtle, #eff6ff);
    color: var(--velin-color-primary, #2563eb);
  }
  velin-accordion details[open] > summary::after {
    transform: rotate(225deg);
  }
  velin-accordion details > :not(summary) {
    padding: var(--velin-space-4, 1rem) var(--velin-space-5, 1.25rem);
    background: var(--velin-color-surface-dim, var(--velin-color-bg-subtle, #f8fafc));
    color: var(--velin-color-text-muted, #64748b);
    font-size: var(--velin-text-sm, 0.875rem);
    line-height: 1.6;
    border-block-start: 1px solid var(--velin-color-border, #e2e8f0);
  }
`;

const shadowStyles = `
  :host {
    display: block;
  }
`;

function ensureLightStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(LIGHT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = LIGHT_STYLE_ID;
  style.textContent = lightStyles;
  document.head.appendChild(style);
}

class VelinAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onToggle = this._onToggle.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    ensureLightStyles();
    this.shadowRoot.innerHTML = `
      <style>${shadowStyles}</style>
      <slot></slot>
    `;

    this._exclusive = this.hasAttribute('exclusive');
    this._wireDetails();

    this.addEventListener('toggle', this._onToggle, true);
    this.addEventListener('keydown', this._onKeydown);
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
        summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
      }
      if (summary && !summary.hasAttribute('tabindex')) {
        summary.setAttribute('tabindex', '0');
      }
    }
  }

  _onToggle(event) {
    const openedDetail = event.target;
    if (!(openedDetail instanceof HTMLDetailsElement)) return;

    const summary = openedDetail.querySelector('summary');
    if (summary) {
      summary.setAttribute('aria-expanded', openedDetail.open ? 'true' : 'false');
    }

    if (!this._exclusive || !openedDetail.open) return;

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
      case 'Enter':
      case ' ':
        // Native summary already toggles on Enter/Space; don't double-handle.
        return;
      default:
        return;
    }
    summaries[nextIndex].focus();
  }

  disconnectedCallback() {
    this.removeEventListener('toggle', this._onToggle, true);
    this.removeEventListener('keydown', this._onKeydown);
  }
}

customElements.define('velin-accordion', VelinAccordion);
export default VelinAccordion;
