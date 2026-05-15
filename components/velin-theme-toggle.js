const styles = `
  :host { display: inline-flex; }
  button {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 2.75rem; min-height: 2.75rem; padding: 0.5rem;
    background: none; border: 2px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem); cursor: pointer;
    color: var(--velin-color-text, #111); transition: background 150ms ease, border-color 150ms ease;
  }
  button:hover { background: var(--velin-color-surface-dim, #eee); border-color: var(--velin-color-border-strong, #999); }
  button:focus-visible { outline: 3px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  svg { width: 1.25rem; height: 1.25rem; transition: transform 300ms ease; }
  :host([theme="dark"]) .sun { display: none; }
  :host(:not([theme="dark"])) .moon { display: none; }
  @media (prefers-reduced-motion: reduce) { svg { transition: none; } }
`;

class VelinThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <button part="button" aria-label="Toggle dark mode">
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
    `;

    const target = this.getAttribute('target') || 'html';
    const el = document.querySelector(target);
    const stored = localStorage.getItem('velin-theme');
    const prefersDarkMq = window.matchMedia('(prefers-color-scheme: dark)');

    const applyFromPreference = () => {
      if (localStorage.getItem('velin-theme')) return;
      if (prefersDarkMq.matches) {
        el?.setAttribute('data-velin-theme', 'dark');
        this.setAttribute('theme', 'dark');
      } else {
        el?.removeAttribute('data-velin-theme');
        this.removeAttribute('theme');
      }
    };

    const prefersDark = prefersDarkMq.matches;

    if (stored === 'dark' || (!stored && prefersDark)) {
      el?.setAttribute('data-velin-theme', 'dark');
      this.setAttribute('theme', 'dark');
    }

    prefersDarkMq.addEventListener('change', applyFromPreference);
    window.addEventListener('storage', (e) => {
      if (e.key !== 'velin-theme' || !el) return;
      if (e.newValue === 'dark') {
        el.setAttribute('data-velin-theme', 'dark');
        this.setAttribute('theme', 'dark');
      } else {
        el.removeAttribute('data-velin-theme');
        this.removeAttribute('theme');
      }
    });

    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      const isDark = el?.getAttribute('data-velin-theme') === 'dark';
      if (isDark) {
        el?.removeAttribute('data-velin-theme');
        this.removeAttribute('theme');
        localStorage.setItem('velin-theme', 'light');
      } else {
        el?.setAttribute('data-velin-theme', 'dark');
        this.setAttribute('theme', 'dark');
        localStorage.setItem('velin-theme', 'dark');
      }
      this.dispatchEvent(new CustomEvent('velin-theme-change', { bubbles: true, detail: { theme: isDark ? 'light' : 'dark', dark: !isDark } }));
    });
  }
}

customElements.define('velin-theme-toggle', VelinThemeToggle);
export default VelinThemeToggle;
