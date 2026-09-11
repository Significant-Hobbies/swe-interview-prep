import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  });
});

test('Scale launches, persists, isolates projects, and returns from Sandbox', async ({ page }) => {
  await page.goto('/play/scale');
  await page.getByRole('button', { name: /Easy Tiny SaaS/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Grow to 5×. Make it sustainable.' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume simulation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Launch your product · $100', exact: true }).click();
  await expect(page.getByText('✓ Launched', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Explore in Sandbox', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Room to experiment.' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Sandbox workload' }).selectOption('analytics');
  await page
    .locator('main')
    .getByRole('button', { name: 'Return to company', exact: true })
    .click();
  await expect(page.getByText('✓ Launched', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Choose project', exact: true }).click();
  await page.getByRole('button', { name: /Expert AI gateway/ }).click();
  await expect(page.getByText('Launch pending', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Choose project', exact: true }).click();
  await page.getByRole('button', { name: /Easy Tiny SaaS/ }).click();
  await expect(page.getByText('✓ Launched', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('✓ Launched', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume simulation', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download debrief', exact: true }).click();
  expect((await downloading).suggestedFilename()).toBe('scale-saas-debrief.md');
});

test('expanded toolkit exposes prerequisites and deploys a persistent read replica', async ({
  page,
}) => {
  await page.goto('/play/scale?project=saas');
  await page.getByRole('button', { name: 'Hold growth', exact: true }).click();
  await page.getByRole('button', { name: '4×', exact: true }).click();
  await page.getByRole('button', { name: 'Browse all 17 tools', exact: true }).click();
  await page.locator('summary').filter({ hasText: 'Reliability' }).click();
  const failover = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Automate regional failover', exact: true }),
  });
  await expect(failover.getByRole('button')).toBeDisabled();
  await expect(failover).toContainText('Add a standby region first.');
  await page.locator('summary').filter({ hasText: 'Data' }).click();
  const replica = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Add a read replica', exact: true }) });
  await replica.getByRole('button', { name: 'Start project', exact: true }).click();
  await page.getByRole('button', { name: 'Back to architecture', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Inspect MySQL + replicas', exact: true })
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Inspect MySQL + replicas', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Explore in Sandbox', exact: true }).click();
  await page.getByRole('button', { name: 'Browse all 17 tools', exact: true }).click();
  await page.locator('summary').filter({ hasText: 'Data' }).click();
  await page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Shard the database', exact: true }) })
    .getByRole('button', { name: 'Test in sandbox', exact: true })
    .click();
  await page.getByRole('button', { name: 'Back to architecture', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect Shard router', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Hot-key traffic' })).toBeVisible();
  await page.getByRole('button', { name: 'Simulate outage', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Restore component', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restore component', exact: true }).click();
  await page
    .locator('main')
    .getByRole('button', { name: 'Return to company', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Inspect MySQL + replicas', exact: true })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect Shard router', exact: true })).toHaveCount(
    0
  );
});

test('every tool exposes optional lessons and outage learning preserves the company', async ({
  page,
  context,
}) => {
  await page.goto('/play/scale?project=saas');
  await page.getByRole('button', { name: 'Pause simulation', exact: true }).click();
  await page.getByRole('button', { name: 'Browse all 17 tools', exact: true }).click();
  for (const summary of await page.locator('.toolkit-group > summary').all()) await summary.click();
  await expect(page.locator('.toolkit-catalog .scale-learning')).toHaveCount(17);
  for (const summary of await page.locator('.toolkit-catalog .scale-learning > summary').all())
    await summary.click();
  const links = page.locator('.toolkit-catalog .scale-learning a');
  await expect(links).toHaveCount(34);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', /^\/curriculum\/concepts\/[a-z0-9-]+\.html$/);
    await expect(link).toHaveAttribute('target', '_blank');
  }
  const popup = context.waitForEvent('page');
  await page
    .getByRole('link', { name: /^Sharding/ })
    .first()
    .click();
  const lesson = await popup;
  await expect(lesson.getByRole('heading', { level: 1 })).toHaveText('Sharding');
  await lesson.close();
  await expect(page.getByRole('button', { name: 'Resume simulation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to architecture', exact: true }).click();
  await page.getByRole('button', { name: 'Explore in Sandbox', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect App server', exact: true }).click();
  await page.getByRole('button', { name: 'Simulate outage', exact: true }).click();
  await page.locator('.failure-learning > summary').click();
  await expect(page.locator('.failure-learning')).toContainText('Component outage');
  await expect(
    page.locator('.failure-learning').getByRole('link', { name: /^Distributed Failure Recovery/ })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Restore component', exact: true }).click();
  await page
    .locator('main')
    .getByRole('button', { name: 'Return to company', exact: true })
    .click();
  await expect(page.getByText('Launch pending', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume simulation', exact: true })).toBeVisible();
});
