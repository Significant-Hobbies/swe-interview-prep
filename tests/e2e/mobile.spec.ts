import { expect, test } from '@playwright/test';

/**
 * Mobile-viewport checks. Run only the mobile project:
 *   pnpm exec playwright test --project=mobile
 *
 * Verifies the app is usable at 390px — no horizontal scroll, the bottom tab
 * bar works, and the Playground shows a single full-width panel.
 */
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
  });
  await page
    .addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' })
    .catch(() => {});
});

test.describe('Loop mobile (390px)', () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) > 500,
    'mobile-only checks',
  );

  test('Today renders with no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Today', exact: true }),
    ).toBeVisible({ timeout: 10000 });

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test('bottom tab bar navigates to the Playground', async ({ page }) => {
    await page.goto('/');
    // The mobile bottom tab bar exposes a "Play" tab.
    await page.getByRole('link', { name: 'Play' }).click();
    await expect(page).toHaveURL(/playground/);
    await expect(page.locator('.monaco-editor').first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('Playground does not overflow horizontally', async ({ page }) => {
    await page.goto('/playground');
    await page
      .locator('.monaco-editor')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
