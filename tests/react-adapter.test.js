import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  splitProps,
  applyVelinProps,
  bindVelinListeners,
  isVelinEventProp,
  velinEventName,
  componentNameForTag,
} from '../packages/react/src/apply-props.js';
import { VELIN_TAGS } from '../packages/react/src/tags.js';
import { COMPONENT_LOADERS } from '../components/runtime/component-loaders.js';

const ROOT = join(import.meta.dirname, '..');
const CANONICAL_TAGS = Object.keys(COMPONENT_LOADERS).filter((tag) => !tag.endsWith('-wc'));

describe('React adapter coverage', () => {
  it('wraps every canonical web component', () => {
    expect([...VELIN_TAGS].sort()).toEqual([...CANONICAL_TAGS].sort());
  });

  it('excludes deprecated *-wc aliases', () => {
    expect(VELIN_TAGS.filter((tag) => tag.endsWith('-wc'))).toEqual([]);
  });

  it('exports a wrapper constant per tag', () => {
    const index = readFileSync(join(ROOT, 'packages', 'react', 'src', 'index.jsx'), 'utf-8');
    for (const tag of CANONICAL_TAGS) {
      expect(index).toContain(`export const ${componentNameForTag(tag)} = createVelinComponent('${tag}');`);
    }
  });

  it('declares types for every wrapper', () => {
    const types = readFileSync(join(ROOT, 'packages', 'react', 'src', 'index.d.ts'), 'utf-8');
    for (const tag of CANONICAL_TAGS) {
      expect(types).toContain(`export declare const ${componentNameForTag(tag)}: VelinComponent;`);
    }
  });

  it('keeps the wrappers previously published as experimental', () => {
    const legacyNames = [
      'VelinDialog', 'VelinModal', 'VelinDrawer', 'VelinSheet', 'VelinThemeToggle',
      'VelinCombobox', 'VelinBottomNav', 'VelinSegmentedControl', 'VelinRating',
      'VelinMenubar', 'VelinCommand', 'VelinAnnouncer',
    ];
    const index = readFileSync(join(ROOT, 'packages', 'react', 'src', 'index.jsx'), 'utf-8');
    for (const name of legacyNames) {
      expect(index).toContain(`export const ${name} = createVelinComponent(`);
    }
  });
});

describe('React prop mapping', () => {
  it('maps onVelin* props to custom event names', () => {
    expect(isVelinEventProp('onVelinChange')).toBe(true);
    expect(isVelinEventProp('onClick')).toBe(false);
    expect(velinEventName('onVelinChange')).toBe('velin-change');
    expect(velinEventName('onVelinSearchSelect')).toBe('velin-search-select');
  });

  it('derives component names from tags', () => {
    expect(componentNameForTag('velin-code-block')).toBe('VelinCodeBlock');
    expect(componentNameForTag('velin-live-dot')).toBe('VelinLiveDot');
  });

  it('routes props into attribute, property, boolean and listener buckets', () => {
    const onVelinChange = () => {};
    const onClick = () => {};
    const items = [{ id: 1 }];
    const parts = splitProps({
      label: 'Search',
      size: 20,
      open: true,
      hidden: false,
      items,
      onVelinChange,
      onClick,
      className: 'velin-search',
      children: 'text',
      missing: null,
      absent: undefined,
    });

    expect(parts.attributes).toEqual({ label: 'Search', size: 20 });
    expect(parts.booleans).toEqual({ open: true, hidden: false });
    expect(parts.properties).toEqual({ items });
    expect(parts.listeners).toEqual({ 'velin-change': onVelinChange });
    expect(parts.reactProps).toEqual({ onClick });
    expect(parts.className).toBe('velin-search');
    expect(parts.children).toBe('text');
    expect(parts.attributes).not.toHaveProperty('missing');
    expect(parts.attributes).not.toHaveProperty('absent');
  });

  it('sets boolean attributes by presence rather than string value', () => {
    const el = document.createElement('velin-modal');
    applyVelinProps(el, { booleans: { open: true } });
    expect(el.hasAttribute('open')).toBe(true);
    expect(el.getAttribute('open')).toBe('');

    applyVelinProps(el, { booleans: { open: false } });
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('assigns objects as element properties instead of stringifying them', () => {
    const el = document.createElement('velin-search');
    const entries = [{ title: 'Docs' }];
    applyVelinProps(el, { properties: { entries } });
    expect(el.entries).toBe(entries);
    expect(el.getAttribute('entries')).toBe(null);
  });

  it('binds and releases custom event listeners', () => {
    const el = document.createElement('velin-rating');
    let calls = 0;
    const unbind = bindVelinListeners(el, { 'velin-change': () => { calls += 1; } });

    el.dispatchEvent(new CustomEvent('velin-change'));
    expect(calls).toBe(1);

    unbind();
    el.dispatchEvent(new CustomEvent('velin-change'));
    expect(calls).toBe(1);
  });
});
