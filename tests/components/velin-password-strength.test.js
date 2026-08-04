import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../components/velin-password-strength.js';
import { scorePassword } from '../../components/velin-password-strength.js';

describe('scorePassword', () => {
  it('scores empty as too weak', () => {
    expect(scorePassword('').score).toBe(0);
  });

  it('scores a strong passphrase higher', () => {
    const result = scorePassword('CorrectHorse1!');
    expect(result.score).toBeGreaterThanOrEqual(4);
    expect(result.pct).toBeGreaterThanOrEqual(80);
  });
});

describe('velin-password-strength', () => {
  let el;
  let input;

  beforeEach(() => {
    input = document.createElement('input');
    input.type = 'password';
    input.id = 'pw-test';
    document.body.appendChild(input);
    el = document.createElement('velin-password-strength');
    el.setAttribute('for', 'pw-test');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el?.remove();
    input?.remove();
  });

  it('updates from the linked input', () => {
    let detail = null;
    el.addEventListener('velin-strength', (e) => { detail = e.detail; });
    input.value = 'Abcdef12!';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(detail?.score).toBeGreaterThanOrEqual(3);
    expect(el.getAttribute('data-score')).toBe(String(detail.score));
    expect(el.shadowRoot.querySelector('.label').textContent).toBe(detail.label);
  });

  it('supports the value attribute without for', () => {
    el.remove();
    el = document.createElement('velin-password-strength');
    el.setAttribute('value', 'short');
    document.body.appendChild(el);
    expect(el.getAttribute('data-score')).toBe('0');
  });
});
