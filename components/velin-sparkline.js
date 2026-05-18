/*
 * <velin-sparkline values="1,3,2,5,7,6,9" area glow animate="draw">
 *
 * Tiny inline-SVG line chart for KPI tiles, live dashboards, and "this week"
 * trends. Renders into light DOM (no Shadow) so theme tokens cascade in for
 * stroke color via `currentColor`. Animates the stroke draw-in once on mount
 * using the chart-animation utility classes; calling `update(values)` swaps
 * the path and runs a short value-bump on the host.
 *
 * Attributes:
 *   values    CSV or JSON-array of numbers
 *   width     viewBox width (default 320)
 *   height    viewBox height (default 96)
 *   min/max   clamp range (optional; otherwise derived from values)
 *   area      truthy enables the gradient area fill
 *   glow      truthy enables continuous drop-shadow pulse
 *   animate   "draw" (default) or "none"
 *   label     accessible label; sets role=img + aria-label
 *
 * Public API:
 *   element.update(values: number[]): replaces the path with a new dataset.
 *   element.values: number[] reflect getter/setter.
 */

const NS = 'http://www.w3.org/2000/svg';

function parseValues(raw) {
  if (!raw) return [];
  const trimmed = String(raw).trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.map(Number).filter((n) => Number.isFinite(n)) : [];
    } catch {
      return [];
    }
  }
  return trimmed
    .split(/[\s,]+/)
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n));
}

function buildPoints(values, w, h, min, max) {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) {
    return [[0, h / 2], [w, h / 2]];
  }
  const range = Math.max(max - min, 1e-6);
  const stepX = w / (n - 1);
  return values.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * h;
    return [x, y];
  });
}

function pointsToPath(points) {
  if (!points.length) return '';
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
}

function pointsToArea(points, h) {
  if (!points.length) return '';
  const line = pointsToPath(points);
  const last = points[points.length - 1][0];
  const first = points[0][0];
  return `${line} L${last.toFixed(2)},${h} L${first.toFixed(2)},${h} Z`;
}

class VelinSparkline extends HTMLElement {
  static get observedAttributes() {
    return ['values', 'width', 'height', 'min', 'max', 'area', 'glow', 'animate', 'label'];
  }

  constructor() {
    super();
    this._values = [];
    this._gradientId = `velin-spark-grad-${Math.random().toString(36).slice(2, 8)}`;
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  get values() {
    return this._values.slice();
  }
  set values(arr) {
    if (!Array.isArray(arr)) return;
    this._values = arr.filter((n) => Number.isFinite(Number(n))).map(Number);
    this.setAttribute('values', this._values.join(','));
  }

  update(values) {
    if (!Array.isArray(values)) return;
    this._values = values.filter((n) => Number.isFinite(Number(n))).map(Number);
    this._render({ tick: true });
  }

  _render({ tick = false } = {}) {
    const w = Number.parseFloat(this.getAttribute('width')) || 320;
    const h = Number.parseFloat(this.getAttribute('height')) || 96;
    const values = this._values.length ? this._values : parseValues(this.getAttribute('values'));
    this._values = values;
    if (!values.length) {
      this.innerHTML = '';
      return;
    }
    const minAttr = Number.parseFloat(this.getAttribute('min'));
    const maxAttr = Number.parseFloat(this.getAttribute('max'));
    const min = Number.isFinite(minAttr) ? minAttr : Math.min(...values);
    const max = Number.isFinite(maxAttr) ? maxAttr : Math.max(...values);

    const wantsArea = this.hasAttribute('area') && this.getAttribute('area') !== 'false';
    const wantsGlow = this.hasAttribute('glow') && this.getAttribute('glow') !== 'false';
    const animate = (this.getAttribute('animate') || 'draw').toLowerCase();
    const label = this.getAttribute('label');

    const points = buildPoints(values, w, h, min, max);
    const linePath = pointsToPath(points);
    const areaPath = wantsArea ? pointsToArea(points, h) : '';

    this.innerHTML = '';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = '100%';
    if (label) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', label);
    } else {
      svg.setAttribute('aria-hidden', 'true');
    }

    if (wantsArea) {
      const defs = document.createElementNS(NS, 'defs');
      const grad = document.createElementNS(NS, 'linearGradient');
      grad.setAttribute('id', this._gradientId);
      grad.setAttribute('x1', '0');
      grad.setAttribute('x2', '0');
      grad.setAttribute('y1', '0');
      grad.setAttribute('y2', '1');
      const stops = [
        ['0%', 'currentColor', '0.35'],
        ['100%', 'currentColor', '0'],
      ];
      stops.forEach(([offset, color, op]) => {
        const stop = document.createElementNS(NS, 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        stop.setAttribute('stop-opacity', op);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      const area = document.createElementNS(NS, 'path');
      area.setAttribute('d', areaPath);
      area.setAttribute('fill', `url(#${this._gradientId})`);
      area.setAttribute('stroke', 'none');
      area.classList.add('velin-chart-area');
      svg.appendChild(area);
    }

    const line = document.createElementNS(NS, 'path');
    line.setAttribute('d', linePath);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', 'currentColor');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(line);
    if (wantsGlow) svg.classList.add('velin-chart-glow');

    this.appendChild(svg);

    if (animate !== 'none') {
      const len = (typeof line.getTotalLength === 'function' && line.getTotalLength()) || w;
      line.style.setProperty('--velin-chart-len', len.toFixed(2));
      line.classList.add('velin-chart-line');
    } else {
      line.style.strokeDasharray = '';
      line.style.strokeDashoffset = '';
    }

    if (tick) {
      this.classList.remove('velin-spark-tick');
      void this.offsetWidth;
      this.classList.add('velin-spark-tick');
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('velin-sparkline')) {
  customElements.define('velin-sparkline', VelinSparkline);
}

export default VelinSparkline;
