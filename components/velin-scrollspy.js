class VelinScrollspy extends HTMLElement {
  constructor() {
    super();
    this._observer = null;
    this._activeId = null;
  }

  connectedCallback() {
    const selector = this.getAttribute('target') || 'section[id]';
    const navSelector = this.getAttribute('nav') || 'a';
    const rootMargin = this.getAttribute('root-margin') || '-20% 0px -60% 0px';

    const sections = document.querySelectorAll(selector);
    if (!sections.length) return;

    this._observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this._activate(entry.target.id, navSelector);
          }
        }
      },
      { rootMargin, threshold: 0 }
    );

    sections.forEach((s) => this._observer.observe(s));
  }

  _activate(id, navSelector) {
    if (this._activeId === id) return;
    this._activeId = id;

    const links = this.querySelectorAll(navSelector);
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.classList.add('velin-doc-sidebar__link--active');
        link.setAttribute('aria-current', 'true');
      } else {
        link.classList.remove('velin-doc-sidebar__link--active');
        link.removeAttribute('aria-current');
      }
    });

    this.dispatchEvent(new CustomEvent('velin-spy-change', { bubbles: true, detail: { id } }));
  }

  disconnectedCallback() {
    if (this._observer) this._observer.disconnect();
  }
}

customElements.define('velin-scrollspy', VelinScrollspy);
export default VelinScrollspy;
