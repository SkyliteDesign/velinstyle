import { highlightElement, initHighlight } from '../core/highlight/index.js';

/**
 * @param {string} spec
 * @returns {Set<number>}
 */
function parseLineHighlight(spec) {
  const lines = new Set();
  if (!spec) return lines;
  for (const part of spec.split(',')) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes('-')) {
      const [a, b] = p.split('-').map((n) => parseInt(n, 10));
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        for (let i = Math.min(a, b); i <= Math.max(a, b); i += 1) lines.add(i);
      }
    } else {
      const n = parseInt(p, 10);
      if (!Number.isNaN(n)) lines.add(n);
    }
  }
  return lines;
}

class VelinCodeBlock extends HTMLElement {
  static get observedAttributes() {
    return ['language', 'highlight', 'line-numbers', 'collapsed'];
  }

  connectedCallback() {
    if (this._built) return;
    this._built = true;
    this.classList.add('velin-code-block');
    this._render();
    this._setupHighlight();
  }

  attributeChangedCallback() {
    if (!this._built) return;
    this._render();
    this._setupHighlight();
  }

  _render() {
    const lang = this.getAttribute('language') || '';
    const showLines = this.hasAttribute('line-numbers');
    const collapsed = this.hasAttribute('collapsed');
    const highlightLines = parseLineHighlight(this.getAttribute('highlight') || '');

    const source = this.textContent.trim();
    this.textContent = '';

    const toolbar = document.createElement('div');
    toolbar.className = 'velin-code-block__toolbar';
    toolbar.innerHTML = '';

    const copyWc = document.createElement('velin-copy');
    copyWc.setAttribute('value', source);
    copyWc.setAttribute('label', 'Copy');
    toolbar.appendChild(copyWc);

    const panelId = `velin-code-panel-${Math.random().toString(36).slice(2, 9)}`;
    const wrap = document.createElement('div');
    wrap.id = panelId;
    wrap.className = showLines ? 'velin-code-block__gutter' : '';

    if (collapsed) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'velin-btn velin-btn--sm velin-btn--ghost';
      toggle.textContent = 'Expand';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      toggle.setAttribute('aria-label', 'Expand code block');
      toggle.addEventListener('click', () => {
        const on = this.hasAttribute('data-collapsed');
        if (on) {
          this.removeAttribute('data-collapsed');
          toggle.textContent = 'Collapse';
          toggle.setAttribute('aria-expanded', 'true');
          toggle.setAttribute('aria-label', 'Collapse code block');
        } else {
          this.setAttribute('data-collapsed', '');
          toggle.textContent = 'Expand';
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Expand code block');
        }
      });
      this.setAttribute('data-collapsed', '');
      toolbar.appendChild(toggle);
    }

    if (showLines) {
      const gutter = document.createElement('div');
      gutter.className = 'velin-code-block__line-numbers';
      const lines = source.split('\n');
      const lineCount = lines.length;
      gutter.textContent = '';
      for (let i = 0; i < lineCount; i += 1) {
        const n = i + 1;
        const span = document.createElement('span');
        if (highlightLines.has(n)) span.className = 'velin-code-block__line--highlight';
        span.textContent = String(n);
        gutter.appendChild(span);
      }
      wrap.appendChild(gutter);
    }

    const pre = document.createElement('pre');
    if (lang) {
      pre.setAttribute('language', lang);
      pre.dataset.language = lang;
    }
    const code = document.createElement('code');
    if (lang) code.className = `language-${lang}`;
    code.textContent = source;
    pre.appendChild(code);
    wrap.appendChild(pre);

    this.appendChild(toolbar);
    this.appendChild(wrap);
    this._pre = pre;
  }

  async _setupHighlight() {
    if (!this._pre) return;
    delete this._pre.dataset.velinHighlighted;
    delete this._pre.dataset.velinObserve;
    const immediate =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (immediate) {
      await highlightElement(this._pre);
    } else {
      initHighlight(this, { root: this });
    }
  }
}

customElements.define('velin-code-block', VelinCodeBlock);
export default VelinCodeBlock;
