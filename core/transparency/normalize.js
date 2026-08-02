import { deriveClaims, primaryLabel } from './claims.js';
import { stableDisclosureId } from './registry.js';

const PROVENANCE_KEYS = [
  'createdBy', 'createdAt', 'reviewedAt', 'approvedBy', 'source', 'license', 'version', 'publishedAt',
];

/**
 * Normalize a draft disclosure into a registry record.
 * @param {Record<string, unknown>} draft
 * @param {{ provider?: string, file?: string, lang?: 'en'|'de' }} [ctx]
 */
export function normalizeDisclosure(draft = {}, ctx = {}) {
  const provider = String(draft.provider || ctx.provider || 'api');
  const type = String(draft.type || 'ai').toLowerCase();
  const status = draft.status != null ? String(draft.status).toLowerCase() : undefined;
  const review = draft.review != null ? String(draft.review).toLowerCase() : undefined;
  const provenance = normalizeProvenance(draft.provenance || draft);
  if (draft.license && !provenance.license) provenance.license = String(draft.license);
  if (draft.model && !provenance.source) provenance.source = `model:${draft.model}`;
  if (draft.generated === true && !status) {
    // generated flag without status
  }
  const resolvedStatus = status || (draft.generated === true ? 'generated' : undefined);
  const claims = deriveClaims({
    status: resolvedStatus,
    review,
    license: provenance.license,
    claims: draft.claims,
  });
  const target = {
    selector: draft.target?.selector || draft.selector || undefined,
    tag: draft.target?.tag || draft.tag || undefined,
    src: draft.target?.src || draft.src || undefined,
    file: draft.target?.file || ctx.file || draft.file || undefined,
  };
  const id = stableDisclosureId({
    id: draft.id || draft.velinTransparencyId,
    selector: target.selector,
    src: target.src,
    tag: target.tag,
    type,
    file: target.file,
  });
  const lang = ctx.lang === 'de' ? 'de' : 'en';
  const label = draft.label ? String(draft.label) : primaryLabel(claims, lang);
  const updated = draft.updated || provenance.publishedAt || provenance.reviewedAt || provenance.createdAt || undefined;

  return {
    id,
    type,
    status: resolvedStatus,
    review,
    provider,
    claims,
    provenance,
    updated,
    label,
    description: draft.description ? String(draft.description) : undefined,
    renderer: draft.renderer || draft.overlay || 'badge',
    tone: draft.tone || toneFromClaims(claims),
    position: draft.position || 'top-right',
    target,
    meta: draft.meta && typeof draft.meta === 'object' ? draft.meta : undefined,
  };
}

function normalizeProvenance(src = {}) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const key of PROVENANCE_KEYS) {
    const v = src[key] ?? src[key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)];
    if (v != null && String(v).trim()) out[key] = String(v).trim();
  }
  // attribute-style aliases
  if (src['created-by']) out.createdBy = String(src['created-by']);
  if (src['created-at']) out.createdAt = String(src['created-at']);
  if (src['reviewed-at']) out.reviewedAt = String(src['reviewed-at']);
  if (src['approved-by']) out.approvedBy = String(src['approved-by']);
  if (src['published-at']) out.publishedAt = String(src['published-at']);
  return out;
}

function toneFromClaims(claims) {
  if (claims.includes('ai.generated')) return 'generated';
  if (claims.includes('review.verified') || claims.includes('trust.official')) return 'verified';
  if (claims.includes('review.human')) return 'human';
  if (claims.includes('ai.assisted')) return 'mixed';
  return 'neutral';
}

/**
 * Merge two records; higher priority (lower rank number) wins field-by-field.
 * @param {import('./registry.js').DisclosureRecord} a
 * @param {import('./registry.js').DisclosureRecord} b
 * @param {(id: string) => number} rankFn
 */
export function mergeDisclosures(a, b, rankFn) {
  const aRank = rankFn(a.provider);
  const bRank = rankFn(b.provider);
  const primary = aRank <= bRank ? a : b;
  const secondary = aRank <= bRank ? b : a;
  const conflictKeys = [];
  for (const key of ['type', 'status', 'review']) {
    if (secondary[key] && primary[key] && secondary[key] !== primary[key]) conflictKeys.push(key);
  }
  const claims = [...new Set([...(primary.claims || []), ...(secondary.claims || [])])];
  const provenance = { ...secondary.provenance, ...primary.provenance };
  return {
    record: {
      ...secondary,
      ...primary,
      claims,
      provenance,
      provider: primary.provider,
      meta: {
        ...(secondary.meta || {}),
        ...(primary.meta || {}),
        mergedFrom: [secondary.provider, primary.provider],
        conflicts: conflictKeys,
      },
    },
    conflicts: conflictKeys,
  };
}
