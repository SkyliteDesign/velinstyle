import { rovingTabindex } from './focus-manager.js';

const styles = `
  :host {
    display: block;
  }
  .tablist {
    display: flex;
    gap: var(--velin-space-1, 0.25rem);
    border-bottom: 2px solid var(--velin-color-border, #ddd);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  ::slotted([role="tab"]) {
    display: inline-flex;
    align-items: center;
    gap: var(--velin-space-2, 0.5rem);
    padding: var(--velin-space-3, 0.75rem) var(--velin-space-4, 1rem);
    min-block-size: 2.75rem;
    font-size: var(--velin-text-base, 1rem);
    font-weight: var(--velin-weight-medium, 500);
    color: var(--velin-color-text-muted, #666);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    white-space: nowrap;
    transition: color 150ms ease, border-color 150ms ease;
  }
  ::slotted([role="tab"][aria-selected="true"]) {
    color: var(--velin-color-primary, #2563eb);
    border-bottom-color: var(--velin-color-primary, #2563eb);
    font-weight: var(--velin-weight-semibold, 600);
  }
  ::slotted([role="tab"]:hover) {
    color: var(--velin-color-text, #111);
  }
  .panels {
    padding-block-start: var(--velin-space-4, 1rem);
  }
  ::slotted([role="tabpanel"][hidden]) {
    display: none;
  }
`;

class VelinTabs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._onTabClick = this._onTabClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="tablist" role="tablist" part="tablist">
        <slot name="tab"></slot>
      </div>
      <div class="panels" part="panels">
        <slot name="panel"></slot>
      </div>
    `;

    this.addEventListener('click', this._onTabClick);
    this.addEventListener('keydown', this._onKeydown);

    requestAnimationFrame(() => this._initTabs());
  }

  _initTabs() {
    const tabs = this._getTabs();
    const panels = this._getPanels();

    tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('slot', 'tab');
      if (!tab.id) tab.id = `velin-tab-${i}`;

      const panel = panels[i];
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('slot', 'panel');
        if (!panel.id) panel.id = `velin-panel-${i}`;
        tab.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', tab.id);
      }
    });

    const selectedTab = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (selectedTab) this._selectTab(selectedTab);
  }

  _getTabs() {
    return [...this.querySelectorAll('[role="tab"], [slot="tab"]')];
  }

  _getPanels() {
    return [...this.querySelectorAll('[role="tabpanel"], [slot="panel"]')];
  }

  _onTabClick(event) {
    const tab = event.target.closest('[role="tab"]');
    if (tab && this.contains(tab)) {
      this._selectTab(tab);
    }
  }

  _selectTab(selectedTab) {
    const tabs = this._getTabs();
    const panels = this._getPanels();

    tabs.forEach((tab, i) => {
      const isSelected = tab === selectedTab;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      if (panels[i]) {
        panels[i].hidden = !isSelected;
      }
    });

    this.dispatchEvent(
      new CustomEvent('velin-tab-change', {
        bubbles: true,
        detail: { tab: selectedTab },
      })
    );
  }

  _onKeydown(event) {
    const tabs = this._getTabs();
    if (tabs.includes(event.target)) {
      rovingTabindex(this, tabs, event);

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Home' || event.key === 'End') {
        const focused = tabs.find((t) => t.getAttribute('tabindex') === '0');
        if (focused) this._selectTab(focused);
      }
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onTabClick);
    this.removeEventListener('keydown', this._onKeydown);
  }
}

customElements.define('velin-tabs', VelinTabs);
export default VelinTabs;
