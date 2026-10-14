import { expect, test } from '@playwright/test';

const routes = ['/concepts/bm25', '/roadmaps/prob-stats-30d', '/projects/highsignal'];
for (const width of [390, 768, 1440]) {
  for (const path of routes) {
    test(`account mastery read is honest and retry retains route at ${width}: ${path}`, async ({
      context,
      page,
    }, testInfo) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 900 });
      const user = {
        id: 'synthetic-per-id',
        name: 'Synthetic learner',
        email: 'test@example.invalid',
      };
      await context.addInitScript((profile) => {
        localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
        window.__arrival = {
          release: Infinity,
          shifts: [] as { t: number; value: number; recent: boolean }[],
        };
        new PerformanceObserver((list) =>
          window.__arrival.shifts.push(
            ...list
              .getEntries()
              .map((e: any) => ({ t: e.startTime, value: e.value, recent: e.hadRecentInput }))
          )
        ).observe({ type: 'layout-shift', buffered: true });
      }, user);
      let release!: () => void;
      let gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      let failed = true;
      await context.routeWebSocket('**/*', (socket) => socket.close());
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== new URL(testInfo.project.use.baseURL!).origin) return route.abort();
        if (url.pathname === '/api/auth/verify') return route.fulfill({ json: { user } });
        if (url.pathname.startsWith('/api/')) {
          if (url.searchParams.get('action') === 'concepts') {
            await gate;
            return route.fulfill({
              status: failed ? 503 : 200,
              json: failed ? { error: 'Synthetic read failure' } : { mastery: {} },
            });
          }
          return route.fulfill({
            json: { profile: {}, projects: {}, artifacts: {}, drills: {}, notes: [] },
          });
        }
        return route.continue();
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
        connectionType: 'cellular4g',
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.goto(`${path}?audit=retained`);
      const boundary = page.locator('[data-mastery-read-boundary]');
      await expect(boundary.getByRole('status')).toContainText('Loading concept mastery');
      await expect(boundary.locator('[inert]')).toHaveCount(1);
      await page.evaluate(() => document.fonts.ready);
      release();
      await expect(boundary.getByRole('alert')).toContainText(
        'Could not load concept mastery (503).'
      );
      if (path.startsWith('/concepts/')) {
        await expect(page.getByText('untouched', { exact: true })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Again', exact: true })).toHaveCount(0);
      }
      if (path.startsWith('/roadmaps/'))
        await expect(page.getByText('0/18 concepts mastered')).not.toBeVisible();
      if (path.startsWith('/projects/'))
        await page.locator('textarea').fill('Retained synthetic next action');
      await page.screenshot({ path: testInfo.outputPath('error.png'), fullPage: true });
      gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      failed = false;
      await boundary.getByRole('button', { name: 'Try again', exact: true }).click();
      await expect(boundary.getByRole('status')).toBeVisible();
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        window.__arrival.release = performance.now();
        window.__arrival.shifts = [];
      });
      release();
      await expect(boundary.locator('[inert]')).toHaveCount(0);
      await expect(boundary.getByRole('alert')).toHaveCount(0);
      await expect(page).toHaveURL(new RegExp(`${path}\\?audit=retained$`));
      if (path.startsWith('/concepts/'))
        await expect(page.getByRole('button', { name: 'Again', exact: true })).toBeVisible();
      if (path.startsWith('/projects/'))
        await expect(page.locator('textarea')).toHaveValue('Retained synthetic next action');
      await page.waitForTimeout(700);
      const cls = await page.evaluate(() =>
        window.__arrival.shifts
          .filter((e) => e.t >= window.__arrival.release && !e.recent)
          .reduce((sum, e) => sum + e.value, 0)
      );
      expect(cls).toBeLessThanOrEqual(0.05);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      );
      await page.screenshot({ path: testInfo.outputPath('settled.png'), fullPage: true });
    });
  }
}

declare global {
  interface Window {
    __arrival: { release: number; shifts: { t: number; value: number; recent: boolean }[] };
  }
}
