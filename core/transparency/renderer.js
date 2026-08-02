/** @type {Map<string, (el: HTMLElement, record: object) => void>} */
const renderers = new Map();

export function registerTransparencyRenderer(name, fn) {
  renderers.set(name, fn);
}

export function listTransparencyRenderers() {
  return [...renderers.keys()];
}

/**
 * Render a disclosure mark onto an element.
 * @param {HTMLElement} el
 * @param {import('./registry.js').DisclosureRecord} record
 */
export function renderDisclosure(el, record) {
  if (typeof document === 'undefined' || !el) return null;
  const name = record.renderer || 'badge';
  const custom = renderers.get(name);
  if (custom) {
    custom(el, record);
    return el.querySelector('.velin-transparency');
  }
  return defaultRender(el, record);
}

function defaultRender(el, record) {
  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';

  let mark = el.querySelector(':scope > .velin-transparency');
  if (!mark) {
    mark = document.createElement('div');
    el.prepend(mark);
  }

  const renderer = record.renderer || 'badge';
  const tone = record.tone || 'neutral';
  const position = record.position || 'top-right';
  mark.className = [
    'velin-transparency',
    `velin-transparency--${renderer}`,
    `velin-transparency--tone-${tone}`,
    `velin-transparency--pos-${position}`,
  ].join(' ');
  mark.setAttribute('data-velin-transparency-id', record.id);
  mark.setAttribute('role', 'note');

  const claimsText = (record.claims || []).join(', ');
  const prov = record.provenance || {};
  const sr = document.createElement('span');
  sr.className = 'velin-sr-only';
  const lang = (el.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || 'en').startsWith('de')
    ? 'de'
    : 'en';
  sr.textContent = lang === 'de'
    ? `Transparenzhinweis: ${record.label}. ${claimsText}. ${provenanceSr(prov, 'de')}`
    : `Transparency notice: ${record.label}. ${claimsText}. ${provenanceSr(prov, 'en')}`;

  const visible = document.createElement('span');
  visible.className = 'velin-transparency__label';
  visible.textContent = record.label || 'Transparency';

  const details = document.createElement('span');
  details.className = 'velin-transparency__details';
  details.hidden = renderer === 'badge' || renderer === 'icon';
  details.textContent = formatDetails(record, lang);

  mark.replaceChildren(sr, visible, details);

  if (record.description) mark.title = record.description;
  else if (details.textContent) mark.title = details.textContent;

  el.setAttribute('data-velin-transparency', record.id);
  return mark;
}

function provenanceSr(p, lang) {
  const parts = [];
  if (p.createdBy) parts.push(lang === 'de' ? `Erstellt von ${p.createdBy}` : `Created by ${p.createdBy}`);
  if (p.createdAt) parts.push(lang === 'de' ? `am ${p.createdAt}` : `on ${p.createdAt}`);
  if (p.approvedBy) parts.push(lang === 'de' ? `Freigegeben von ${p.approvedBy}` : `Approved by ${p.approvedBy}`);
  if (p.license) parts.push(p.license);
  if (p.version) parts.push(`v${p.version}`);
  return parts.join('. ');
}

function formatDetails(record, lang) {
  const p = record.provenance || {};
  const bits = [];
  if (p.approvedBy) bits.push(lang === 'de' ? `Freigabe: ${p.approvedBy}` : `Approved: ${p.approvedBy}`);
  if (p.license) bits.push(p.license);
  if (p.version) bits.push(`v${p.version}`);
  if (p.updated || record.updated) bits.push(record.updated || p.publishedAt || '');
  return bits.filter(Boolean).join(' · ');
}

// Register alias names to default path
for (const name of ['overlay', 'badge', 'inline', 'tooltip', 'footer', 'ribbon', 'panel', 'icon', 'corner-badge', 'stamp', 'sidebar', 'floating-card', 'banner']) {
  registerTransparencyRenderer(name, (el, record) => {
    defaultRender(el, { ...record, renderer: normalizeRendererName(name) });
  });
}

function normalizeRendererName(name) {
  if (name === 'corner-badge' || name === 'stamp') return 'badge';
  if (name === 'floating-card' || name === 'sidebar') return 'panel';
  if (name === 'banner') return 'footer';
  return name;
}
