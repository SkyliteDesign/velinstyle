import { defineConfig, devices } from '@playwright/test';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PLAYWRIGHT_PORT || process.env.PW_PORT || 18765);
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npx serve . -l ${PORT} --cors`,
    url: `${BASE_URL}/tests/e2e/fixtures/wc-smoke.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
