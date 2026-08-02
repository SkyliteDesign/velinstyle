/** Default and merge helpers for transparency policy. */

/**
 * Soft framework defaults so existing sites are not hard-failed by `velinstyle check`.
 * Projects opt into strict media/provenance rules via velin.transparency.policy.json.
 */
export const DEFAULT_POLICY = {
  media: {
    images: 'optional',
    videos: 'optional',
    audio: 'optional',
    text: 'optional',
    pdf: 'optional',
  },
  rules: {
    requireReview: false,
    allowGenerated: true,
    minimumStatus: null,
    staleDays: 365,
  },
  provenance: {
    required: [],
    recommended: ['approvedBy', 'source', 'version', 'createdAt', 'license'],
    images: { required: [] },
    videos: { required: [] },
    audio: { required: [] },
    pdf: { required: [] },
  },
  providers: {
    priority: ['api', 'json', 'meta', 'html'],
  },
};

/** Strict example policy for teams that require disclosure on media. */
export const STRICT_MEDIA_POLICY = {
  media: {
    images: 'required',
    videos: 'required',
    audio: 'required',
    text: 'optional',
    pdf: 'required',
  },
  provenance: {
    required: [],
    recommended: ['approvedBy', 'source', 'version'],
    images: { required: ['createdAt', 'license', 'source'] },
    videos: { required: ['createdAt'] },
    audio: { required: ['createdAt'] },
    pdf: { required: ['license'] },
  },
};

/**
 * @param {unknown} raw
 */
export function normalizePolicy(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const nested = input.policy && typeof input.policy === 'object' ? input.policy : input;
  return {
    media: { ...DEFAULT_POLICY.media, ...(nested.media || {}) },
    rules: { ...DEFAULT_POLICY.rules, ...(nested.rules || {}) },
    provenance: {
      ...DEFAULT_POLICY.provenance,
      ...(nested.provenance || {}),
      images: { ...DEFAULT_POLICY.provenance.images, ...(nested.provenance?.images || {}) },
      videos: { ...DEFAULT_POLICY.provenance.videos, ...(nested.provenance?.videos || {}) },
      audio: { ...DEFAULT_POLICY.provenance.audio, ...(nested.provenance?.audio || {}) },
      pdf: { ...DEFAULT_POLICY.provenance.pdf, ...(nested.provenance?.pdf || {}) },
    },
    providers: {
      ...DEFAULT_POLICY.providers,
      ...(nested.providers || {}),
      priority: nested.providers?.priority || DEFAULT_POLICY.providers.priority,
    },
  };
}

/**
 * @param {string} mediaKind images|videos|audio|text|pdf
 * @param {ReturnType<typeof normalizePolicy>} policy
 */
export function mediaRequirement(mediaKind, policy) {
  return policy.media[mediaKind] || 'optional';
}

/**
 * @param {string} mediaKind
 * @param {ReturnType<typeof normalizePolicy>} policy
 */
export function requiredProvenanceFields(mediaKind, policy) {
  const base = policy.provenance.required || [];
  const specific = policy.provenance[mediaKind]?.required || [];
  return [...new Set([...base, ...specific])];
}

/**
 * Provider priority index (lower = higher priority).
 * @param {string} providerId
 * @param {ReturnType<typeof normalizePolicy>} policy
 */
export function providerRank(providerId, policy) {
  const list = policy.providers.priority || DEFAULT_POLICY.providers.priority;
  const idx = list.indexOf(providerId);
  return idx === -1 ? 999 : idx;
}
