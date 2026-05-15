const KEY_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const MAX_ENTRY_SIZE = 64 * 1024;

class VelinPersist extends HTMLElement {
  static get observedAttributes() { return ['key', 'storage']; }

  constructor() {
    super();
    this._debounceTimer = null;
    this._onInput = this._onInput.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onReset = this._onReset.bind(this);
  }

  get storageKey() {
    const raw = this.getAttribute('key') || 'default';
    const safe = KEY_RE.test(raw) ? raw : 'default';
    return `velin-persist-${safe}`;
  }

  get _storage() {
    return this.getAttribute('storage') === 'session' ? sessionStorage : localStorage;
  }

  connectedCallback() {
    this.style.display = 'contents';
    this.addEventListener('input', this._onInput);
    this.addEventListener('change', this._onInput);
    this.addEventListener('submit', this._onSubmit);
    this.addEventListener('reset', this._onReset);

    requestAnimationFrame(() => this._restore());
  }

  disconnectedCallback() {
    this.removeEventListener('input', this._onInput);
    this.removeEventListener('change', this._onInput);
    this.removeEventListener('submit', this._onSubmit);
    this.removeEventListener('reset', this._onReset);
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
  }

  _onInput() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._save(), 300);
  }

  _onSubmit(e) {
    this.clear();
  }

  _onReset() {
    requestAnimationFrame(() => this.clear());
  }

  _getFields() {
    return this.querySelectorAll('input[name], textarea[name], select[name]');
  }

  _save() {
    const data = {};
    this._getFields().forEach((field) => {
      const name = field.name;
      if (!name) return;
      if (field.type === 'password' || field.type === 'file') return;
      if (field.type === 'checkbox') {
        data[name] = field.checked;
      } else if (field.type === 'radio') {
        if (field.checked) data[name] = field.value;
      } else {
        data[name] = field.value;
      }
    });

    try {
      const json = JSON.stringify(data);
      if (json.length > MAX_ENTRY_SIZE) return;
      this._storage.setItem(this.storageKey, json);
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        this.dispatchEvent(new CustomEvent('velin-persist-error', { bubbles: true, detail: { error: 'quota' } }));
      }
    }
  }

  _restore() {
    let data;
    try {
      const raw = this._storage.getItem(this.storageKey);
      if (!raw || raw.length > MAX_ENTRY_SIZE) return;
      data = JSON.parse(raw);
      if (typeof data !== 'object' || data === null) return;
    } catch { return; }

    this._getFields().forEach((field) => {
      const name = field.name;
      if (!(name in data)) return;
      if (field.type === 'checkbox') {
        field.checked = !!data[name];
      } else if (field.type === 'radio') {
        field.checked = field.value === data[name];
      } else {
        field.value = data[name];
      }
    });

    this.dispatchEvent(new CustomEvent('velin-persist-restore', { bubbles: true, detail: { data } }));
  }

  clear() {
    try {
      this._storage.removeItem(this.storageKey);
    } catch { /* ignore */ }
    this.dispatchEvent(new CustomEvent('velin-persist-clear', { bubbles: true }));
  }
}

customElements.define('velin-persist', VelinPersist);
export default VelinPersist;
