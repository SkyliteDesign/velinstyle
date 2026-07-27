import { announce } from './a11y-utils.js';

/**
 * Accessible error summary for a light-DOM `<form>`.
 *
 * Native constraint validation shows a transient browser bubble on one field at
 * a time, which is unusable with a screen reader or on a long form. This element
 * takes over submit handling to build a persistent, focusable summary, wire
 * `aria-invalid` and `aria-describedby` per field, and announce the error count.
 *
 * Covers WCAG 3.3.1 Error Identification, 3.3.3 Error Suggestion and the
 * `aria-describedby` half of 4.1.2 Name, Role, Value.
 */

const FIELD_SELECTOR = 'input, select, textarea';
const IGNORED_TYPES = new Set(['submit', 'reset', 'button', 'image', 'hidden']);

let fieldIdCounter = 0;

/** `CSS.escape` is missing in some non-browser DOM implementations. */
function escapeSelector(value) {
  const text = String(value ?? '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(text);
  return text.replace(/[^\w-]/g, (char) => `\\${char}`);
}

/** @param {HTMLElement} field */
function fieldLabel(field) {
  const explicit = field.getAttribute('data-error-label');
  if (explicit) return explicit;

  const ariaLabel = field.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();

  const labelledBy = field.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => field.ownerDocument.getElementById(id)?.textContent?.trim() || '')
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }

  if (field.id) {
    const label = field.ownerDocument.querySelector(`label[for="${escapeSelector(field.id)}"]`);
    if (label?.textContent.trim()) return label.textContent.trim();
  }

  const wrapping = field.closest('label');
  if (wrapping?.textContent.trim()) return wrapping.textContent.trim();

  return field.name || 'This field';
}

/** @param {HTMLElement} field */
function fieldMessage(field) {
  return field.getAttribute('data-error-message')?.trim() || field.validationMessage || 'Invalid value';
}

/**
 * @param {HTMLElement} field
 * @param {string} id
 */
function addDescribedBy(field, id) {
  const ids = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  if (!ids.includes(id)) {
    ids.push(id);
    field.setAttribute('aria-describedby', ids.join(' '));
  }
}

/**
 * @param {HTMLElement} field
 * @param {string} id
 */
function removeDescribedBy(field, id) {
  const ids = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  const next = ids.filter((value) => value !== id);
  if (next.length) field.setAttribute('aria-describedby', next.join(' '));
  else field.removeAttribute('aria-describedby');
}

class VelinFormSummary extends HTMLElement {
  static get observedAttributes() {
    return ['for', 'heading'];
  }

  constructor() {
    super();
    this._form = null;
    this._panel = null;
    this._errors = [];
    this._onSubmit = this._onSubmit.bind(this);
    this._onFieldChange = this._onFieldChange.bind(this);
    this._onReset = this._onReset.bind(this);
  }

  connectedCallback() {
    this.classList.add('velin-form-summary');
    requestAnimationFrame(() => this._bindForm());
  }

  disconnectedCallback() {
    this._unbindForm();
  }

