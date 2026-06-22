import { expect, test } from '@playwright/test';

/**
 * Mobile-viewport checks. Run only the mobile project:
 *   pnpm exec playwright test --project=mobile
 *
 * Verifies the app is usable at 390px — no horizontal scroll and the bottom
 * tab bar of the Learning OS works.
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
    await expect(page.getByRole('heading', { name: 'Set your active path.', exact: true })).toBeVisible({ timeout: 10000 });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test('bottom tab bar navigates to Practice', async ({ page }) => {
    await page.goto('/learn');
    const bottomNav = page.locator('div.fixed.bottom-0');
    await bottomNav.getByRole('link', { name: 'Practice' }).click();
    await expect(page).toHaveURL(/practice/);
    await expect(page.getByText('This week')).toBeVisible();
  });

  test('bottom bar reaches Mock and Browse opens Playground', async ({ page }) => {
    await page.goto('/learn');
    const bottomNav = page.locator('div.fixed.bottom-0');
    await bottomNav.getByRole('link', { name: 'Mock' }).click();
    await expect(page).toHaveURL(/mock/);
    await bottomNav.getByRole('button', { name: 'Browse catalog' }).click();
    await bottomNav.getByRole('link', { name: 'Playground' }).click();
    await expect(page).toHaveURL(/playground/);
    await bottomNav.getByRole('link', { name: 'Progress' }).click();
    await expect(page).toHaveURL(/progress/);
  });

  test('Practice does not overflow horizontally', async ({ page }) => {
    await page.goto('/practice');
    await page.getByText('This week').waitFor({ state: 'visible' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});