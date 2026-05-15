#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, rmSync, statSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { listProviders, getProviderUrl, PROVIDERS } from './icon-providers.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const args = process.argv.slice(2);
const command = args[0];

const LAYERS = ['tokens', 'reset', 'base', 'a11y', 'layout', 'components', 'utilities', 'helpers'];

const LAYER_FILES = {
  tokens: [
    'tokens/color.css', 'tokens/spacing.css', 'tokens/typography.css',
    'tokens/radius.css', 'tokens/shadow.css', 'tokens/motion.css',
    'tokens/z-index.css', 'tokens/aspect-ratio.css',
  ],
  reset: ['base/root.css', 'base/reset.css'],
  base: ['base/focus.css', 'base/content.css'],
  a11y: [
    'a11y/sr-only.css', 'a11y/skip-link.css', 'a11y/reduced-motion.css',
    'a11y/forced-colors.css', 'a11y/skeleton.css', 'a11y/preferences.css',
    'a11y/security.css',
  ],
  layout: [
    'layout/breakpoints.css', 'layout/container.css', 'layout/grid.css',
    'layout/flex.css', 'layout/patterns.css',
  ],
  components: [
    'components/button.css', 'components/card.css', 'components/input.css',
    'components/nav.css', 'components/alert.css', 'components/badge.css',
    'components/table.css', 'components/tooltip.css', 'components/modal.css',
    'components/breadcrumb.css', 'components/pagination.css', 'components/progress.css',
    'components/spinner.css', 'components/list-group.css', 'components/avatar.css',
    'components/switch.css', 'components/divider.css', 'components/chip.css',
    'components/timeline.css', 'components/stepper.css', 'components/stat.css',
    'components/drawer.css', 'components/input-group.css', 'components/form-validation.css', 'components/collapse.css',
  ],
  utilities: [
    'utilities/color.css', 'utilities/spacing.css', 'utilities/display.css',
    'utilities/text.css', 'utilities/sizing.css', 'utilities/border.css',
    'utilities/position.css', 'utilities/animation.css', 'utilities/gradient.css',
    'utilities/print.css', 'utilities/responsive.css', 'utilities/divide.css',
    'utilities/scroll.css', 'utilities/color-mix.css', 'utilities/scroll-animation.css',
    'utilities/view-transition.css', 'utilities/scope.css', 'utilities/anchor.css',
    'utilities/filter.css', 'utilities/container-style.css', 'utilities/state.css',
  ],
  helpers: ['helpers/helpers.css'],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function getArg(flag, alias) {
  const idx = args.indexOf(flag);
  const aidx = alias ? args.indexOf(alias) : -1;
  const i = idx !== -1 ? idx : aidx;
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

function hasFlag(flag, alias) {
  return args.includes(flag) || (alias && args.includes(alias));
}

// ── Help ─────────────────────────────────────────────────────────────────────

function help() {
  console.log(`
  ${C.bold('VelinStyle CLI')} v0.6.1

  ${C.bold('Usage:')}
    velinstyle init                 Create velinstyle.config.js
    velinstyle build                Build custom CSS with selected layers
    velinstyle themes               List available themes
    velinstyle add <name>           Add a single component CSS
    velinstyle icons <subcommand>   Manage icon providers
    velinstyle scan [path]          Security & accessibility scanner
    velinstyle prefix [path]        Add missing velin- prefix (dry-run; use --write)
    velinstyle blueprint [name]     Print HTML blueprint (run: velinstyle blueprint list)
    velinstyle tokens build         Generate CSS variables from tokens.json

  ${C.bold('Icons subcommands:')}
    icons list                      Show available icon providers
    icons add <provider> [--icons a,b] [--variant outline]  Download to icons/svg/
    icons remove <provider>         Remove provider icons
    icons build                     Rebuild icon sprite

  ${C.bold('Icons example (multi-provider):')}
    velinstyle icons add lucide --icons menu,search,check
    velinstyle icons add heroicons --icons arrow-left --variant outline
    velinstyle icons build

  ${C.bold('Blueprint:')}
    velinstyle blueprint list       Print all blueprint ids
    velinstyle blueprint <name> [--output, -o <file>]

  ${C.bold('Tokens:')}
    velinstyle tokens build [--input <path>] [--output, -o <file>]

  ${C.bold('Scan options:')}
    --fix                           Auto-fix safe issues (writes files)
    --fix-dry-run                   Show files that would be auto-fixed; no write
    --fix-lang <code>               Default lang for a11y/html-lang fix (default: de)
    --severity <level>              Minimum severity: error, warning, info

  ${C.bold('Prefix options (velinstyle prefix):')}
    --write                         Write files (default is dry-run)
    --bootstrap-display             Map Bootstrap d-* display utilities to Velin names
    --map <file>                    JSON class map (merged after auto map; see below)

  Prefix also loads ${C.dim('velinstyle-prefix-map.json')} from the migration root (the
  directory you pass, or the parent of a single file) if that file exists. ${C.dim('--map')}
  merges on top and overrides duplicate keys.

  ${C.bold('Build options:')}
    --output, -o <path>             Output file path (default: ./velinstyle-custom.css)
    --minify                        Minify output

  ${C.bold('General:')}
    --help, -h                      Show this help
`);
}

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
  const configPath = resolve('velinstyle.config.js');
  if (existsSync(configPath)) {
    console.log('velinstyle.config.js already exists.');
    return;
  }

  const config = `// VelinStyle Configuration
export default {
  layers: [
    'tokens',      // Design tokens (colors, spacing, typography, etc.)
    'reset',       // CSS reset + layer order
    'base',        // Focus styles + content styles
    'a11y',        // Accessibility + security utilities
    'layout',      // Grid, container, flex, breakpoints
    'components',  // All UI components (button, card, nav, etc.)
    'utilities',   // Utility classes (display, spacing, text, etc.)
    'helpers',     // Helper classes (ratios, stacks, stretched-link, etc.)
  ],
  theme: null,     // e.g. 'neon', 'ocean', 'corporate'
  output: './velinstyle-custom.css',
  minify: true,
  scan: {
    enabled: false,    // Set true to auto-scan on build
    severity: 'warning',
    fix: false,
    ignore: ['node_modules', 'dist', '.git'],
  },
};
`;

  writeFileSync(configPath, config);
  console.log(C.green('Created velinstyle.config.js'));
  console.log('Edit the layers array, then run: velinstyle build');
}

// ── Build ────────────────────────────────────────────────────────────────────

async function build() {
  const configPath = resolve('velinstyle.config.js');
  let config;

  if (existsSync(configPath)) {
    config = (await import(configPath)).default;
  } else {
    config = { layers: LAYERS, theme: null, output: './velinstyle-custom.css', minify: true };
  }

  const output = getArg('--output', '-o') || config.output || './velinstyle-custom.css';
  const minify = hasFlag('--minify') || config.minify;
  const selectedLayers = config.layers || LAYERS;

  let css = `/* VelinStyle Custom Build -- ${selectedLayers.join(', ')} */\n`;

  for (const layer of selectedLayers) {
    const files = LAYER_FILES[layer];
    if (!files) {
      console.warn(C.yellow(`Unknown layer: ${layer}`));
      continue;
    }
    for (const file of files) {
      const filePath = join(PKG_ROOT, 'src', file);
      if (existsSync(filePath)) {
        css += readFileSync(filePath, 'utf-8') + '\n';
      }
    }
  }

  if (config.theme) {
    const themePath = join(PKG_ROOT, 'src', 'themes', `${config.theme}.css`);
    if (existsSync(themePath)) {
      css += readFileSync(themePath, 'utf-8') + '\n';
    } else {
      console.warn(C.yellow(`Theme not found: ${config.theme}`));
    }
  }

  const tmpPath = resolve('.velinstyle-tmp.css');
  writeFileSync(tmpPath, css);

  try {
    const minifyFlag = minify ? '--minify' : '';
    execSync(`npx lightningcss --bundle ${minifyFlag} "${tmpPath}" -o "${resolve(output)}"`, {
      stdio: 'inherit',
    });
    console.log(C.green(`Built: ${output}`) + ` (layers: ${selectedLayers.join(', ')}${config.theme ? ', theme: ' + config.theme : ''})`);
  } catch {
    writeFileSync(resolve(output), css);
    console.log(C.yellow(`Built (unbundled): ${output}`));
  } finally {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
  }

  if (config.scan?.enabled) {
    console.log(C.dim('\nRunning post-build scan...'));
    const { scan } = await import('./scanner.js');
    scan(resolve('.'), config.scan);
  }
}

// ── Themes ───────────────────────────────────────────────────────────────────

function themes() {
  const themesDir = join(PKG_ROOT, 'src', 'themes');
  if (!existsSync(themesDir)) {
    console.log('No themes directory found.');
    return;
  }

  const available = readdirSync(themesDir)
    .filter(f => f.endsWith('.css'))
    .map(f => f.replace('.css', ''));

  console.log(`\n  ${C.bold('Available VelinStyle Themes:')}\n`);
  available.forEach(t => console.log(`    - ${t}`));
  console.log(`\n  Total: ${available.length} themes`);
  console.log('  Usage: Set theme in velinstyle.config.js or load via:');
  console.log('    <link rel="stylesheet" href="dist/themes/<name>.min.css">\n');
}

// ── Add Component ────────────────────────────────────────────────────────────

function add() {
  const name = args[1];
  if (!name) {
    console.log('Usage: velinstyle add <component-name>');
    console.log('Example: velinstyle add button');
    return;
  }

  const filePath = join(PKG_ROOT, 'src', 'components', `${name}.css`);
  if (!existsSync(filePath)) {
    console.log(C.red(`Component not found: ${name}`));
    console.log('Available:');
    readdirSync(join(PKG_ROOT, 'src', 'components'))
      .filter(f => f.endsWith('.css'))
      .map(f => f.replace('.css', ''))
      .forEach(c => console.log(`  - ${c}`));
    return;
  }

  const outDir = resolve('velinstyle-components');
  mkdirSync(outDir, { recursive: true });
  const content = readFileSync(filePath, 'utf-8');
  const outPath = join(outDir, `${name}.css`);
  writeFileSync(outPath, content);
  console.log(C.green(`Added: ${outPath}`));
}

// ── Icons ────────────────────────────────────────────────────────────────────

async function icons() {
  const sub = args[1];

  if (!sub || sub === 'list') {
    iconsListCmd();
  } else if (sub === 'add') {
    await iconsAddCmd();
  } else if (sub === 'remove') {
    iconsRemoveCmd();
  } else if (sub === 'build') {
    iconsBuildCmd();
  } else {
    console.log(`Unknown icons subcommand: ${sub}`);
    console.log('Available: list, add, remove, build');
  }
}

function iconsListCmd() {
  const providers = listProviders();
  console.log(`\n  ${C.bold('Available Icon Providers:')}\n`);
  providers.forEach(p => {
    console.log(`  ${C.cyan(p.key.padEnd(14))} ${p.name} -- ${p.description}`);
    console.log(`  ${' '.repeat(14)} License: ${p.license} | ${C.dim(p.homepage)}`);
    if (p.variants.length) console.log(`  ${' '.repeat(14)} Variants: ${p.variants.join(', ')}`);
    console.log();
  });

  const svgDir = join(PKG_ROOT, 'icons', 'svg');
  if (existsSync(svgDir)) {
    const installed = readdirSync(svgDir).filter(f => f.endsWith('.svg'));
    console.log(`  ${C.bold('Installed icons:')} ${installed.length} in icons/svg/\n`);
  }
}

async function iconsAddCmd() {
  const provider = args[2];
  if (!provider) {
    console.log('Usage: velinstyle icons add <provider> [--icons name1,name2] [--variant outline]');
    console.log('Providers: ' + Object.keys(PROVIDERS).join(', '));
    return;
  }

  if (!PROVIDERS[provider]) {
    console.log(C.red(`Unknown provider: ${provider}`));
    console.log('Available: ' + Object.keys(PROVIDERS).join(', '));
    return;
  }

  const iconsList = getArg('--icons');
  const variant = getArg('--variant');

  if (!iconsList) {
    console.log(C.yellow('Please specify icons to add with --icons name1,name2,...'));
    console.log(`Example: velinstyle icons add ${provider} --icons heart,star,check`);
    return;
  }

  const names = iconsList.split(',').map(s => s.trim()).filter(Boolean);
  const svgDir = join(PKG_ROOT, 'icons', 'svg');
  mkdirSync(svgDir, { recursive: true });

  let added = 0;
  let failed = 0;

  for (const name of names) {
    const url = getProviderUrl(provider, name, variant);
    if (!url) { failed++; continue; }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const svg = await res.text();
      if (!svg.includes('<svg')) throw new Error('Not SVG');

      const filename = `${provider}-${name}.svg`;
      writeFileSync(join(svgDir, filename), svg);
      console.log(C.green(`  + ${filename}`));
      added++;
    } catch (e) {
      console.log(C.red(`  x ${name}: ${e.message}`));
      failed++;
    }
  }

  console.log(`\n  Added: ${added}, Failed: ${failed}`);
  if (added > 0) {
    console.log(C.dim('  Run "velinstyle icons build" to rebuild the sprite.'));
  }
}

