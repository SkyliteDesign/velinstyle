const PROVIDER_CDNS = {
  lucide: 'https://unpkg.com/lucide-static@latest/icons/{name}.svg',
  heroicons: 'https://unpkg.com/heroicons@2/24/outline/{name}.svg',
  bootstrap: 'https://unpkg.com/bootstrap-icons@latest/icons/{name}.svg',
  material: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/{name}/default/24px.svg',
  fontawesome: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/{name}.svg',
};

const PROVIDER_VARIANTS = {
  fontawesome: {
    regular: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/{name}.svg',
    solid: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/{name}.svg',
    brands: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/{name}.svg',
  },
  heroicons: {
    outline: 'https://unpkg.com/heroicons@2/24/outline/{name}.svg',
    solid: 'https://unpkg.com/heroicons@2/24/solid/{name}.svg',
    mini: 'https://unpkg.com/heroicons@2/20/solid/{name}.svg',
  },
};

function resolveProviderUrl(provider, variant) {
  const variants = PROVIDER_VARIANTS[provider];
  if (variant && variants?.[variant]) return variants[variant];
  return PROVIDER_CDNS[provider];
}

const _svgCache = new Map();

class VelinIcon extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'size', 'label', 'provider', 'variant', 'sprite'];
  }

  constructor() {
    super();
    this._rendered = false;
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (this._rendered) this._render();
  }

  _render() {
    const name = this.getAttribute('name');
    const size = this.getAttribute('size') || '24';
    const label = this.getAttribute('label');
    const provider = this.getAttribute('provider');
    const variant = this.getAttribute('variant');

    if (!name) {
      this.innerHTML = '';
      return;
    }

    if (provider && (PROVIDER_CDNS[provider] || PROVIDER_VARIANTS[provider])) {
      this._renderFromCDN(name, size, label, provider, variant);
      return;
    }

    this._renderFromSprite(name, size, label);
  }

  _renderFromSprite(name, size, label) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    this._applyStyle(svg);
    this._applyA11y(svg, label);

    const use = document.createElementNS(svgNS, 'use');
    const spriteAttr = this.getAttribute('sprite');
    const localSymbol = document.getElementById(name);
    const isLocalSymbol = localSymbol && localSymbol.tagName && localSymbol.tagName.toLowerCase() === 'symbol';
    let href;
    if (spriteAttr === '' || (spriteAttr == null && isLocalSymbol)) {
      href = `#${name}`;
    } else {
      const spriteUrl = spriteAttr || 'velin-icons.svg';
      href = `${spriteUrl}#${name}`;
    }
    use.setAttribute('href', href);
    svg.appendChild(use);

    this.innerHTML = '';
    this.appendChild(svg);
    this._rendered = true;
  }

  async _renderFromCDN(name, size, label, provider, variant) {
    const cacheKey = `${provider}:${variant || 'default'}:${name}`;

    if (_svgCache.has(cacheKey)) {
      this._injectSVG(_svgCache.get(cacheKey), size, label);
      return;
    }

    const template = resolveProviderUrl(provider, variant);
    if (!template) {
      this._renderFromSprite(name, size, label);
      return;
    }
    const url = template.replace('{name}', name);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      const text = await res.text();
      if (!text.includes('<svg')) throw new Error('Not SVG');
      _svgCache.set(cacheKey, text);
      this._injectSVG(text, size, label);
    } catch {
      this._renderFromSprite(name, size, label);
    }
  }

  _injectSVG(svgText, size, label) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) { this.innerHTML = ''; return; }

    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', '0 0 24 24');
    this._applyStyle(svg);
    this._applyA11y(svg, label);

    this.innerHTML = '';
    this.appendChild(document.importNode(svg, true));
    this._rendered = true;
  }

  _applyStyle(svg) {
    svg.style.display = 'inline-block';
    svg.style.verticalAlign = 'middle';
    svg.style.flexShrink = '0';
  }

  _applyA11y(svg, label) {
    if (label) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', label);
    } else {
      svg.setAttribute('aria-hidden', 'true');
    }
  }

  static get providers() { return Object.keys(PROVIDER_CDNS); }

  static registerProvider(name, urlTemplate) {
    PROVIDER_CDNS[name] = urlTemplate;
  }
}

customElements.define('velin-icon', VelinIcon);
export default VelinIcon;
