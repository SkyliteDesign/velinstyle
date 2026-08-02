import { CLAIM_CATALOG } from './claims.js';
import { requiredProvenanceFields } from './policy.js';

const VALID_STATUS = new Set([
  'generated', 'assisted', 'ai-assisted', 'human-reviewed', 'human-edited', 'verified', 'edited', 'draft',
]);
const VALID_REVIEW = new Set(['human', 'human-reviewed', 'verified', 'none']);
const VALID_TYPES = new Set([
  'ai', 'trust', 'compliance', 'metadata', 'review', 'verification', 'license',
  'accessibility', 'security', 'custom', 'image', 'video', 'audio', 'text', 'pdf', 'document',
]);

/**
 * @param {import('./registry.js').DisclosureRecord} record
 * @param {object} policy
 */
export function validateRecord(record, policy) {
  const findings = [];
  if (!record?.id) {
    findings.push(finding('error', 'invalid.id', 'Disclosure missing id'));
  }
  if (record.type && !VALID_TYPES.has(String(record.type).toLowerCase())) {
    findings.push(finding('warning', 'invalid.type', `Unknown type "${record.type}"`, record.id));
  }
  if (record.status && !VALID_STATUS.has(String(record.status).toLowerCase())) {
    findings.push(finding('error', 'invalid.status', `Invalid status "${record.status}"`, record.id));
  }
  if (record.review && !VALID_REVIEW.has(String(record.review).toLowerCase())) {
    findings.push(finding('error', 'invalid.review', `Invalid review "${record.review}"`, record.id));
  }
  if (!record.label) {
    findings.push(finding('warning', 'missing.label', 'Missing label', record.id));
  }
  if (policy.rules?.requireReview && !record.review && !record.claims?.includes('review.human')) {
    findings.push(finding('error', 'policy.requireReview', 'Policy requires review', record.id));
  }
  if (policy.rules?.allowGenerated === false && record.claims?.includes('ai.generated')) {
    findings.push(finding('error', 'policy.allowGenerated', 'Generated content not allowed by policy', record.id));
  }
  if (policy.rules?.minimumStatus === 'human-reviewed') {
    const ok = record.claims?.includes('review.human') || record.claims?.includes('review.verified')
      || record.review === 'human' || record.review === 'human-reviewed' || record.review === 'verified';
    if (!ok && (record.claims?.includes('ai.generated') || record.claims?.includes('ai.assisted'))) {
      findings.push(finding('error', 'policy.minimumStatus', 'minimumStatus human-reviewed not met', record.id));
    }
  }
  for (const claim of record.claims || []) {
    if (!CLAIM_CATALOG[claim] && !String(claim).startsWith('custom.')) {
      findings.push(finding('warning', 'unknown.claim', `Unknown claim "${claim}"`, record.id));
    }
  }
  const mediaKind = inferMediaKind(record);
  const required = requiredProvenanceFields(mediaKind, policy);
  for (const field of required) {
    if (!record.provenance?.[field]) {
      findings.push(finding('error', `missing-provenance.${field}`, `Missing provenance.${field}`, record.id));
    }
  }
  for (const field of policy.provenance?.recommended || []) {
    if (!record.provenance?.[field]) {
      findings.push(finding('info', `recommended-provenance.${field}`, `Recommended provenance.${field}`, record.id));
    }
  }
  if (record.updated || record.provenance?.reviewedAt) {
    const staleDays = policy.rules?.staleDays ?? 365;
    const dateStr = record.provenance?.reviewedAt || record.updated;
    const age = ageDays(dateStr);
    if (age != null && age > staleDays) {
      findings.push(finding('warning', 'stale-reviewedAt', `Review/update is ${age} days old (limit ${staleDays})`, record.id));
    }
  }
  return findings;
}

/**
 * @param {import('./registry.js').DisclosureRecord[]} records
 * @param {object} policy
 */
export function validateRecords(records, policy) {
  const findings = [];
  const seen = new Map();
  for (const r of records) {
    if (seen.has(r.id)) {
      findings.push(finding('error', 'duplicate.id', `Duplicate disclosure id "${r.id}"`, r.id));
    }
    seen.set(r.id, true);
    findings.push(...validateRecord(r, policy));
  }
  return findings;
}

export function inferMediaKind(record) {
  const tag = String(record.target?.tag || '').toUpperCase();
  const type = String(record.type || '').toLowerCase();
  const src = String(record.target?.src || '');
  if (tag === 'IMG' || type === 'image' || /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(src)) return 'images';
  if (tag === 'VIDEO' || type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(src)) return 'videos';
  if (tag === 'AUDIO' || type === 'audio' || /\.(mp3|wav|ogg)(\?|$)/i.test(src)) return 'audio';
  if (type === 'pdf' || /\.pdf(\?|$)/i.test(src)) return 'pdf';
  return 'text';
}

function ageDays(dateStr) {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

function finding(severity, code, message, id) {
  return { severity, code, message, id: id || null };
}
