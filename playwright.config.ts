import { definePlaywrightConfig } from '@saas-maker/test-config/playwright';

export default definePlaywrightConfig({
  testDir: './tests/e2e',
  baseURL: 'http://localhost:5199',
  viewportMatrix: false,
  smoke: false,
  extend: {
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
    webServer: {
      command: 'pnpm exec vite --port 5199 --strictPort',
      url: 'http://localhost:5199',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  },
});
