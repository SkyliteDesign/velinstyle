import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setBackgroundInert, clearBackgroundInert } from '../components/focus-manager.js';

describe('overlay inert/overflow ownership (ADR 0013)', () => {
  let sibling;
  let hostA;
  let hostB;

  beforeEach(() => {
    sibling = document.createElement('div');
    sibling.id = 'page-sibling';
    document.body.appendChild(sibling);
    hostA = document.createElement('div');
    hostB = document.createElement('div');
    document.body.appendChild(hostA);
    document.body.appendChild(hostB);
    document.body.style.overflow = '';
  });

  afterEach(() => {
    clearBackgroundInert(hostA);
    clearBackgroundInert(hostB);
    sibling?.remove();
    hostA?.remove();
    hostB?.remove();
    document.body.style.overflow = '';
  });

  it('locks overflow and marks siblings inert', () => {
    setBackgroundInert(hostA);
    expect(document.body.style.overflow).toBe('hidden');
    expect(sibling.hasAttribute('inert')).toBe(true);
    clearBackgroundInert(hostA);
    expect(document.body.style.overflow).toBe('');
    expect(sibling.hasAttribute('inert')).toBe(false);
  });

  it('keeps lock while stacked overlays remain', () => {
    setBackgroundInert(hostA);
    setBackgroundInert(hostB);
    clearBackgroundInert(hostB);
    expect(document.body.style.overflow).toBe('hidden');
    expect(sibling.hasAttribute('inert')).toBe(true);
    clearBackgroundInert(hostA);
    expect(document.body.style.overflow).toBe('');
  });

  it('clears when host is removed from DOM after open', () => {
    setBackgroundInert(hostA);
    clearBackgroundInert(hostA);
    hostA.remove();
    expect(document.body.style.overflow).toBe('');
    expect(sibling.hasAttribute('inert')).toBe(false);
  });
});
