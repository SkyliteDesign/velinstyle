import { transparencyDoctor } from './doctor.js';
import { stableDisclosureId } from './registry.js';

/**
 * Analyze HTML and suggest disclosures + optional apply.
 * @param {string} html
 * @param {{ policy: object, file?: string, apply?: boolean, dryRun?: boolean }} opts
 */
export async function transparencyMigrate(html, opts) {
  const doctor = await transparencyDoctor(html, opts);
  const suggestions = [];

  for (const f of doctor.findings) {
    if (!String(f.code).startsWith('missing-disclosure.')) continue;
    const target = f.target || {};
    const kind = f.code.replace('missing-disclosure.', '');
    const type = kind === 'images' || kind === 'videos' || kind === 'audio' ? 'ai' : kind === 'pdf' ? 'license' : 'ai';
    const id = stableDisclosureId({
      id: target.id,
      src: target.src,
      tag: target.tag,
      type,
      file: opts.file,
    });
    const attrs = {
      'velin-transparency': '',
      'velin-transparency-id': id,
      'velin-type': type,
      'velin-status': type === 'ai' ? 'generated' : 'verified',
      'velin-review': 'human-reviewed',
    };
    if (kind === 'images' || kind === 'pdf') {
      attrs['velin-created-at'] = new Date().toISOString().slice(0, 10);
      attrs['velin-license'] = 'CC BY 4.0';
    }
    if (kind === 'images') attrs['velin-source'] = target.src || '';
    suggestions.push({
      id,
      kind,
      target,
      attrs,
      reason: f.message,
    });
  }

  // Provenance gaps on existing disclosures
  for (const f of doctor.findings) {
    if (!String(f.code).startsWith('missing-provenance.')) continue;
    const field = f.code.replace('missing-provenance.', '');
    suggestions.push({
      id: f.id,
      kind: 'provenance',
      field,
      attrs: { [`velin-${kebab(field)}`]: field === 'license' ? 'CC BY 4.0' : field.includes('At') ? new Date().toISOString().slice(0, 10) : 'unknown' },
      reason: f.message,
    });
  }

  let nextHtml = html;
  let applied = 0;
  if (opts.apply && opts.dryRun !== true) {
    const result = applySuggestions(html, suggestions.filter((s) => s.kind !== 'provenance' || s.target));
    nextHtml = result.html;
    applied = result.applied;
    // provenance-only patches on existing tags
    for (const s of suggestions.filter((x) => x.kind === 'provenance' && x.id)) {
      const patched = patchAttrsById(nextHtml, s.id, s.attrs);
      if (patched.changed) {
        nextHtml = patched.html;
        applied += 1;
      }
    }
  }

  return {
    doctor,
    suggestions,
    applied,
    html: nextHtml,
    dryRun: opts.dryRun !== false && !opts.apply,
  };
}

function kebab(s) {
  return String(s).replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function applySuggestions(html, suggestions) {
  let out = html;
  let applied = 0;
  for (const s of suggestions) {
    if (!s.target?.tag) continue;
    const tag = s.target.tag.toLowerCase();
    const src = s.target.src;
    const id = s.target.id;
    let re;
    if (id) {
      re = new RegExp(`<${tag}\\b([^>]*\\bid=["']${escapeRe(id)}["'][^>]*)>`, 'i');
    } else if (src) {
      re = new RegExp(`<${tag}\\b([^>]*\\b(?:src|href)=["']${escapeRe(src)}["'][^>]*)>`, 'i');
    } else continue;
    const m = out.match(re);
    if (!m) continue;
    if (/\bvelin-transparency\b/i.test(m[0])) continue;
    const attrStr = Object.entries(s.attrs)
      .map(([k, v]) => (v === '' ? k : `${k}="${String(v).replace(/"/g, '&quot;')}"`))
      .join(' ');
    const next = m[0].replace(/>$/, ` ${attrStr}>`);
    out = out.replace(m[0], next);
    applied += 1;
  }
  return { html: out, applied };
}

function patchAttrsById(html, id, attrs) {
  const re = new RegExp(`<([a-z0-9-]+)\\b([^>]*\\b(?:velin-transparency-id|id)=["']${escapeRe(id)}["'][^>]*)>`, 'i');
  const m = html.match(re);
  if (!m) return { html, changed: false };
  let open = m[0];
  for (const [k, v] of Object.entries(attrs)) {
    if (new RegExp(`\\b${k}=`, 'i').test(open)) continue;
    open = open.replace(/>$/, ` ${k}="${String(v).replace(/"/g, '&quot;')}">`);
  }
  if (open === m[0]) return { html, changed: false };
  return { html: html.replace(m[0], open), changed: true };
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