function iconsRemoveCmd() {
  const provider = args[2];
  if (!provider) {
    console.log('Usage: velinstyle icons remove <provider>');
    return;
  }

  const svgDir = join(PKG_ROOT, 'icons', 'svg');
  if (!existsSync(svgDir)) return;

  const files = readdirSync(svgDir).filter(f => f.startsWith(`${provider}-`) && f.endsWith('.svg'));
  if (files.length === 0) {
    console.log(C.yellow(`No icons found for provider: ${provider}`));
    return;
  }

  files.forEach(f => {
    unlinkSync(join(svgDir, f));
    console.log(C.dim(`  - ${f}`));
  });
  console.log(`\n  Removed ${files.length} icons from "${provider}".`);
  console.log(C.dim('  Run "velinstyle icons build" to rebuild the sprite.'));
}

function iconsBuildCmd() {
  const buildScript = join(PKG_ROOT, 'icons', 'build-sprite.js');
  if (!existsSync(buildScript)) {
    console.log(C.red('icons/build-sprite.js not found.'));
    return;
  }

  try {
    execSync(`node "${buildScript}"`, { stdio: 'inherit', cwd: PKG_ROOT });
    console.log(C.green('\nIcon sprite rebuilt successfully.'));
  } catch {
    console.log(C.red('Failed to rebuild icon sprite.'));
  }
}

