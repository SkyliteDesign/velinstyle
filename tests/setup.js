import { vi } from 'vitest';

/** jsdom has no matchMedia; VelinThemeToggle and others rely on it */
if (typeof window === 'undefined') {
  // Node environment (e.g. search-benchmark) — skip jsdom polyfills
} else Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
