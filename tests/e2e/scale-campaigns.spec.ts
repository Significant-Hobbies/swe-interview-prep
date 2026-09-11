import { expect, test } from '@playwright/test';

// Ordinary UI controls only: no injected company state or accelerated worker clock.
for (const run of [
  {
    profile: 'saas',
    target: 1000,
    projects: ['Optimize the query path', 'Upgrade the app server'],
  },
  {
    profile: 'commerce',
    target: 2000,
    projects: [
      'Upgrade MySQL',
      'Upgrade MySQL',
      'Upgrade MySQL',
      'Optimize the query path',
      'Upgrade the app server',
      'Upgrade the app server',
    ],
  },
  {
    profile: 'inference',
    target: 1000,
    projects: [
      'Upgrade MySQL',
      'Upgrade MySQL',
      'Upgrade MySQL',
      'Optimize the query path',
      'Upgrade the app server',
      'Upgrade the app server',
      'Upgrade the app server',
      'Add an app instance',
    ],
  },
]) {
  test(`plays ${run.profile} from fresh company through completion`, async ({ page }, testInfo) => {
    test.setTimeout(210_000);
    await page.addInitScript(() => {
      localStorage.setItem('dsa-prep-guest', '1');
      localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
    });
    await page.goto(`/play/scale?project=${run.profile}`);
    await page.getByRole('button', { name: 'Hold growth', exact: true }).click();
    await page.getByRole('button', { name: '4×', exact: true }).click();
    await page.getByRole('button', { name: 'Browse all 17 tools', exact: true }).click();
    for (const group of ['Data', 'Compute'])
      await page.locator('summary').filter({ hasText: group }).click();
    for (const name of run.projects) {
      const card = page
        .locator('article')
        .filter({ has: page.getByRole('heading', { name, exact: true }) });
      await card.getByRole('button', { name: 'Start project', exact: true }).click();
      await expect(
        page.getByRole('progressbar', { name: 'Engineering project completion' })
      ).toBeVisible();
      await expect(
        page.getByRole('progressbar', { name: 'Engineering project completion' })
      ).toHaveCount(0, { timeout: 20000 });
    }
    await page.getByRole('button', { name: 'Back to architecture', exact: true }).click();
    await page.getByRole('button', { name: 'Launch your product · $100', exact: true }).click();
    await page.getByRole('button', { name: /Stagger the rollout/ }).click();
    await expect(page.getByRole('heading', { name: 'You handled it.', exact: true })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'Choose the next event', exact: true }).click();
    await page.getByRole('button', { name: /Take the longer window/ }).click();
    await page.getByRole('button', { name: /Cancel maintenance/ }).click();
    await expect(page.getByRole('heading', { name: 'You handled it.', exact: true })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'Build toward the finish', exact: true }).click();
    await page.getByRole('button', { name: 'Resume growth', exact: true }).click();
    await expect
      .poll(
        async () => {
          const text = await page.locator('.challenge-panel .challenge-milestones').innerText();
          return Number(text.match(/([\d,]+) \/ [\d,]+ users/)?.[1].replaceAll(',', ''));
        },
        { timeout: 140000, intervals: [500] }
      )
      .toBeGreaterThanOrEqual(run.target);
    await page.getByRole('button', { name: 'Hold growth', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'You built a sustainable company.', exact: true })
    ).toBeVisible({ timeout: 30000 });
    await testInfo.attach('completed-company', {
      body: await page.locator('main').innerText(),
      contentType: 'text/plain',
    });
    await page.screenshot({
      path: testInfo.outputPath(`${run.profile}-complete.png`),
      fullPage: true,
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'You built a sustainable company.', exact: true })
    ).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download debrief', exact: true }).click();
    await (await download).saveAs(testInfo.outputPath(`${run.profile}-debrief.md`));
  });
}
