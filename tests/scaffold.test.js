import { describe, it, expect } from 'vitest';
import { parseIntent, scaffoldFromPrompt, listIntents } from '../cli/scaffold.js';

describe('scaffold', () => {
  it('parses navbar intent (DE)', () => {
    const intent = parseIntent('Navbar mit Logo und Suchfeld');
    expect(intent.id).toBe('navbar');
  });

  it('parses modal intent (EN)', () => {
    const intent = parseIntent('confirmation modal dialog');
    expect(intent.id).toBe('modal');
  });

  it('parses dashboard intent', () => {
    const intent = parseIntent('admin dashboard with sidebar');
    expect(intent.id).toBe('dashboard');
  });

  it('generates navbar HTML with velin- classes only', () => {
    const r = scaffoldFromPrompt('Navbar mit Suche');
    expect(r.ok).toBe(true);
    expect(r.html).toMatch(/navbar-header|role="banner"/);
    expect(r.html).not.toMatch(/class="(?!velin-)[a-z]/);
    const foreign = r.html.match(/class="([^"]+)"/g) || [];
    for (const cl of foreign) {
      const inner = cl.replace(/class="/, '').replace(/"$/, '');
      for (const token of inner.split(/\s+/)) {
        if (token && !token.startsWith('velin-') && !token.startsWith('language-')) {
          // allow empty or structural
          if (!['active', 'show'].includes(token)) {
            expect(token.startsWith('velin-') || token.includes('__')).toBe(true);
          }
        }
      }
    }
  });

  it('includes search blueprint when prompt mentions search', () => {
    const r = scaffoldFromPrompt('navigation bar with search field');
    expect(r.blueprints).toContain('search-field');
  });

  it('modal scaffold uses modal blueprint', () => {
    const r = scaffoldFromPrompt('Modal zur Bestätigung');
    expect(r.ok).toBe(true);
    expect(r.blueprints).toContain('modal');
  });

  it('returns responsiveHints from layout audit', () => {
    const r = scaffoldFromPrompt('Navbar mit vielen Links');
    expect(r.responsiveHints).toBeDefined();
  });

  it('listIntents returns all recipes', () => {
    expect(listIntents().length).toBeGreaterThanOrEqual(8);
  });
});
