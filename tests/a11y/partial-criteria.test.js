import { describe, it, expect } from 'vitest';
import { WCAG_AAA_CRITERIA } from '../../cli/docgen/extract-a11y.js';

/** Framework-owned WCAG 2.2 criteria still marked partial (author/app responsibility). */
const EXPECTED_PARTIAL = ['1.3.1', '1.4.11', '2.1.1', '3.3.2', '3.3.7', '4.1.2'];

describe('WCAG partial criteria tracking', () => {
  it('documents six partial criteria for app authors', () => {
    const partial = WCAG_AAA_CRITERIA.filter((c) => c.status === 'partial').map((c) => c.id);
    expect(partial.sort()).toEqual([...EXPECTED_PARTIAL].sort());
  });

  it('each partial criterion has a test hook id', () => {
    for (const id of EXPECTED_PARTIAL) {
      const row = WCAG_AAA_CRITERIA.find((c) => c.id === id);
      expect(row?.testId).toBeTruthy();
      expect(row?.owner).toMatch(/Author|Forms|velin-persist|Web Components|Tokens/i);
    }
  });
});
