/** Velin-Meta MIME and JSON shape for agent consumption. */

export const VELIN_META_MIME = 'application/vnd.velinstyle.meta+json';

export const VELIN_AGENT_SCHEMA_VERSION = 1;

/** Top-level doc sections under /docs/ used to fix wrongly prefixed paths. */
export const DOC_ROOT_SEGMENTS = new Set([
  'getting-started',
  'extend',
  'guides',
  'utilities',
  'components',
  'forms',
  'layout',
  'content',
  'customize',
  'animations',
  'about',
  'helpers',
  'generated',
  'migration',
]);

/**
 * @typedef {Object} VelinAgentBundle
 * @property {number} schemaVersion
 * @property {string} mime
 * @property {string} generatedAt
 * @property {{ name: string, version: string, homepage?: string, repository?: string }} framework
 * @property {string[]} packageExports
 * @property {{ breaking?: string[], migration?: string[] }} release
 * @property {{ tags: string[], count: number }} components
 * @property {{ names: string[], count: number }} attributes
 * @property {{ commands: object[] }} cli
 * @property {{ categories: string[], scannerRuleCount: number }} tooling
 * @property {{ path: string, entryCount?: number }} searchIndex
 * @property {{ generated: string, guides: Record<string, string> }} documentation
 * @property {string[]} conventions
 */

export const AGENT_CONVENTIONS = [
  'Positioning: VelinStyle is the WCAG 2.2 AAA CSS framework with native JavaScript runtime and Web Components — not a JS-only library or a utility-only CSS kit.',
  'Use only velin-* utility classes and documented Web Components.',
  'Prefer data-velin-theme on <html> for theme switching.',
  'Run velinstyle scan on generated HTML before shipping.',
  'Do not put secrets, API keys, or raw emails in velin-meta or page meta.',
  'Resolve doc links against docs root (/docs/), not the current page folder.',
];
