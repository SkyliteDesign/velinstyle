import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../components/velin-otp-input.js';

describe('velin-otp-input', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('velin-otp-input');
    el.setAttribute('length', '6');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el?.remove();
  });

  it('renders the configured number of digit inputs', () => {
    expect(el.shadowRoot.querySelectorAll('input')).toHaveLength(6);
  });

  it('advances focus and emits complete', () => {
    const inputs = [...el.shadowRoot.querySelectorAll('input')];
    let completed = null;
    el.addEventListener('velin-complete', (e) => { completed = e.detail.value; });
    for (let i = 0; i < 6; i++) {
      inputs[i].value = String(i + 1);
      inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
    }
    expect(el.value).toBe('123456');
    expect(completed).toBe('123456');
  });

  it('supports paste of a full code', () => {
    const first = el.shadowRoot.querySelector('input');
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    paste.clipboardData = { getData: () => '987654' };
    first.dispatchEvent(paste);
    expect(el.value).toBe('987654');
  });
});
