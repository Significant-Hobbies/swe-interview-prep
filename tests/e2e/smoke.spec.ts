import { expect, test } from '@playwright/test';

// Bypass Login by seeding guest mode in localStorage before page load.
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
  });
  // SaaSMaker feedback widget overlays bottom-right and intercepts clicks.
  await page.addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' }).catch(() => {});
});

test.describe('Learning OS smoke', () => {
  test('Dashboard renders the next-action heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /What should I do next/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Today's learning loop")).toBeVisible();
  });

  test('Concepts page lists tracks and concept cards', async ({ page }) => {
    await page.goto('/concepts');
    await expect(page.getByRole('heading', { name: /Concept Library/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'All tracks' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search & IR' })).toBeVisible();
    await expect(page.getByRole('link', { name: /BM25/i }).first()).toBeVisible();
  });

  test('Concept detail shows mental model and self-review buttons', async ({ page }) => {
    await page.goto('/concepts/bm25');
    await expect(page.getByRole('heading', { name: 'BM25', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Good' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
  });

  test('Roadmaps page shows the four roadmaps', async ({ page }) => {
    await page.goto('/roadmaps');
    await expect(page.getByRole('heading', { name: /Learning Roadmaps/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: '9-Day Reset' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /90-Day AI Search/i })).toBeVisible();
  });

  test('Roadmap detail shows milestones', async ({ page }) => {
    await page.goto('/roadmaps/reset-9-day');
    await expect(page.getByRole('heading', { name: '9-Day Reset' })).toBeVisible();
    await expect(page.getByText(/Milestone 1/i)).toBeVisible();
  });

  test('Drills page lists drills', async ({ page }) => {
    await page.goto('/drills');
    await expect(page.getByRole('heading', { name: /Drill Bank/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /BM25/i }).first()).toBeVisible();
  });

  test('Build Lab shows the artifact board', async ({ page }) => {
    await page.goto('/build');
    await expect(page.getByRole('heading', { name: 'Build Lab', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'To build' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shipped' })).toBeVisible();
  });

  test('Reviews page renders an empty or active state', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.getByRole('heading', { name: /Spaced Repetition/i })).toBeVisible();
  });

  test('Projects page lists core projects', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'HighSignal' })).toBeVisible();
  });

  test('Progress page renders metrics', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible();
    await expect(page.getByText('Mastery by track')).toBeVisible();
  });

  test('Playground loads with the Monaco editor', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
  });

  test('Settings modal opens', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /AI Settings/i }).click();
    await expect(page.getByRole('heading', { name: /AI Configuration/i })).toBeVisible();
  });

  test('Legacy URLs redirect into the new IA', async ({ page }) => {
    await page.goto('/dsa/patterns');
    await expect(page).toHaveURL(/\/concepts/);
    await page.goto('/review');
    await expect(page).toHaveURL(/\/reviews/);
    await page.goto('/today');
    await expect(page).toHaveURL(/\/$/);
  });

  test('core loop: concept detail links to a drill', async ({ page }) => {
    await page.goto('/concepts/bm25');
    await page.getByRole('link', { name: /Calculate a BM25 score/i }).first().click();
    await expect(page).toHaveURL(/\/drills\//);
    await expect(page.getByRole('button', { name: /Mark solved/i })).toBeVisible();
  });
});
