(function () {
  document.querySelectorAll('.velin-nav__toggle, [data-velin-nav-toggle]').forEach((btn) => {
    if (btn.dataset.velinNavBound) return;
    btn.dataset.velinNavBound = '1';
    btn.addEventListener('click', () => {
      const list = btn.nextElementSibling;
      if (!list) return;
      list.toggleAttribute('data-velin-open');
      btn.setAttribute('aria-expanded', list.hasAttribute('data-velin-open') ? 'true' : 'false');
    });
  });

  document.querySelectorAll('[data-velin-theme-toggle]').forEach((btn) => {
    if (btn.dataset.velinThemeToggleBound) return;
    btn.dataset.velinThemeToggleBound = '1';
    btn.addEventListener('click', () => {
      const panel = document.getElementById('themePanel');
      if (!panel) return;
      const open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : 'block';
    });
  });
})();
