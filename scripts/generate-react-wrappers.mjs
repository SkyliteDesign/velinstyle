/**
 * Generate @velinstyle/react wrappers from the component loader registry so the
 * adapter can never fall behind the custom elements the framework ships.
 *
 * Run: node scripts/generate-react-wrappers.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { componentNameForTag } from '../packages/react/src/apply-props.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REACT_SRC = join(ROOT, 'packages', 'react', 'src');

const loaders = readFileSync(join(ROOT, 'components', 'runtime', 'component-loaders.js'), 'utf-8');
const allTags = [...loaders.matchAll(/'(velin-[a-z0-9-]+)':/g)].map((m) => m[1]);

/** Legacy `*-wc` aliases stay out of the adapter; use the canonical tags. */
const tags = allTags.filter((tag) => !tag.endsWith('-wc')).sort();

const header = (script) => `/**
 * AUTO-GENERATED — run: node scripts/${script}
 */
`;

const tagsFile = `${header('generate-react-wrappers.mjs')}export const VELIN_TAGS = [
${tags.map((t) => `  '${t}',`).join('\n')}
];
`;
writeFileSync(join(REACT_SRC, 'tags.js'), tagsFile);

const exports = tags.map((tag) => `export const ${componentNameForTag(tag)} = createVelinComponent('${tag}');`);
const indexFile = `${header('generate-react-wrappers.mjs')}import { createVelinComponent } from './create-component.jsx';

export { createVelinComponent } from './create-component.jsx';
export {
  splitProps,
  applyVelinProps,
  bindVelinListeners,
  isVelinEventProp,
  velinEventName,
  componentNameForTag,
} from './apply-props.js';
export { VELIN_TAGS } from './tags.js';

${exports.join('\n')}
`;
writeFileSync(join(REACT_SRC, 'index.jsx'), indexFile);

const typeExports = tags.map(
  (tag) => `export declare const ${componentNameForTag(tag)}: VelinComponent;`,
);
const typesFile = `${header('generate-react-wrappers.mjs')}import type { ComponentType, CSSProperties, ReactNode, Ref } from 'react';

/**
 * Props accepted by every wrapper. Scalars become attributes, booleans become
 * presence attributes, objects and arrays are assigned as element properties,
 * and \`onVelin*\` handlers are bound as custom-event listeners.
 */
export interface VelinComponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
  [prop: string]: unknown;
}

export interface VelinComponent extends ComponentType<VelinComponentProps> {
  /** Custom element tag rendered by this wrapper. */
  tagName: string;
}

export declare function createVelinComponent(tag: string): VelinComponent;
export declare const VELIN_TAGS: readonly string[];

export declare function isVelinEventProp(name: string): boolean;
export declare function velinEventName(propName: string): string;
export declare function componentNameForTag(tag: string): string;
export declare function splitProps(props: Record<string, unknown>): {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  attributes: Record<string, string | number>;
  properties: Record<string, unknown>;
  booleans: Record<string, boolean>;
  listeners: Record<string, EventListener>;
  reactProps: Record<string, unknown>;
};
export declare function applyVelinProps(
  el: Element,
  parts: { properties?: Record<string, unknown>; booleans?: Record<string, boolean> },
): void;
export declare function bindVelinListeners(
  el: Element,
  listeners: Record<string, EventListener>,
): () => void;

${typeExports.join('\n')}
`;
writeFileSync(join(REACT_SRC, 'index.d.ts'), typesFile);

console.log(`Wrote ${tags.length} React wrappers`);
