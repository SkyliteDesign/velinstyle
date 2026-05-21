import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bootFromDOM, COMPONENT_LOADERS } from '../components/runtime/index.js';

describe('bootFromDOM', () => {
  let root;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'boot-fixture';
    document.body.appendChild(root);
  });

  afterEach(() => {
    root?.remove();
  });

  it('registers every tag from COMPONENT_LOADERS without race failures', async () => {
    for (const tag of Object.keys(COMPONENT_LOADERS)) {
      root.appendChild(document.createElement(tag));
    }
    await bootFromDOM(root);
    await Promise.all(
      Object.keys(COMPONENT_LOADERS).map((tag) => customElements.whenDefined(tag)),
    );
    for (const tag of Object.keys(COMPONENT_LOADERS)) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });

  it('bootAttributes wires velin-scroll-top on body', async () => {
    document.body.setAttribute('velin-scroll-top', '400');
    await bootFromDOM(document, { attributes: true });
    await customElements.whenDefined('velin-scroll-top');
    const wc = document.querySelector('velin-scroll-top');
    expect(wc).not.toBeNull();
    expect(wc.getAttribute('threshold')).toBe('400');
    document.body.removeAttribute('velin-scroll-top');
    wc?.remove();
  });
});
