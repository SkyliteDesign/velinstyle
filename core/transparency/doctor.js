import { collectAllDisclosures } from './providers.js';
import { validateRecords, inferMediaKind } from './validator.js';
import { mediaRequirement, requiredProvenanceFields } from './policy.js';
import { createRegistry } from './registry.js';
import { pillarForClaim } from './claims.js';

/**
 * Run transparency doctor on HTML string (or precollected context).
 * @param {string} html
 * @param {{ policy: object, file?: string, lang?: string, meta?: object }} ctx
 */
export async function transparencyDoctor(html, ctx) {
  const { records, conflicts } = await collectAllDisclosures(html, ctx);
  const registry = createRegistry();
  for (const r of records) registry.register(r);

  const findings = [];
  for (const c of conflicts) {
    findings.push({
      severity: 'warning',
      code: 'conflict',
      message: `Conflicting fields [${c.keys.join(', ')}] from providers ${(c.providers || []).join(' > ')}`,
      id: c.id,
    });
  }
  findings.push(...validateRecords(records, ctx.policy));

  // Media coverage
  const media = scanMediaTargets(html);
  const coveredSrc = new Set(
    records.map((r) => (r.target?.src || '').split('?')[0].toLowerCase()).filter(Boolean),
  );
  const coveredSelectors = new Set(records.map((r) => r.target?.selector).filter(Boolean));

  for (const item of media) {
    const req = mediaRequirement(item.kind, ctx.policy);
    if (req !== 'required') continue;
    const srcKey = (item.src || '').split('?')[0].toLowerCase();
    const has =
      (item.id && coveredSelectors.has(`#${item.id}`))
      || (srcKey && coveredSrc.has(srcKey))
      || records.some((r) => r.target?.tag === item.tag && !r.target?.src && item.kind === inferMediaKind(r));
    // Better: check if element itself has velin-transparency in opening tag
    if (item.disclosed) continue;
    if (!has) {
      findings.push({
        severity: 'error',
        code: `missing-disclosure.${item.kind}`,
        message: `Required ${item.kind} lacks velin-transparency (${item.tag}${item.src ? ` ${item.src}` : ''})`,
        id: item.id || null,
        target: item,
      });
    }
  }

  const scores = computeScores(records, findings, media, ctx.policy);
  return {
    ok: !findings.some((f) => f.severity === 'error'),
    file: ctx.file || null,
    registry: registry.export(),
    findings,
    scores,
    summary: {
      disclosures: records.length,
      media: media.length,
      errors: findings.filter((f) => f.severity === 'error').length,
      warnings: findings.filter((f) => f.severity === 'warning').length,
      info: findings.filter((f) => f.severity === 'info').length,
    },
  };
}

function scanMediaTargets(html) {
  const out = [];
  const re = /<(img|video|audio|a|embed|object)(\s[^>]*)?>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toUpperCase();
    const attrs = m[2] || '';
    const src = attrs.match(/\b(?:src|href)=["']([^"']+)["']/i)?.[1] || '';
    const id = attrs.match(/\bid=["']([^"']+)["']/i)?.[1];
    const disclosed = /\bvelin-transparency\b/i.test(attrs) || /\bvelin-disclosure\b/i.test(attrs);
    let kind = 'text';
    if (tag === 'IMG') kind = 'images';
    else if (tag === 'VIDEO') kind = 'videos';
    else if (tag === 'AUDIO') kind = 'audio';
    else if (/\.pdf(\?|$)/i.test(src) || /application\/pdf/i.test(attrs)) kind = 'pdf';
    else if (tag === 'A' && !/\.pdf(\?|$)/i.test(src)) continue;
    else if (tag === 'EMBED' || tag === 'OBJECT') {
      if (/\.pdf/i.test(src) || /pdf/i.test(attrs)) kind = 'pdf';
      else continue;
    }
    out.push({ tag, src, id, kind, disclosed });
  }
  return out;
}

function computeScores(records, findings, media, policy) {
  const pillars = { ai: [], trust: [], compliance: [], metadata: [], provenance: [] };
  for (const r of records) {
    for (const c of r.claims || []) {
      const p = pillarForClaim(c);
      if (pillars[p]) pillars[p].push(true);
    }
    const kind = inferMediaKind(r);
    const req = requiredCount(kind, policy);
    const have = Object.keys(r.provenance || {}).length;
    pillars.provenance.push(req === 0 ? true : have >= req);
  }

  const requiredMedia = media.filter((m) => mediaRequirement(m.kind, policy) === 'required');
  const missingMedia = findings.filter((f) => String(f.code).startsWith('missing-disclosure.')).length;
  const coverage = requiredMedia.length
    ? Math.round(((requiredMedia.length - missingMedia) / requiredMedia.length) * 100)
    : 100;

  const pillarScore = (arr) => {
    if (!arr.length) return records.length ? 100 : coverage;
    return Math.round((arr.filter(Boolean).length / arr.length) * 100);
  };

  const errors = findings.filter((f) => f.severity === 'error').length;
  const transparency = Math.max(0, Math.min(100, Math.round(
    (coverage * 0.45)
    + (pillarScore(pillars.provenance) * 0.25)
    + (Math.max(0, 100 - errors * 8) * 0.3),
  )));

  return {
    transparency,
    ai: pillarScore(pillars.ai),
    trust: pillarScore(pillars.trust),
    metadata: pillarScore(pillars.metadata),
    compliance: pillarScore(pillars.compliance),
    provenance: pillarScore(pillars.provenance),
    coverage,
  };
}

function requiredCount(kind, policy) {
  return requiredProvenanceFields(kind, policy).length;
}
