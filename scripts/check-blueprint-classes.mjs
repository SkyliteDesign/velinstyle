#!/usr/bin/env node
/**
 * Fail if any CLI blueprint emits velin-* classes missing from framework CSS.
 */
import { validateAllBlueprints, loadKnownCssClasses } from '../cli/blueprint.js';

const known = loadKnownCssClasses({ includeDist: true });
const results = validateAllBlueprints(known);
const bad = results.filter((r) => !r.ok);

if (bad.length === 0) {
  console.log(`Blueprint class check OK (${results.length} blueprints, ${known.size} CSS classes).`);
  process.exit(0);
}

console.error('Blueprint class check FAILED — generators must not emit dead CSS:');
for (const r of bad) {
  console.error(`  ${r.id}: missing ${r.missing?.join(', ') || r.error}`);
}
process.exit(1);
