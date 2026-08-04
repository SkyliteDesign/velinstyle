/**
 * Production report — text + JSON.
 */
export function buildReport(data) {
  const {
    originalBytes = 0,
    productionBytes = 0,
    breakdown = {},
    themes = [],
    icons = [],
    components = [],
    tags = [],
    imagesSkipped = true,
    filesScanned = 0,
  } = data;

  const saved = Math.max(0, originalBytes - productionBytes);
  const pct = originalBytes > 0 ? Math.round((saved / originalBytes) * 100) : 0;

  const lines = [
    'Velin Production Report',
    `Original     ${formatKb(originalBytes)}`,
    '↓',
    `Production    ${formatKb(productionBytes)}`,
    '↓',
    `${pct} % gespart`,
    '',
  ];

  for (const [key, delta] of Object.entries(breakdown)) {
    if (delta == null) continue;
    const label = key.padEnd(8);
    const sign = delta > 0 ? '-' : delta < 0 ? '+' : ' ';
    lines.push(`${label} ${sign}${formatKb(Math.abs(delta))}`);
  }

  if (imagesSkipped) {
    lines.push('');
    lines.push('Images: skipped (coming soon)');
  }

  lines.push('');
  lines.push(`Scanned files: ${filesScanned}`);
  if (themes.length) lines.push(`Themes: ${themes.join(', ')}`);
  if (icons.length) lines.push(`Icons (${icons.length}): ${icons.slice(0, 12).join(', ')}${icons.length > 12 ? '…' : ''}`);
  if (tags.length) lines.push(`Web Components: ${tags.join(', ')}`);
  if (components.length) lines.push(`CSS modules: ${components.length}`);

  return {
    version: 1,
    originalBytes,
    productionBytes,
    savedBytes: saved,
    savedPercent: pct,
    breakdown,
    themes,
    icons,
    tags,
    components,
    filesScanned,
    images: imagesSkipped ? { status: 'skipped', note: 'coming soon' } : null,
    text: lines.join('\n'),
  };
}

export function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(bytes >= 10240 ? 0 : 1)} KB`;
}

export function measureBytes(parts) {
  let total = 0;
  for (const p of parts) {
    if (typeof p === 'number') total += p;
    else if (typeof p === 'string') total += Buffer.byteLength(p, 'utf-8');
    else if (p && typeof p.bytes === 'number') total += p.bytes;
  }
  return total;
}
