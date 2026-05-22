import { expect, test } from '@playwright/test';

/**
 * Mobile-viewport checks. Run only the mobile project:
 *   pnpm exec playwright test --project=mobile
 *
 * Verifies the app is usable at 390px — no horizontal scroll and the bottom
 * tab bar of the 9-page IA works.
 */
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
  });
  await page
    .addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' })
    .catch(() => {});
});

test.describe('Learning OS mobile (390px)', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 500, 'mobile-only checks');

  test('Dashboard renders with no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /What should I do next/i }),
    ).toBeVisible({ timeout: 10000 });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test('bottom tab bar navigates to Concepts', async ({ page }) => {
    await page.goto('/');
    const bottomNav = page.locator('div.fixed.bottom-0');
    await bottomNav.getByRole('link', { name: 'Concepts' }).click();
    await expect(page).toHaveURL(/concepts/);
    await expect(page.getByRole('heading', { name: /Concept Library/i })).toBeVisible();
  });

  test('bottom tab bar "More" sheet exposes secondary pages', async ({ page }) => {
    await page.goto('/');
    await page.locator('div.fixed.bottom-0').getByRole('button', { name: 'More' }).click();
    await page.getByRole('link', { name: 'Progress' }).click();
    await expect(page).toHaveURL(/progress/);
  });

  test('Concepts page does not overflow horizontally', async ({ page }) => {
    await page.goto('/concepts');
    await page.getByRole('heading', { name: /Concept Library/i }).waitFor({ state: 'visible' });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
