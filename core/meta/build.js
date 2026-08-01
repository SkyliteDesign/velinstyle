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
    version: readPackageMeta(pkgRoot).version || '0.0.0',
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

  const readJsonSafe = (rel) => {
    const p = join(pkgRoot, rel);
    if (!existsSync(p)) return null;
    try {
      return JSON.parse(readFileSync(p, 'utf-8'));
    } catch {
      return null;
    }
  };

  const knowledgeComponents = readJsonSafe('core/meta/knowledge/components.json');
  const knowledgeTokens = readJsonSafe('core/meta/knowledge/tokens.json');
  const pageRegistry = readJsonSafe('core/meta/pages/registry.json');
  const sectionRegistry = readJsonSafe('core/meta/sections/registry.json');
  const skillsRegistry = readJsonSafe('packages/velinstyle-skills/registry.json');
  const skillsCatalog = readJsonSafe('packages/velinstyle-skills/catalog.json');

  const constraintDir = join(pkgRoot, 'core', 'meta', 'design-constraints');
  const designConstraints = [];
  if (existsSync(constraintDir)) {
    for (const file of readdirSync(constraintDir).filter((f) => f.endsWith('.json'))) {
      try {
        designConstraints.push(JSON.parse(readFileSync(join(constraintDir, file), 'utf-8')));
      } catch {
        /* skip bad files */
      }
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
        'VelinStyle is a CSS framework with WCAG 2.2 AAA-oriented defaults, native JavaScript runtime, and Web Components.',
      pipeline: 'Core Foundation → Design System → Knowledge Graph → Prompt Engine → Review Engine → AI Metadata',
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
        'Prefer velinstyle scaffold / plan for page generation (plan → render → review).',
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
    knowledgeGraph: {
      components: knowledgeComponents?.components || [],
      componentCount: knowledgeComponents?.components?.length || 0,
      tokens: knowledgeTokens,
      pages: pageRegistry?.pages || [],
      pageCount: pageRegistry?.pages?.length || 0,
      sections: sectionRegistry?.sections || [],
      sectionCount: sectionRegistry?.sections?.length || 0,
      designConstraints,
      schemas: [
        'schemas/component-knowledge.schema.json',
        'schemas/design-intelligence.schema.json',
        'schemas/design-constraint.schema.json',
        'schemas/page-template.schema.json',
        'schemas/section.schema.json',
        'schemas/review-report.schema.json',
        'schemas/token-graph.schema.json',
        'schemas/design-rule.schema.json',
        'schemas/skill-record.schema.json',
        'schemas/skill-registry.schema.json',
        'schemas/skill-pack.schema.json',
        'schemas/skill-graph.schema.json',
        'schemas/skill-bundle.schema.json',
        'schemas/skill-template.schema.json',
        'schemas/skill-project.schema.json',
      ],
    },
    skills: {
      count: skillsCatalog?.totals?.skills || skillsRegistry?.skills?.length || 0,
      categories: [...new Set((skillsRegistry?.skills || []).map((item) => item.category))].sort(),
      capabilities: [...new Set((skillsRegistry?.skills || []).flatMap((item) => item.capabilities || []))].sort(),
      items: (skillsRegistry?.skills || []).map((item) => ({
        id: item.id,
        category: item.category,
        priority: item.priority,
        status: item.status,
        confidence: item.confidence,
        capabilities: item.capabilities || [],
      })),
    },
    skillPacks: skillsRegistry?.packs || [],
    workflowGraphs: (skillsRegistry?.workflowGraphs || []).map((graph) => ({
      id: graph.id,
      name: graph.name,
      entry: graph.entry,
      nodeCount: Object.keys(graph.nodes || {}).length,
      edgeCount: (graph.edges || []).length,
    })),
    bundles: skillsRegistry?.bundles || [],
    templates: skillsRegistry?.templates || [],
    projectSkills: skillsRegistry?.projects || [],
    attributes: { names: attributes, count: attributes.length },
    cli: { commands: cliCommands },
    tooling: {
      categories: [
        'scan',
        'prefix',
        'scaffold',
        'plan',
        'review',
        'layout',
        'perf',
        'tokens',
        'docs',
        'search',
        'meta',
      ],
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
        aiSkills: 'docs/guides/ai-skills.html',
        velinSearch: 'docs/guides/velin-search.html',
        syntaxHighlight: 'docs/guides/syntax-highlight.html',
        promptScaffolding: 'docs/guides/prompt-scaffolding.html',
        apiReference: 'docs/guides/api-reference.html',
      },
      strategy: {
        note: 'Maintainer strategy/ADR docs are not published (monorepo interne_docs/strategy).',
        northStar: 'VELINSTYLE_2030.md',
        architecture: 'ARCHITECTURE.md',
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
    'VelinStyle is a CSS framework with WCAG 2.2 AAA-oriented defaults, native JavaScript runtime, and Web Components.';
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
    `- Pipeline: ${bundle.framework.pipeline || 'Core → Design → Knowledge → Prompt → Review → AI Metadata'}`,
    `- Maturity: CSS/Web Components/runtime = stable; plan/review, knowledge graph, page/section registry, agent metadata = beta/foundation (seed, expanding); Studio + Utility Engine generator = planned`,
    `- Components: ${bundle.components.count} canonical Web Components (\`velin-*\`); ${bundle.components.loaderCount ?? bundle.components.count} lazy-loader entries`,
    `- Knowledge graph: ${bundle.knowledgeGraph?.componentCount ?? 0} component nodes, ${bundle.knowledgeGraph?.pageCount ?? 0} page types, ${bundle.knowledgeGraph?.sectionCount ?? 0} sections, ${bundle.knowledgeGraph?.designConstraints?.length ?? 0} design constraint packs`,
    `- HTML attributes: ${bundle.attributes.count} \`velin-*\` bridges`,
    `- CLI: velinstyle (scan, scaffold, plan, review, docs generate, search index, meta)`,
    '',
    '## Agent briefing',
    '- Treat plan/review/knowledge graph as beta foundation — usable, not a finished AI design system.',
    '- Build pages with plan-first flow: analyze prompt → page registry → sections → design constraints → HTML → review.',
    '- Prefer tokens (`--velin-color-*`, `--velin-space-*`) over raw hex.',
    '- One H1 per page; form fields need labels + `velin-form-summary` when validating.',
    '- Hero: max 2 CTAs; FAQ uses disclosure (`velin-accordion` / details).',
    '- Do not invent non-`velin-*` utility classes.',
    '- Prefer registry-backed skills/workflows (`velinstyle skills ...`, `velinstyle workflow ...`) before ad-hoc orchestration.',
    '',
    '## Conventions',
    ...bundle.conventions.map((c) => `- ${c}`),
    '',
    '## Key guides',
    `- [Velin-Meta](${baseUrl}/docs/guides/velin-meta.html)`,
    `- [AI Skills](${baseUrl}/docs/guides/ai-skills.html)`,
    `- [VelinSearch](${baseUrl}/docs/guides/velin-search.html)`,
    `- [Syntax highlighting](${baseUrl}/docs/guides/syntax-highlight.html)`,
    `- [Prompt scaffolding](${baseUrl}/docs/guides/prompt-scaffolding.html)`,
    `- [API reference (generated)](${baseUrl}/docs/guides/api-reference.html)`,
    `- North star: VELINSTYLE_2030.md`,
    `- Architecture: ARCHITECTURE.md`,
    '',
    '## Generated reference',
    `- [Components index](${baseUrl}/docs/generated/components/)`,
    `- [Tokens](${baseUrl}/docs/generated/tokens/)`,
    `- [Utilities](${baseUrl}/docs/generated/utilities/)`,
    `- [CLI commands](${baseUrl}/docs/generated/cli/commands.md)`,
    '',
    '## Usage for agents',
    '```',
    'npx velinstyle plan "Steuerberater Landingpage mit Kontaktformular"',
    'npx velinstyle scaffold "Steuerberater Landingpage mit Kontaktformular" -o out.html --json',
    'npx velinstyle review out.html --json',
    'npx velinstyle meta',
    'npx velinstyle docs generate',
    'npx velinstyle skills list --capability review',
    'npx velinstyle skills install frontend',
    'npx velinstyle workflow landingpage --json',
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
