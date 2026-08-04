#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, rmSync, statSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { listProviders, getProviderUrl, PROVIDERS } from './icon-providers.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const args = process.argv.slice(2);
const command = args[0];

const CLI_VERSION = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf-8')).version;

const LAYERS = ['tokens', 'reset', 'base', 'a11y', 'layout', 'components', 'utilities', 'security', 'helpers'];

const LAYER_FILES = {
  tokens: [
    'tokens/fonts.css', 'tokens/color.css', 'tokens/spacing.css', 'tokens/typography.css',
    'tokens/radius.css', 'tokens/shadow.css', 'tokens/motion.css',
    'tokens/z-index.css', 'tokens/aspect-ratio.css',
  ],
  reset: ['base/root.css', 'base/reset.css'],
  base: ['base/focus.css', 'base/content.css'],
  a11y: [
    'a11y/sr-only.css', 'a11y/skip-link.css', 'a11y/reduced-motion.css',
    'a11y/forced-colors.css', 'a11y/skeleton.css', 'a11y/preferences.css',
    'a11y/focus-not-obscured.css', 'a11y/target-size.css', 'a11y/high-contrast-aaa.css',
    'a11y/authentication.css', 'a11y/consistent-help.css', 'a11y/dragging-alternatives.css',
    'a11y/focus-appearance.css',
  ],
  security: ['a11y/security.css'],
  layout: [
    'layout/breakpoints.css', 'layout/container.css', 'layout/grid.css',
    'layout/flex.css', 'layout/patterns.css', 'layout/app-shell.css',
  ],
  components: [
    'components/button.css', 'components/card.css', 'components/input.css',
    'components/nav.css', 'components/alert.css', 'components/badge.css',
    'components/table.css', 'components/data-table.css', 'components/tooltip.css', 'components/modal.css',
    'components/breadcrumb.css', 'components/pagination.css', 'components/progress.css',
    'components/spinner.css', 'components/list-group.css', 'components/avatar.css',
    'components/switch.css', 'components/divider.css', 'components/chip.css',
    'components/timeline.css', 'components/stepper.css', 'components/stat.css',
    'components/drawer.css', 'components/input-group.css', 'components/form-validation.css', 'components/collapse.css',
    'components/calendar-dropzone.css',
    'components/transparency.css',
  ],
  utilities: [
    'utilities/color.css', 'utilities/spacing.css', 'utilities/display.css',
    'utilities/text.css', 'utilities/sizing.css', 'utilities/border.css',
    'utilities/position.css', 'utilities/animation.css', 'utilities/gradient.css',
    'utilities/print.css', 'utilities/responsive.css', 'utilities/divide.css',
    'utilities/scroll.css', 'utilities/color-mix.css', 'utilities/scroll-animation.css',
    'utilities/view-transition.css',     'utilities/scope.css', 'utilities/anchor.css',
    'utilities/filter.css', 'utilities/filter-effects.css', 'utilities/chart-animation.css',
    'utilities/container-style.css', 'utilities/state.css',
    'utilities/safe-area.css',
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
  ${C.bold('VelinStyle CLI')} v${CLI_VERSION}

  ${C.bold('Usage:')}
    velinstyle init                 Create velinstyle.config.js
    velinstyle build                Build custom CSS with selected layers
    velinstyle build --production   Content-aware production output (CSS/JS/themes/icons)
    velinstyle production [path]    Alias for build --production
    velinstyle themes               List available themes
    velinstyle add <name>           Add a single component CSS
    velinstyle icons <subcommand>   Manage icon providers
    velinstyle scan [path|file]     Security & accessibility scanner (dir or .html/.css/.js)
    velinstyle prefix [path]        Add missing velin- prefix (dry-run; use --write)
    velinstyle blueprint [name]     Print HTML blueprint (run: velinstyle blueprint list)
    velinstyle blueprint <name> --strict  Fail if emitted classes ∉ CSS
    velinstyle create <kind> [dir]  Scaffold: landing|dashboard|docs|auth
    velinstyle serve [dir]          Static preview server (default port 4173)
    velinstyle doctor               Check dist, icons, config, Windows ESM paths
    velinstyle transparency <sub>   Transparency Framework: doctor|validate|report|export|migrate
    velinstyle check [path]         doctor + blueprint --strict + scan + review + transparency
    velinstyle scaffold "<prompt>"  Plan-first page HTML or recipe fragment
    velinstyle scaffold --atelier 04,07  Compose Atelier Library ids (beta)
    velinstyle plan "<prompt>"      Emit page plan JSON (no HTML)
    velinstyle plan --atelier 04,07 Emit plan JSON for Atelier ids (beta)
    velinstyle atelier <num|id>     Pull curated Atelier Library showcase
    velinstyle atelier list         List curated Library numbers/ids
    velinstyle review [file|html]   Design / a11y / SEO / conversion review gate
    velinstyle wc api <tag>         Human-readable Web Component API from source
    velinstyle layout <sub>         Responsive layout audit and fixes
    velinstyle perf <sub>           Performance audit (images, scripts) with --fix
    velinstyle tokens build         Generate CSS variables from tokens.json
    velinstyle tokens validate      Validate tokens.json schema
    velinstyle docs generate        Auto-generate Markdown API reference
    velinstyle meta                 Build agent context (velin-agent.json, llms.txt)
    velinstyle search index         Build JSON search index for VelinSearch
    velinstyle skills <subcommand>  Registry-first AI skills commands
    velinstyle workflow <id>        Resolve workflow graph / project workflow

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
    velinstyle blueprint list [--strict]  Print ids (strict validates all)
    velinstyle blueprint <name> [--output, -o <file>] [--strict]

  ${C.bold('Create / serve / doctor / check:')}
    velinstyle create landing|dashboard|docs|auth [dir] [--theme earth] [--no-copy]
    velinstyle serve [dir] [--port 4173]
    velinstyle doctor
    velinstyle check [path] [--json|--sarif] [--profile marketing|app|docs|fragment|ecommerce]
    Alias: validate → check · documentation → docs generate help

  ${C.bold('Web Components:')}
    velinstyle wc api <tag>         e.g. velinstyle wc api velin-toast

  ${C.bold('Scaffold (1.2.0):')}
    velinstyle scaffold "<prompt>"  Plan → render → review for pages; recipes for fragments
    velinstyle scaffold list-intents  Show recipe intent keywords
    velinstyle scaffold "<prompt>" -o out.html [--json]
    velinstyle scaffold --atelier 04,07 [-o page.html] [--from <library>]  Compose Library showcases (beta)

  ${C.bold('Atelier Library pull (1.2.x):')}
    velinstyle atelier list
    velinstyle atelier 36 [-o dir] [--format html|blade|vue|react] [--from <library>] [--base-url <url>]
    Limitation: blade/vue/react = integration wrappers around vanilla assets (not native rewrites).
    Native framework blocks / Velin Studio Builder = planned. Atelier ≠ Studio.

  ${C.bold('Plan / Review (1.2.x):')}
    velinstyle plan "<prompt>" [--json] [-o plan.json]
    velinstyle plan --atelier 04,07 [-o plan.json]  Atelier compose plan (beta)
    velinstyle review <file.html> [--json] [--prompt "..."]

  ${C.bold('Transparency (1.2.1):')}
    velinstyle transparency doctor [path|file] [--policy file] [--json]
    velinstyle transparency validate [path|file] [--policy file] [--json]
    velinstyle transparency report [path|file] [--out dir] [--policy file]
    velinstyle transparency export [path|file] [--format json|json-ld|csv|html] [-o file]
    velinstyle transparency migrate [path|file] [--apply] [--write] [--policy file]
    Alias: transparency scan → doctor

  ${C.bold('Layout (0.8.0):')}
    velinstyle layout audit [path]    Report flex/grid/responsive issues
    velinstyle layout suggest [path]  Audit with fix suggestions
    velinstyle layout fix [path]      Apply safe fixes (--dry-run default, --write)

  ${C.bold('Performance (0.9.0):')}
    velinstyle perf audit [path|file] Report CLS, lazy-load, script defer issues
    velinstyle perf suggest [path|file] Same as audit with fix hints
    velinstyle perf fix [path|file]   Apply safe fixes (--write)

  ${C.bold('Production Builder (1.2.2):')}
    velinstyle build --production [path]
    velinstyle production [path]
      --out, -o <dir>          Default: ./dist/velin-production
      --explain                Show removed CSS/themes/icons + reasons
      --watch                  Rebuild on content change
      --report <file>          Write JSON/Markdown report
      --safelist <list|file>   Extra classes / themes / icons / CSS files
      --no-js --no-icons --no-themes --no-motion --no-minify

  ${C.bold('Tokens:')}
    velinstyle tokens build [--input <path>] [--output, -o <file>]
    velinstyle tokens validate [--input <path>]

  ${C.bold('Docs (0.9.0):')}
    velinstyle docs generate [--scope all|components|tokens|utilities|cli|rules|a11y|meta] [--out docs/generated]
    velinstyle meta [--out dist/velin-agent.json] [--llms-out dist/llms.txt] [--base-url URL]
    velinstyle meta page <file.html> [--write]  Merge curated meta (goals/intent) on --write

  ${C.bold('Search:')}
    velinstyle search index [--out dist/search-index.json] [--extra-html dir1,dir2]

  ${C.bold('Skills:')}
    velinstyle skills list [--capability review] [--status beta] [--json]
    velinstyle skills show <skill-id> [--human]
    velinstyle skills install <skill-id|pack|bundle:id|project:id> [--target .cursor/skills]
    velinstyle skills run <skill-id> [--json]
    velinstyle skills validate
    velinstyle skills packs|bundles|templates|projects|graphs

  ${C.bold('Workflow:')}
    velinstyle workflow <graph-id|project:id> [--json]

  ${C.bold('Scan options:')}
    --fix                           Auto-fix safe issues (writes files)
    --fix-dry-run                   Show files that would be auto-fixed; no write
    --fix-lang <code>               Default lang for a11y/html-lang fix (default: de)
    --severity <level>              Minimum severity: error, warning, info
    --only <category>               Filter: security, pii, a11y, css, wc, perf

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
    --preset lite                   Marketing subset layers (tokens+reset+base+layout+components+utilities)

  ${C.bold('General:')}
    --help, -h                      Show this help
`);
}

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
  const configPath = resolve('velinstyle.config.js');
  if (existsSync(configPath)) {
    console.log('velinstyle.config.js already exists.');
  } else {
    const config = `// VelinStyle Configuration
export default {
  // Marketing lite: layers: ['tokens','reset','base','layout','components','utilities'] + theme
  // See docs/guides/marketing-lite-css.html
  layers: [
    'tokens',
    'reset',
    'base',
    'a11y',
    'layout',
    'components',
    'utilities',
    'helpers',
  ],
  theme: null,     // e.g. 'earth', 'nordic', 'ocean'
  output: './velinstyle-custom.css',
  minify: true,
  scan: {
    enabled: false,
    severity: 'warning',
    fix: false,
    ignore: ['node_modules', 'dist', '.git'],
  },
};
`;
    writeFileSync(configPath, config);
    console.log(C.green('Created velinstyle.config.js'));
  }

  const vendorDir = resolve('vendor', 'velinstyle');
  const distCss = join(PKG_ROOT, 'dist', 'velinstyle.min.css');
  if (existsSync(distCss)) {
    mkdirSync(vendorDir, { recursive: true });
    for (const f of ['velinstyle.min.css', 'velinstyle-components.min.js', 'velin-icons.svg']) {
      const src = join(PKG_ROOT, 'dist', f);
      if (existsSync(src)) writeFileSync(join(vendorDir, f), readFileSync(src));
    }
    const themesSrc = join(PKG_ROOT, 'dist', 'themes');
    if (existsSync(themesSrc)) {
      mkdirSync(join(vendorDir, 'themes'), { recursive: true });
      for (const name of readdirSync(themesSrc)) {
        const src = join(themesSrc, name);
        if (statSync(src).isFile()) writeFileSync(join(vendorDir, 'themes', name), readFileSync(src));
      }
    }
    console.log(C.green(`Copied dist assets → ${vendorDir}`));
  } else {
    console.log(C.yellow('Framework dist/ not found — skip vendor copy. Build the framework or copy dist manually into vendor/velinstyle.'));
  }

  const starter = resolve('index.velin-starter.html');
  if (!existsSync(starter) && !existsSync(resolve('index.html'))) {
    writeFileSync(
      starter,
      `<!DOCTYPE html>
<html lang="en" data-velin-reveal-auto>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="velin-icon-sprite" content="vendor/velinstyle/velin-icons.svg">
  <title>VelinStyle starter</title>
  <link rel="stylesheet" href="vendor/velinstyle/velinstyle.min.css">
</head>
<body>
  <a class="velin-skip-link" href="#main">Skip to main</a>
  <main id="main" class="velin-container velin-py-8">
    <h1 class="velin-text-3xl velin-font-bold">VelinStyle starter</h1>
    <p class="velin-text-muted">Run <code>velinstyle serve</code> or <code>velinstyle create landing</code>.</p>
  </main>
  <script type="module" src="vendor/velinstyle/velinstyle-components.min.js"></script>
</body>
</html>
`,
      'utf-8',
    );
    console.log(C.green('Created index.velin-starter.html'));
  }

  console.log('Next: velinstyle build  ·  velinstyle serve  ·  velinstyle doctor');
}

// ── Build ────────────────────────────────────────────────────────────────────

async function build() {
  if (hasFlag('--production')) {
    const { runProduction } = await import('./production/run.js');
    const rest = args.slice(1).filter((a) => a !== '--production');
    await runProduction({ args: rest, helpers: { getArg, hasFlag, C } });
    return;
  }

  const configPath = resolve('velinstyle.config.js');
  let config;

  if (existsSync(configPath)) {
    config = (await import(pathToFileURL(configPath).href)).default;
  } else {
    config = { layers: LAYERS, theme: null, output: './velinstyle-custom.css', minify: true };
  }

  const LITE_LAYERS = ['tokens', 'reset', 'base', 'layout', 'components', 'utilities'];
  const preset = getArg('--preset') || config.preset;
  if (preset === 'lite') {
    config = { ...config, layers: LITE_LAYERS };
  }

  const output = getArg('--output', '-o') || getArg('--out') || config.output || './velinstyle-custom.css';
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

  const outAbs = resolve(output);
  let bundled = false;
  try {
    const binName = process.platform === 'win32' ? 'lightningcss.cmd' : 'lightningcss';
    const localBin = join(PKG_ROOT, 'node_modules', '.bin', binName);
    const cli = existsSync(localBin) ? `"${localBin}"` : 'npx lightningcss';
    const minifyFlag = minify ? '--minify' : '';
    execSync(`${cli} --bundle ${minifyFlag} "${tmpPath}" -o "${outAbs}"`, {
      stdio: 'inherit',
      cwd: PKG_ROOT,
      shell: true,
    });
    bundled = true;
    console.log(C.green(`Built: ${output}`) + ` (layers: ${selectedLayers.join(', ')}${config.theme ? ', theme: ' + config.theme : ''})`);
  } catch {
    writeFileSync(outAbs, css);
    console.log(C.yellow(`Built (unbundled): ${output}`));
    console.log(C.yellow('  Install lightningcss-cli in the VelinStyle package (or run build from the framework repo) for minified output.'));
  } finally {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
  }

  if (preset === 'lite' && existsSync(outAbs)) {
    const liteBytes = statSync(outAbs).size;
    const fullMin = join(PKG_ROOT, 'dist', 'velinstyle.min.css');
    if (existsSync(fullMin)) {
      const fullBytes = statSync(fullMin).size;
      const liteKb = (liteBytes / 1024).toFixed(1);
      const fullKb = (fullBytes / 1024).toFixed(1);
      console.log(`  Size: lite ${liteKb} KB vs dist/velinstyle.min.css ${fullKb} KB`);
      if (!bundled || liteBytes >= fullBytes) {
        console.log(C.yellow(`  Warning: lite output is not smaller than the full min CSS${bundled ? '' : ' (unbundled)'}.`));
      }
    }
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
  const strict = hasFlag('--strict');
  const { listBlueprints, emitBlueprint, validateAllBlueprints } = await import('./blueprint.js');
  if (sub === '--help' || sub === '-h') {
    console.log(`Usage: velinstyle blueprint [list|<name>] [--output|-o <file>] [--strict]

  list                 List blueprint ids
  list --strict        Validate all blueprints against CSS
  <name>               Emit HTML (stdout or -o file)
  <name> --strict      Fail if classes missing from CSS
`);
    return;
  }
  if (!sub || sub === 'list') {
    if (strict) {
      const results = validateAllBlueprints();
      const bad = results.filter((r) => !r.ok);
      if (bad.length) {
        for (const r of bad) {
          console.log(C.red(`${r.id}: ${r.missing?.join(', ') || r.error}`));
        }
        process.exit(1);
      }
      console.log(C.green(`All ${results.length} blueprints pass --strict`));
      return;
    }
    console.log(`\n  ${C.bold('Available blueprints:')}\n`);
    listBlueprints().forEach((b) => console.log(`    - ${b}`));
    console.log(`\n  ${C.dim('Example: velinstyle blueprint modal -o snippet.html --strict')}\n`);
    return;
  }
  const out = getArg('--output', '-o');
  const r = emitBlueprint(sub, { output: out || null, strict });
  if (!r.ok) {
    console.log(C.red(r.error));
    process.exit(1);
  }
  if (r.text) {
    console.log(r.text);
  } else {
    console.log(C.green(`Wrote blueprint to ${r.path}`));
  }
}

async function serveCmd() {
  const raw = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const port = Number(getArg('--port')) || 4173;
  const { serveStatic } = await import('./serve.js');
  const result = await serveStatic({ dir: resolve(raw), port });
  if (!result.ok) {
    console.log(C.red(result.error));
    process.exit(1);
  }
  console.log(C.green(`Serving ${result.dir}`));
  console.log(`  ${result.url}`);
  console.log(C.dim('Press Ctrl+C to stop'));
}

async function doctorCmd() {
  const { runDoctor, formatDoctorReport } = await import('./doctor.js');
  const raw = args[1] && !args[1].startsWith('-') ? resolve(args[1]) : process.cwd();
  let cwd = raw;
  try {
    if (existsSync(raw) && statSync(raw).isFile()) cwd = dirname(raw);
  } catch { /* use raw */ }
  const report = await runDoctor({ cwd, pkgRoot: PKG_ROOT });
  console.log(formatDoctorReport(report));
  process.exit(report.ok ? 0 : 1);
}

async function createCmd() {
  const kind = args[1];
  if (!kind || kind === '--help' || kind === '-h') {
    console.log(`Usage: velinstyle create <landing|dashboard|docs|auth> [dir] [--theme earth] [--no-copy]`);
    process.exit(kind ? 0 : 1);
  }
  const { CREATE_KINDS, createProject } = await import('./create.js');
  if (!CREATE_KINDS.includes(kind)) {
    console.log(C.red(`Unknown kind "${kind}". Use: ${CREATE_KINDS.join('|')}`));
    process.exit(1);
  }
  const dir = args[2] && !args[2].startsWith('-') ? args[2] : kind;
  const theme = getArg('--theme') || undefined;
  const copyAssets = !hasFlag('--no-copy');
  const r = createProject({ kind, dir: resolve(dir), pkgRoot: PKG_ROOT, theme, copyAssets });
  if (!r.ok) {
    console.log(C.red(r.error));
    process.exit(1);
  }
  console.log(C.green(`Created ${kind} at ${r.dir}`));
  console.log(C.dim(`  index: ${r.indexPath}`));
  if (r.vendorRel) console.log(C.dim(`  vendor: ${r.vendorRel}/`));
  if (r.vendorCopied?.length) console.log(C.dim(`  copied: ${r.vendorCopied.join(', ')}`));
  console.log(C.dim(`  Next: velinstyle serve ${dir} · velinstyle check ${dir}`));
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

async function tokensValidateCmd() {
  const input = getArg('--input') || 'examples/tokens.sample.json';
  const { validateTokensJson } = await import('./tokens-validate.js');
  const result = validateTokensJson(resolve(input));
  if (result.ok) {
    console.log(C.green(`Valid: ${resolve(input)}`));
    process.exit(0);
  }
  console.log(C.red(`Invalid: ${resolve(input)}`));
  result.errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}

async function tokensCmd() {
  const sub = args[1];
  if (sub === 'build') {
    await tokensBuildCmd();
  } else if (sub === 'validate') {
    await tokensValidateCmd();
  } else {
    console.log('Usage: velinstyle tokens build|validate [--input tokens.json] [--output, -o <file>]');
  }
}

async function perfCmd() {
  const sub = args[1] || 'audit';
  const rawTarget = args[2] && !args[2].startsWith('-') ? args[2] : '.';
  const targetPath = resolve(rawTarget);
  const asJson = hasFlag('--json');
  const write = hasFlag('--write');
  const dryRun = hasFlag('--dry-run') || !write;

  const { auditPath, formatTextReport, fixPath } = await import('./perf-audit.js');

  if (sub === 'fix') {
    const result = fixPath(targetPath, { write, dryRun });
    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (result.changes.length === 0) {
      console.log(C.green('No safe performance fixes to apply.'));
      return;
    }
    for (const c of result.changes) {
      console.log(`${dryRun ? '[dry-run] ' : ''}${c.file}`);
      c.changes.forEach((ch) => console.log(C.dim(`  - ${ch}`)));
    }
    return;
  }

  const { issues, files } = auditPath(targetPath);
  if (asJson) {
    console.log(JSON.stringify({ files, issues }, null, 2));
    return;
  }
  console.log(formatTextReport(issues, files));
  process.exit(issues.some((x) => x.severity === 'error') ? 1 : 0);
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

async function atelierCmd() {
  const sub = args[1];
  const {
    listAtelierEntries,
    pullAtelier,
  } = await import('./atelier.js');

  if (!sub || sub === '--help' || sub === '-h') {
    console.log(`Usage: velinstyle atelier list
       velinstyle atelier <num|id> [-o dir] [--format html|blade|vue|react]
         [--from <library-root>] [--base-url <url>] [--rewrite-vendor <path>]

  Pull a curated Atelier Library showcase (e.g. 36 → 36-calendar).
  Limitation: --format blade|vue|react writes integration shells only (not native rewrites).
  Velin Studio Builder and native framework blocks are planned — not shipped.`);
    return;
  }

  if (sub === 'list') {
    const r = listAtelierEntries();
    if (!r.ok) {
      console.log(C.red(r.error));
      process.exit(1);
    }
    console.log(`\n  ${C.bold('Atelier Library (curated)')} · ${r.items.length} templates\n`);
    for (const it of r.items) {
      console.log(`    ${C.cyan(it.num.padStart(3))}  ${it.id}  ${C.dim(it.title || '')}`);
    }
    console.log(`\n  ${C.dim('Example: velinstyle atelier 36 -o ./velin-atelier/36-calendar')}\n`);
    return;
  }

  const out = getArg('--output', '-o');
  const format = getArg('--format') || 'html';
  const from = getArg('--from') || process.env.VELINSTYLE_ATELIER_ROOT || null;
  const baseUrl = getArg('--base-url');
  const rewriteVendor = getArg('--rewrite-vendor');

  const r = await pullAtelier(sub, {
    output: out || undefined,
    format,
    from: from || undefined,
    baseUrl: baseUrl || undefined,
    rewriteVendor: rewriteVendor || undefined,
  });
  if (!r.ok) {
    console.log(C.red(r.error));
    process.exit(1);
  }
  console.log(C.green(`Pulled ${r.entry.id} → ${r.path} (format: ${r.format})`));
  console.log(C.dim(`  source: ${r.source}`));
  console.log(C.dim('  Limitation: blade/vue/react = wrappers; Studio/native rewrites planned.'));
}

async function scaffoldCmd() {
  const sub = args[1];
  const { scaffoldFromPrompt, listIntents } = await import('./scaffold.js');
  if (sub === 'list-intents') {
    console.log(`\n  ${C.bold('Scaffold intents:')}\n`);
    for (const i of listIntents()) {
      console.log(`    ${C.cyan(i.id)} — ${i.blueprints.join(' + ')}`);
      console.log(C.dim(`      keywords: ${i.keywords.slice(0, 5).join(', ')}…`));
    }
    console.log('');
    return;
  }

  const atelierList = getArg('--atelier');
  if (atelierList) {
    const { composeAtelierPage } = await import('./atelier.js');
    const out = getArg('--output', '-o') || resolve('velin-atelier/compose.html');
    const from = getArg('--from') || process.env.VELINSTYLE_ATELIER_ROOT || null;
    const baseUrl = getArg('--base-url');
    const r = await composeAtelierPage(atelierList, {
      output: out,
      from: from || undefined,
      baseUrl: baseUrl || undefined,
    });
    if (!r.ok) {
      console.log(C.red(r.error));
      process.exit(1);
    }
    if (hasFlag('--json')) {
      console.log(JSON.stringify({
        ok: true,
        mode: r.mode,
        path: r.path,
        entries: r.entries,
        planSections: r.planSections,
      }, null, 2));
    } else {
      console.log(C.green(`Wrote Atelier compose (beta) → ${r.path}`));
      console.log(C.dim(`  ids: ${r.entries.map((e) => e.id).join(', ')}`));
      console.log(C.dim('  Beta: Library compose — not Velin Studio. Wrappers ≠ native rewrites.'));
    }
    return;
  }

  const promptParts = [];
  let i = 1;
  while (i < args.length) {
    const a = args[i];
    if (a.startsWith('-')) break;
    if (a !== 'scaffold') promptParts.push(a);
    i += 1;
  }
  const prompt = promptParts.join(' ').trim() || sub;
  if (!prompt || prompt === 'list-intents') {
    console.log('Usage: velinstyle scaffold "<description>" [-o file.html] [--json]');
    console.log('       velinstyle scaffold --atelier 04,07 [-o page.html] [--from <library>]');
    return;
  }
  const r = scaffoldFromPrompt(prompt);
  if (!r.ok) {
    console.log(C.red(r.error));
    process.exit(1);
  }
  const out = getArg('--output', '-o');
  const asJson = hasFlag('--json');
  if (asJson) {
    console.log(JSON.stringify(r, null, 2));
  } else if (out) {
    writeFileSync(resolve(out), r.html, 'utf-8');
    console.log(C.green(`Wrote ${resolve(out)} (intent: ${r.intent}, ${r.confidence}${r.mode ? `, mode: ${r.mode}` : ''})`));
    if (r.review?.gate) {
      console.log(C.dim(`  review gate: ${r.review.gate} (promptScore ${r.review.promptScore})`));
    }
    if (r.responsiveHints?.length) {
      console.log(C.yellow(`  ${r.responsiveHints.length} layout hint(s) — run: velinstyle layout suggest ${out}`));
    }
  } else {
    console.log(r.html);
  }
}

async function planCmd() {
  const atelierList = getArg('--atelier');
  if (atelierList) {
    const { planFromAtelierList } = await import('./atelier.js');
    const payload = planFromAtelierList(atelierList, { prompt: args.slice(1).filter((a) => !a.startsWith('-')).join(' ') });
    if (!payload.ok) {
      console.log(C.red(payload.error));
      process.exit(1);
    }
    const out = getArg('--output', '-o');
    if (out) {
      writeFileSync(resolve(out), JSON.stringify(payload, null, 2), 'utf-8');
      console.log(C.green(`Wrote Atelier plan (beta) ${resolve(out)} (${payload.plan.sections.length} sections)`));
      return;
    }
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const promptParts = [];
  let i = 1;
  while (i < args.length) {
    const a = args[i];
    if (a.startsWith('-')) break;
    promptParts.push(a);
    i += 1;
  }
  const prompt = promptParts.join(' ').trim();
  if (!prompt) {
    console.log('Usage: velinstyle plan "<description>" [--json] [-o plan.json]');
    console.log('       velinstyle plan --atelier 04,07 [-o plan.json]');
    return;
  }
  const { analyzePrompt, buildPlan } = await import('./prompt-engine.js');
  const analysis = analyzePrompt(prompt);
  const plan = buildPlan(analysis, prompt);
  const payload = { analysis, plan };
  const out = getArg('--output', '-o');
  if (out) {
    writeFileSync(resolve(out), JSON.stringify(payload, null, 2), 'utf-8');
    console.log(C.green(`Wrote plan ${resolve(out)} (page: ${plan.page?.id}, sections: ${plan.sections.length})`));
    return;
  }
  console.log(JSON.stringify(payload, null, 2));
}

async function reviewCmd() {
  const target = args[1] && !args[1].startsWith('-') ? args[1] : null;
  if (!target) {
    console.log('Usage: velinstyle review <file.html> [--json] [--prompt "..."] [--profile marketing|app|docs|fragment]');
    return;
  }
  const full = resolve(target);
  if (!existsSync(full)) {
    console.log(C.red(`File not found: ${full}`));
    process.exit(1);
  }
  const html = readFileSync(full, 'utf-8');
  const prompt = getArg('--prompt') || '';
  const profile = getArg('--profile');
  let plan;
  if (prompt) {
    const { analyzePrompt, buildPlan } = await import('./prompt-engine.js');
    plan = buildPlan(analyzePrompt(prompt), prompt);
  }
  const { reviewHtml } = await import('./review.js');
  const report = reviewHtml(html, { plan, prompt, profile: profile || undefined });
  if (hasFlag('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n  ${C.bold('Review gate:')} ${report.gate}  ${C.dim(`profile ${report.profile} · promptScore ${report.promptScore}`)}`);
    console.log(C.dim(`  design ${report.scores.design} · a11y ${report.scores.accessibility} · seo ${report.scores.seo} · perf ${report.scores.performance} · conversion ${report.scores.conversion} · opt ${report.scores.optimization ?? '—'}`));
    if (report.optimization) {
      console.log(C.dim(`  optimization · unused themes ${report.optimization.unusedThemes} · WC tags ${report.optimization.componentTags} · class tokens ${report.optimization.classTokens}`));
    }
    if (report.issues.length) {
      console.log(`\n  ${C.bold('Issues:')}`);
      for (const issue of report.issues) {
        const color = issue.severity === 'error' ? C.red : C.yellow;
        console.log(color(`    [${issue.severity}] ${issue.code}: ${issue.message}`));
        console.log(C.dim(`      fix: ${issue.fix}`));
      }
    } else {
      console.log(C.green('\n  No issues.'));
    }
    console.log('');
  }
  process.exit(report.gate === 'fail' ? 1 : 0);
}

