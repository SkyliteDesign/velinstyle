import { describe, it, expect } from 'vitest';
import { listRegisteredAttributes, getAttributeHandler } from '../core/attributes/registry.js';

describe('attribute registry', () => {
  it('registers at least 20 attributes', () => {
    const attrs = listRegisteredAttributes();
    expect(attrs.length).toBeGreaterThanOrEqual(20);
  });

  it('includes core bridge attributes', () => {
    const attrs = listRegisteredAttributes();
    for (const name of ['velin-modal', 'velin-tabs', 'velin-code', 'velin-reveal', 'velin-search', 'velin-scroll-top']) {
      expect(attrs).toContain(name);
      expect(getAttributeHandler(name)?.enhance).toBeTypeOf('function');
    }
  });
});
