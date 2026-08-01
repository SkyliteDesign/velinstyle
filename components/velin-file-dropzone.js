import { escapeHTML } from './sanitize.js';

const styles = `
  :host { display: block; }
  .zone {
    border: 2px dashed var(--velin-color-border, #cbd5e1);
    border-radius: var(--velin-radius-md, 0.5rem);
    padding: var(--velin-space-6, 1.5rem);
    background: var(--velin-color-surface-dim, var(--velin-color-bg-subtle, #f8fafc));
    color: var(--velin-color-text, #111);
    text-align: center;
    transition: border-color 150ms ease, background 150ms ease;
  }
  :host([dragging]) .zone {
    border-color: var(--velin-color-primary, #2563eb);
    background: var(--velin-color-primary-subtle, #eff6ff);
  }
  .hint { margin: 0 0 var(--velin-space-3, 0.75rem); color: var(--velin-color-text-muted, #64748b); }
  .browse {
    display: inline-flex; align-items: center; justify-content: center;
    min-block-size: 2.75rem; padding-inline: var(--velin-space-4, 1rem);
    border-radius: var(--velin-radius-md, 0.5rem);
    border: none; cursor: pointer;
    background: var(--velin-color-primary, #2563eb);
    color: var(--velin-color-on-primary, #fff);
    font: inherit;
  }
  .browse:focus-visible { outline: 2px solid var(--velin-color-focus, #2563eb); outline-offset: 2px; }
  input[type="file"] {
    position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); border: 0;
  }
  .list { list-style: none; padding: 0; margin: var(--velin-space-4, 1rem) 0 0; text-align: start; }
  .list li {
    display: flex; justify-content: space-between; gap: var(--velin-space-3, 0.75rem);
    padding: var(--velin-space-2, 0.5rem) 0;
    border-block-end: 1px solid var(--velin-color-border, #e2e8f0);
    font-size: var(--velin-text-sm, 0.875rem);
  }
  .progress {
    margin-block-start: var(--velin-space-3, 0.75rem);
    block-size: 0.5rem; border-radius: 999px;
    background: var(--velin-color-border, #e2e8f0); overflow: hidden;
  }
  .bar {
    block-size: 100%; inline-size: 0%;
    background: var(--velin-color-primary, #2563eb);
    transition: inline-size 150ms ease;
  }
  .status { margin: var(--velin-space-2, 0.5rem) 0 0; font-size: var(--velin-text-sm, 0.875rem); }
  .status[data-tone="error"] { color: var(--velin-color-danger, #b91c1c); }
`;

class VelinFileDropzone extends HTMLElement {
  static get observedAttributes() {
    return ['accept', 'multiple', 'label', 'progress'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._files = [];
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot?.querySelector('.zone')) this._render();
  }

  get files() {
    return this._files.slice();
  }

  _emitFiles(fileList) {
    const accept = this.getAttribute('accept');
    const files = [...fileList];
    if (accept) {
      const parts = accept.split(',').map((s) => s.trim().toLowerCase());
      const bad = files.find((f) => {
        const name = f.name.toLowerCase();
        const type = (f.type || '').toLowerCase();
        return !parts.some((p) => (p.startsWith('.') ? name.endsWith(p) : type === p || type.startsWith(p.replace('/*', '/'))));
      });
      if (bad) {
        this._setStatus(`File type not allowed: ${bad.name}`, 'error');
        this.dispatchEvent(new CustomEvent('velin-error', { bubbles: true, detail: { message: 'accept', file: bad } }));
        return;
      }
    }
    this._files = files;
    this._setStatus(files.length ? `${files.length} file(s) ready` : '', 'ok');
    this.dispatchEvent(new CustomEvent('velin-files', { bubbles: true, detail: { files } }));
    this._renderList();
  }

  _setStatus(text, tone = 'ok') {
    const el = this.shadowRoot?.querySelector('.status');
    if (!el) return;
    el.textContent = text;
    el.dataset.tone = tone;
  }

  _renderList() {
    const ul = this.shadowRoot?.querySelector('.list');
    if (!ul) return;
    ul.innerHTML = this._files.map((f) => `<li><span>${escapeHTML(f.name)}</span><span>${Math.round(f.size / 1024)} KB</span></li>`).join('');
  }

  _render() {
    const label = escapeHTML(this.getAttribute('label') || 'Upload files');
    const accept = this.getAttribute('accept') || '';
    const multiple = this.hasAttribute('multiple');
    const progress = Math.max(0, Math.min(100, Number(this.getAttribute('progress') || 0)));

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="zone" role="group" aria-label="${label}">
        <p class="hint">Drag and drop files here, or browse. Client-side only — wire <code>velin-files</code> to your upload API.</p>
        <button type="button" class="browse">Browse files</button>
        <input type="file" ${accept ? `accept="${escapeHTML(accept)}"` : ''} ${multiple ? 'multiple' : ''} />
        <div class="progress" hidden="${progress <= 0 ? 'true' : 'false'}" aria-hidden="${progress <= 0 ? 'true' : 'false'}">
          <div class="bar" style="inline-size:${progress}%"></div>
        </div>
        <p class="status" role="status" aria-live="polite"></p>
        <ul class="list"></ul>
      </div>
    `;

    const input = this.shadowRoot.querySelector('input');
    const browse = this.shadowRoot.querySelector('.browse');
    const zone = this.shadowRoot.querySelector('.zone');
    browse.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      if (input.files?.length) this._emitFiles(input.files);
    });

    ['dragenter', 'dragover'].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        this.setAttribute('dragging', '');
      });
    });
    ['dragleave', 'drop'].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        this.removeAttribute('dragging');
      });
    });
    zone.addEventListener('drop', (e) => {
      const list = e.dataTransfer?.files;
      if (list?.length) this._emitFiles(list);
    });

    this._renderList();
  }
}

customElements.define('velin-file-dropzone', VelinFileDropzone);
export default VelinFileDropzone;
