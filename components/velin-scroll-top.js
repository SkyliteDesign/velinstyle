const styles = `
  :host { position: fixed; inset-block-end: var(--velin-scroll-top-bottom, var(--velin-space-4, 1rem)); inset-inline-end: var(--velin-scroll-top-end, var(--velin-space-4, 1rem)); z-index: var(--velin-z-fixed, 300); }
  button {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 2.75rem; min-height: 2.75rem; padding: 0.625rem;
    background: var(--velin-color-primary, #2563eb); color: var(--velin-color-on-primary, #fff);
    border: none; border-radius: var(--velin-radius-full, 50%);
    cursor: pointer; box-shadow: var(--velin-shadow-lg, 0 10px 15px rgba(0,0,0,0.1));
    opacity: 0; visibility: hidden; transform: translateY(0.5rem);
    transition: opacity 200ms ease, visibility 200ms ease, transform 200ms ease, background 150ms ease;
  }
  button:hover { background: var(--velin-color-primary-hover, #1d4ed8); }
  button:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  :host([visible]) button { opacity: 1; visibility: visible; transform: translateY(0); }
  svg { width: 1.25rem; height: 1.25rem; }
  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
`;

class VelinScrollTop extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onScroll = this._onScroll.bind(this);
  }

  connectedCallback() {
    const threshold = parseInt(this.getAttribute('threshold') || '300', 10);
    this._threshold = threshold;

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <button part="button" aria-label="Scroll to top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
        </svg>
      </button>
    `;

    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._onScroll();
  }

  _onScroll() {
    if (window.scrollY > this._threshold) {
      this.setAttribute('visible', '');
    } else {
      this.removeAttribute('visible');
    }
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._onScroll);
  }
}

customElements.define('velin-scroll-top', VelinScrollTop);
export default VelinScrollTop;
