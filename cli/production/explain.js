/**
 * --explain: human-readable removals with reasons.
 */
export function buildExplain({
  skippedCss = [],
  skippedThemes = [],
  skippedIcons = [],
  skippedMotion = false,
  graphExplain = [],
} = {}) {
  const removed = [];

  for (const item of skippedCss) {
    removed.push({
      id: item.file || item,
      reason: item.reason || 'Nicht benutzt',
    });
  }
  for (const theme of skippedThemes) {
    removed.push({ id: `${theme}.theme.css`, reason: 'Nicht benutzt' });
  }
  for (const icon of skippedIcons.slice(0, 40)) {
    removed.push({ id: `icon:${icon}`, reason: 'Nicht benutzt' });
  }
  if (skippedIcons.length > 40) {
    removed.push({ id: `icon:…(+${skippedIcons.length - 40})`, reason: 'Nicht benutzt' });
  }
  if (skippedMotion) {
    removed.push({ id: 'motion utilities', reason: 'Keine Animate-/Motion-Klassen gefunden' });
  }

  const kept = [];
  const seen = new Set();
  for (const e of graphExplain) {
    if (!e.keep || seen.has(e.keep)) continue;
    seen.add(e.keep);
    kept.push({ id: e.keep, reason: e.reason });
  }

  const lines = ['Entfernt'];
  if (!removed.length) lines.push('(nichts entfernt — oder Scan fand fast alles)');
  for (const r of removed) {
    lines.push(`${r.id.padEnd(28)} ${r.reason}`);
  }
  lines.push('');
  lines.push('Behalten (Auszug)');
  for (const k of kept.slice(0, 30)) {
    lines.push(`${k.id.padEnd(28)} ${k.reason}`);
  }

  return { removed, kept, text: lines.join('\n') };
}
