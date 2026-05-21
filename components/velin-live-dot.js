/*
 * <velin-live-dot status="live">Realtime</velin-live-dot>
 *
 * Tiny status indicator: a coloured dot with an optional concentric pulse
 * (driven by the velin-live-pulse keyframe in chart-animation.css). Slot
 * children render after the dot for an inline "Live - Streaming" label.
 *
 * Attributes:
 *   status   "live" (default) | "paused" | "warning" | "error" | "muted"
 *            Determines dot colour via the CSS custom prop --velin-live-color.
 *   pulse    "true" (default) | "false"   Disables the looped pulse.
 */

import { liveDotLabel } from './a11y-utils.js';

const STATUS_COLORS = {
  live: 'var(--velin-color-success, oklch(60% 0.16 145))',
  paused: 'var(--velin-color-text-muted, oklch(60% 0.02 240))',
  warning: 'var(--velin-color-warning, oklch(75% 0.16 80))',
  error: 'var(--velin-color-danger, oklch(60% 0.2 25))',
  muted: 'var(--velin-color-border, oklch(85% 0.01 240))',
};

const styles = `
  :host {
    display: inline-flex;
    align-items: center;
    gap: var(--velin-space-2, 0.5rem);
    font-size: inherit;
    color: inherit;
    line-height: 1.2;
  }
  .dot {
    inline-size: 0.55rem;
    block-size: 0.55rem;
    border-radius: 50%;
    background: var(--velin-live-color);
    flex-shrink: 0;
  }
  :host([pulse="false"]) .dot { animation: none; }
  :host(:not([pulse="false"])) .dot { animation: velin-live-pulse 1.8s var(--velin-ease-out, ease-out) infinite; }
  @media (prefers-reduced-motion: reduce) {
    .dot { animation: none !important; }
  }
`;

const KEYFRAMES_FALLBACK = `
@keyframes velin-live-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--velin-live-color) 65%, transparent); }
  70% { box-shadow: 0 0 0 0.6rem color-mix(in oklch, var(--velin-live-color) 0%, transparent); }
  100% { box-shadow: 0 0 0 0 transparent; }
}`;

class VelinLiveDot extends HTMLElement {
  static get observedAttributes() {
    return ['status', 'pulse'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this._render();
  }

  _render() {
    const status = this.getAttribute('status') || 'live';
    const color = STATUS_COLORS[status] || STATUS_COLORS.live;
    const label = this.getAttribute('aria-label') || liveDotLabel(status);
    this.setAttribute('role', 'status');
    this.setAttribute('aria-label', label);
    this.style.setProperty('--velin-live-color', color);
    this.shadowRoot.innerHTML = `
      <style>${styles}${KEYFRAMES_FALLBACK}</style>
      <span class="dot" aria-hidden="true"></span><slot></slot>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('velin-live-dot')) {
  customElements.define('velin-live-dot', VelinLiveDot);
}

export default VelinLiveDot;
