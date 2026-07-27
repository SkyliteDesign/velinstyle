import { announce } from './a11y-utils.js';

/**
 * Progressive enhancement for a light-DOM `<table>`: sorting, filtering and
 * pagination without replacing the semantic markup.
 *
 * The table keeps working with JavaScript disabled — every feature is layered
 * on top of the rows that are already in the document.
 */

const SORT_TYPES = new Set(['text', 'number', 'date']);

let warnedMissingName = false;

/** @param {HTMLElement} cell */
function sortValue(cell, type) {
  const raw = cell?.dataset?.sortValue ?? cell?.textContent ?? '';
  const text = raw.trim();
  if (type === 'number') {
    const num = Number.parseFloat(text.replace(/[^\d.,-]/g, '').replace(',', '.'));
    return Number.isNaN(num) ? Number.NEGATIVE_INFINITY : num;
  }
  if (type === 'date') {
    const time = Date.parse(text);
    return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
  }
  return text.toLowerCase();
}

class VelinDataTable extends HTMLElement {
  static get observedAttributes() {
    return ['page-size', 'filter-input', 'empty-text', 'label'];
  }

  constructor() {
    super();
    this._table = null;
    this._page = 1;
    this._query = '';
    this._sortIndex = -1;
    this._sortDirection = 'ascending';
    this._filterEl = null;
    this._pagination = null;
    this._emptyRow = null;
    this._filterTimer = null;
    this._onFilterInput = this._onFilterInput.bind(this);
  }

  connectedCallback() {
    this.classList.add('velin-data-table');
    // Rows may still be streaming in when the element upgrades.
    requestAnimationFrame(() => this._init());
  }

  disconnectedCallback() {
    if (this._filterEl) this._filterEl.removeEventListener('input', this._onFilterInput);
    if (this._filterTimer) clearTimeout(this._filterTimer);
  }

