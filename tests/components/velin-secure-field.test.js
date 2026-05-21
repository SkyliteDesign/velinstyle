import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../components/velin-secure-field.js';

describe('velin-secure-field', () => {
  let field;

  beforeEach(() => {
    field = document.createElement('velin-secure-field');
    document.body.appendChild(field);
  });

  afterEach(() => {
    field?.remove();
  });

  it('does not include plain text or key in submit event', async () => {
    const input = field.shadowRoot.querySelector('input');
    input.value = 'secret123';
    const detail = await new Promise((resolve) => {
      field.addEventListener('velin-secure-submit', (e) => resolve(e.detail), { once: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(detail.plain).toBeUndefined();
    expect(detail.payload).toBeDefined();
    expect(String(detail.payload)).not.toContain('"key"');
  });
});
