import { join } from 'path';
import { listRegisteredAttributes } from '../../core/attributes/registry.js';
import { banner, heading } from './markdown.js';

const ATTRIBUTE_DOCS = {
  'velin-modal': 'Opens a modal dialog (bridges to `<velin-modal>`).',
  'velin-tabs': 'Tab navigation (bridges to `<velin-tabs>`).',
  'velin-accordion': 'Accordion sections (bridges to `<velin-accordion>`).',
  'velin-tooltip': 'Tooltip on hover/focus (bridges to `<velin-tooltip>`).',
  'velin-copy': 'Copy text to clipboard (bridges to `<velin-copy>`).',
  'velin-counter': 'Animated number counter (bridges to `<velin-counter>`).',
  'velin-notify': 'Show a toast notification (bridges to `<velin-toast>`).',
  'velin-theme': 'Theme toggle or set `data-velin-theme`.',
  'velin-progress': 'Progress bar or ring (`ring` for `<velin-progress-ring>`).',
  'velin-search': 'Attach VelinSearch to an element.',
  'velin-reveal': 'Reveal element when scrolled into view.',
  'velin-fade': 'Fade-in on scroll.',
  'velin-slide': 'Slide-in on scroll (`up`, `down`, …).',
  'velin-scale': 'Scale-in on scroll.',
  'velin-parallax': 'Parallax background (`slow` optional).',
  'velin-hover': 'Hover lift/glow animation.',
  'velin-stagger': 'Stagger child animations (delay in ms).',
  'velin-scroll': 'Smooth scroll to anchor (`href="#id"`).',
  'velin-anchor': 'Scroll-margin for anchor targets.',
  'velin-lazy': 'Lazy-load images with optional skeleton.',
  'velin-skeleton': 'Skeleton placeholder (`text`, `avatar`, `image`, …).',
  'velin-loading': 'Loading spinner state.',
  'velin-grid': 'Auto grid layout (column count).',
  'velin-code': 'Code block with copy button and VelinHighlight syntax colors (use `language` or `velin-code="js"`).',
  'velin-quote': 'Styled blockquote.',
  'velin-highlight': 'Inline text mark (not syntax highlighting — use `velin-code` or `velinSyntax`).',
};

const A11Y_NOTES = {
  'velin-reveal': 'Honors `prefers-reduced-motion`: content shown immediately without animation.',
  'velin-fade': 'Honors `prefers-reduced-motion`.',
  'velin-slide': 'Honors `prefers-reduced-motion`.',
  'velin-scale': 'Honors `prefers-reduced-motion`.',
  'velin-parallax': 'Disabled under `prefers-reduced-motion` (CSS + motion runtime).',
  'velin-hover': 'Motion reduced globally when user prefers reduced motion.',
  'velin-stagger': 'Stagger delays collapse under reduced motion.',
  'velin-scroll': 'Uses `scroll-behavior: auto` when reduced motion is preferred.',
  'velin-skeleton': 'Sets `aria-hidden` only on empty placeholders — do not use on containers with real text.',
  'velin-loading': 'Sets `aria-busy`, `role="status"`, default `aria-label="Loading"`.',
  'velin-notify': 'Dispatches toast event; pair with `<velin-announcer>` or `initA11y()`.',
  'velin-lazy': 'Adds `loading="lazy"` on `<img>` only.',
};

export function extractAttributes() {
  return listRegisteredAttributes().map((name) => ({
    name,
    description: ATTRIBUTE_DOCS[name] || 'Velin HTML attribute extension.',
  }));
}

export function renderAttribute(attr) {
  let md = banner('velinstyle docs generate');
  md += heading(1, attr.name);
  md += `\n${attr.description}\n\n`;
  md += '## Example\n\n```html\n';
  if (attr.name === 'velin-code') {
    md += '<pre velin-code="js" language="js"><code>const x = 42;</code></pre>\n';
  } else if (attr.name === 'velin-scroll') {
    md += '<a href="#section" velin-scroll>Jump to section</a>\n';
  } else {
    md += `<div ${attr.name}${attr.name === 'velin-slide' ? '="up"' : ''}>…</div>\n`;
  }
  md += '```\n';
  if (A11Y_NOTES[attr.name]) {
    md += '\n## Accessibility\n\n';
    md += `${A11Y_NOTES[attr.name]}\n`;
  }
  return md;
}

export function renderAttributesIndex(attrs) {
  let md = banner('velinstyle docs generate');
  md += heading(1, 'Velin HTML attributes');
  md += '\nDeclarative extensions interpreted by `bootAttributes()` / `bootFromDOM({ attributes: true })`.\n\n';
  md += '| Attribute | Description |\n| --- | --- |\n';
  for (const a of attrs) {
    md += `| [\`${a.name}\`](./${a.name}.md) | ${a.description} |\n`;
  }
  return md;
}

export function writeAttributesDocs(outDir) {
  const attrs = extractAttributes();
  const written = [];
  for (const a of attrs) {
    written.push({ path: join(outDir, 'attributes', `${a.name}.md`), content: renderAttribute(a) });
  }
  written.push({ path: join(outDir, 'attributes', 'README.md'), content: renderAttributesIndex(attrs) });
  return written;
}
