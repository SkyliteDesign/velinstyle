import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import {
  VELIN_META_MIME,
  VELIN_AGENT_SCHEMA_VERSION,
  AGENT_CONVENTIONS,
} from './schema.js';
import { relativizeDocsPathname } from '../search/docs-url.js';

/**
 * @param {string} pkgRoot
 */
export function readPackageMeta(pkgRoot) {
  const pkgPath = join(pkgRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const exports = Object.keys(pkg.exports || {});
  return {
    name: pkg.name,
    version: pkg.version,
    homepage: pkg.homepage,
    repository: typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url,
    exports,
  };
}

const LEGACY_WC_SUFFIX = '-wc';

/**
 * @param {string} pkgRoot
 * @returns {{ canonical: string[], legacyAliases: string[], loaderTags: string[] }}
 */
export function collectComponentTags(pkgRoot) {
  const loadersPath = join(pkgRoot, 'components', 'runtime', 'component-loaders.js');
  if (existsSync(loadersPath)) {
    const src = readFileSync(loadersPath, 'utf-8');
    const loaderTags = [...new Set([...src.matchAll(/'((velin-[a-z0-9-]+))':/g)].map((m) => m[1]))].sort();
    const legacyAliases = loaderTags.filter((t) => t.endsWith(LEGACY_WC_SUFFIX));
    const canonical = loaderTags.filter((t) => !t.endsWith(LEGACY_WC_SUFFIX));
    return { canonical, legacyAliases, loaderTags };
  }
  const dir = join(pkgRoot, 'components');
  if (!existsSync(dir)) return { canonical: [], legacyAliases: [], loaderTags: [] };
  const canonical = readdirSync(dir)
    .filter((f) => f.startsWith('velin-') && f.endsWith('.js') && !f.includes('runtime'))
    .map((f) => basename(f, '.js'))
    .filter((t) => !t.endsWith(LEGACY_WC_SUFFIX))
    .sort();
  return { canonical, legacyAliases: [], loaderTags: canonical };
}

/**
 * JS helpers shipped under components/ but not registered as custom elements.
 * @param {string} pkgRoot
 */
export function collectHelperModules(pkgRoot) {
  const helpers = ['velin-flip', 'velin-haptic', 'velin-reveal'];
  return helpers.filter((name) => existsSync(join(pkgRoot, 'components', `${name}.js`)));
}

/**
 * @param {string} html
 * @param {string} [sourcePath]
 * @param {string} [pkgRoot]
 */
export function buildPageMeta(html, sourcePath = '', pkgRoot = '.') {
  const components = new Set();
  const classes = new Set();
  const attributes = new Set();

  for (const m of html.matchAll(/<(velin-[a-z0-9-]+)/gi)) {
    components.add(m[1].toLowerCase());
  }
  for (const m of html.matchAll(/\b(velin-[a-z0-9-]+)/gi)) {
    classes.add(m[1].toLowerCase());
  }
  for (const m of html.matchAll(/\b(velin-[a-z]+)(?:\s*=|(?=\s|>))/gi)) {
    const name = m[1].toLowerCase();
    if (!name.includes('-wc')) attributes.add(name);
  }

  const intent = sourcePath.includes('components/')
    ? 'component-doc'
    : sourcePath.includes('guides/')
      ? 'guide'
      : 'page';

  return {
    version: readPackageMeta(pkgRoot).version || '0.9.0',
    mime: VELIN_META_MIME,
    page: {
      intent,
      source: sourcePath || undefined,
    },
    allowed: {
      classesPrefix: ['velin-'],
      components: [...components].sort(),
      sampleClasses: [...classes].sort().slice(0, 48),
    },
    attributes: [...attributes].sort(),
    a11y: [
      'Use semantic HTML inside Velin components.',
      'Provide labels for interactive controls.',
      'Respect prefers-reduced-motion; Velin motion attributes honor it.',
    ],
  };
}

/**
 * @param {object} options
 * @param {string} options.pkgRoot
 * @param {string} [options.searchIndexPath]
 * @param {import('./schema.js').VelinAgentBundle} [options.partial]
 */
export async function buildAgentBundle(options) {
  const { pkgRoot } = options;
  const pkg = readPackageMeta(pkgRoot);
  const { canonical, legacyAliases, loaderTags } = collectComponentTags(pkgRoot);
  const helpers = collectHelperModules(pkgRoot);

  let attributes = [];
  try {
    const { listRegisteredAttributes } = await import('../attributes/registry.js');
    attributes = listRegisteredAttributes().sort();
  } catch {
    /* registry may need DOM in some environments */
  }

  let cliCommands = [];
  try {
    const { loadCliManifest } = await import('../../cli/docgen/extract-cli.js');
    cliCommands = loadCliManifest().commands || [];
  } catch {
    const manifestPath = join(pkgRoot, 'cli', 'cli-manifest.json');
    if (existsSync(manifestPath)) {
      cliCommands = JSON.parse(readFileSync(manifestPath, 'utf-8')).commands || [];
    }
  }

  let scannerRuleCount = 0;
  let a11yContracts = { wcagLevel: 'AAA', components: {} };
  try {
    const { SCANNER_RULES } = await import('../../cli/scanner-rules-data.js');
    scannerRuleCount = SCANNER_RULES.length;
  } catch {
    /* optional */
  }
  try {
    const contractsPath = join(pkgRoot, 'core', 'a11y', 'component-contracts.json');
    if (existsSync(contractsPath)) {
      a11yContracts = JSON.parse(readFileSync(contractsPath, 'utf-8'));
    }
  } catch {
    /* optional */
  }

  const searchPath = options.searchIndexPath || join(pkgRoot, 'dist', 'search-index.json');
  let entryCount;
  if (existsSync(searchPath)) {
    try {
      const idx = JSON.parse(readFileSync(searchPath, 'utf-8'));
      entryCount = Array.isArray(idx.entries) ? idx.entries.length : undefined;
    } catch {
      /* ignore */
    }
  }

  const bundle = {
    schemaVersion: VELIN_AGENT_SCHEMA_VERSION,
    mime: VELIN_META_MIME,
    generatedAt: new Date().toISOString(),
    framework: {
      name: pkg.name,
      version: pkg.version,
      homepage: pkg.homepage,
      repository: pkg.repository,
      tagline:
        'VelinStyle is the WCAG 2.2 AAA CSS framework with native JavaScript runtime and Web Components.',
    },
    packageExports: pkg.exports,
    release: {
      breaking: [
        'Canonical tags: velin-tooltip, velin-stepper (legacy *-wc aliases deprecated).',
        '.velin-mb-* is margin-bottom only; use .velin-my-* for block axis.',
      ],
      migration: [
        'Replace velin-tooltip-wc / velin-stepper-wc with velin-tooltip / velin-stepper.',
        'Point AI tools at velin-agent.json or docs/llms.txt for framework context.',
      ],
    },
    components: {
      tags: canonical,
      count: canonical.length,
      loaderTags,
      loaderCount: loaderTags.length,
      legacyAliases,
      helpers,
    },
    attributes: { names: attributes, count: attributes.length },
    cli: { commands: cliCommands },
    tooling: {
      categories: ['scan', 'prefix', 'scaffold', 'layout', 'perf', 'tokens', 'docs', 'search', 'meta'],
      scannerRuleCount,
    },
    a11y: {
      wcagLevel: a11yContracts.wcagLevel || 'AAA',
      modules: 'src/a11y/*.css',
      matrix: 'docs/generated/a11y/wcag22-aaa-matrix.md',
      componentContracts: a11yContracts.components,
      init: "import { initA11y } from '@birdapi/velinstyle/a11y'; initA11y();",
    },
    searchIndex: {
      path: 'dist/search-index.json',
      entryCount,
    },
    documentation: {
      generated: 'docs/generated/',
      guides: {
        velinMeta: 'docs/guides/velin-meta.html',
        velinSearch: 'docs/guides/velin-search.html',
        syntaxHighlight: 'docs/guides/syntax-highlight.html',
        promptScaffolding: 'docs/guides/prompt-scaffolding.html',
        apiReference: 'docs/guides/api-reference.html',
      },
      agentFiles: {
        json: 'dist/velin-agent.json',
        llmsTxt: 'dist/llms.txt',
      },
    },
    conventions: AGENT_CONVENTIONS,
    ...options.partial,
  };

  return bundle;
}

/**
 * @param {object} bundle
 * @param {string} [baseUrl]
 */
export function buildLlmsTxt(bundle, baseUrl = 'https://velinstyle.info') {
  const tagline =
    bundle.framework.tagline ||
    'VelinStyle is the WCAG 2.2 AAA CSS framework with native JavaScript runtime and Web Components.';
  const lines = [
    `# VelinStyle ${bundle.framework.version}`,
    '',
    `> ${tagline}`,
    `> Full machine context: ${baseUrl}/dist/velin-agent.json`,
    `> MIME: ${VELIN_META_MIME}`,
    '',
    '## Framework',
    `- npm: ${bundle.framework.name}`,
    `- ${tagline}`,
    `- Components: ${bundle.components.count} canonical Web Components (\`velin-*\`); ${bundle.components.loaderCount ?? bundle.components.count} lazy-loader entries`,
    `- HTML attributes: ${bundle.attributes.count} \`velin-*\` bridges`,
    `- CLI: velinstyle (scan, scaffold, docs generate, search index, meta)`,
    '',
    '## Conventions',
    ...bundle.conventions.map((c) => `- ${c}`),
    '',
    '## Key guides',
    `- [Velin-Meta](${baseUrl}/docs/guides/velin-meta.html)`,
    `- [VelinSearch](${baseUrl}/docs/guides/velin-search.html)`,
    `- [Syntax highlighting](${baseUrl}/docs/guides/syntax-highlight.html)`,
    `- [Prompt scaffolding](${baseUrl}/docs/guides/prompt-scaffolding.html)`,
    `- [API reference (generated)](${baseUrl}/docs/guides/api-reference.html)`,
    '',
    '## Generated reference',
    `- [Components index](${baseUrl}/docs/generated/components/)`,
    `- [Tokens](${baseUrl}/docs/generated/tokens/)`,
    `- [Utilities](${baseUrl}/docs/generated/utilities/)`,
    `- [CLI commands](${baseUrl}/docs/generated/cli/commands.md)`,
    '',
    '## Usage for agents',
    '```',
    'npx velinstyle meta',
    'npx velinstyle docs generate',
    'npx velinstyle search index',
    '```',
    '',
  ];
  return lines.join('\n');
}

/**
 * Serialize page meta for embedding in HTML.
 * @param {object} meta
 */
export function serializePageMetaScript(meta) {
  return `<script type="${VELIN_META_MIME}" id="velin-meta">\n${JSON.stringify(meta, null, 2)}\n</script>`;
}

export { relativizeDocsPathname };
