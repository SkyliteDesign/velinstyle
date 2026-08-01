import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: block; max-inline-size: 100%; }
  .cal {
    box-sizing: border-box;
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    background: var(--velin-color-surface, #fff);
    color: var(--velin-color-text, #111);
    padding: var(--velin-space-3, 0.75rem);
    max-inline-size: min(20rem, 100%);
    inline-size: 100%;
  }
  .head {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--velin-space-2, 0.5rem); margin-block-end: var(--velin-space-3, 0.75rem);
  }
  .title { font-weight: var(--velin-weight-semibold, 600); margin: 0; font-size: var(--velin-text-base, 1rem); }
  .nav {
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    min-inline-size: 2.5rem; min-block-size: 2.5rem;
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-sm, 0.25rem);
    background: var(--velin-color-surface-bright, #fff);
    color: inherit; cursor: pointer;
  }
  .nav:focus-visible { outline: 2px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  .grid {
    display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.25rem;
  }
  .dow {
    text-align: center; font-size: var(--velin-text-xs, 0.75rem);
    color: var(--velin-color-text-muted, #64748b); padding-block: 0.25rem;
  }
  .day {
    inline-size: 100%;
    min-inline-size: 0;
    min-block-size: 2.25rem;
    aspect-ratio: 1;
    border: none; border-radius: var(--velin-radius-sm, 0.25rem);
    background: transparent; color: inherit; cursor: pointer;
    font: inherit;
    padding: 0;
  }
  .day[aria-disabled="true"] { opacity: 0.35; cursor: not-allowed; }
  .day[aria-selected="true"] {
    background: var(--velin-color-primary, #2563eb);
    color: var(--velin-color-on-primary, #fff);
  }
  .day:not([aria-disabled="true"]):hover {
    background: var(--velin-color-primary-subtle, #eff6ff);
  }
  .day:focus-visible { outline: 2px solid var(--velin-color-focus, #2563eb); outline-offset: 1px; }
  .out { color: var(--velin-color-text-muted, #94a3b8); }
`;

function iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(v) {
  if (!v) return null;
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

class VelinCalendar extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'min', 'max', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._view = new Date();
    this._view.setDate(1);
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    const selected = parseISO(this.getAttribute('value')) || new Date();
    this._view = new Date(selected.getFullYear(), selected.getMonth(), 1);
    this._render();
  }

  attributeChangedCallback(name, prev, next) {
    if (prev === next || !this.shadowRoot?.querySelector('.cal')) return;
    if (name === 'value' && next) {
      const d = parseISO(next);
      if (d) this._view = new Date(d.getFullYear(), d.getMonth(), 1);
    }
    this._render();
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  set value(v) {
    if (v) this.setAttribute('value', v);
    else this.removeAttribute('value');
  }

  _inRange(d) {
    const min = parseISO(this.getAttribute('min'));
    const max = parseISO(this.getAttribute('max'));
    if (min && d < min) return false;
    if (max && d > max) return false;
    return true;
  }

  _select(d) {
    if (!this._inRange(d)) return;
    const v = iso(d);
    this.setAttribute('value', v);
    this.dispatchEvent(new CustomEvent('velin-change', { bubbles: true, detail: { value: v, date: d } }));
    this._render();
  }

  _shiftMonth(delta) {
    this._view = new Date(this._view.getFullYear(), this._view.getMonth() + delta, 1);
    this._render();
  }

  _onKey(e) {
    const selected = parseISO(this.getAttribute('value')) || new Date();
    let next = new Date(selected);
    switch (e.key) {
      case 'ArrowLeft': next.setDate(next.getDate() - 1); break;
      case 'ArrowRight': next.setDate(next.getDate() + 1); break;
      case 'ArrowUp': next.setDate(next.getDate() - 7); break;
      case 'ArrowDown': next.setDate(next.getDate() + 7); break;
      case 'Home': next = new Date(next.getFullYear(), next.getMonth(), 1); break;
      case 'End': next = new Date(next.getFullYear(), next.getMonth() + 1, 0); break;
      case 'PageUp': next = new Date(next.getFullYear(), next.getMonth() - 1, next.getDate()); break;
      case 'PageDown': next = new Date(next.getFullYear(), next.getMonth() + 1, next.getDate()); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._select(selected);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (!this._inRange(next)) return;
    this._view = new Date(next.getFullYear(), next.getMonth(), 1);
    this.setAttribute('value', iso(next));
    this.dispatchEvent(new CustomEvent('velin-change', { bubbles: true, detail: { value: iso(next), date: next } }));
    this._render();
    this.shadowRoot.querySelector(`[data-iso="${iso(next)}"]`)?.focus();
  }

  _render() {
    const label = escapeHTML(this.getAttribute('label') || 'Choose date');
    const selected = parseISO(this.getAttribute('value'));
    const y = this._view.getFullYear();
    const m = this._view.getMonth();
    const title = this._view.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    const start = new Date(y, m, 1);
    const startDow = (start.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const dows = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    let cells = dows.map((d) => `<div class="dow" aria-hidden="true">${d}</div>`).join('');
    for (let i = 0; i < startDow; i += 1) {
      const d = new Date(y, m, -startDow + i + 1);
      cells += `<button type="button" class="day out" tabindex="-1" data-iso="${iso(d)}" aria-label="${iso(d)}">${d.getDate()}</button>`;
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(y, m, day);
      const id = iso(d);
      const sel = selected && iso(selected) === id;
      const disabled = !this._inRange(d);
      cells += `<button type="button" class="day" data-iso="${id}" aria-label="${id}" aria-selected="${sel ? 'true' : 'false'}" aria-disabled="${disabled ? 'true' : 'false'}" tabindex="${sel ? '0' : '-1'}">${day}</button>`;
    }

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="cal" role="group" aria-label="${label}">
        <div class="head">
          <button type="button" class="nav" data-nav="-1" aria-label="Previous month">‹</button>
          <p class="title" id="cal-title">${escapeHTML(title)}</p>
          <button type="button" class="nav" data-nav="1" aria-label="Next month">›</button>
        </div>
        <div class="grid" role="grid" aria-labelledby="cal-title">${cells}</div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => this._shiftMonth(Number(btn.getAttribute('data-nav'))));
    });
    this.shadowRoot.querySelectorAll('.day').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        const d = parseISO(btn.getAttribute('data-iso'));
        if (d) this._select(d);
      });
      btn.addEventListener('keydown', this._onKey);
    });
  }
}

customElements.define('velin-calendar', VelinCalendar);
export default VelinCalendar;
