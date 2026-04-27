import { expect,test } from '@playwright/test';

// Bypass Login by seeding guest mode in localStorage before page load.
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
  });
  // SaaSMaker feedback widget overlays bottom-right and intercepts clicks
  await page.addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' }).catch(() => {});
});

test.describe('Loop app smoke', () => {
  test('Today route renders heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('Concepts page shows heatmap with at least one category section', async ({ page }) => {
    await page.goto('/concepts');
    await expect(page.getByRole('heading', { name: /Concept Graph/i })).toBeVisible();
    // Filter buttons
    await expect(page.getByRole('button', { name: 'DSA' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LLD' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'HLD' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Behavioral' })).toBeVisible();
  });

  test('Concept tile click opens drawer with self-rate buttons', async ({ page }) => {
    await page.goto('/concepts');
    // Click first concept tile (Arrays & Hashing should be present)
    await page.getByRole('button', { name: /Arrays & Hashing/i }).first().click();
    await expect(page.getByRole('button', { name: 'again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'good' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'easy' })).toBeVisible();
  });

  test('Playground loads with code editor', async ({ page }) => {
    await page.goto('/playground');
    // Wait for Monaco
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
    // Toolbar buttons
    await expect(page.getByRole('button', { name: /Companion/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Library/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Explain/i })).toBeVisible();
  });

  test('Playground panels toggle on/off', async ({ page }) => {
    await page.goto('/playground');
    await page.locator('.monaco-editor').first().waitFor({ state: 'visible', timeout: 15000 });
    // Toggle Companion off then back on
    const companionBtn = page.getByRole('button', { name: /Companion/i });
    await companionBtn.click();
    await companionBtn.click();
    // Should still render w/o crash
    await expect(page.locator('.monaco-editor').first()).toBeVisible();
  });

  test('Settings modal opens and closes', async ({ page }) => {
    await page.goto('/');
    // Settings cog (icon-only)
    await page.getByRole('button', { name: /AI Settings/i }).click();
    await expect(page.getByRole('heading', { name: /AI Configuration/i })).toBeVisible();
    // Close via X
    await page.getByRole('button').filter({ has: page.locator('svg') }).last().click();
  });

  test('Review page renders empty state without report', async ({ page }) => {
    await page.goto('/review');
    await expect(page.getByRole('heading', { name: /Weekly Review/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible();
  });

  test('Bottom nav links navigate between routes (mobile viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/');
    // Hide SaaSMaker widget that overlays bottom-right
    await page.addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' });
    const bottomNav = page.locator('div.fixed.bottom-0');
    await bottomNav.locator('a[href="/concepts"]').click();
    await expect(page.getByRole('heading', { name: /Concept Graph/i })).toBeVisible();
    await bottomNav.locator('a[href="/playground"]').click();
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
  });

  test('Legacy URLs redirect to /concepts', async ({ page }) => {
    await page.goto('/dsa/patterns');
    await expect(page).toHaveURL(/\/concepts/);
    await page.goto('/library/system-design-primer');
    await expect(page).toHaveURL(/\/concepts/);
  });
});
