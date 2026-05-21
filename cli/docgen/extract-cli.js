import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { banner, heading, table } from './markdown.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Commands registered in cli/index.js switch */
export const REGISTERED_COMMANDS = [
  'init', 'build', 'themes', 'add', 'icons', 'blueprint', 'tokens',
  'scan', 'prefix', 'scaffold', 'layout', 'perf', 'docs', 'meta',
];

export function loadCliManifest() {
  const path = join(__dirname, '..', 'cli-manifest.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function validateManifest(manifest) {
  const errors = [];
  const names = manifest.commands.map((c) => c.name);
  for (const cmd of REGISTERED_COMMANDS) {
    if (!names.includes(cmd)) {
      errors.push(`Manifest missing command: ${cmd}`);
    }
  }
  for (const name of names) {
    if (!REGISTERED_COMMANDS.includes(name)) {
      errors.push(`Manifest has unknown command (not in router): ${name}`);
    }
  }
  return errors;
}

export function renderCliDocs(manifest) {
  let md = banner('cli/cli-manifest.json');
  md += heading(1, 'CLI commands');
  md += `\nVelinStyle CLI v${manifest.version}. Run \`velinstyle --help\` for full usage.\n\n`;
  md += table(
    ['Command', 'Summary', 'Subcommands', 'Flags', 'Example'],
    manifest.commands.map((c) => [
      `\`${c.name}\``,
      c.summary,
      (c.subcommands || []).join(', ') || '—',
      (c.flags || []).join(', ') || '—',
      `\`${c.example}\``,
    ]),
  );
  return md;
}