async function layoutCmd() {
  const sub = args[1] || 'audit';
  const rawTarget = args[2] && !args[2].startsWith('-') ? args[2] : '.';
  const targetPath = resolve(rawTarget);
  const asJson = hasFlag('--json');
  const write = hasFlag('--write');
  const dryRun = hasFlag('--dry-run') || !write;

  const { auditPath, suggestFromIssues, formatTextReport, fixPath } = await import('./layout-audit.js');

  if (sub === 'fix') {
    const result = fixPath(targetPath, { write, dryRun });
    if (!result.ok) {
      console.log(C.red(result.error || 'Fix failed'));
      process.exit(1);
    }
    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (result.changes.length === 0) {
      console.log(C.green('No safe fixes to apply.'));
      return;
    }
    for (const c of result.changes) {
      console.log(`${dryRun ? '[dry-run] ' : ''}${c.file}`);
      c.changes.forEach((ch) => console.log(C.dim(`  - ${ch}`)));
    }
    return;
  }

  const { issues, files } = auditPath(targetPath);
  const outIssues = sub === 'suggest' ? suggestFromIssues(issues) : issues;

  if (asJson) {
    console.log(JSON.stringify({ files, issues: outIssues }, null, 2));
    return;
  }

  console.log(formatTextReport(outIssues, files));
  if (sub === 'suggest' && issues.length) {
    console.log(C.bold('Suggested fixes:'));
    for (const i of outIssues) {
      console.log(`  [${i.id}] ${i.fix}`);
      if (i.responsive?.mobile) {
        console.log(C.dim(`    mobile: ${i.responsive.mobile}`));
      }
    }
    console.log('');
  }
  process.exit(issues.some((x) => x.severity === 'error') ? 1 : 0);
}

