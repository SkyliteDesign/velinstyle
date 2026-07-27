import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

/** Wait for the requestAnimationFrame the component uses to defer setup. */
function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

const ROWS = [
  ['Cara', '30', '2024-03-01'],
  ['alice', '100', '2023-01-15'],
  ['Bob', '9', '2025-07-20'],
];

function buildTable({ attrs = '', sortTypes = ['text', 'number', 'date'] } = {}) {
  const host = document.createElement('velin-data-table');
  for (const [name, value] of Object.entries(attrs)) host.setAttribute(name, value);
  host.innerHTML = `
    <table class="velin-table">
      <caption>People</caption>
      <thead>
        <tr>
          <th data-sort="${sortTypes[0]}">Name</th>
          <th data-sort="${sortTypes[1]}">Score</th>
          <th data-sort="${sortTypes[2]}">Joined</th>
        </tr>
      </thead>
      <tbody>
        ${ROWS.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
      </tbody>
    </table>`;
  document.body.appendChild(host);
  return host;
}

function names(host) {
  return host.visibleRows.map((row) => row.cells[0].textContent);
}

beforeAll(async () => {
  await import('../../components/velin-data-table.js');
  await import('../../components/velin-announcer.js');
});

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('velin-data-table setup', () => {
  it('registers as a custom element', () => {
    expect(customElements.get('velin-data-table')).toBeDefined();
  });

  it('leaves the light-DOM table in place', async () => {
    const host = buildTable();
    await nextFrame();
    expect(host.querySelector('table')).not.toBeNull();
    expect(host.rows).toHaveLength(3);
    expect(host.shadowRoot).toBeNull();
  });

  it('does nothing when there is no table', async () => {
    const host = document.createElement('velin-data-table');
    host.textContent = 'no table here';
    document.body.appendChild(host);
    await nextFrame();
    expect(host.rows).toEqual([]);
  });

  it('turns sortable headers into real buttons with aria-sort', async () => {
    const host = buildTable();
    await nextFrame();
    const headers = [...host.querySelectorAll('th')];
    for (const th of headers) {
      expect(th.getAttribute('aria-sort')).toBe('none');
      const button = th.querySelector('button.velin-data-table__sort');
      expect(button).not.toBeNull();
      expect(button.type).toBe('button');
    }
  });

  it('opts a column out of sorting with data-sort="none"', async () => {
    const host = buildTable({ sortTypes: ['text', 'number', 'none'] });
    await nextFrame();
    const headers = [...host.querySelectorAll('th')];
    expect(headers[2].querySelector('button')).toBeNull();
    expect(headers[2].hasAttribute('aria-sort')).toBe(false);
  });

  it('applies the label attribute when the table has no caption', async () => {
    const host = buildTable({ attrs: { label: 'Team members' } });
    host.querySelector('caption').remove();
    await nextFrame();
    expect(host.querySelector('table').getAttribute('aria-label')).toBe('Team members');
  });

  it('warns when the table has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const host = buildTable();
    host.querySelector('caption').remove();
    await nextFrame();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('velin-data-table'));
    warn.mockRestore();
  });
});

describe('velin-data-table sorting', () => {
  it('sorts text case-insensitively and toggles direction', async () => {
    const host = buildTable();
    await nextFrame();

    host.sort(0);
    expect(names(host)).toEqual(['alice', 'Bob', 'Cara']);
    expect(host.querySelectorAll('th')[0].getAttribute('aria-sort')).toBe('ascending');

    host.sort(0);
    expect(names(host)).toEqual(['Cara', 'Bob', 'alice']);
    expect(host.querySelectorAll('th')[0].getAttribute('aria-sort')).toBe('descending');
  });

  it('sorts numbers numerically rather than lexically', async () => {
    const host = buildTable();
    await nextFrame();
    host.sort(1);
    expect(host.visibleRows.map((r) => r.cells[1].textContent)).toEqual(['9', '30', '100']);
  });

  it('sorts dates chronologically', async () => {
    const host = buildTable();
    await nextFrame();
    host.sort(2);
    expect(names(host)).toEqual(['alice', 'Cara', 'Bob']);
  });

  it('marks only one column as sorted', async () => {
    const host = buildTable();
    await nextFrame();
    host.sort(0);
    host.sort(1);
    const sortStates = [...host.querySelectorAll('th')].map((th) => th.getAttribute('aria-sort'));
    expect(sortStates).toEqual(['none', 'ascending', 'none']);
  });

  it('sorts when the header button is clicked', async () => {
    const host = buildTable();
    await nextFrame();
    host.querySelectorAll('th')[0].querySelector('button').click();
    expect(names(host)).toEqual(['alice', 'Bob', 'Cara']);
  });

  it('emits velin-data-table-sort', async () => {
    const host = buildTable();
    await nextFrame();
    const events = [];
    host.addEventListener('velin-data-table-sort', (e) => events.push(e.detail));
    host.sort(0);
    expect(events).toEqual([{ index: 0, direction: 'ascending', column: 'Name' }]);
  });

  it('prefers data-sort-value over cell text', async () => {
    const host = buildTable();
    await nextFrame();
    host.rows.forEach((row, i) => { row.cells[0].dataset.sortValue = String(3 - i); });
    host.sort(0);
    expect(names(host)).toEqual(['Bob', 'alice', 'Cara']);
  });
});

