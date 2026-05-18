/*
 * <velin-counter from="0" to="61840" duration="900" format="currency" currency="EUR">
 *
 * Animated count-up/down using requestAnimationFrame plus an exponential
 * ease-out for the classic "money fly-in" effect. Renders the current value
 * as text content inside the element (light DOM), so it inherits typography
 * tokens automatically.
 *
 * Attributes:
 *   from        starting value (default 0)
 *   to          target value
 *   duration    ms (default 900)
 *   decimals    fixed decimal places
 *   prefix      string before the number
 *   suffix      string after the number
 *   format      "number" (default) | "currency" | "percent"
 *   currency    ISO code (default EUR), used when format=currency
 *   locale      BCP47 locale (default browser default)
 *   autostart   "false" disables auto-start on connect/intersect
 *
 * Public API:
 *   start(): runs the animation from `from` to `to`.
 *   reset(): jumps back to `from` without animating.
 */

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function buildFormatter(host) {
  const format = (host.getAttribute('format') || 'number').toLowerCase();
  const locale = host.getAttribute('locale') || undefined;
  const decimalsAttr = host.getAttribute('decimals');
  const decimals = decimalsAttr != null ? Math.max(0, Number.parseInt(decimalsAttr, 10) || 0) : null;
  const opts = {};
  if (decimals != null) {
    opts.minimumFractionDigits = decimals;
    opts.maximumFractionDigits = decimals;
  }
  if (format === 'currency') {
    opts.style = 'currency';
    opts.currency = host.getAttribute('currency') || 'EUR';
  } else if (format === 'percent') {
    opts.style = 'percent';
  }
  try {
    return new Intl.NumberFormat(locale, opts);
  } catch {
    return new Intl.NumberFormat(undefined, opts);
  }
}

class VelinCounter extends HTMLElement {
  static get observedAttributes() {
    return ['from', 'to', 'duration', 'decimals', 'prefix', 'suffix', 'format', 'currency', 'locale'];
  }

  constructor() {
    super();
    this._rafId = 0;
    this._started = false;
    this._observer = null;
  }

  connectedCallback() {
    this._render(this._fromValue());
    if (this.getAttribute('autostart') === 'false') return;
    this._scheduleStart();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._rafId);
    this._observer?.disconnect();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'to' || name === 'from') {
      this.start();
    } else {
      this._render(this._lastValue ?? this._toValue());
    }
  }

  _fromValue() {
    return Number.parseFloat(this.getAttribute('from')) || 0;
  }
  _toValue() {
    return Number.parseFloat(this.getAttribute('to')) || 0;
  }
  _duration() {
    return Math.max(0, Number.parseFloat(this.getAttribute('duration')) || 900);
  }

  _scheduleStart() {
    if (this._started) return;
    if (typeof IntersectionObserver === 'undefined') {
      this.start();
      return;
    }
    this._observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.start();
          this._observer.disconnect();
          this._observer = null;
          break;
        }
      }
    }, { threshold: 0.2 });
    this._observer.observe(this);
  }

  start() {
    cancelAnimationFrame(this._rafId);
    this._started = true;
    const from = this._fromValue();
    const to = this._toValue();
    const duration = this._duration();
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || duration === 0) {
      this._render(to);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const value = from + (to - from) * easeOutExpo(t);
      this._render(value);
      if (t < 1) this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  reset() {
    cancelAnimationFrame(this._rafId);
    this._started = false;
    this._render(this._fromValue());
  }

  _render(value) {
    this._lastValue = value;
    const formatter = buildFormatter(this);
    const prefix = this.getAttribute('prefix') || '';
    const suffix = this.getAttribute('suffix') || '';
    this.textContent = `${prefix}${formatter.format(value)}${suffix}`;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('velin-counter')) {
  customElements.define('velin-counter', VelinCounter);
}

export default VelinCounter;