async function docsCmd() {
  const sub = args[1];
  if (sub === 'generate') {
    const scope = getArg('--scope') || 'all';
    const out = getArg('--out') || join(PKG_ROOT, 'docs', 'generated');
    const { generateDocs } = await import('./docs-generate.js');
    const result = await generateDocs({ scope, outDir: resolve(out), searchIndex: true });
    if (!result.ok) {
      console.log(C.red(result.error));
      process.exit(1);
    }
    console.log(C.green(`Generated ${result.written} file(s) → ${resolve(out)}`));
    return;
  }
  console.log('Usage: velinstyle docs generate [--scope all|components|tokens|utilities|cli|rules|a11y|meta] [--out <dir>]');
}

async function metaCmd() {
  const { metaMain } = await import('./meta.js');
  await metaMain(process.argv.slice(2));
}

async function searchCmd() {
  const sub = args[1];
  if (sub === 'index') {
    const out = getArg('--out') || join(PKG_ROOT, 'dist', 'search-index.json');
    const extra = getArg('--extra-html');
    const { buildSearchIndex } = await import('./search-index.js');
    const result = buildSearchIndex({
      outFile: resolve(out),
      extraHtmlDirs: extra ? extra.split(',').map((p) => resolve(p.trim())) : [],
    });
    console.log(C.green(`Search index: ${result.count} entries → ${result.outFile}`));
    return;
  }
  console.log('Usage: velinstyle search index [--out <file>] [--extra-html dir1,dir2]');
}

