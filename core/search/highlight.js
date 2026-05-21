/**
 * Escape HTML and wrap query matches in <mark class="velin-search-hit">.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
export function highlightHtml(text, query) {
  const raw = String(text || '');
  const q = String(query || '').trim();
  if (!q || q.length < 2) return escapeHtml(raw);
  const lower = raw.toLowerCase();
  const ql = q.toLowerCase();
  let start = lower.indexOf(ql);
  let len = q.length;
  if (start === -1) {
    start = fuzzySubsequenceIndex(lower, ql);
    if (start === -1) return escapeHtml(raw);
    len = Math.min(q.length, raw.length - start);
  }
  return (
    escapeHtml(raw.slice(0, start)) +
    '<mark class="velin-search-hit">' +
    escapeHtml(raw.slice(start, start + len)) +
    '</mark>' +
    escapeHtml(raw.slice(start + len))
  );
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @returns {number} start index of subsequence or -1 */
function fuzzySubsequenceIndex(haystack, needle) {
  let j = 0;
  let start = -1;
  for (let i = 0; i < haystack.length && j < needle.length; i++) {
    if (haystack[i] === needle[j]) {
      if (j === 0) start = i;
      j++;
    }
  }
  return j === needle.length ? start : -1;
}
