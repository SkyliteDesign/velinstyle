import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { applyEffects, markVisible, VISIBLE_CLASS } from '../core/motion/effects.js';
import { applyStagger } from '../core/motion/stagger.js';

describe('motion effects', () => {
  it('applies fade classes for velin-fade', () => {
    const el = document.createElement('div');
    applyEffects(el, { fade: 'true' });
    expect(el.classList.contains('velin-animate-on-scroll--fade')).toBe(true);
  });

  it('marks element visible', () => {
    const el = document.createElement('div');
    markVisible(el);
    expect(el.classList.contains(VISIBLE_CLASS)).toBe(true);
    expect(el.dataset.velinVisible).toBe('true');
  });
});

describe('stagger', () => {
  it('sets delay on children', () => {
    const ul = document.createElement('ul');
    ul.appendChild(document.createElement('li'));
    ul.appendChild(document.createElement('li'));
    applyStagger(ul, '50');
    const items = ul.querySelectorAll('.velin-stagger-item');
    expect(items.length).toBe(2);
    expect(items[1].style.getPropertyValue('--velin-stagger-delay')).toBe('50ms');
  });
});