describe('velin-data-table filtering', () => {
  it('hides non-matching rows so they leave the a11y tree', async () => {
    const host = buildTable();
    await nextFrame();
    host.filter('bo');
    expect(names(host)).toEqual(['Bob']);
    const hidden = host.rows.filter((row) => row.hidden);
    expect(hidden).toHaveLength(2);
  });

  it('clears the filter when the query is empty', async () => {
    const host = buildTable();
    await nextFrame();
    host.filter('bo');
    host.filter('');
    expect(host.visibleRows).toHaveLength(3);
  });

  it('renders an empty state when nothing matches', async () => {
    const host = buildTable({ attrs: { 'empty-text': 'Nothing found' } });
    await nextFrame();
    host.filter('zzz');
    const empty = host.querySelector('.velin-data-table__empty');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toBe('Nothing found');
    expect(empty.querySelector('td').colSpan).toBe(3);
    expect(host.rows).not.toContain(empty);
  });

  it('removes the empty state when rows match again', async () => {
    const host = buildTable();
    await nextFrame();
    host.filter('zzz');
    host.filter('bob');
    expect(host.querySelector('.velin-data-table__empty')).toBeNull();
  });

  it('restricts matching to cells marked data-filter', async () => {
    const host = buildTable();
    await nextFrame();
    for (const row of host.rows) row.cells[0].setAttribute('data-filter', '');
    host.filter('100');
    expect(host.visibleRows).toHaveLength(0);
  });

  it('binds an external filter input', async () => {
    const input = document.createElement('input');
    input.id = 'table-filter';
    document.body.appendChild(input);
    const host = buildTable({ attrs: { 'filter-input': '#table-filter' } });
    await nextFrame();

    input.value = 'cara';
    input.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(names(host)).toEqual(['Cara']);
  });

  it('emits velin-data-table-filter with the match count', async () => {
    const host = buildTable();
    await nextFrame();
    const events = [];
    host.addEventListener('velin-data-table-filter', (e) => events.push(e.detail));
    host.filter('a');
    expect(events[0].count).toBe(host.visibleRows.length);
  });
});

describe('velin-data-table pagination', () => {
  it('shows only one page of rows', async () => {
    const host = buildTable({ attrs: { 'page-size': '2' } });
    await nextFrame();
    expect(host.visibleRows).toHaveLength(2);
    expect(host.pageCount).toBe(2);
  });

  it('navigates between pages', async () => {
    const host = buildTable({ attrs: { 'page-size': '2' } });
    await nextFrame();
    host.goToPage(2);
    expect(host.page).toBe(2);
    expect(host.visibleRows).toHaveLength(1);
  });

  it('clamps out-of-range pages', async () => {
    const host = buildTable({ attrs: { 'page-size': '2' } });
    await nextFrame();
    host.goToPage(99);
    expect(host.page).toBe(2);
    host.goToPage(-5);
    expect(host.page).toBe(1);
  });

  it('renders a labelled pagination nav with disabled edge buttons', async () => {
    const host = buildTable({ attrs: { 'page-size': '2' } });
    await nextFrame();
    const nav = host.querySelector('nav.velin-data-table__pagination');
    expect(nav.getAttribute('aria-label')).toBe('Table pagination');
    expect(nav.querySelector('[data-velin-page="previous"]').disabled).toBe(true);
    expect(nav.querySelector('[data-velin-page="next"]').disabled).toBe(false);
    expect(nav.querySelector('[data-velin-page="status"]').textContent).toBe('Page 1 of 2');

    host.goToPage(2);
    expect(nav.querySelector('[data-velin-page="previous"]').disabled).toBe(false);
    expect(nav.querySelector('[data-velin-page="next"]').disabled).toBe(true);
  });

  it('omits pagination when everything fits on one page', async () => {
    const host = buildTable({ attrs: { 'page-size': '10' } });
    await nextFrame();
    expect(host.querySelector('.velin-data-table__pagination')).toBeNull();
  });

  it('resets to the first page after filtering', async () => {
    const host = buildTable({ attrs: { 'page-size': '2' } });
    await nextFrame();
    host.goToPage(2);
    host.filter('a');
    expect(host.page).toBe(1);
  });

  it('paginates the filtered rows only', async () => {
    const host = buildTable({ attrs: { 'page-size': '2' } });
    await nextFrame();
    host.filter('a');
    expect(host.matchingRows).toHaveLength(2);
    expect(host.pageCount).toBe(1);
  });

  it('emits velin-data-table-page', async () => {
    const host = buildTable({ attrs: { 'page-size': '2' } });
    await nextFrame();
    const events = [];
    host.addEventListener('velin-data-table-page', (e) => events.push(e.detail));
    host.goToPage(2);
    expect(events).toEqual([{ page: 2, pageCount: 2 }]);
  });
});
