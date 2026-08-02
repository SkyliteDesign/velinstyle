/** Standardized claim taxonomy for Velin Transparency Framework. */

export const CLAIM_CATALOG = {
  'ai.generated': { pillar: 'ai', label: { en: 'AI generated', de: 'KI-generiert' } },
  'ai.assisted': { pillar: 'ai', label: { en: 'AI assisted', de: 'KI-unterstützt' } },
  'review.human': { pillar: 'ai', label: { en: 'Human reviewed', de: 'Mensch geprüft' } },
  'review.verified': { pillar: 'trust', label: { en: 'Verified', de: 'Verifiziert' } },
  'security.checked': { pillar: 'trust', label: { en: 'Security checked', de: 'Security geprüft' } },
  'accessibility.checked': { pillar: 'trust', label: { en: 'Accessibility checked', de: 'Barrierefreiheit geprüft' } },
  'trust.official': { pillar: 'trust', label: { en: 'Official', de: 'Offiziell' } },
  'trust.signed': { pillar: 'trust', label: { en: 'Signed', de: 'Signiert' } },
  'trust.opensource': { pillar: 'trust', label: { en: 'Open source', de: 'Open Source' } },
  'privacy.gdpr': { pillar: 'compliance', label: { en: 'GDPR', de: 'DSGVO' } },
  'license.cc-by': { pillar: 'compliance', label: { en: 'CC BY', de: 'CC BY' } },
  'license.mit': { pillar: 'compliance', label: { en: 'MIT', de: 'MIT' } },
  'license.apache-2': { pillar: 'compliance', label: { en: 'Apache-2.0', de: 'Apache-2.0' } },
  'content.updated': { pillar: 'metadata', label: { en: 'Updated', de: 'Aktualisiert' } },
  'content.author': { pillar: 'metadata', label: { en: 'Author', de: 'Autor' } },
  'content.source': { pillar: 'metadata', label: { en: 'Source', de: 'Quelle' } },
  'content.language': { pillar: 'metadata', label: { en: 'Language', de: 'Sprache' } },
  'version.current': { pillar: 'metadata', label: { en: 'Version', de: 'Version' } },
  'provenance.complete': { pillar: 'provenance', label: { en: 'Provenance complete', de: 'Nachweis vollständig' } },
};

const STATUS_TO_CLAIM = {
  generated: 'ai.generated',
  assisted: 'ai.assisted',
  'ai-assisted': 'ai.assisted',
  'human-reviewed': 'review.human',
  'human-edited': 'review.human',
  verified: 'review.verified',
  edited: 'review.human',
  draft: null,
};

const REVIEW_TO_CLAIM = {
  human: 'review.human',
  'human-reviewed': 'review.human',
  verified: 'review.verified',
  none: null,
};

const LICENSE_TO_CLAIM = {
  'cc by 4.0': 'license.cc-by',
  'cc-by': 'license.cc-by',
  'cc-by-4.0': 'license.cc-by',
  mit: 'license.mit',
  'apache-2.0': 'license.apache-2',
  apache: 'license.apache-2',
};

/**
 * @param {string} [status]
 * @param {string} [review]
 * @param {string} [license]
 * @param {string[]} [extra]
 */
export function deriveClaims({ status, review, license, claims = [] } = {}) {
  const out = new Set(Array.isArray(claims) ? claims.filter(Boolean) : []);
  const statusClaim = STATUS_TO_CLAIM[String(status || '').toLowerCase()];
  if (statusClaim) out.add(statusClaim);
  const reviewClaim = REVIEW_TO_CLAIM[String(review || '').toLowerCase()];
  if (reviewClaim) out.add(reviewClaim);
  if (license) {
    const key = String(license).toLowerCase().trim();
    const mapped = LICENSE_TO_CLAIM[key] || (key.startsWith('cc') ? 'license.cc-by' : null);
    if (mapped) out.add(mapped);
  }
  return [...out];
}

/**
 * @param {string} claim
 * @param {'en'|'de'} [lang]
 */
export function claimLabel(claim, lang = 'en') {
  const entry = CLAIM_CATALOG[claim];
  if (!entry) return claim;
  return entry.label[lang] || entry.label.en || claim;
}

/**
 * @param {string[]} claims
 * @param {'en'|'de'} [lang]
 */
export function primaryLabel(claims = [], lang = 'en') {
  const order = ['ai.generated', 'ai.assisted', 'review.human', 'review.verified', 'trust.official', 'license.cc-by', 'license.mit'];
  for (const c of order) {
    if (claims.includes(c)) return claimLabel(c, lang);
  }
  if (claims[0]) return claimLabel(claims[0], lang);
  return lang === 'de' ? 'Transparenz' : 'Transparency';
}

export function pillarForClaim(claim) {
  return CLAIM_CATALOG[claim]?.pillar || (String(claim).startsWith('custom.') ? 'custom' : 'metadata');
}
