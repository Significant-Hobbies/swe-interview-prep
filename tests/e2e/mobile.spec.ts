import { expect, test } from '@playwright/test';

/**
 * Mobile-viewport checks. Run only the mobile project:
 *   pnpm exec playwright test --project=mobile
 *
 * Verifies the app is usable at 390px — no horizontal scroll and the bottom
 * tab bar of the 5-tab IA works.
 */
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
  });
  await page
    .addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' })
    .catch(() => {});
});

test.describe('Five-tab IA mobile (390px)', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 500, 'mobile-only checks');

  test('Learn renders with no horizontal scroll', async ({ page }) => {
    await page.goto('/learn');
    await expect(page.getByRole('heading', { name: 'Learn', exact: true })).toBeVisible({ timeout: 10000 });

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
    await expect(page.getByRole('heading', { name: 'Practice', exact: true })).toBeVisible();
  });

  test('bottom tab bar reaches Playground and Progress', async ({ page }) => {
    await page.goto('/learn');
    const bottomNav = page.locator('div.fixed.bottom-0');
    await bottomNav.getByRole('link', { name: 'Playground' }).click();
    await expect(page).toHaveURL(/playground/);
    await bottomNav.getByRole('link', { name: 'Progress' }).click();
    await expect(page).toHaveURL(/progress/);
  });

  test('Practice does not overflow horizontally', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('heading', { name: 'Practice', exact: true }).waitFor({ state: 'visible' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