async function skillsCmd() {
  const { skillsCommand } = await import('./skills.js');
  await skillsCommand(args.slice(1));
}

async function workflowCmd() {
  const { workflowCommand } = await import('./workflow.js');
  await workflowCommand(args.slice(1));
}

async function wcCmd() {
  const sub = args[1];
  if (sub === 'api' || sub === '--help' || sub === '-h' || !sub) {
    if (sub !== 'api') {
      console.log(`Usage: velinstyle wc api <tag>\nExample: velinstyle wc api velin-toast`);
      if (sub === '--help' || sub === '-h' || !sub) process.exit(0);
    }
    const tag = args[2];
    const { describeWcApi, formatWcApi } = await import('./wc-api.js');
    const report = describeWcApi(PKG_ROOT, tag);
    if (!report.ok) {
      console.error(report.error);
      process.exit(1);
    }
    if (hasFlag('--json')) console.log(JSON.stringify(report, null, 2));
    else console.log(formatWcApi(report));
    return;
  }
  console.error(`Unknown wc subcommand: ${sub}. Use: velinstyle wc api <tag>`);
  process.exit(1);
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
  const only = getArg('--only');

  const { scan } = await import('./scanner.js');
  const exitCode = scan(targetPath, {
    severity,
    fix,
    fixDryRun,
    fixLang: fixLang || undefined,
    format,
    only,
  });
  process.exit(exitCode);
}

