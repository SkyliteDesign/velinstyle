/**
 * Emit a slim runtime stub that registers only detected Web Components.
 */
export function buildProductionJs({ tags = [], features = {} } = {}) {
  const unique = [...new Set(tags.map((t) => String(t).toLowerCase()))].sort();
  const list = JSON.stringify(unique, null, 2);
  const wantAttributes = Boolean(features.attributes);
  const wantHighlight = Boolean(features.highlight);
  const wantMotion = Boolean(features.motion);

  return `/* VelinStyle Production Runtime — generated */
/* Registers only Web Components detected in your project. */

const TAGS = ${list};

export async function bootProduction(options = {}) {
  const { register, bootFromDOM } = await import('@birdapi/velinstyle/runtime');
  if (options.root || ${wantAttributes} || ${wantHighlight} || ${wantMotion}) {
    return bootFromDOM(options.root || (typeof document !== 'undefined' ? document : undefined), {
      tags: TAGS,
      attributes: options.attributes ?? ${wantAttributes},
      highlight: options.highlight ?? ${wantHighlight},
      haptic: options.haptic ?? false,
    });
  }
  return register(TAGS);
}

export { TAGS };

if (typeof document !== 'undefined' && !globalThis.__VELIN_PRODUCTION_NO_AUTOBOOT__) {
  bootProduction().catch((err) => {
    console.warn('[velinstyle production] boot failed:', err);
  });
}
`;
}

export function detectRuntimeFeatures(extracted) {
  const attrs = extracted.attrs || new Set();
  const classes = extracted.classes || new Set();
  const motion = extracted.motion || new Set();
  return {
    attributes: [...attrs].some((a) => a.startsWith('data-velin-') && a !== 'data-velin-theme' && a !== 'data-velin-component'),
    highlight: [...classes].some((c) => c.includes('highlight') || c.includes('code')),
    motion: motion.size > 0 || [...classes].some((c) => c.includes('animate')),
  };
}
