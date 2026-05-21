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
  { tag: 'velin-carousel', module: '../../components/velin-carousel.js', observedAttrs: ['autoplay', 'interval'] },
  { tag: 'velin-collapse', module: '../../components/velin-collapse.js', observedAttrs: ['open'] },
  { tag: 'velin-scrollspy', module: '../../components/velin-scrollspy.js', observedAttrs: [] },
  { tag: 'velin-tooltip', module: '../../components/velin-tooltip.js', observedAttrs: ['content', 'placement'] },
  { tag: 'velin-lightbox', module: '../../components/velin-lightbox.js', observedAttrs: [] },
  { tag: 'velin-stepper', module: '../../components/velin-stepper.js', observedAttrs: [] },
  { tag: 'velin-dialog', module: '../../components/velin-dialog.js', observedAttrs: [] },
  { tag: 'velin-countdown', module: '../../components/velin-countdown.js', observedAttrs: [] },
  { tag: 'velin-progress-ring', module: '../../components/velin-progress-ring.js', observedAttrs: [] },
  { tag: 'velin-persist', module: '../../components/velin-persist.js', observedAttrs: [] },
  { tag: 'velin-combobox', module: '../../components/velin-combobox.js', observedAttrs: ['open', 'aria-label'] },
  { tag: 'velin-bottom-nav', module: '../../components/velin-bottom-nav.js', observedAttrs: ['aria-label', 'current'] },
  { tag: 'velin-sheet', module: '../../components/velin-sheet.js', observedAttrs: ['open'] },
  { tag: 'velin-segmented-control', module: '../../components/velin-segmented-control.js', observedAttrs: ['aria-label'] },
  { tag: 'velin-rating', module: '../../components/velin-rating.js', observedAttrs: ['value'] },
  { tag: 'velin-menubar', module: '../../components/velin-menubar.js', observedAttrs: [] },
  { tag: 'velin-command', module: '../../components/velin-command.js', observedAttrs: ['open'] },
  { tag: 'velin-announcer', module: '../../components/velin-announcer.js', observedAttrs: [] },
  { tag: 'velin-code-block', module: '../../components/velin-code-block.js', observedAttrs: [] },
  { tag: 'velin-email', module: '../../components/velin-email.js', observedAttrs: ['value', 'obfuscate', 'label'] },
  { tag: 'velin-live-dot', module: '../../components/velin-live-dot.js', observedAttrs: [] },
  { tag: 'velin-sparkline', module: '../../components/velin-sparkline.js', observedAttrs: [] },
  { tag: 'velin-search', module: '../../components/velin-search.js', observedAttrs: [] },
  { tag: 'velin-counter', module: '../../components/velin-counter.js', observedAttrs: [] },
  { tag: 'velin-secure-field', module: '../../components/velin-secure-field.js', observedAttrs: ['type', 'name', 'label', 'mode', 'autocomplete'] },
];

const CONTRACT_TAGS = [
  'velin-accordion', 'velin-announcer', 'velin-bottom-nav', 'velin-carousel', 'velin-code-block',
  'velin-collapse', 'velin-combobox', 'velin-command', 'velin-copy', 'velin-countdown', 'velin-counter',
  'velin-dialog', 'velin-drawer', 'velin-dropdown', 'velin-email', 'velin-icon', 'velin-lightbox',
  'velin-live-dot', 'velin-menubar', 'velin-modal', 'velin-persist', 'velin-popover', 'velin-progress-ring',
  'velin-rating', 'velin-scroll-top', 'velin-scrollspy', 'velin-search', 'velin-secure-field',
  'velin-segmented-control', 'velin-sheet', 'velin-sparkline', 'velin-stepper', 'velin-tabs',
  'velin-theme-toggle', 'velin-toast', 'velin-tooltip',
];