  attributeChangedCallback(name, previous, next) {
    if (previous === next || !this._table) return;
    if (name === 'page-size') {
      this._page = 1;
      this._render();
    } else if (name === 'filter-input') {
      this._bindFilterInput();
    } else if (name === 'label') {
      this._ensureAccessibleName();
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** @returns {HTMLTableRowElement[]} */
  get rows() {
    const body = this._table?.tBodies?.[0];
    return body ? [...body.rows].filter((row) => row !== this._emptyRow) : [];
  }

  /** Rows matching the current filter, across all pages. */
  get matchingRows() {
    return this.rows.filter((row) => !row.dataset.velinFiltered);
  }

  /** Rows visible on the current page. */
  get visibleRows() {
    return this.matchingRows.filter((row) => !row.hidden);
  }

  get page() {
    return this._page;
  }

  get pageSize() {
    const size = Number.parseInt(this.getAttribute('page-size') || '', 10);
    return Number.isFinite(size) && size > 0 ? size : 0;
  }

  get pageCount() {
    const size = this.pageSize;
    if (!size) return 1;
    return Math.max(1, Math.ceil(this.matchingRows.length / size));
  }

  /**
   * @param {number} index Column index
   * @param {'ascending' | 'descending'} [direction]
   */
  sort(index, direction) {
    const headers = this._headers();
    const header = headers[index];
    if (!header) return;
    const type = this._sortType(header);
    if (type === 'none') return;

    this._sortDirection = direction
      || (this._sortIndex === index && this._sortDirection === 'ascending' ? 'descending' : 'ascending');
    this._sortIndex = index;

    const factor = this._sortDirection === 'ascending' ? 1 : -1;
    const body = this._table.tBodies[0];
    const sorted = this.rows.slice().sort((a, b) => {
      const av = sortValue(a.cells[index], type);
      const bv = sortValue(b.cells[index], type);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
    for (const row of sorted) body.appendChild(row);

    this._syncSortState();
    this._page = 1;
    this._render();

    const label = header.dataset.sortLabel || header.textContent.trim();
    announce(`${label} sorted ${this._sortDirection}`);
    this.dispatchEvent(new CustomEvent('velin-data-table-sort', {
      bubbles: true,
      detail: { index, direction: this._sortDirection, column: label },
    }));
  }

  /** @param {string} query */
  filter(query) {
    this._query = String(query || '').trim().toLowerCase();
    for (const row of this.rows) {
      const match = !this._query || this._rowText(row).includes(this._query);
      if (match) delete row.dataset.velinFiltered;
      else row.dataset.velinFiltered = 'true';
    }
    this._page = 1;
    this._render();

    const count = this.matchingRows.length;
    announce(count === 1 ? '1 row matches' : `${count} rows match`);
    this.dispatchEvent(new CustomEvent('velin-data-table-filter', {
      bubbles: true,
      detail: { query: this._query, count },
    }));
  }

  /** @param {number} page */
  goToPage(page) {
    const target = Math.min(Math.max(1, Math.trunc(page) || 1), this.pageCount);
    if (target === this._page) return;
    this._page = target;
    this._render();
    announce(`Page ${this._page} of ${this.pageCount}`);
    this.dispatchEvent(new CustomEvent('velin-data-table-page', {
      bubbles: true,
      detail: { page: this._page, pageCount: this.pageCount },
    }));
  }

  // ── Setup ──────────────────────────────────────────────────────────────────

  _init() {
    this._table = this.querySelector('table');
    if (!this._table || !this._table.tBodies.length) return;

    this._ensureAccessibleName();
    this._setupSorting();
    this._bindFilterInput();
    this._render();
  }

  _headers() {
    const headRow = this._table.tHead?.rows?.[0];
    return headRow ? [...headRow.cells] : [];
  }

  /** @param {HTMLTableCellElement} header */
  _sortType(header) {
    const declared = (header.dataset.sort || '').toLowerCase();
    if (declared === 'none') return 'none';
    if (SORT_TYPES.has(declared)) return declared;
    return this.hasAttribute('sortable') ? 'text' : 'none';
  }

  /**
   * A table without a name is unusable with a screen reader, so surface it
   * instead of failing silently (WCAG 1.3.1 / 2.4.6).
   */
  _ensureAccessibleName() {
    const table = this._table;
    if (!table) return;
    const label = this.getAttribute('label');
    const hasName = table.caption?.textContent.trim()
      || table.getAttribute('aria-label')?.trim()
      || table.getAttribute('aria-labelledby')?.trim();

    if (!hasName && label) {
      table.setAttribute('aria-label', label);
      return;
    }
    if (!hasName && !warnedMissingName) {
      warnedMissingName = true;
      console.warn('[velinstyle] <velin-data-table> needs a <caption>, aria-label, or a label attribute.');
    }
  }

  /** Sortable headers get a real button so keyboard and AT support come for free. */
  _setupSorting() {
    this._headers().forEach((header, index) => {
      if (this._sortType(header) === 'none') return;
      if (header.querySelector('.velin-data-table__sort')) return;

      const label = header.textContent.trim();
      header.dataset.sortLabel = label;
      header.setAttribute('aria-sort', 'none');
      header.classList.add('velin-data-table__th');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'velin-data-table__sort';
      button.textContent = label;

      const icon = document.createElement('span');
      icon.className = 'velin-data-table__sort-icon';
      icon.setAttribute('aria-hidden', 'true');
      button.appendChild(icon);

      button.addEventListener('click', () => this.sort(index));
      header.textContent = '';
      header.appendChild(button);
    });
  }

  _syncSortState() {
    this._headers().forEach((header, index) => {
      if (this._sortType(header) === 'none') return;
      const active = index === this._sortIndex;
      header.setAttribute('aria-sort', active ? this._sortDirection : 'none');
      header.querySelector('.velin-data-table__sort')?.classList.toggle('velin-data-table__sort--active', active);
    });
  }

  _bindFilterInput() {
    if (this._filterEl) this._filterEl.removeEventListener('input', this._onFilterInput);
    const selector = this.getAttribute('filter-input');
    this._filterEl = selector ? document.querySelector(selector) : null;
    if (this._filterEl) this._filterEl.addEventListener('input', this._onFilterInput);
  }

  _onFilterInput(event) {
    if (this._filterTimer) clearTimeout(this._filterTimer);
    const value = event.target.value;
    this._filterTimer = setTimeout(() => this.filter(value), 150);
  }

  /** @param {HTMLTableRowElement} row */
  _rowText(row) {
    const scoped = [...row.cells].filter((cell) => cell.hasAttribute('data-filter'));
    const cells = scoped.length ? scoped : [...row.cells];
    return cells.map((cell) => cell.textContent || '').join(' ').toLowerCase();
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  _render() {
    const size = this.pageSize;
    this._page = Math.min(this._page, this.pageCount);
    const matching = this.matchingRows;
    const start = size ? (this._page - 1) * size : 0;
    const end = size ? start + size : matching.length;

    for (const row of this.rows) {
      const index = matching.indexOf(row);
      row.hidden = index === -1 || index < start || index >= end;
    }

    this._renderEmptyState(matching.length === 0);
    this._renderPagination();
  }

  /** @param {boolean} isEmpty */
  _renderEmptyState(isEmpty) {
    if (!isEmpty) {
      this._emptyRow?.remove();
      this._emptyRow = null;
      return;
    }
    if (this._emptyRow?.isConnected) return;

    const columns = this._headers().length || 1;
    const row = document.createElement('tr');
    row.className = 'velin-data-table__empty';
    const cell = document.createElement('td');
    cell.colSpan = columns;
    cell.textContent = this.getAttribute('empty-text') || 'No matching rows';
    row.appendChild(cell);
    this._table.tBodies[0].appendChild(row);
    this._emptyRow = row;
  }

  _renderPagination() {
    if (!this.pageSize || this.pageCount <= 1) {
      this._pagination?.remove();
      this._pagination = null;
      return;
    }

    if (!this._pagination?.isConnected) {
      const nav = document.createElement('nav');
      nav.className = 'velin-data-table__pagination';
      nav.setAttribute('aria-label', this.getAttribute('pagination-label') || 'Table pagination');

      const previous = document.createElement('button');
      previous.type = 'button';
      previous.className = 'velin-btn velin-btn--outline velin-btn--sm';
      previous.dataset.velinPage = 'previous';
      previous.textContent = this.getAttribute('previous-text') || 'Previous';
      previous.addEventListener('click', () => this.goToPage(this._page - 1));

      const status = document.createElement('p');
      status.className = 'velin-data-table__page-status';
      status.dataset.velinPage = 'status';

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'velin-btn velin-btn--outline velin-btn--sm';
      next.dataset.velinPage = 'next';
      next.textContent = this.getAttribute('next-text') || 'Next';
      next.addEventListener('click', () => this.goToPage(this._page + 1));

      nav.append(previous, status, next);
      this.appendChild(nav);
      this._pagination = nav;
    }

    const status = this._pagination.querySelector('[data-velin-page="status"]');
    if (status) status.textContent = `Page ${this._page} of ${this.pageCount}`;
    const previous = this._pagination.querySelector('[data-velin-page="previous"]');
    const next = this._pagination.querySelector('[data-velin-page="next"]');
    if (previous) previous.disabled = this._page <= 1;
    if (next) next.disabled = this._page >= this.pageCount;
  }
}

customElements.define('velin-data-table', VelinDataTable);
export default VelinDataTable;