async function checkCmd() {
  const raw = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  const target = resolve(raw);
  const asJson = hasFlag('--json');
  const asSarif = hasFlag('--sarif');
  const profile = getArg('--profile');
  let failed = 0;
  const steps = [];

  const quiet = asJson || asSarif;

  if (!quiet) console.log(C.bold('\n── doctor ──'));
  const { runDoctor, formatDoctorReport } = await import('./doctor.js');
  let doctorCwd = target;
  try {
    if (existsSync(target) && statSync(target).isFile()) doctorCwd = dirname(target);
  } catch { /* keep target */ }
  const doc = await runDoctor({ cwd: doctorCwd, pkgRoot: PKG_ROOT });
  if (!quiet) console.log(formatDoctorReport(doc));
  if (!doc.ok) failed += 1;
  steps.push({ step: 'doctor', ok: doc.ok, detail: { checks: doc.checks?.length, warnings: doc.warnings?.length } });

  if (!quiet) console.log(C.bold('\n── blueprint --strict ──'));
  const { validateAllBlueprints } = await import('./blueprint.js');
  const bp = validateAllBlueprints();
  const badBp = bp.filter((r) => !r.ok);
  if (badBp.length) {
    if (!quiet) {
      for (const r of badBp) console.log(C.red(`${r.id}: ${r.missing?.join(', ') || r.error}`));
    }
    failed += 1;
  } else if (!quiet) {
    console.log(C.green(`All ${bp.length} blueprints pass --strict`));
  }
  steps.push({ step: 'blueprint', ok: badBp.length === 0, total: bp.length, failed: badBp.length });

  if (!quiet) console.log(C.bold('\n── scan ──'));
  const { scan } = await import('./scanner.js');
  const scanResult = scan(target, { severity: 'warning', format: 'json', returnData: true });
  if (!quiet && scanResult.issues?.length) {
    for (const i of scanResult.issues.slice(0, 40)) {
      console.log(`  ${i.severity} ${i.rule} L${i.line}: ${i.message}`);
    }
    if (scanResult.issues.length > 40) console.log(C.dim(`  … ${scanResult.issues.length - 40} more`));
  } else if (!quiet) {
    console.log(C.green('No scan issues at warning+'));
  }
  if (scanResult.exitCode) failed += 1;
  steps.push({
    step: 'scan',
    ok: !scanResult.exitCode,
    errors: scanResult.errors,
    warnings: scanResult.warnings,
    issues: scanResult.issues,
  });

  let htmlFile = null;
  let reviewReport = null;
  try {
    const st = statSync(target);
    if (st.isFile() && /\.html?$/i.test(target)) htmlFile = target;
    else if (st.isDirectory()) {
      const idx = join(target, 'index.html');
      if (existsSync(idx)) htmlFile = idx;
    }
  } catch { /* skip review */ }

  if (htmlFile) {
    if (!quiet) console.log(C.bold('\n── review ──'));
    const { reviewHtml } = await import('./review.js');
    const html = readFileSync(htmlFile, 'utf-8');
    reviewReport = reviewHtml(html, { prompt: '', profile: profile || undefined });
    if (!quiet) {
      console.log(`Gate: ${reviewReport.gate} (profile ${reviewReport.profile}, promptScore ${reviewReport.promptScore ?? '—'})`);
    }
    if (reviewReport.gate === 'fail') failed += 1;
    steps.push({ step: 'review', ok: reviewReport.gate !== 'fail', gate: reviewReport.gate, report: reviewReport });
  } else {
    if (!quiet) console.log(C.dim('\n── review skipped (no index.html / HTML file) ──'));
    steps.push({ step: 'review', ok: true, skipped: true });
  }

  if (!quiet) console.log(C.bold('\n── transparency ──'));
  try {
    const { transparencyCheckStep } = await import('./transparency.js');
    const tx = await transparencyCheckStep(htmlFile || target, { quiet, C });
    if (!tx.ok && !tx.skipped) failed += 1;
    if (!quiet && tx.scores) {
      console.log(`Transparency ${tx.scores.transparency}% · AI ${tx.scores.ai}% · Trust ${tx.scores.trust}% · Provenance ${tx.scores.provenance}%`);
    }
    steps.push({ step: 'transparency', ok: tx.ok || !!tx.skipped, scores: tx.scores, skipped: tx.skipped });
  } catch (err) {
    if (!quiet) console.log(C.yellow(`transparency skipped: ${err.message}`));
    steps.push({ step: 'transparency', ok: true, skipped: true, error: String(err.message || err) });
  }

  const payload = {
    ok: failed === 0,
    failedSteps: failed,
    target,
    steps,
  };

  if (asSarif) {
    const results = [];
    for (const issue of scanResult.issues || []) {
      results.push({
        ruleId: issue.rule,
        level: issue.severity === 'ERROR' ? 'error' : issue.severity === 'WARNING' ? 'warning' : 'note',
        message: { text: issue.message },
        locations: [{
          physicalLocation: {
            artifactLocation: { uri: issue.file || htmlFile || target },
            region: { startLine: issue.line || 1 },
          },
        }],
      });
    }
    for (const issue of reviewReport?.issues || []) {
      results.push({
        ruleId: issue.code,
        level: issue.severity === 'error' ? 'error' : 'warning',
        message: { text: issue.message },
        locations: [{
          physicalLocation: {
            artifactLocation: { uri: htmlFile || target },
            region: { startLine: 1 },
          },
        }],
      });
    }
    const sarif = {
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: { driver: { name: 'velinstyle-check', informationUri: 'https://github.com/SkyliteDesign/velinstyle', version: CLI_VERSION } },
        results,
      }],
    };
    console.log(JSON.stringify(sarif, null, 2));
  } else if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
  } else if (failed) {
    console.log(C.red(`\ncheck failed (${failed} step(s))`));
  } else {
    console.log(C.green('\ncheck passed'));
  }

  process.exit(failed ? 1 : 0);
}

