import { normalizePolicy } from './policy.js';
import { createRegistry } from './registry.js';
import { collectAllDisclosures } from './providers.js';
import { validateRecords } from './validator.js';
import { transparencyDoctor } from './doctor.js';
import { buildTransparencyReports } from './reporter.js';
import { exportDisclosures } from './export.js';
import { transparencyMigrate } from './migrate.js';
import { normalizeDisclosure } from './normalize.js';

/**
 * Create a Transparency Engine instance.
 * @param {{ policy?: object, lang?: 'en'|'de' }} [options]
 */
export function createTransparencyEngine(options = {}) {
  const policy = normalizePolicy(options.policy);
  const registry = createRegistry();
  const lang = options.lang === 'de' ? 'de' : 'en';

  return {
    policy,
    registry,
    lang,

    /**
     * Collect → validate → register from HTML string / DOM / JSON.
     */
    async ingest(root, ctx = {}) {
      const { records, conflicts } = await collectAllDisclosures(root, {
        policy,
        lang,
        file: ctx.file,
        meta: ctx.meta,
        apiDisclosures: ctx.apiDisclosures,
      });
      registry.clear();
      for (const r of records) registry.register(r);
      const findings = validateRecords(records, policy);
      return { records, conflicts, findings, registry: registry.export() };
    },

    register(draft, ctx = {}) {
      const record = normalizeDisclosure(draft, { provider: draft.provider || 'api', lang, file: ctx.file });
      return registry.register(record);
    },

    async doctor(html, ctx = {}) {
      return transparencyDoctor(html, { policy, lang, ...ctx });
    },

    async validate(html, ctx = {}) {
      const report = await transparencyDoctor(html, { policy, lang, ...ctx });
      return {
        ok: report.ok && !report.findings.some((f) => f.severity === 'error'),
        findings: report.findings,
        scores: report.scores,
      };
    },

    async report(html, ctx = {}) {
      const doctor = await transparencyDoctor(html, { policy, lang, ...ctx });
      return buildTransparencyReports(doctor, { title: ctx.title });
    },

    export(format = 'json') {
      return exportDisclosures(registry.list(), format);
    },

    async migrate(html, ctx = {}) {
      return transparencyMigrate(html, { policy, lang, ...ctx });
    },
  };
}

export const TransparencyMIME = 'application/vnd.velinstyle.transparency+json';
