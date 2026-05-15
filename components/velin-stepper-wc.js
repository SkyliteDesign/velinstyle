import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: block; }
  .steps {
    display: flex; gap: var(--velin-space-2, 0.5rem);
    counter-reset: step;
    margin-block-end: var(--velin-space-6, 1.5rem);
  }
  .step {
    flex: 1; text-align: center; position: relative;
    counter-increment: step;
  }
  .step__marker {
    display: inline-flex; align-items: center; justify-content: center;
    width: 2.5rem; height: 2.5rem; border-radius: 50%;
    border: 2px solid var(--velin-color-border, #ddd);
    background: var(--velin-color-surface-bright, #fff);
    color: var(--velin-color-text-muted, #888);
    font-weight: 600; font-size: 0.875rem;
    transition: all 200ms ease;
  }
  .step.active .step__marker {
    border-color: var(--velin-color-primary, #2563eb);
    background: var(--velin-color-primary, #2563eb);
    color: #fff;
  }
  .step.completed .step__marker {
    border-color: var(--velin-color-success, #16a34a);
    background: var(--velin-color-success, #16a34a);
    color: #fff;
  }
  .step__label {
    display: block; margin-top: 0.5rem;
    font-size: var(--velin-text-sm, 0.875rem);
    color: var(--velin-color-text-muted, #888);
  }
  .step.active .step__label { color: var(--velin-color-primary, #2563eb); font-weight: 600; }
  .step.completed .step__label { color: var(--velin-color-success, #16a34a); }
  .step + .step::before {
    content: ""; position: absolute;
    top: 1.25rem; right: 50%; width: 100%;
    height: 2px; background: var(--velin-color-border, #ddd);
    z-index: -1;
  }
  .step.completed + .step::before,
  .step.active + .step::before { background: var(--velin-color-success, #16a34a); }
  .step.completed + .step.active::before { background: var(--velin-color-primary, #2563eb); }
  .panels ::slotted(*) { display: none; }
  .panels ::slotted([data-active]) { display: block; }
  @media (prefers-reduced-motion: reduce) { .step__marker { transition: none; } }
`;

class VelinStepperWC extends HTMLElement {
  static get observedAttributes() { return ['active']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._current = 0;
  }

  connectedCallback() {
    this._current = parseInt(this.getAttribute('active') || '0', 10);
    this._buildSteps();
  }

  _buildSteps() {
    const labels = (this.getAttribute('labels') || '').split(',').map(s => s.trim());
    const stepsHTML = labels.map((label, i) => {
      const state = i < this._current ? 'completed' : i === this._current ? 'active' : '';
      const marker = i < this._current ? '&#10003;' : (i + 1);
      const ariaCurrent = i === this._current ? ' aria-current="step"' : '';
      return `<div class="step ${state}" role="listitem"${ariaCurrent}><span class="step__marker" aria-hidden="true">${marker}</span><span class="step__label">${escapeHTML(label)}</span></div>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="steps" role="list" aria-label="Progress" part="steps">${stepsHTML}</div>
      <div class="panels" part="panels"><slot></slot></div>
    `;
    this._updatePanels();
  }

  _updatePanels() {
    const panels = this.shadowRoot.querySelector('slot')?.assignedElements() || [];
    panels.forEach((p, i) => {
      if (i === this._current) p.setAttribute('data-active', '');
      else p.removeAttribute('data-active');
    });
  }

  next() {
    const labels = (this.getAttribute('labels') || '').split(',');
    if (this._current < labels.length - 1) {
      this._current++;
      this.setAttribute('active', this._current);
      this._buildSteps();
      this.dispatchEvent(new CustomEvent('velin-step-change', { bubbles: true, detail: { step: this._current } }));
    }
  }

  prev() {
    if (this._current > 0) {
      this._current--;
      this.setAttribute('active', this._current);
      this._buildSteps();
      this.dispatchEvent(new CustomEvent('velin-step-change', { bubbles: true, detail: { step: this._current } }));
    }
  }

  goTo(step) {
    this._current = step;
    this.setAttribute('active', this._current);
    this._buildSteps();
    this.dispatchEvent(new CustomEvent('velin-step-change', { bubbles: true, detail: { step: this._current } }));
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'active' && oldVal !== null && oldVal !== newVal) {
      this._current = parseInt(newVal, 10);
      this._buildSteps();
    }
  }
}

customElements.define('velin-stepper-wc', VelinStepperWC);
export default VelinStepperWC;