function suggestCommand(unknown) {
  const names = [
    'init', 'build', 'themes', 'add', 'icons', 'blueprint', 'create', 'serve', 'doctor', 'check',
    'validate', 'tokens', 'scan', 'prefix', 'scaffold', 'plan', 'review', 'transparency', 'layout', 'perf',
    'docs', 'documentation', 'meta', 'search', 'skills', 'workflow', 'wc', 'production', 'atelier',
  ];
  const q = String(unknown || '').toLowerCase();
  function editDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i += 1) dp[i][0] = i;
    for (let j = 0; j <= n; j += 1) dp[0][j] = j;
    for (let i = 1; i <= m; i += 1) {
      for (let j = 1; j <= n; j += 1) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }
  return names
    .map((name) => ({ name, dist: editDistance(q, name) }))
    .sort((a, b) => a.dist - b.dist || a.name.localeCompare(b.name))
    .slice(0, 3)
    .filter((s) => s.dist <= Math.max(4, Math.ceil(q.length / 2)))
    .map((s) => s.name);
}

function unknownCommand(cmd) {
  console.log(C.red(`Unknown command '${cmd}'.`));
  const suggestions = suggestCommand(cmd);
  if (suggestions.length) {
    console.log(`Did you mean ${suggestions.map((s) => C.cyan(s)).join(', ')}?`);
  }
  console.log(C.dim('Run velinstyle --help for the command list.'));
  process.exit(1);
}

