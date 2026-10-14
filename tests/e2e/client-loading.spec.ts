import { expect, test } from '@playwright/test';

for (const width of [390, 768, 1440]) {
  test(`mastery failure/retry and shared compact home/back behavior at ${width}`, async ({
    context,
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    let failed = true;
    const user = {
      id: 'synthetic-client-loading',
      name: 'Synthetic learner',
      email: 'audit@example.invalid',
    };
    await context.addInitScript((profile) => {
      if (!sessionStorage.getItem('audit-guest'))
        localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
    }, user);
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
      if (url.pathname === '/api/auth/verify') return route.fulfill({ json: { user } });
      if (url.pathname.startsWith('/api/')) {
        if (url.searchParams.get('action') === 'concepts' && failed)
          return route.fulfill({
            status: 503,
            json: { error: 'Synthetic mastery failure' },
          });
        return route.fulfill({
          json: {
            mastery: {},
            drills: {},
            artifacts: {},
            projects: {},
            notes: [],
            profile: {},
          },
        });
      }
      return route.continue();
    });
    await context.routeWebSocket('**/*', (socket) => socket.close());
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
    test.setTimeout(90000);
    await page.goto('/progress');
    await expect(page.getByRole('alert')).toContainText('Could not load concept mastery (503).', {
      timeout: 30000,
    });
    await expect(page.getByText('concepts mastered', { exact: false })).toHaveCount(0);
    failed = false;
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.getByText('concepts mastered', { exact: false })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.locator('studio-footer [data-footer-mode="compact"]')).toHaveCount(1);
    await expect(page.locator('studio-footer form, studio-footer textarea')).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`progress-compact-${width}.png`),
      fullPage: true,
    });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.setItem('audit-guest', '1');
    });
    await page.reload();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.getByRole('link', { name: 'SWE Prep', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('studio-footer form[data-subscribe]')).toHaveCount(1);
    const theme = await page.evaluate(() => ({
      font: getComputedStyle(document.body).fontFamily,
      background: getComputedStyle(document.body).backgroundColor,
    }));
    await page.goBack();
    await expect(page).toHaveURL(/\/progress$/);
    await expect(page.locator('studio-footer [data-footer-mode="compact"]')).toHaveCount(1);
    await expect(page.locator('studio-footer form, studio-footer textarea')).toHaveCount(0);
    expect(
      await page.evaluate(() => ({
        font: getComputedStyle(document.body).fontFamily,
        background: getComputedStyle(document.body).backgroundColor,
      }))
    ).toEqual(theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  });
}

test('learning import failure retries the current route and filters', async ({ context, page }) => {
  let failed = true;
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { user: null } });
    if (/\/assets\/bootstrap-[^/]+\.js$/.test(url.pathname) && failed)
      return route.fulfill({ status: 503, body: 'Synthetic chunk failure' });
    return route.continue();
  });
  await page.goto('/progress/all?tab=notes');
  await expect(page.getByRole('alert')).toHaveText('Could not open the learning workspace.');
  failed = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page).toHaveURL(/\/progress\/all\?tab=notes$/);
  await expect(page.locator('studio-footer [data-footer-mode="compact"]')).toHaveCount(1);
});

for (const path of ['/learn', '/dashboard']) {
  for (const width of [390, 768, 1440]) {
    test(`mastery read stays explicit on ${path} at ${width}`, async ({ context, page }) => {
      await page.setViewportSize({ width, height: 900 });
      const user = { id: 'synthetic-mastery', name: 'Synthetic', email: 'audit@example.invalid' };
      let failed = true;
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      await context.addInitScript((profile) => {
        localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
      }, user);
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
        if (url.pathname === '/api/auth/verify') return route.fulfill({ json: { user } });
        if (url.pathname.startsWith('/api/')) {
          if (url.searchParams.get('action') === 'concepts') {
            await pending;
            if (failed)
              return route.fulfill({ status: 503, json: { error: 'Synthetic read failure' } });
          }
          return route.fulfill({
            json: { mastery: {}, drills: {}, artifacts: {}, projects: {}, notes: [], profile: {} },
          });
        }
        return route.continue();
      });
      await context.routeWebSocket('**/*', (socket) => socket.close());
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
      test.setTimeout(90000);
      await page.goto(path);
      await expect(
        page.getByText(
          path === '/dashboard'
            ? 'Building today’s priority from your learning state…'
            : 'Loading concept mastery…',
          { exact: true }
        )
      ).toBeVisible({
        timeout: 30000,
      });
      release();
      await expect(page.getByRole('alert')).toContainText('(503)');
      await expect(page.locator('main h1')).toHaveCount(0);
      failed = false;
      await page.getByRole('button', { name: 'Try again', exact: true }).click();
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(page.locator('main h1').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      );
    });
  }
}
