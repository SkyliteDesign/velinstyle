/**
 * Shared docs theme picker — loaded instead of inline script/styles.
 */
(function initVelinDocsThemePicker() {
  const THEMES = ['sharp', 'soft', 'brutalist', 'neon', 'earth', 'ocean', 'sunset', 'nordic', 'retro', 'corporate', 'pastel', 'midnight', 'forest'];
  const NAMES = ['Default'].concat(THEMES).concat(['dark']);
  const VALS = [''].concat(THEMES).concat(['dark']);

  THEMES.forEach((t) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `dist/themes/${t}.min.css`;
    document.head.appendChild(link);
  });

  const picker = document.getElementById('themePicker');
  const panel = document.getElementById('themePanel');
  const grid = document.getElementById('themeGrid');
  const trigger = picker?.querySelector('.velin-docs-theme-trigger');
  if (!picker || !panel || !grid || !trigger) return;

  trigger.addEventListener('click', () => {
    const open = panel.hasAttribute('data-open');
    if (open) panel.removeAttribute('data-open');
    else panel.setAttribute('data-open', '');
    trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  NAMES.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'velin-docs-theme-chip';
    btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    btn.addEventListener('click', () => {
      if (VALS[i]) document.documentElement.setAttribute('data-velin-theme', VALS[i]);
      else document.documentElement.removeAttribute('data-velin-theme');
      grid.querySelectorAll('.velin-docs-theme-chip').forEach((x) => x.removeAttribute('data-active'));
      btn.setAttribute('data-active', '');
    });
    grid.appendChild(btn);
  });
})();
