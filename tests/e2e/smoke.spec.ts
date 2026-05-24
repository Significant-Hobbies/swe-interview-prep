import { expect, test } from '@playwright/test';

// Bypass Login by seeding guest mode in localStorage before page load.
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
  });
  // SaaSMaker feedback widget overlays bottom-right and intercepts clicks.
  await page.addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' }).catch(() => {});
});

test.describe('Five-tab IA smoke', () => {
  test('root redirects to /learn and shows roadmaps + concepts', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/learn$/);
    await expect(page.getByRole('heading', { name: 'Learn', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /BM25/i }).first()).toBeVisible();
  });

  test('Practice page renders drills by default with track filter', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.getByRole('heading', { name: 'Practice', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^All \(/ })).toBeVisible();
  });

  test('Practice → Reviews tab switches view', async ({ page }) => {
    await page.goto('/practice');
    await page.getByRole('tab', { name: /^Reviews/ }).click();
    // Either the no-reviews empty state or an active review card is fine.
    await expect(
      page.getByText(/No reviews yet|How well did you recall it|Reveal answer/i),
    ).toBeVisible();
  });

  test('Playground loads the Monaco editor', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
  });

  test('Mock interview page loads', async ({ page }) => {
    await page.goto('/mock');
    await expect(page).toHaveURL(/\/mock/);
  });

  test('Progress page shows mastery and notes tab', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible();
    await expect(page.getByText('Mastery by track')).toBeVisible();
    await page.getByRole('tab', { name: 'Notes' }).click();
    await expect(page.getByRole('button', { name: /New note/i })).toBeVisible();
  });

  test('Concept detail still reachable and shows self-review buttons', async ({ page }) => {
    await page.goto('/concepts/bm25');
    await expect(page.getByRole('heading', { name: 'BM25', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Good' })).toBeVisible();
  });

  test('Roadmap detail still reachable', async ({ page }) => {
    await page.goto('/roadmaps/reset-9-day');
    await expect(page.getByRole('heading', { name: '9-Day Reset' })).toBeVisible();
  });

  test('Settings modal opens', async ({ page }) => {
    await page.goto('/learn');
    await page.getByRole('button', { name: /AI Settings/i }).click();
    await expect(page.getByRole('heading', { name: /AI Configuration/i })).toBeVisible();
  });

  test('legacy URLs redirect into the five-tab IA', async ({ page }) => {
    await page.goto('/concepts');
    await expect(page).toHaveURL(/\/learn$/);
    await page.goto('/drills');
    await expect(page).toHaveURL(/\/practice$/);
    await page.goto('/reviews');
    await expect(page).toHaveURL(/\/practice\?tab=reviews$/);
    await page.goto('/build');
    await expect(page).toHaveURL(/\/playground$/);
    await page.goto('/notes');
    await expect(page).toHaveURL(/\/progress$/);
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/progress$/);
  });

  test('core loop: concept detail links to a drill', async ({ page }) => {
    await page.goto('/concepts/bm25');
    await page.getByRole('link', { name: /Calculate a BM25 score/i }).first().click();
    await expect(page).toHaveURL(/\/drills\//);
    await expect(page.getByRole('button', { name: /Mark solved/i })).toBeVisible();
  });
});
