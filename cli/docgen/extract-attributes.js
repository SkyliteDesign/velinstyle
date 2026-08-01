import { join } from 'path';
import { listRegisteredAttributes } from '../../core/attributes/registry.js';
import { banner, heading, table } from './markdown.js';

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
  'velin-scroll-top': 'Inject / configure `<velin-scroll-top>` (empty or `threshold` px).',
  'velin-anchor': 'Scroll-margin for anchor targets.',
  'velin-lazy': 'Lazy-load images with optional skeleton.',
  'velin-skeleton': 'Skeleton placeholder (`text`, `avatar`, `image`, …).',
  'velin-loading': 'Loading spinner state.',
  'velin-grid': 'Auto grid layout (column count).',
  'velin-code': 'Code block with copy button and VelinHighlight syntax colors (use `language` or `velin-code="js"`).',
  'velin-quote': 'Styled blockquote.',
  'velin-highlight': 'Inline text mark (not syntax highlighting — use `velin-code` or `velinSyntax`).',
};

/** Value | Meaning | Bridges to */
const ATTRIBUTE_VALUES = {
  'velin-modal': [
    ['(empty / present)', 'Upgrade host to modal trigger / content bridge', '`<velin-modal>`'],
  ],
  'velin-tabs': [
    ['(empty / present)', 'Bridge host to tabs controller', '`<velin-tabs>`'],
  ],
  'velin-accordion': [
    ['(empty / present)', 'Bridge host to accordion', '`<velin-accordion>`'],
  ],
  'velin-tooltip': [
    ['(empty)', 'Use host `title` / text as tooltip', '`<velin-tooltip>`'],
    ['`text`', 'Explicit tooltip label', '`<velin-tooltip>`'],
  ],
  'velin-copy': [
    ['(empty)', 'Copy host text content', '`<velin-copy>` / Clipboard API'],
    ['`selector` / value', 'Copy from related node when provided by enhance', 'Clipboard API'],
  ],
  'velin-counter': [
    ['number', 'Target value to animate toward', '`<velin-counter>`'],
  ],
  'velin-notify': [
    ['message', 'Toast body text', '`<velin-toast>`'],
  ],
  'velin-theme': [
    ['`toggle`', 'Cycle light/dark (or theme picker behavior)', '`data-velin-theme`'],
    ['`<name>`', 'Set named theme / scheme', '`data-velin-theme`'],
  ],
  'velin-progress': [
    ['`0`–`100`', 'Linear progress value', '`<velin-progress>`'],
    ['`ring`', 'Use progress ring instead of bar', '`<velin-progress-ring>`'],
  ],
  'velin-search': [
    ['(empty / present)', 'Attach search UI / behavior', 'VelinSearch / `<velin-search>`'],
  ],
  'velin-scroll-top': [
    ['(empty)', 'Mount default scroll-top control', '`<velin-scroll-top>`'],
    ['threshold px', 'Show after scroll distance', '`<velin-scroll-top>`'],
  ],
  'velin-reveal': [
    ['(empty / present)', 'Reveal when in view', 'Motion runtime'],
  ],
  'velin-fade': [
    ['(empty / present)', 'Fade in on scroll', 'Motion runtime'],
  ],
  'velin-slide': [
    ['`up`', 'Slide from below', 'Motion runtime'],
    ['`down`', 'Slide from above', 'Motion runtime'],
    ['`left` / `right`', 'Horizontal slide', 'Motion runtime'],
  ],
  'velin-scale': [
    ['(empty / present)', 'Scale in on scroll', 'Motion runtime'],
  ],
  'velin-parallax': [
    ['(empty)', 'Default parallax speed', 'Motion runtime'],
    ['`slow`', 'Reduced parallax factor', 'Motion runtime'],
  ],
  'velin-hover': [
    ['(empty / present)', 'Hover lift / glow', 'Motion CSS'],
  ],
  'velin-stagger': [
    ['ms number', 'Stagger delay between children', 'Motion runtime'],
  ],
  'velin-scroll': [
    ['(empty / present)', 'Smooth-scroll using `href="#id"`', 'Scroll behavior'],
  ],
  'velin-anchor': [
    ['(empty / length)', 'Apply scroll-margin for in-page targets', 'CSS scroll-margin'],
  ],
  'velin-lazy': [
    ['(empty / present)', 'Lazy-load `<img>` (`loading="lazy"`)', 'Native lazy + optional skeleton'],
  ],
  'velin-skeleton': [
    ['`text`', 'Text-line placeholder', 'Skeleton CSS'],
    ['`avatar`', 'Circular placeholder', 'Skeleton CSS'],
    ['`image`', 'Media block placeholder', 'Skeleton CSS'],
    ['`card` / other', 'Preset shapes when supported', 'Skeleton CSS'],
  ],
  'velin-loading': [
    ['(empty / present)', 'Busy / spinner state (`aria-busy`)', 'Loading CSS'],
  ],
  'velin-grid': [
    ['column count', 'Auto-fit grid columns', 'CSS grid'],
  ],
  'velin-code': [
    ['language id (`js`, `css`, …)', 'Syntax highlight + copy chrome', 'VelinHighlight / `<velin-code-block>`'],
  ],
  'velin-quote': [
    ['(empty / present)', 'Style host as blockquote', 'Quote CSS'],
  ],
  'velin-highlight': [
    ['(empty / present)', 'Inline mark emphasis', 'Mark CSS'],
  ],
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
  'velin-scroll-top': 'Ensure the control has an accessible name when rendered.',
  'velin-modal': 'Prefer the web component for focus trap / `velin-close`; attribute is a bridge.',
};

const EXAMPLES = {
  'velin-code': '<pre velin-code="js" language="js"><code>const x = 42;</code></pre>',
  'velin-scroll': '<a href="#section" velin-scroll>Jump to section</a>',
  'velin-slide': '<div velin-slide="up">…</div>',
  'velin-theme': '<button type="button" velin-theme="toggle">Theme</button>',
  'velin-progress': '<div velin-progress="42"></div>',
  'velin-skeleton': '<div velin-skeleton="text"></div>',
  'velin-scroll-top': '<body velin-scroll-top>',
  'velin-notify': '<button type="button" velin-notify="Saved">Notify</button>',
  'velin-stagger': '<ul velin-stagger="80">…</ul>',
  'velin-grid': '<div velin-grid="3">…</div>',
  'velin-parallax': '<div velin-parallax="slow">…</div>',
};

export function extractAttributes() {
  return listRegisteredAttributes().map((name) => ({
    name,
    description: ATTRIBUTE_DOCS[name] || 'Velin HTML attribute extension.',
    values: ATTRIBUTE_VALUES[name] || [['(empty / present)', 'Enable the attribute behavior', 'Attribute registry']],
  }));
}

export function renderAttribute(attr) {
  let md = banner('velinstyle docs generate');
  md += heading(1, attr.name);
  md += `\n${attr.description}\n\n`;

  md += heading(2, 'Values');
  md += table(
    ['Value', 'Meaning', 'Bridges to'],
    (attr.values || []).map((row) => row.map((cell) => cell)),
  );

  md += '## Example\n\n```html\n';
  md += `${EXAMPLES[attr.name] || `<div ${attr.name}>…</div>`}\n`;
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
  md += '| Attribute | Description | Values |\n| --- | --- | --- |\n';
  for (const a of attrs) {
    const n = (a.values && a.values.length) || 0;
    md += `| [\`${a.name}\`](./${a.name}.md) | ${a.description} | ${n} |\n`;
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
