/**
 * Export registry items to interoperable formats.
 * @param {import('./registry.js').DisclosureRecord[]} items
 * @param {'json'|'json-ld'|'csv'|'html'} format
 */
export function exportDisclosures(items, format = 'json') {
  switch (format) {
    case 'json-ld':
      return JSON.stringify(toJsonLd(items), null, 2);
    case 'csv':
      return toCsv(items);
    case 'html':
      return toHtmlTable(items);
    case 'json':
    default:
      return JSON.stringify({
        schema: 'velinstyle.transparency.export',
        mime: 'application/vnd.velinstyle.transparency+json',
        version: 1,
        exportedAt: new Date().toISOString(),
        items,
      }, null, 2);
  }
}

function toJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@graph': items.map((r) => ({
      '@type': 'CreativeWork',
      '@id': r.id,
      name: r.label,
      description: r.description,
      creativeWorkStatus: r.status,
      dateCreated: r.provenance?.createdAt,
      dateModified: r.updated || r.provenance?.reviewedAt,
      version: r.provenance?.version,
      license: r.provenance?.license,
      author: r.provenance?.createdBy
        ? { '@type': 'Person', name: r.provenance.createdBy }
        : undefined,
      contributor: r.provenance?.approvedBy
        ? { '@type': 'Person', name: r.provenance.approvedBy }
        : undefined,
      isBasedOn: r.provenance?.source,
      additionalProperty: (r.claims || []).map((c) => ({
        '@type': 'PropertyValue',
        name: 'velin.claim',
        value: c,
      })),
    })),
  };
}

function toCsv(items) {
  const headers = [
    'id', 'type', 'status', 'review', 'label', 'claims',
    'createdBy', 'createdAt', 'reviewedAt', 'approvedBy', 'source', 'license', 'version', 'publishedAt',
  ];
  const lines = [headers.join(',')];
  for (const r of items) {
    const p = r.provenance || {};
    const row = [
      r.id, r.type, r.status, r.review, r.label, (r.claims || []).join('|'),
      p.createdBy, p.createdAt, p.reviewedAt, p.approvedBy, p.source, p.license, p.version, p.publishedAt,
    ].map(csvEscape);
    lines.push(row.join(','));
  }
  return `${lines.join('\n')}\n`;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toHtmlTable(items) {
  const rows = items.map((r) => {
    const p = r.provenance || {};
    return `<tr>
      <td>${esc(r.id)}</td><td>${esc(r.label)}</td><td>${esc((r.claims || []).join(', '))}</td>
      <td>${esc(p.createdBy)}</td><td>${esc(p.createdAt)}</td><td>${esc(p.approvedBy)}</td>
      <td>${esc(p.license)}</td><td>${esc(p.version)}</td><td>${esc(p.source)}</td>
    </tr>`;
  }).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Transparency export</title></head>
<body><table border="1" cellpadding="6">
<thead><tr><th>Id</th><th>Label</th><th>Claims</th><th>Created by</th><th>Created</th><th>Approved by</th><th>License</th><th>Version</th><th>Source</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
