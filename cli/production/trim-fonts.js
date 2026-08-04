/**
 * Font utility trim — keep only used velin-font-* / weight utilities in text.css slice.
 * (Full tokens/typography.css stays in alwaysCss; this filters utility text layer extras.)
 */
import { filterCssByUsedClasses } from './trim-css.js';

export function filterFontUtilities(cssText, usedClasses) {
  const used = usedClasses instanceof Set ? usedClasses : new Set(usedClasses);
  // Always keep base text utilities that are structural if any font class used
  const keep = new Set(used);
  if ([...used].some((c) => c.startsWith('velin-font-') || c.startsWith('velin-text-'))) {
    keep.add('velin-font-sans');
    keep.add('velin-font-normal');
  }
  return filterCssByUsedClasses(cssText, keep, { keepAllWithoutVelinClass: false });
}

export function summarizeFontUsage(extracted) {
  const classes = [...(extracted.fontWeights || extracted.classes || [])]
    .filter((c) => String(c).startsWith('velin-font-') || String(c).startsWith('velin-text-'))
    .sort();
  return { classes, count: classes.length };
}
