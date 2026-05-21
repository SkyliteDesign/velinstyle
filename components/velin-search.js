import { createSearch, highlightHtml, SEARCH_CATEGORIES, resolveDocsSearchUrl } from '../core/search/index.js';
import { escapeHTMLAttribute } from './sanitize.js';

const CATEGORY_LABELS = {
  docs: 'Documentation',
  components: 'Components',
  api: 'API',
  examples: 'Examples',
};

class VelinSearch extends HTMLElement {
  static get observedAttributes() {
    return ['index', 'categories', 'min-chars', 'fuzzy', 'placeholder', 'debounce'];
  }

  constructor() {
    super();
    this._search = createSearch();
    this._debounceTimer = null;
    this._activeIndex = -1;
    this._flatResults = [];
    this._indexLoaded = false;
    this._listId = `velin-search-listbox-${Math.random().toString(36).slice(2, 9)}`;
    this._mounted = false;
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;
    this._ensureMarkup();
    this._loadIndex();
    this._bindEvents();
  }

  disconnectedCallback() {
    this._teardown?.();
    this._mounted = false;
  }

  get indexUrl() {
    return this.getAttribute('index') || '/search-index.json';
  }

  get minChars() {
    return parseInt(this.getAttribute('min-chars') || '2', 10);
  }

  get fuzzy() {
    const v = this.getAttribute('fuzzy');
    return v === null ? 0.2 : parseFloat(v) || 0;
  }

  get categories() {
    const raw = this.getAttribute('categories');
    if (!raw) return null;
    return raw.split(',').map((c) => c.trim()).filter((c) => SEARCH_CATEGORIES.includes(c));
  }

  get debounceMs() {
    return parseInt(this.getAttribute('debounce') || '120', 10);
  }

  _ensureMarkup() {
    if (this.querySelector('[data-velin-search-input]')) return;
    const ph = escapeHTMLAttribute(this.getAttribute('placeholder') || 'Search…');
    const label = escapeHTMLAttribute(this.getAttribute('aria-label') || 'Search');
    this.innerHTML = `
      <div class="velin-search">
        <div class="velin-search__field">
          <input type="search" class="velin-search__input" data-velin-search-input
            placeholder="${ph}" autocomplete="off" role="combobox" aria-expanded="false"
            aria-label="${label}" aria-controls="${this._listId}" aria-autocomplete="list" />
        </div>
        <div class="velin-search__status velin-visually-hidden" data-velin-search-status aria-live="polite" aria-atomic="true"></div>
        <div class="velin-search__results" data-velin-search-results role="listbox"
          id="${this._listId}" hidden></div>
      </div>
    `;
  }

  _inputEl() {
    return this.querySelector('[data-velin-search-input]');
  }

  _resultsEl() {
    return this.querySelector('[data-velin-search-results]');
  }

  async _loadIndex() {
    try {
      await this._search.loadIndex(this.indexUrl);
      this._indexLoaded = true;
    } catch {
      this._indexLoaded = false;
    }
  }

  _bindEvents() {
    const input = this._inputEl();
    const panel = this._resultsEl();
    if (!input || !panel) return;

    input.addEventListener('input', () => {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._runQuery(input.value), this.debounceMs);
    });
    input.addEventListener('focus', () => {
      if (input.value.trim().length >= this.minChars) this._runQuery(input.value);
    });
    input.addEventListener('keydown', (e) => this._onKeydown(e, input, panel));

