import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  auditHtml,
  auditPath,
  suggestFromIssues,
  applySafeFixes,
} from '../cli/layout-audit.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), 'layout', 'fixtures');

function fixture(name) {
  return readFileSync(join(FIX, name), 'utf-8');
}

describe('layout-audit', () => {
  it('detects grid without row', () => {
    const issues = auditHtml(fixture('broken-grid.html'));
    expect(issues.some((i) => i.id === 'grid-missing-row')).toBe(true);
  });

  it('detects flex without wrap on crowded nav', () => {
    const issues = auditHtml(fixture('broken-flex.html'));
    expect(issues.some((i) => i.id === 'flex-no-wrap-overflow')).toBe(true);
  });

  it('detects velin-hidden without md show', () => {
    const issues = auditHtml(fixture('broken-hidden.html'));
    expect(issues.some((i) => i.id === 'mobile-hidden-only')).toBe(true);
  });

  it('detects 100vw', () => {
    const issues = auditHtml(fixture('broken-viewport.html'));
    expect(issues.some((i) => i.id === 'viewport-width')).toBe(true);
  });

  it('detects missing container on main', () => {
    const issues = auditHtml(fixture('broken-main.html'));
    expect(issues.some((i) => i.id === 'missing-container')).toBe(true);
  });

  it('auditPath scans fixture directory', () => {
    const { issues, files } = auditPath(FIX);
    expect(files.length).toBeGreaterThanOrEqual(5);
    expect(issues.length).toBeGreaterThanOrEqual(5);
  });

  it('suggest adds fix strings', () => {
    const issues = auditHtml(fixture('broken-grid.html'));
    const suggested = suggestFromIssues(issues);
    expect(suggested[0].fix).toMatch(/velin-row/);
  });

  it('applySafeFixes adds flex wrap', () => {
    const { html, changes } = applySafeFixes(fixture('broken-flex.html'));
    expect(html).toContain('velin-flex--wrap');
    expect(changes.length).toBeGreaterThan(0);
  });

  it('applySafeFixes pairs hidden with md-block', () => {
    const { html } = applySafeFixes(fixture('broken-hidden.html'));
    expect(html).toContain('velin-md-block');
  });
});
