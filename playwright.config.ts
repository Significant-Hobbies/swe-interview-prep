import { devices } from '@playwright/test';
import { definePlaywrightConfig } from '@saas-maker/test-config/playwright';

export default definePlaywrightConfig({
  testDir: './tests/e2e',
  baseURL: 'http://localhost:5199',
  viewportMatrix: false,
  smoke: false,
  extend: {
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
    // Desktop baseline + a mobile-viewport project (iPhone 13 = 390px, the
    // fleet mobile target) so mobile regressions are caught.
    projects: [
      { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
      { name: 'mobile', use: { ...devices['iPhone 13'] } },
    ],
    webServer: {
      command: 'pnpm exec vite --port 5199 --strictPort',
      url: 'http://localhost:5199',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  },
});