beforeAll(async () => {
  await import('../../components/index.js');
  await import('../../components/velin-secure-field.js');
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

describe('contract coverage', () => {
  it('tests every tag listed in component-contracts.json', () => {
    const tested = new Set(COMPONENTS.map((c) => c.tag));
    for (const tag of CONTRACT_TAGS) {
      expect(tested.has(tag)).toBe(true);
    }
  });
});

describe('Web Component shadow DOM', () => {
  const withShadow = COMPONENTS.filter(
    (c) =>
      ![
        'velin-icon',
        'velin-scrollspy',
        'velin-persist',
        'velin-sparkline',
        'velin-code-block',
        'velin-search',
        'velin-counter',
      ].includes(c.tag),
  );

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
  it('has a dialog with role="dialog" and aria-labelledby', () => {
    const el = document.createElement('velin-drawer');
    el.setAttribute('title', 'Test Drawer');
    document.body.appendChild(el);
    const dialog = el.shadowRoot.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('velin-drawer-title');
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
  it('wires aria-controls on summary elements', () => {
    const el = document.createElement('velin-accordion');
    el.innerHTML = '<details><summary>One</summary><p id="p1">Content</p></details>';
    document.body.appendChild(el);
    const summary = el.querySelector('summary');
    expect(summary.getAttribute('aria-controls')).toBe('p1');
    el.remove();
  });
});

describe('velin-modal keyboard', () => {
  it('closes on Escape', () => {
    const el = document.createElement('velin-modal');
    el.setAttribute('title', 'Kbd');
    document.body.appendChild(el);
    el.open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.hasAttribute('open')).toBe(false);
    el.remove();
  });
});

describe('velin-collapse', () => {
  it('sets aria-expanded on trigger', () => {
    const el = document.createElement('velin-collapse');
    const btn = document.createElement('button');
    btn.slot = 'trigger';
    btn.textContent = 'Toggle';
    el.appendChild(btn);
    document.body.appendChild(el);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-controls')).toBeTruthy();
    el.open();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
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
    expect(svg.getAttribute('role')).toBe('presentation');
    const use = svg.querySelector('use');
    if (use) expect(use.getAttribute('aria-hidden')).toBe('true');
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

describe('velin-search', () => {
  it('input has default aria-label', async () => {
    const el = document.createElement('velin-search');
    document.body.appendChild(el);
    await customElements.whenDefined('velin-search');
    await new Promise((r) => setTimeout(r, 50));
    const input = el.querySelector('[data-velin-search-input]');
    expect(input?.getAttribute('aria-label')).toBe('Search');
    el.remove();
  });
});

describe('velin-counter', () => {
  it('exposes live region', () => {
    const el = document.createElement('velin-counter');
    el.setAttribute('to', '10');
    document.body.appendChild(el);
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    el.remove();
  });
});

describe('velin-live-dot', () => {
  it('exposes status via aria-label on host', () => {
    const el = document.createElement('velin-live-dot');
    el.setAttribute('status', 'live');
    document.body.appendChild(el);
    expect(el.getAttribute('aria-label')).toBeTruthy();
    el.remove();
  });
});

describe('velin-sparkline', () => {
  it('uses role=img when label is set', () => {
    const el = document.createElement('velin-sparkline');
    el.setAttribute('values', '1,2,3');
    el.setAttribute('label', 'Weekly trend');
    document.body.appendChild(el);
    const svg = el.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Weekly trend');
    el.remove();
  });
});

describe('velin-email', () => {
  it('renders reveal button before showing address', () => {
    const el = document.createElement('velin-email');
    el.setAttribute('value', 'dGVzdEBleGFtcGxlLmNvbQ==');
    el.setAttribute('obfuscate', 'base64');
    document.body.appendChild(el);
    const btn = el.shadowRoot.querySelector('button');
    expect(btn).not.toBeNull();
    expect(el.shadowRoot.querySelector('.revealed')).toBeNull();
    el.remove();
  });
});

describe('velin-code-block', () => {
  it('renders code in light DOM with optional expand control', async () => {
    const el = document.createElement('velin-code-block');
    el.textContent = 'const x = 1;';
    document.body.appendChild(el);
    await customElements.whenDefined('velin-code-block');
    await new Promise((r) => setTimeout(r, 20));
    expect(el.querySelector('pre, code, [part="code"]')).toBeTruthy();
    el.remove();
  });
});

describe('Legacy *-wc aliases (deprecated)', () => {
  it('velin-tooltip-wc remains registered', () => {
    expect(customElements.get('velin-tooltip-wc')).toBeDefined();
  });

  it('velin-stepper-wc remains registered', () => {
    expect(customElements.get('velin-stepper-wc')).toBeDefined();
  });
});
