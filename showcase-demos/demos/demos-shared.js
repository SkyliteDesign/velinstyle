/**
 * Cross-demo navigation + in-page TOC for expanded showcases.
 */
(function () {
  'use strict';

  const DEMOS = [
    { href: 'index.html', label: 'Overview' },
    { href: 'showcase-runtime.html', label: 'Runtime 0.9' },
    { href: 'showcase-ui-kit.html', label: 'UI kit' },
    { href: 'showcase-interactive.html', label: 'Interactive' },
    { href: 'showcase-saas.html', label: 'SaaS' },
    { href: 'showcase-dashboard.html', label: 'Dashboard' },
    { href: 'showcase-forum.html', label: 'Forum' },
    { href: 'showcase-ecommerce.html', label: 'E-Commerce' },
    { href: 'showcase-crypto.html', label: 'Crypto' },
  ];

  function currentDemoHref() {
    const fromBody = document.body.getAttribute('data-demo-page');
    if (fromBody) return fromBody;
    const path = location.pathname.replace(/\\/g, '/');
    const file = path.split('/').pop() || 'index.html';
    return file || 'index.html';
  }

  function renderCrossNav(container) {
    const current = currentDemoHref();
    const label = document.createElement('span');
    label.className = 'demo-crossnav__label';
    label.textContent = 'Demos';
    container.appendChild(label);
    DEMOS.forEach((d) => {
      const a = document.createElement('a');
      a.href = d.href;
      a.textContent = d.label;
      if (d.href === current) a.setAttribute('aria-current', 'page');
      container.appendChild(a);
    });
  }

  function buildToc(nav, sections) {
    const title = document.createElement('p');
    title.className = 'demo-toc__title';
    title.textContent = 'On this page';
    nav.appendChild(title);
    sections.forEach((sec) => {
      const h = sec.querySelector('h2[id], h2');
      const id = h?.id || sec.id;
      if (!id || !h) return;
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = h.textContent.replace(/\s*New in.*$/i, '').trim();
      nav.appendChild(a);
    });
  }

  function initTocSpy(nav) {
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    if (!links.length) return;
    const map = links.map((a) => ({
      a,
      el: document.getElementById(a.getAttribute('href').slice(1)),
    })).filter((x) => x.el);

    const onScroll = () => {
      let active = map[0];
      const y = window.scrollY + 120;
      map.forEach((entry) => {
        if (entry.el.offsetTop <= y) active = entry;
      });
      map.forEach(({ a }) => a.removeAttribute('aria-current'));
      if (active) active.a.setAttribute('aria-current', 'true');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    document.querySelectorAll('[data-demo-crossnav]').forEach(renderCrossNav);
    document.querySelectorAll('[data-demo-toc]').forEach((nav) => {
      const root = nav.closest('.demo-layout') || document;
      const sections = root.querySelectorAll('.demo-section[id]');
      if (!sections.length) return;
      buildToc(nav, sections);
      initTocSpy(nav);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