  attributeChangedCallback(name, previous, next) {
    if (previous === next) return;
    if (name === 'for' && this.isConnected) {
      this._unbindForm();
      this._bindForm();
    } else if (name === 'heading' && this._panel) {
      const heading = this._panel.querySelector('.velin-form-summary__heading');
      if (heading) heading.textContent = this.headingText;
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  get form() {
    return this._form;
  }

  /** @returns {{ field: HTMLElement, label: string, message: string }[]} */
  get errors() {
    return this._errors.slice();
  }

  get headingText() {
    return this.getAttribute('heading') || 'There is a problem';
  }

  /** Validate the form and render the summary. @returns {boolean} valid */
  validate() {
    if (!this._form) return true;
    const errors = [];
    for (const field of this._fields()) {
      if (field.checkValidity()) {
        this._clearFieldError(field);
        continue;
      }
      const error = { field, label: fieldLabel(field), message: fieldMessage(field) };
      this._markFieldError(field, error.message);
      errors.push(error);
    }
    this._errors = errors;
    this._render();
    return errors.length === 0;
  }

  /** Remove the summary and all field error state. */
  clear() {
    for (const field of this._fields()) this._clearFieldError(field);
    this._errors = [];
    this._render();
  }

  /** Move focus to the first field with an error. */
  focusFirstError() {
    const first = this._errors[0];
    if (first) this._focusField(first.field);
  }

  // ── Form wiring ────────────────────────────────────────────────────────────

  _bindForm() {
    const id = this.getAttribute('for');
    this._form = id ? this.ownerDocument.getElementById(id) : this.closest('form');
    if (!this._form) return;

    // Native bubbles show one error at a time and vanish; the summary replaces them.
    if (!this.hasAttribute('native-validation')) this._form.noValidate = true;

    this._form.addEventListener('submit', this._onSubmit);
    this._form.addEventListener('reset', this._onReset);
    this._form.addEventListener('input', this._onFieldChange);
    this._form.addEventListener('change', this._onFieldChange);
  }

  _unbindForm() {
    if (!this._form) return;
    this._form.removeEventListener('submit', this._onSubmit);
    this._form.removeEventListener('reset', this._onReset);
    this._form.removeEventListener('input', this._onFieldChange);
    this._form.removeEventListener('change', this._onFieldChange);
    this._form = null;
  }

  /** @returns {HTMLElement[]} */
  _fields() {
    if (!this._form) return [];
    const seenRadioNames = new Set();
    return [...this._form.querySelectorAll(FIELD_SELECTOR)].filter((field) => {
      if (IGNORED_TYPES.has(field.type)) return false;
      if (field.disabled || field.hasAttribute('data-error-ignore')) return false;
      if (typeof field.checkValidity !== 'function') return false;
      // One entry per radio group so the summary lists the group once.
      if (field.type === 'radio' && field.name) {
        if (seenRadioNames.has(field.name)) return false;
        seenRadioNames.add(field.name);
      }
      return true;
    });
  }

  _onSubmit(event) {
    if (this.validate()) return;
    event.preventDefault();
    this._announceErrors();
    this._focusPanel();
    this.dispatchEvent(new CustomEvent('velin-form-invalid', {
      bubbles: true,
      detail: { errors: this.errors.map(({ label, message }) => ({ label, message })) },
    }));
  }

  _onReset() {
    requestAnimationFrame(() => this.clear());
  }

  /** Re-validate a single field once it already had an error, never before. */
  _onFieldChange(event) {
    const field = event.target;
    if (!field || !this._errors.some((error) => error.field === field)) return;
    if (!field.checkValidity()) return;

    this._clearFieldError(field);
    this._errors = this._errors.filter((error) => error.field !== field);
    this._render();
    if (this._errors.length === 0) {
      this.dispatchEvent(new CustomEvent('velin-form-valid', { bubbles: true }));
    }
  }

  // ── Field state ────────────────────────────────────────────────────────────

  /** @param {HTMLElement} field */
  _errorId(field) {
    if (!field.id) field.id = `velin-field-${++fieldIdCounter}`;
    return `${field.id}-error`;
  }

  /**
   * @param {HTMLElement} field
   * @param {string} message
   */
  _markFieldError(field, message) {
    const errorId = this._errorId(field);
    field.setAttribute('aria-invalid', 'true');

    let holder = this.ownerDocument.getElementById(errorId);
    if (!holder) {
      holder = this._form.querySelector(`[data-velin-error-for="${escapeSelector(field.name || field.id)}"]`);
    }
    if (!holder) {
      holder = this.ownerDocument.createElement('p');
      holder.dataset.velinErrorGenerated = 'true';
      field.insertAdjacentElement('afterend', holder);
    }
    holder.id = errorId;
    holder.classList.add('velin-field-error');
    holder.textContent = message;
    addDescribedBy(field, errorId);
  }

  /** @param {HTMLElement} field */
  _clearFieldError(field) {
    if (!field.id) return;
    const errorId = `${field.id}-error`;
    field.removeAttribute('aria-invalid');
    removeDescribedBy(field, errorId);

    const holder = this.ownerDocument.getElementById(errorId);
    if (!holder) return;
    if (holder.dataset.velinErrorGenerated) holder.remove();
    else holder.textContent = '';
  }

  /** @param {HTMLElement} field */
  _focusField(field) {
    const target = field.type === 'radio' && field.name
      ? this._form.querySelector(`input[type="radio"][name="${escapeSelector(field.name)}"]`) || field
      : field;
    target.focus();
    this.dispatchEvent(new CustomEvent('velin-form-error-focus', {
      bubbles: true,
      detail: { name: target.name || target.id },
    }));
  }

  // ── Summary panel ──────────────────────────────────────────────────────────

  _render() {
    if (!this._errors.length) {
      this._panel?.remove();
      this._panel = null;
      this.hidden = true;
      return;
    }

    this.hidden = false;
    if (!this._panel?.isConnected) {
      const panel = this.ownerDocument.createElement('div');
      panel.className = 'velin-form-summary__panel velin-alert velin-alert--danger';
      panel.setAttribute('role', 'alert');
      panel.tabIndex = -1;

      const heading = this.ownerDocument.createElement('p');
      heading.className = 'velin-form-summary__heading';
      heading.textContent = this.headingText;

      const list = this.ownerDocument.createElement('ul');
      list.className = 'velin-form-summary__list';

      panel.append(heading, list);
      this.appendChild(panel);
      this._panel = panel;
    }

    const list = this._panel.querySelector('.velin-form-summary__list');
    list.textContent = '';
    for (const error of this._errors) {
      const item = this.ownerDocument.createElement('li');
      const link = this.ownerDocument.createElement('a');
      link.href = `#${this._errorId(error.field).replace(/-error$/, '')}`;
      link.textContent = `${error.label}: ${error.message}`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this._focusField(error.field);
      });
      item.appendChild(link);
      list.appendChild(item);
    }
  }

  _focusPanel() {
    this._panel?.focus();
  }

  _announceErrors() {
    const count = this._errors.length;
    announce(count === 1 ? '1 field needs attention' : `${count} fields need attention`, 'assertive');
  }
}

customElements.define('velin-form-summary', VelinFormSummary);
export default VelinFormSummary;
