import { rovingTabindex } from './focus-manager.js';
import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: inline-block; position: relative; }
  .listbox {
    position: absolute; z-index: var(--velin-z-dropdown, 100);
    inset-block-start: 100%; inset-inline-start: 0;
    min-inline-size: 100%; margin-block-start: var(--velin-space-1, 0.25rem);
    padding-block: var(--velin-space-1, 0.25rem);
    background: var(--velin-color-surface-bright, #fff);
    border: 1px solid var(--velin-color-border, #ddd);
    border-radius: var(--velin-radius-md, 0.5rem);
    box-shadow: var(--velin-shadow-lg, 0 10px 15px rgba(0,0,0,0.08));
    opacity: 0; visibility: hidden;
    transition: opacity 150ms ease, visibility 150ms ease;
  }
  :host([open]) .listbox { opacity: 1; visibility: visible; }
  ::slotted([role="option"]) {
    display: block; inline-size: 100%;
    padding: var(--velin-space-2, 0.5rem) var(--velin-space-4, 1rem);
    min-block-size: 2.5rem;
    text-align: start; background: none; border: none;
    cursor: pointer; font-size: var(--velin-text-base, 1rem);
  }
  ::slotted([role="option"][aria-selected="true"]) {
    background: var(--velin-color-surface-dim, #eee);
  }
`;

class VelinCombobox extends HTMLElement {
  static get observedAttributes() { return ['open', 'aria-label']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this._onDocClick = this._onDocClick.bind(this);
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    const listId = `velin-combobox-list-${Math.random().toString(36).slice(2, 9)}`;
    this._listId = listId;
    const listLabel = escapeHTML(this.getAttribute('aria-label') || 'Options');
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <slot name="trigger"></slot>
      <div class="listbox" id="${listId}" role="listbox" aria-label="${listLabel}" part="listbox"><slot></slot></div>
    `;
    const triggerSlot = this.shadowRoot.querySelector('slot[name="trigger"]');
    triggerSlot.addEventListener('slotchange', () => this._wireTrigger());
    this.shadowRoot.querySelector('slot:not([name])')?.addEventListener('slotchange', () => this._wireOptions());
    this._wireTrigger();
    this._wireOptions();
    this.addEventListener('keydown', this._onKey);
  }

  _wireTrigger() {
    const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
    if (!trigger) return;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
    trigger.setAttribute('aria-controls', this._listId);
    trigger.setAttribute('aria-autocomplete', 'list');
    if (!trigger.id) trigger.id = `velin-combobox-trigger-${Math.random().toString(36).slice(2, 9)}`;
    const list = this.shadowRoot.querySelector('.listbox');
    if (list) list.setAttribute('aria-labelledby', trigger.id);
    if (!trigger.dataset.velinComboWired) {
      trigger.dataset.velinComboWired = '1';
      trigger.addEventListener('click', () => this.toggle());
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); this.open(); }
      });
    }
  }

  _wireOptions() {
    const options = this._getOptions();
    options.forEach((el, i) => {
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', el.hasAttribute('selected') ? 'true' : 'false');
      el.setAttribute('tabindex', i === 0 ? '0' : '-1');
    });
  }

  _getOptions() {
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    return slot ? slot.assignedElements().filter((el) => !el.hidden) : [];
  }

  toggle() { this.hasAttribute('open') ? this.close() : this.open(); }

  open() {
    this.setAttribute('open', '');
    const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onDocClick, true);
    requestAnimationFrame(() => {
      const opts = this._getOptions();
      if (opts.length) opts[0].focus();
    });
  }

  close() {
    this.removeAttribute('open');
    const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
    if (trigger) { trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); }
    document.removeEventListener('click', this._onDocClick, true);
    this.dispatchEvent(new CustomEvent('velin-close', { bubbles: true }));
  }

  _onDocClick(e) {
    if (!this.contains(e.target)) this.close();
  }

  _onKey(e) {
    if (!this.hasAttribute('open')) return;
    if (e.key === 'Escape') { this.close(); return; }
    const options = this._getOptions();
    if (!options.length) return;
    rovingTabindex(this, options, e);
    if (e.key === 'Enter' && options.includes(e.target)) {
      this._selectOption(e.target);
      this.close();
    }
  }

  _selectOption(el) {
    this._getOptions().forEach((o) => o.setAttribute('aria-selected', o === el ? 'true' : 'false'));
    const trigger = this.shadowRoot.querySelector('slot[name="trigger"]')?.assignedElements()[0];
    if (trigger && 'value' in trigger) trigger.value = el.textContent?.trim() || '';
    this.dispatchEvent(new CustomEvent('velin-select', { bubbles: true, detail: { option: el } }));
  }

  attributeChangedCallback(name) {
    if (name === 'open') this._wireTrigger();
    if (name === 'aria-label') {
      const list = this.shadowRoot?.querySelector('.listbox');
      if (list) list.setAttribute('aria-label', escapeHTML(this.getAttribute('aria-label') || 'Options'));
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick, true);
  }
}

customElements.define('velin-combobox', VelinCombobox);
export default VelinCombobox;
