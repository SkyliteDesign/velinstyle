import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../components/velin-empty-state.js';

describe('velin-empty-state', () => {
  let el;

  beforeEach(() => {
    el = document.createElement('velin-empty-state');
    el.setAttribute('heading', 'No results');
    el.setAttribute('description', 'Try another filter.');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el?.remove();
  });

  it('renders heading and description', () => {
    expect(el.shadowRoot.querySelector('.heading-fallback').textContent).toBe('No results');
    expect(el.shadowRoot.querySelector('.description-fallback').textContent).toBe('Try another filter.');
  });

  it('updates heading after connect', () => {
    el.setAttribute('heading', 'Empty inbox');
    expect(el.shadowRoot.querySelector('.heading-fallback').textContent).toBe('Empty inbox');
  });

  it('exposes an actions slot', () => {
    const btn = document.createElement('button');
    btn.slot = 'actions';
    btn.textContent = 'Create';
    el.appendChild(btn);
    const slot = el.shadowRoot.querySelector('slot[name="actions"]');
    expect(slot.assignedElements()[0]).toBe(btn);
  });
});
