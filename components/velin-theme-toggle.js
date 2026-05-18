const THEMES = [
  { slug: '', label: 'Default (Light)' },
  { slug: 'dark', label: 'Dark' },
  { slug: 'brutalist', label: 'Brutalist' },
  { slug: 'corporate', label: 'Corporate' },
  { slug: 'earth', label: 'Earth' },
  { slug: 'forest', label: 'Forest' },
  { slug: 'midnight', label: 'Midnight' },
  { slug: 'neon', label: 'Neon' },
  { slug: 'nordic', label: 'Nordic' },
  { slug: 'ocean', label: 'Ocean' },
  { slug: 'pastel', label: 'Pastel' },
  { slug: 'retro', label: 'Retro' },
  { slug: 'sharp', label: 'Sharp' },
  { slug: 'soft', label: 'Soft' },
  { slug: 'sunset', label: 'Sunset' },
];

const BUILTIN_THEMES = new Set(['', 'dark']);

const loadedThemeStylesheets = new Set();

function ensureThemeStylesheet(slug, base) {
  if (!slug || BUILTIN_THEMES.has(slug)) return;
  if (loadedThemeStylesheets.has(slug)) return;
  const existing = document.querySelector(`link[data-velin-theme-css="${slug}"]`);
  if (existing) {
    loadedThemeStylesheets.add(slug);
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${base.replace(/\/$/, '')}/${slug}.min.css`;
  link.setAttribute('data-velin-theme-css', slug);
  document.head.appendChild(link);
  loadedThemeStylesheets.add(slug);
}

const styles = `
  :host { display: inline-flex; position: relative; }
  .group {
    display: inline-flex; align-items: stretch;
    border: 2px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    background: none;
    overflow: hidden;
  }
  button {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 2.75rem; padding: 0.5rem;
    background: none; border: 0; cursor: pointer;
    color: var(--velin-color-text, #111);
    transition: background 150ms ease;
  }
  button:hover { background: var(--velin-color-surface-dim, #eee); }
  button:focus-visible {
    outline: 3px solid var(--velin-color-focus, #2563eb);
    outline-offset: 2px;
  }
  .toggle { min-width: 2.75rem; }
  .picker {
    min-width: 1.75rem;
    border-inline-start: 1px solid var(--velin-color-border, #ddd);
    color: var(--velin-color-text-muted, #555);
  }
  svg { width: 1.25rem; height: 1.25rem; transition: transform 300ms ease; }
  .chev { width: 0.75rem; height: 0.75rem; }
  :host([theme="dark"]) .sun { display: none; }
  :host(:not([theme="dark"])) .moon { display: none; }
  :host([compact]) .picker { display: none; }
  :host([compact]) .toggle { border-inline-end: 0; }
  @media (prefers-reduced-motion: reduce) { svg { transition: none; } }

  .menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    inset-inline-end: 0;
    z-index: 1000;
    min-width: 12rem;
    padding: 0.375rem;
    background: var(--velin-color-surface-bright, #fff);
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    box-shadow: var(--velin-shadow-lg, 0 12px 32px rgba(0,0,0,0.12));
    list-style: none;
    margin: 0;
    display: none;
    max-height: min(70vh, 24rem);
    overflow-y: auto;
  }
  :host([menu-open]) .menu { display: block; }
  .menu li { margin: 0; }
  .menu button {
    width: 100%;
    justify-content: flex-start;
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
    color: var(--velin-color-text, #111);
    border-radius: var(--velin-radius-sm, 0.25rem);
    min-height: 2rem;
    text-align: start;
  }
  .menu button:hover,
  .menu button[aria-current="true"] {
    background: var(--velin-color-primary-subtle, #eef);
    color: var(--velin-color-primary, #2a4cf0);
  }
  .menu button[aria-current="true"] {
    font-weight: 600;
  }
  .menu .swatch {
    width: 0.75rem; height: 0.75rem;
    border-radius: 50%;
    margin-inline-end: 0.5rem;
    background: currentColor;
    border: 1px solid var(--velin-color-border, #ddd);
  }
`;

class VelinThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onDocClick = this._onDocClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="group" part="group">
        <button class="toggle" part="button" aria-label="Toggle dark mode">
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </button>
        <button class="picker" part="picker" aria-label="Choose theme" aria-haspopup="menu" aria-expanded="false">
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
      <ul class="menu" role="menu" hidden></ul>
    `;

    this._target = document.querySelector(this.getAttribute('target') || 'html');
    this._themesBase = this.getAttribute('themes-base') || 'dist/themes';
    this._menu = this.shadowRoot.querySelector('.menu');
    this._toggleBtn = this.shadowRoot.querySelector('.toggle');
    this._pickerBtn = this.shadowRoot.querySelector('.picker');

    this._renderMenu();
    this._initPreference();

    this._toggleBtn.addEventListener('click', () => this._toggleDarkMode());
    this._pickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleMenu();
    });

    document.addEventListener('click', this._onDocClick);
    this.shadowRoot.addEventListener('keydown', this._onKeyDown);

    const prefersDarkMq = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkMq.addEventListener('change', () => this._applyFromPreference());
    window.addEventListener('storage', (e) => {
      if (e.key === 'velin-theme') this._readStorage();
    });
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
  }

  _renderMenu() {
    this._menu.innerHTML = THEMES.map((t) => `
      <li role="none">
        <button type="button" role="menuitem" data-theme="${t.slug}">
          <span class="swatch" aria-hidden="true" data-theme-swatch="${t.slug}"></span>
          ${t.label}
        </button>
      </li>
    `).join('');
    this._menu.removeAttribute('hidden');
    this._menu.querySelectorAll('button[data-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-theme');
        this._applyTheme(slug, { persist: true });
        this._closeMenu();
      });
    });
  }

  _toggleMenu() {
    if (this.hasAttribute('menu-open')) this._closeMenu();
    else this._openMenu();
  }

  _openMenu() {
    this.setAttribute('menu-open', '');
    this._pickerBtn.setAttribute('aria-expanded', 'true');
    this._highlightActive();
    const first = this._menu.querySelector('button[data-theme]');
    if (first) first.focus();
  }

  _closeMenu() {
    this.removeAttribute('menu-open');
    this._pickerBtn.setAttribute('aria-expanded', 'false');
  }

  _onDocClick(e) {
    if (!this.hasAttribute('menu-open')) return;
    if (e.composedPath().includes(this)) return;
    this._closeMenu();
  }

  _onKeyDown(e) {
    if (!this.hasAttribute('menu-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this._closeMenu();
      this._pickerBtn.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = Array.from(this._menu.querySelectorAll('button[data-theme]'));
      const idx = items.indexOf(this.shadowRoot.activeElement);
      const next = e.key === 'ArrowDown'
        ? items[(idx + 1) % items.length]
        : items[(idx - 1 + items.length) % items.length];
      next?.focus();
    }
  }

  _highlightActive() {
    const current = this._currentSlug();
    this._menu.querySelectorAll('button[data-theme]').forEach((btn) => {
      const slug = btn.getAttribute('data-theme');
      if (slug === current) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
  }

  _currentSlug() {
    if (!this._target) return '';
    const value = this._target.getAttribute('data-velin-theme');
    if (!value || value === 'light') return '';
    return value;
  }

  _initPreference() {
    const stored = localStorage.getItem('velin-theme');
    if (stored) {
      this._applyTheme(stored, { persist: false });
      return;
    }
    this._applyFromPreference();
  }

  _readStorage() {
    const stored = localStorage.getItem('velin-theme');
    this._applyTheme(stored || '', { persist: false });
  }

  _applyFromPreference() {
    if (localStorage.getItem('velin-theme')) return;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._applyTheme(prefersDark ? 'dark' : '', { persist: false });
  }

  _applyTheme(slug, { persist }) {
    const normalized = !slug || slug === 'light' ? '' : slug;
    if (!this._target) return;
    if (!normalized) {
      this._target.removeAttribute('data-velin-theme');
      this.removeAttribute('theme');
    } else {
      this._target.setAttribute('data-velin-theme', normalized);
      this.setAttribute('theme', normalized === 'dark' ? 'dark' : normalized);
      ensureThemeStylesheet(normalized, this._themesBase);
    }
    if (persist) {
      if (!normalized) localStorage.removeItem('velin-theme');
      else localStorage.setItem('velin-theme', normalized);
    }
    this._highlightActive();
    this.dispatchEvent(new CustomEvent('velin-theme-change', {
      bubbles: true,
      detail: { theme: normalized || 'light', dark: normalized === 'dark', slug: normalized },
    }));
  }

  _toggleDarkMode() {
    const current = this._currentSlug();
    const next = current === 'dark' ? '' : 'dark';
    this._applyTheme(next, { persist: true });
  }
}

customElements.define('velin-theme-toggle', VelinThemeToggle);
export default VelinThemeToggle;
