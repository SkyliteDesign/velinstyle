/**
 * Framework integration shells for Atelier pulls.
 * Blade/Vue/React are wrappers around vanilla showcase assets — not native rewrites.
 */

export const LIMITATION_EN = `## Limitation

\`--format blade|vue|react\` writes an **integration shell** that mounts the original Atelier vanilla showcase (HTML/JS/CSS + Web Components). It does **not** rewrite the template into idiomatic Blade/Vue/React.

Native framework blocks are **planned** for a later release / Velin Studio (not shipped).

Atelier Library ≠ Velin Studio Builder.
`;

export const LIMITATION_DE = `## Einschränkung

\`--format blade|vue|react\` erzeugt eine **Integrations-Shell** um das originale Vanilla-Showcase (HTML/JS/CSS + Web Components). Kein idiomatischer Rewrite.

Native Framework-Bausteine sind **geplant** (spätere Version / Velin Studio — nicht shipped).

Atelier Library ≠ Velin Studio Builder.
`;

const FORMATS = new Set(['html', 'blade', 'vue', 'react']);

export function normalizeFormat(raw) {
  const f = String(raw || 'html').toLowerCase().trim();
  if (!FORMATS.has(f)) {
    return { ok: false, error: `Unknown format "${raw}". Use: html | blade | vue | react (blade/vue/react = integration wrappers, not native rewrites).` };
  }
  return { ok: true, format: f };
}

/**
 * @param {{ id: string, title?: string, assetDir: string, format: string }} opts
 */
export function emitFormatShell(opts) {
  const { id, title = id, assetDir = '.', format } = opts;
  const n = normalizeFormat(format);
  if (!n.ok) return n;

  const rel = !assetDir || assetDir === '.' ? '.' : assetDir.replace(/\\/g, '/').replace(/\/$/, '');
  const appJs = rel === '.' ? './app.js' : `${rel}/app.js`;
  const appCss = rel === '.' ? './app.css' : `${rel}/app.css`;

  if (n.format === 'html') {
    return {
      ok: true,
      format: 'html',
      files: {},
      note: 'html',
    };
  }

  if (n.format === 'blade') {
    const assetPath = rel === '.' ? `velin-atelier/${id}` : rel;
    const blade = `{{-- VelinStyle Atelier wrapper for ${id} — vanilla showcase mount, not a native Blade rewrite --}}
{{-- Limitation: integration shell only. Native framework blocks / Studio = planned. --}}
@vite(['resources/css/app.css', 'resources/js/app.js'])
<link rel="stylesheet" href="{{ asset('${assetPath}/app.css') }}">
<div id="root" data-atelier-id="${id}" data-velin-atelier-mount></div>
<script type="module" src="{{ asset('${assetPath}/app.js') }}"></script>
`;
    return {
      ok: true,
      format: 'blade',
      files: {
        [`${id}.blade.php`]: blade,
      },
    };
  }

  if (n.format === 'vue') {
    const vue = `<!-- VelinStyle Atelier wrapper for ${id} — mounts vanilla showcase; not idiomatic Vue SFC rewrite -->
<script setup>
import { onMounted, ref } from 'vue';
import '${appCss}';

const root = ref(null);
const title = ${JSON.stringify(title)};

onMounted(async () => {
  // Load original Atelier app.js (vanilla). Native Vue rewrite is planned later.
  await import('${appJs}');
});
</script>

<template>
  <div>
    <p class="velin-text-muted">Atelier {{ title }} (integration wrapper)</p>
    <div id="root" ref="root" data-atelier-id="${id}" data-velin-atelier-mount></div>
  </div>
</template>
`;
    return {
      ok: true,
      format: 'vue',
      files: {
        [`${id}.vue`]: vue,
      },
    };
  }

  // react
  const jsx = `/** VelinStyle Atelier wrapper for ${id} — mounts vanilla showcase; not a native JSX rewrite */
import { useEffect, useRef } from 'react';
import '${appCss}';

/**
 * Limitation: integration shell only. Native React blocks are planned / Studio later.
 */
export default function Atelier${id.replace(/[^a-zA-Z0-9]/g, '_')}() {
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await import('${appJs}');
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <p>{${JSON.stringify(title)}} (Atelier integration wrapper)</p>
      <div id="root" ref={rootRef} data-atelier-id="${id}" data-velin-atelier-mount />
    </div>
  );
}
`;
  return {
    ok: true,
    format: 'react',
    files: {
      [`${id}.jsx`]: jsx,
    },
  };
}

/**
 * @param {{ id: string, title?: string, format: string, sourceHint?: string }} opts
 */
export function buildPullReadme(opts) {
  const { id, title = id, format, sourceHint = '' } = opts;
  return `# Atelier pull: ${id}

**Title:** ${title}
**Format:** ${format}
${sourceHint ? `**Source:** ${sourceHint}\n` : ''}
Install CSS/WC: \`npm i @birdapi/velinstyle\` and point vendor/link stylesheets to \`node_modules/@birdapi/velinstyle/dist\`.

${LIMITATION_EN}

---

${LIMITATION_DE}
`;
}
