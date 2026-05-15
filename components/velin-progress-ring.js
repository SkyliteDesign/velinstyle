const styles = `
  :host { display: inline-flex; align-items: center; justify-content: center; }
  svg { transform: rotate(-90deg); }
  .track { fill: none; stroke: var(--velin-color-border, #e5e5e5); }
  .fill {
    fill: none;
    stroke: var(--velin-progress-ring-color, var(--velin-color-primary, #2563eb));
    stroke-linecap: round;
    transition: stroke-dashoffset 400ms ease;
  }
  .label {
    position: absolute;
    font-size: var(--velin-text-lg, 1.125rem);
    font-weight: var(--velin-weight-semibold, 600);
    color: var(--velin-color-text, #1a1a2e);
  }
  :host { position: relative; }
  @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }
`;

class VelinProgressRing extends HTMLElement {
  static get observedAttributes() { return ['value', 'size', 'stroke', 'color']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }

  _render() {
    const value = Math.min(100, Math.max(0, parseInt(this.getAttribute('value') || '0', 10)));
    const size = parseInt(this.getAttribute('size') || '120', 10);
    const strokeWidth = parseInt(this.getAttribute('stroke') || '8', 10);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = this.getAttribute('color');
    const colorStyle = color ? `stroke: var(--velin-color-${color}, ${color});` : '';
    const showLabel = this.getAttribute('label') !== 'false';

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" part="svg" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100">
        <circle class="track" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}" />
        <circle class="fill" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          style="${colorStyle}" part="fill" />
      </svg>
      ${showLabel ? `<span class="label" part="label">${value}%</span>` : ''}
    `;
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuenow', value);
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    this.setAttribute('aria-label', this.getAttribute('aria-label') || `${value}%`);
  }

  attributeChangedCallback() { this._render(); }
}

customElements.define('velin-progress-ring', VelinProgressRing);
export default VelinProgressRing;
