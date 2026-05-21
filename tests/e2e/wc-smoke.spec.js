import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/wc-smoke.html');
  await page.waitForFunction(() => customElements.get('velin-copy'));
});

test('declarative velin-scroll-top upgrades', async ({ page }) => {
  await page.waitForSelector('velin-scroll-top');
  const aria = await page.locator('velin-scroll-top').evaluate((el) => {
    return el.shadowRoot?.querySelector('button')?.getAttribute('aria-label');
  });
  expect(aria).toBe('Scroll to top');
  const threshold = await page.locator('velin-scroll-top').getAttribute('threshold');
  expect(threshold).toBe('200');
});

test('velin-copy exposes accessible control', async ({ page }) => {
  const label = await page.locator('velin-copy').evaluate((el) => {
    return el.shadowRoot?.querySelector('button')?.getAttribute('aria-label');
  });
  expect(label).toBe('Copy');
});

test('canonical and legacy tooltip tags share behavior', async ({ page }) => {
  await page.waitForSelector('velin-tooltip-wc');
  const roles = await page.evaluate(() => {
    const tip = document.querySelector('velin-tooltip')?.shadowRoot?.querySelector('[role="tooltip"]');
    const legacy = document.querySelector('velin-tooltip-wc')?.shadowRoot?.querySelector('[role="tooltip"]');
    return [tip?.getAttribute('role'), legacy?.getAttribute('role')];
  });
  expect(roles).toEqual(['tooltip', 'tooltip']);
});

test('legacy stepper-wc matches canonical stepper structure', async ({ page }) => {
  const lists = await page.evaluate(() => {
    const a = document.querySelector('velin-stepper')?.shadowRoot?.querySelector('[role="list"]');
    const b = document.querySelector('velin-stepper-wc')?.shadowRoot?.querySelector('[role="list"]');
    return [!!a, !!b];
  });
  expect(lists).toEqual([true, true]);
});
