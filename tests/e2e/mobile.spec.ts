import { expect, test } from '@playwright/test';

import { clickNav } from './nav';

/**
 * Mobile-viewport checks. Run only the mobile project:
 *   pnpm exec playwright test --project=mobile
 *
 * Verifies the app is usable at 390px — no horizontal scroll, and that every
 * primary destination is reachable. Commit 4de5acc replaced the old
 * `div.fixed.bottom-0` tab bar with the header's compact "Menu" disclosure;
 * these specs drive that instead (see `clickNav` in smoke.spec.ts).
 */
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  });
  await page
    .addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' })
    .catch(() => {});
});

test.describe('Learning OS mobile (390px)', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 500, 'mobile-only checks');

  test('Learn renders with no horizontal scroll', async ({ page }) => {
    await page.goto('/learn');
    await expect(
      page.getByRole('heading', { name: 'Set your active path.', exact: true })
    ).toBeVisible({ timeout: 10000 });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(overflow).toBe(false);
  });

  test('compact menu navigates to Practice', async ({ page }) => {
    await page.goto('/learn');
    await clickNav(page, 'Practice');
    await expect(page).toHaveURL(/practice/);
    await expect(page.getByText('This week')).toBeVisible();
  });

  test('compact menu reaches Mock, Playground, and Progress', async ({ page }) => {
    await page.goto('/learn');
    await clickNav(page, 'Mock');
    await expect(page).toHaveURL(/mock/);
    await clickNav(page, 'Playground');
    await expect(page).toHaveURL(/playground/);
    await clickNav(page, 'Progress');
    await expect(page).toHaveURL(/progress/);
  });

  test('Practice does not overflow horizontally', async ({ page }) => {
    await page.goto('/practice');
    await page.getByText('This week').waitFor({ state: 'visible' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(overflow).toBe(false);
  });
});
