/**
 * Build report artifacts from a doctor result.
 * @param {Awaited<ReturnType<import('./doctor.js').transparencyDoctor>>} report
 * @param {{ title?: string }} [opts]
 */
export function buildTransparencyReports(report, opts = {}) {
  const title = opts.title || 'Velin Transparency Report';
  const json = {
    schema: 'velinstyle.transparency.report',
    version: 1,
    generatedAt: new Date().toISOString(),
    title,
    ...report,
  };
  const sarif = toSarif(report, title);
  const html = toHtml(report, title);
  return { json, sarif, html };
}

function toSarif(report, title) {
  const results = (report.findings || []).map((f) => ({
    ruleId: f.code,
    level: f.severity === 'error' ? 'error' : f.severity === 'warning' ? 'warning' : 'note',
    message: { text: f.message },
    locations: f.id || f.target
      ? [{
        physicalLocation: {
          artifactLocation: { uri: report.file || 'document.html' },
          region: { snippet: { text: f.id || f.target?.src || '' } },
        },
      }]
      : [],
  }));
  return {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: {
        driver: {
          name: 'velinstyle-transparency',
          informationUri: 'https://velinstyle.info',
          rules: [],
        },
      },
      results,
      properties: { title, scores: report.scores },
    }],
  };
}

function toHtml(report, title) {
  const scores = report.scores || {};
  const rows = (report.findings || []).map((f) => `
    <tr>
      <td>${esc(f.severity)}</td>
      <td><code>${esc(f.code)}</code></td>
      <td>${esc(f.message)}</td>
      <td>${esc(f.id || '')}</td>
    </tr>`).join('');
  const items = (report.registry?.items || []).map((r) => `
    <tr>
      <td><code>${esc(r.id)}</code></td>
      <td>${esc(r.type)}</td>
      <td>${esc(r.label)}</td>
      <td>${esc((r.claims || []).join(', '))}</td>
      <td>${esc(JSON.stringify(r.provenance || {}))}</td>
    </tr>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <style>
    body{font-family:system-ui,sans-serif;margin:2rem;background:#0c0b0a;color:#f5f2eb}
    table{border-collapse:collapse;width:100%;margin-block:1rem}
    th,td{border:1px solid #333;padding:.5rem;text-align:left;vertical-align:top}
    th{background:#1a1917}
    .scores{display:flex;flex-wrap:wrap;gap:.75rem}
    .score{padding:.75rem 1rem;background:#1a1917;border-radius:8px;min-width:7rem}
    .ok{color:#7ddea0}.bad{color:#f5a5a5}
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <p class="${report.ok ? 'ok' : 'bad'}">${report.ok ? 'PASS' : 'FAIL'} — ${report.summary?.errors || 0} errors, ${report.summary?.warnings || 0} warnings</p>
  <div class="scores">
    ${scoreCard('Transparency', scores.transparency)}
    ${scoreCard('AI', scores.ai)}
    ${scoreCard('Trust', scores.trust)}
    ${scoreCard('Metadata', scores.metadata)}
    ${scoreCard('Compliance', scores.compliance)}
    ${scoreCard('Provenance', scores.provenance)}
  </div>
  <h2>Findings</h2>
  <table><thead><tr><th>Severity</th><th>Code</th><th>Message</th><th>Id</th></tr></thead><tbody>${rows || '<tr><td colspan="4">None</td></tr>'}</tbody></table>
  <h2>Registry</h2>
  <table><thead><tr><th>Id</th><th>Type</th><th>Label</th><th>Claims</th><th>Provenance</th></tr></thead><tbody>${items || '<tr><td colspan="5">Empty</td></tr>'}</tbody></table>
</body>
</html>`;
}

function scoreCard(name, value) {
  const v = value == null ? '—' : `${value}%`;
  return `<div class="score"><strong>${esc(name)}</strong><div>${v}</div></div>`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