// ── Scan ─────────────────────────────────────────────────────────────────────

async function blueprintCmd() {
  const sub = args[1];
  const { listBlueprints, emitBlueprint } = await import('./blueprint.js');
  if (!sub || sub === 'list') {
    console.log(`\n  ${C.bold('Available blueprints:')}\n`);
    listBlueprints().forEach((b) => console.log(`    - ${b}`));
    console.log(`\n  ${C.dim('Example: velinstyle blueprint modal -o snippet.html')}\n`);
    return;
  }
  const out = getArg('--output', '-o');
  const r = emitBlueprint(sub, { output: out || null });
  if (!r.ok) {
    console.log(C.red(r.error));
    return;
  }
  if (r.text) {
    console.log(r.text);
  } else {
    console.log(C.green(`Wrote blueprint to ${r.path}`));
  }
}

async function tokensBuildCmd() {
  const inputPath = resolve(getArg('--input') || 'tokens.json');
  const outPath = getArg('--output', '-o');
  const { buildTokensFromJson } = await import('./tokens-build.js');
  const css = buildTokensFromJson(inputPath);
  if (!css) {
    console.log(C.red(`Could not read or parse: ${inputPath}`));
    return;
  }
  if (outPath) {
    writeFileSync(resolve(outPath), css, 'utf-8');
    console.log(C.green(`Wrote ${resolve(outPath)}`));
  } else {
    console.log(css);
  }
}

