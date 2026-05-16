const styles = `
  :host { display: block; position: relative; overflow: hidden; }
  .track {
    display: flex; transition: transform 400ms ease;
    touch-action: pan-y pinch-zoom;
  }
  ::slotted(*) {
    flex: 0 0 100%; min-width: 0;
  }
  .controls {
    position: absolute; inset: 0; display: flex;
    align-items: center; justify-content: space-between;
    pointer-events: none; padding-inline: var(--velin-space-2, 0.5rem);
  }
  button {
    pointer-events: auto; display: inline-flex; align-items: center; justify-content: center;
    min-width: 2.75rem; min-height: 2.75rem; padding: 0.5rem;
    background: var(--velin-color-surface-bright, #fff); color: var(--velin-color-text, #111);
    border: 1px solid var(--velin-color-border, #ddd); border-radius: var(--velin-radius-full, 50%);
    cursor: pointer; box-shadow: var(--velin-shadow-md, 0 4px 6px rgba(0,0,0,0.07));
    opacity: 0.9; transition: opacity 150ms ease;
  }
  button:hover { opacity: 1; }
  button:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  button:disabled { opacity: 0.3; cursor: not-allowed; }
  svg { width: 1.25rem; height: 1.25rem; }
  .indicators {
    display: flex; justify-content: center; align-items: center; gap: var(--velin-space-2, 0.5rem);
    padding-block: var(--velin-space-3, 0.75rem);
  }
  .pause-btn {
    font-size: var(--velin-text-xs, 0.75rem);
    padding-inline: var(--velin-space-3, 0.75rem);
    min-inline-size: auto;
    border-radius: var(--velin-radius-md, 0.375rem);
  }
  .dot {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 2.75rem; min-height: 2.75rem;
    background: none; border: none; padding: 0; cursor: pointer;
    border-radius: var(--velin-radius-full, 50%);
  }
  .dot::before {
    content: ""; display: block;
    width: 0.5rem; height: 0.5rem; border-radius: 50%;
    background: var(--velin-color-border, #ccc);
    transition: background 200ms ease, transform 200ms ease;
  }
  .dot[aria-current="true"]::before { background: var(--velin-color-primary, #2563eb); transform: scale(1.3); }
  .dot:focus-visible { outline: 2px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .track { transition: none; } }
`;

class VelinCarousel extends HTMLElement {
  static get observedAttributes() { return ['autoplay', 'interval']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._index = 0;
    this._timer = null;
    this._startX = 0;
    this._autoplayPaused = false;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="track" role="group" aria-roledescription="carousel" part="track"><slot></slot></div>
      <div class="controls" part="controls">
        <button class="prev" aria-label="Previous slide" part="prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="next" aria-label="Next slide" part="next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      </div>
      <div class="indicators" role="group" aria-label="Slide indicators" part="indicators"></div>
    `;

    this.shadowRoot.querySelector('.prev').addEventListener('click', () => this.prev());
    this.shadowRoot.querySelector('.next').addEventListener('click', () => this.next());

    const track = this.shadowRoot.querySelector('.track');
    track.addEventListener('touchstart', (e) => { this._startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = this._startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    });

    this.addEventListener('mouseenter', () => this._pause());
    this.addEventListener('mouseleave', () => this._resume());
    this.addEventListener('focusin', () => this._pause());
    this.addEventListener('focusout', () => this._resume());

    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { this.prev(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { this.next(); e.preventDefault(); }
      else if (e.key === 'Home') { this.goTo(0); e.preventDefault(); }
      else if (e.key === 'End') { this.goTo(this._count - 1); e.preventDefault(); }
    });

    if (!this.hasAttribute('role')) this.setAttribute('role', 'region');
    this.setAttribute('aria-roledescription', 'carousel');

    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => { this._buildDots(); this._update(); });

    if (this.hasAttribute('autoplay')) this._startAutoplay();
  }

  get _slides() { return this.shadowRoot.querySelector('slot').assignedElements(); }
  get _count() { return this._slides.length; }

  prev() { this._index = (this._index - 1 + this._count) % this._count; this._update(); this._emit(); }
  next() { this._index = (this._index + 1) % this._count; this._update(); this._emit(); }
  goTo(i) { this._index = Math.max(0, Math.min(i, this._count - 1)); this._update(); this._emit(); }

  _update() {
    const track = this.shadowRoot.querySelector('.track');
    track.style.transform = `translateX(-${this._index * 100}%)`;
    this._slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== this._index ? 'true' : 'false');
      s.inert = i !== this._index;
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', `Slide ${i + 1} of ${this._count}`);
    });
    this.shadowRoot.querySelectorAll('.dot').forEach((d, i) => {
      d.setAttribute('aria-current', i === this._index ? 'true' : 'false');
    });
  }

  _buildDots() {
    const c = this.shadowRoot.querySelector('.indicators');
    c.innerHTML = '';
    this._slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot';
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => this.goTo(i));
      c.appendChild(d);
    });
    if (this.hasAttribute('autoplay')) {
      const pause = document.createElement('button');
      pause.type = 'button';
      pause.className = 'pause-btn';
      pause.setAttribute('aria-pressed', 'false');
      pause.setAttribute('aria-label', 'Pause automatic slide show');
      pause.textContent = 'Pause';
      pause.addEventListener('click', () => this._toggleAutoplayPause(pause));
      c.appendChild(pause);
    }
    this._update();
  }

  _toggleAutoplayPause(btn) {
    this._autoplayPaused = !this._autoplayPaused;
    if (this._autoplayPaused) {
      this._pause();
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Resume automatic slide show');
      btn.textContent = 'Play';
    } else {
      this._resume();
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Pause automatic slide show');
      btn.textContent = 'Pause';
    }
  }

  _emit() { this.dispatchEvent(new CustomEvent('velin-slide-change', { bubbles: true, detail: { index: this._index } })); }
  _startAutoplay() { const ms = parseInt(this.getAttribute('interval') || '5000', 10); this._timer = setInterval(() => this.next(), ms); }
  _pause() { if (this._timer) { clearInterval(this._timer); this._timer = null; } }
  _resume() {
    if (this.hasAttribute('autoplay') && !this._timer && !this._autoplayPaused) this._startAutoplay();
  }

  disconnectedCallback() { this._pause(); }
}

customElements.define('velin-carousel', VelinCarousel);
export default VelinCarousel;
