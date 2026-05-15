import { describe, it, expect, beforeAll } from 'vitest';

const COMPONENTS = [
  { tag: 'velin-modal', module: '../../components/velin-modal.js', observedAttrs: ['open'] },
  { tag: 'velin-drawer', module: '../../components/velin-drawer.js', observedAttrs: ['open'] },
  { tag: 'velin-tabs', module: '../../components/velin-tabs.js', observedAttrs: [] },
  { tag: 'velin-accordion', module: '../../components/velin-accordion.js', observedAttrs: [] },
  { tag: 'velin-dropdown', module: '../../components/velin-dropdown.js', observedAttrs: ['open'] },
  { tag: 'velin-toast', module: '../../components/velin-toast.js', observedAttrs: [] },
  { tag: 'velin-icon', module: '../../components/velin-icon.js', observedAttrs: ['name', 'size', 'label'] },
  { tag: 'velin-theme-toggle', module: '../../components/velin-theme-toggle.js', observedAttrs: [] },
  { tag: 'velin-popover', module: '../../components/velin-popover.js', observedAttrs: ['open'] },
  { tag: 'velin-copy', module: '../../components/velin-copy.js', observedAttrs: [] },
  { tag: 'velin-scroll-top', module: '../../components/velin-scroll-top.js', observedAttrs: [] },
];

beforeAll(async () => {
  await import('../../components/index.js');
});

describe('Web Component registration', () => {
  for (const { tag } of COMPONENTS) {
    it(`${tag} is defined in the custom element registry`, () => {
      expect(customElements.get(tag)).toBeDefined();
    });
  }
});

describe('Web Component instantiation', () => {
  for (const { tag } of COMPONENTS) {
    it(`${tag} can be created with document.createElement`, () => {
      const el = document.createElement(tag);
      expect(el).toBeInstanceOf(HTMLElement);
      expect(el.tagName.toLowerCase()).toBe(tag);
    });
  }
});

describe('Web Component shadow DOM', () => {
  const withShadow = COMPONENTS.filter((c) => c.tag !== 'velin-icon');

  for (const { tag } of withShadow) {
    it(`${tag} attaches a shadow root on connect`, () => {
      const el = document.createElement(tag);
      document.body.appendChild(el);
      expect(el.shadowRoot).not.toBeNull();
      el.remove();
    });
  }
});

describe('Observed attributes', () => {
  for (const { tag, observedAttrs } of COMPONENTS) {
    if (observedAttrs.length === 0) continue;

    it(`${tag} observes [${observedAttrs.join(', ')}]`, () => {
      const Ctor = customElements.get(tag);
      expect(Ctor.observedAttributes).toEqual(expect.arrayContaining(observedAttrs));
    });
  }
});

describe('velin-modal', () => {
  it('has a dialog with role="dialog" and aria-modal', () => {
    const el = document.createElement('velin-modal');
    el.setAttribute('title', 'Test Modal');
    document.body.appendChild(el);
    const dialog = el.shadowRoot.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    el.remove();
  });

  it('reflects the title attribute into the heading', () => {
    const el = document.createElement('velin-modal');
    el.setAttribute('title', 'My Title');
    document.body.appendChild(el);
    const heading = el.shadowRoot.querySelector('.title');
    expect(heading.textContent).toBe('My Title');
    el.remove();
  });

  it('has a close button with aria-label', () => {
    const el = document.createElement('velin-modal');
    document.body.appendChild(el);
    const btn = el.shadowRoot.querySelector('.close-btn');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('Close');
    el.remove();
  });
});

describe('velin-drawer', () => {
  it('has a dialog with role="dialog" and aria-modal', () => {
    const el = document.createElement('velin-drawer');
    el.setAttribute('title', 'Test Drawer');
    document.body.appendChild(el);
    const dialog = el.shadowRoot.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    el.remove();
  });

  it('supports side attribute', () => {
    const el = document.createElement('velin-drawer');
    el.setAttribute('side', 'end');
    document.body.appendChild(el);
    expect(el.getAttribute('side')).toBe('end');
    el.remove();
  });
});

describe('velin-dropdown', () => {
  it('has a menu with role="menu"', () => {
    const el = document.createElement('velin-dropdown');
    document.body.appendChild(el);
    const menu = el.shadowRoot.querySelector('[role="menu"]');
    expect(menu).not.toBeNull();
    el.remove();
  });

  it('toggle() opens and closes', () => {
    const el = document.createElement('velin-dropdown');
    document.body.appendChild(el);
    expect(el.hasAttribute('open')).toBe(false);
    el.toggle();
    expect(el.hasAttribute('open')).toBe(true);
    el.toggle();
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
  });
});

describe('velin-accordion', () => {
  it('renders a region role', () => {
    const el = document.createElement('velin-accordion');
    document.body.appendChild(el);
    const region = el.shadowRoot.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    el.remove();
  });
});

describe('velin-toast', () => {
  it('sets ARIA live region attributes on connect', () => {
    const el = document.createElement('velin-toast');
    document.body.appendChild(el);
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('aria-atomic')).toBe('true');
    el.remove();
  });

  it('show() creates a toast element in shadow DOM', () => {
    const el = document.createElement('velin-toast');
    document.body.appendChild(el);
    el.show({ message: 'Hello', type: 'success', duration: 0 });
    const toast = el.shadowRoot.querySelector('.toast');
    expect(toast).not.toBeNull();
    expect(toast.querySelector('.toast-content').textContent).toBe('Hello');
    expect(toast.classList.contains('toast--success')).toBe(true);
    el.remove();
  });
});

describe('velin-icon', () => {
  it('renders an SVG with the correct size', () => {
    const el = document.createElement('velin-icon');
    el.setAttribute('name', 'check');
    el.setAttribute('size', '32');
    document.body.appendChild(el);
    const svg = el.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
    el.remove();
  });

  it('sets aria-hidden when no label is provided', () => {
    const el = document.createElement('velin-icon');
    el.setAttribute('name', 'check');
    document.body.appendChild(el);
    const svg = el.querySelector('svg');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    el.remove();
  });

  it('sets role="img" and aria-label when label is provided', () => {
    const el = document.createElement('velin-icon');
    el.setAttribute('name', 'check');
    el.setAttribute('label', 'Checkmark');
    document.body.appendChild(el);
    const svg = el.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Checkmark');
    el.remove();
  });
});

describe('velin-theme-toggle', () => {
  it('renders a button with aria-label', () => {
    const el = document.createElement('velin-theme-toggle');
    document.body.appendChild(el);
    const btn = el.shadowRoot.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('Toggle dark mode');
    el.remove();
  });
});

describe('velin-popover', () => {
  it('has a tooltip role when trigger is hover', () => {
    const el = document.createElement('velin-popover');
    el.setAttribute('trigger', 'hover');
    document.body.appendChild(el);
    const tooltip = el.shadowRoot.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
    el.remove();
  });

  it('toggle() opens and closes', () => {
    const el = document.createElement('velin-popover');
    document.body.appendChild(el);
    el.toggle();
    expect(el.hasAttribute('open')).toBe(true);
    el.toggle();
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
  });
});

describe('velin-copy', () => {
  it('renders a button with aria-label="Copy"', () => {
    const el = document.createElement('velin-copy');
    document.body.appendChild(el);
    const btn = el.shadowRoot.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('Copy');
    el.remove();
  });
});

describe('velin-scroll-top', () => {
  it('renders a button with aria-label="Scroll to top"', () => {
    const el = document.createElement('velin-scroll-top');
    document.body.appendChild(el);
    const btn = el.shadowRoot.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('Scroll to top');
    el.remove();
  });
});