// ── Router ───────────────────────────────────────────────────────────────────

const ALIASES = {
  validate: 'check',
  documentation: 'docs',
};

const resolvedCommand = ALIASES[command] || command;

switch (resolvedCommand) {
  case 'init': init(); break;
  case 'build': await build(); break;
  case 'production': {
    const { runProduction } = await import('./production/run.js');
    await runProduction({ args: args.slice(1), helpers: { getArg, hasFlag, C } });
    break;
  }
  case 'themes': themes(); break;
  case 'add': add(); break;
  case 'icons': icons(); break;
  case 'blueprint': await blueprintCmd(); break;
  case 'create': await createCmd(); break;
  case 'serve': await serveCmd(); break;
  case 'doctor': await doctorCmd(); break;
  case 'check': await checkCmd(); break;
  case 'tokens': await tokensCmd(); break;
  case 'scan': scanCmd(); break;
  case 'prefix': await prefixCmd(); break;
  case 'scaffold': await scaffoldCmd(); break;
  case 'plan': await planCmd(); break;
  case 'atelier': await atelierCmd(); break;
  case 'review': await reviewCmd(); break;
  case 'transparency': {
    const { transparencyCmd } = await import('./transparency.js');
    await transparencyCmd(args.slice(1), { C, getArg, hasFlag });
    break;
  }
  case 'layout': await layoutCmd(); break;
  case 'perf': await perfCmd(); break;
  case 'docs': await docsCmd(); break;
  case 'meta': await metaCmd(); break;
  case 'search': await searchCmd(); break;
  case 'skills': await skillsCmd(); break;
  case 'workflow': await workflowCmd(); break;
  case 'wc': await wcCmd(); break;
  case '--help': case '-h': case undefined: help(); break;
  default: unknownCommand(command); break;
}