    const onDocClick = (e) => {
      if (!this.contains(e.target)) this._hide(panel, input);
    };
    document.addEventListener('click', onDocClick);
    this._teardown = () => {
      document.removeEventListener('click', onDocClick);
      clearTimeout(this._debounceTimer);
    };
  }

  async _runQuery(raw) {
    const input = this._inputEl();
    const panel = this._resultsEl();
    if (!input || !panel) return;
    const q = raw.trim();
    if (q.length < this.minChars) {
      this._hide(panel, input);
      return;
    }
    if (!this._indexLoaded) await this._loadIndex();
    const { groups } = this._search.query(q, {
      minChars: this.minChars,
      fuzzy: this.fuzzy,
      categories: this.categories || undefined,
      limit: 12,
    });
    this._activeIndex = -1;
    this._renderResults(panel, input, q, groups);
    if (this._flatResults.length) {
      panel.hidden = false;
      panel.classList.add('velin-search__results--open');
      input.setAttribute('aria-expanded', 'true');
    } else {
      this._hide(panel, input);
    }
  }

  _renderResults(panel, input, q, groups) {
    panel.innerHTML = '';
    const order = this.categories || [...SEARCH_CATEGORIES];
    this._flatResults = [];
    let globalIdx = 0;
    for (const cat of order) {
      const items = groups[cat];
      if (!items?.length) continue;
      const groupId = `${this._listId}-group-${cat}`;
      const group = document.createElement('div');
      group.setAttribute('role', 'group');
      group.setAttribute('aria-labelledby', groupId);
      const heading = document.createElement('div');
      heading.className = 'velin-search__group-label';
      heading.id = groupId;
      heading.textContent = CATEGORY_LABELS[cat] || cat;
      group.appendChild(heading);
      for (const item of items) {
        const a = document.createElement('a');
        const navHref = resolveDocsSearchUrl(item.url);
        if (navHref) a.href = navHref;
        a.className = 'velin-search__item';
        a.setAttribute('role', 'option');
        a.id = `velin-search-opt-${globalIdx}`;
        a.innerHTML =
          `<span class="velin-search__title">${highlightHtml(item.title, q)}</span>` +
          `<span class="velin-search__excerpt">${highlightHtml(item.excerpt || '', q)}</span>`;
        a.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            if (navHref) window.location.assign(navHref);
          },
          true,
        );
        a.addEventListener('mouseenter', () => this._setActive(globalIdx, panel, input));
        group.appendChild(a);
        this._flatResults.push(item);
        globalIdx++;
      }
      panel.appendChild(group);
    }
    const status = this._statusEl();
    if (status) {
      status.textContent = this._flatResults.length
        ? `${this._flatResults.length} results`
        : 'No results';
    }
  }

  _statusEl() {
    return this.querySelector('[data-velin-search-status]');
  }

  _setActive(idx, panel, input) {
    this._activeIndex = idx;
    panel.querySelectorAll('.velin-search__item').forEach((el, i) => {
      el.classList.toggle('velin-search__item--active', i === idx);
      if (i === idx) {
        input.setAttribute('aria-activedescendant', el.id);
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  _onKeydown(e, input, panel) {
    if (e.key === 'Escape') {
      this._hide(panel, input);
      return;
    }
    if (!this._flatResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = this._activeIndex < this._flatResults.length - 1 ? this._activeIndex + 1 : 0;
      this._setActive(next, panel, input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = this._activeIndex > 0 ? this._activeIndex - 1 : this._flatResults.length - 1;
      this._setActive(prev, panel, input);
    } else if (e.key === 'Enter') {
      const target = this._activeIndex >= 0 ? this._flatResults[this._activeIndex] : this._flatResults[0];
      const navHref = target?.url ? resolveDocsSearchUrl(target.url) : '';
      if (navHref) {
        e.preventDefault();
        window.location.assign(navHref);
      }
    }
  }

  _hide(panel, input) {
    panel.hidden = true;
    panel.classList.remove('velin-search__results--open');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    this._activeIndex = -1;
  }
}

export default VelinSearch;

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined' && !customElements.get('velin-search')) {
  customElements.define('velin-search', VelinSearch);
}

export function bindDeclarativeSearch(root = document) {
  root.querySelectorAll('[velin-search-input]').forEach((input) => {
    if (input.dataset.velinSearchBound) return;
    input.dataset.velinSearchBound = '1';
    let host = input.closest('velin-search');
    if (!host) {
      host = document.createElement('velin-search');
      host.setAttribute('index', input.getAttribute('data-search-index') || '/search-index.json');
      const results = input.parentElement?.querySelector('[velin-search-results]');
      input.before(host);
      host.appendChild(input);
      if (results) host.appendChild(results);
    }
  });
}