async function tokensCmd() {
  const sub = args[1];
  if (sub === 'build') {
    await tokensBuildCmd();
  } else {
    console.log('Usage: velinstyle tokens build [--input tokens.json] [--output out.css]');
  }
}

async function prefixCmd() {
  const rawTarget = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const targetPath = resolve(rawTarget);
  let migrationRoot = targetPath;
  try {
    const st = statSync(targetPath);
    if (st.isFile()) migrationRoot = dirname(targetPath);
  } catch {
    console.log(C.red(`Not found: ${targetPath}`));
    process.exit(1);
  }

  const mapArg = getArg('--map');
  const write = hasFlag('--write');
  const bootstrapDisplay = hasFlag('--bootstrap-display');

  try {
    const { buildExplicitPrefixMap, prefixCommandMain } = await import('./prefix-classes.js');
    const explicitMap = buildExplicitPrefixMap(migrationRoot, mapArg ? resolve(mapArg) : null);
    prefixCommandMain(targetPath, {
      write,
      bootstrapAliases: bootstrapDisplay,
      pkgRoot: PKG_ROOT,
      explicitMap,
    });
  } catch (e) {
    console.log(C.red(/** @type {Error} */ (e).message));
    process.exit(1);
  }
}

async function scanCmd() {
  const targetPath = args[1] && !args[1].startsWith('-') ? resolve(args[1]) : resolve('.');
  const format = getArg('--format') || 'text';
  const fix = hasFlag('--fix');
  const fixDryRun = hasFlag('--fix-dry-run');
  let fixLang = getArg('--fix-lang');
  if (fixLang && !/^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})?$/.test(fixLang)) {
    console.log(C.yellow(`Invalid --fix-lang "${fixLang}", using "de".`));
    fixLang = 'de';
  }
  const severity = getArg('--severity') || 'warning';

  const { scan } = await import('./scanner.js');
  const exitCode = scan(targetPath, {
    severity,
    fix,
    fixDryRun,
    fixLang: fixLang || undefined,
    format,
  });
  process.exit(exitCode);
}

// ── Router ───────────────────────────────────────────────────────────────────

switch (command) {
  case 'init': init(); break;
  case 'build': build(); break;
  case 'themes': themes(); break;
  case 'add': add(); break;
  case 'icons': icons(); break;
  case 'blueprint': await blueprintCmd(); break;
  case 'tokens': await tokensCmd(); break;
  case 'scan': scanCmd(); break;
  case 'prefix': await prefixCmd(); break;
  case '--help': case '-h': help(); break;
  default: help(); break;
}
