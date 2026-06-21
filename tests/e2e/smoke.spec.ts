import { expect, test } from '@playwright/test';

// Bypass Login by seeding guest mode in localStorage before page load.
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  });
  // SaaSMaker feedback widget overlays bottom-right and intercepts clicks.
  await page.addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' }).catch(() => {});
});

test.describe('Learning OS smoke', () => {
  test('root redirects to /today and shows today plan', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/today$/);
    await expect(
      page.getByText(/min session|You're caught up/i).first(),
    ).toBeVisible();
  });

  test('Learn page shows roadmaps + concepts', async ({ page }) => {
    await page.goto('/learn');
    await expect(page.getByRole('heading', { name: 'Pick a path.', exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Interview and systems paths' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Interview prep', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /90-Day AI Search/i })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Browse catalog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'All concepts' })).toBeVisible();
  });

  test('Practice page renders drill hub', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.getByText('This week')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Browse catalog' })).toBeVisible();
  });

  test('Practice → Reviews view on drill browser', async ({ page }) => {
    await page.goto('/practice/all?tab=reviews');
    await expect(
      page.getByText(/No reviews yet|How well did you recall it|Reveal answer/i),
    ).toBeVisible();
  });

  test('Playground loads the Monaco editor', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
  });

  test('Mock interview page loads timed prompts', async ({ page }) => {
    await page.goto('/mock');
    await expect(page).toHaveURL(/\/mock$/);
    await expect(page.getByRole('heading', { name: 'Mock interview' })).toBeVisible();
  });

  test('Progress page shows mastery rollup and notes link', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByText(/concepts mastered/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notes' })).toBeVisible();
    await page.getByRole('link', { name: 'Notes' }).click();
    await expect(page).toHaveURL(/\/progress\/all\?tab=notes/);
  });

  test('Concept detail still reachable and shows self-review buttons', async ({ page }) => {
    await page.goto('/concepts/bm25');
    await expect(page.getByRole('heading', { name: 'BM25', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Good' })).toBeVisible();
  });

  test('Roadmap detail shows visual graph', async ({ page }) => {
    await page.goto('/roadmaps/prob-stats-30d');
    await expect(page.getByRole('heading', { name: /Probability & Statistics/i })).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('public share roadmap works without sign-in', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/share/roadmaps/prob-stats-30d');
    await expect(page.getByRole('heading', { name: /Probability & Statistics/i })).toBeVisible();
    await expect(page.getByText(/Sign in to track progress/i)).toBeVisible();
    await context.close();
  });

  test('onboarding path picker shows role options', async ({ context, page }) => {
    await context.addInitScript(() => {
      localStorage.removeItem('swe-os:onboarding-v1');
    });
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: /Pick your primary path/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /AI Search & RAG/i })).toBeVisible();
    await expect(page.getByText(/Finish setup to unlock navigation/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Learn', exact: true })).toHaveCount(0);
  });

  test('primary top nav navigates between tabs', async ({ page }) => {
    await page.goto('/today');
    await page.getByRole('link', { name: 'Learn', exact: true }).click();
    await expect(page).toHaveURL(/\/learn$/);
    await page.getByRole('link', { name: 'Practice', exact: true }).click();
    await expect(page).toHaveURL(/\/practice$/);
  });

  test('Settings modal opens', async ({ page }) => {
    await page.goto('/learn');
    await page.getByRole('button', { name: /^Settings$/i }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('Settings import tab shows Anki upload', async ({ page }) => {
    await page.goto('/learn');
    await page.getByRole('button', { name: /^Settings$/i }).click();
    await page.getByRole('button', { name: /^Import$/i }).click();
    await expect(page.getByText(/Anki import/i)).toBeVisible();
    await expect(page.getByText(/Choose \.apkg or \.txt/i)).toBeVisible();
  });

  test('Practice all shows LeetCode drill section when stubs exist', async ({ page }) => {
    await page.goto('/practice/all');
    await expect(page.getByText(/LeetCode practice/i)).toBeVisible();
  });

  test('concept detail shows LeetCode drill for array-hashing', async ({ page }) => {
    await page.goto('/concepts/array-hashing');
    await expect(page.getByText(/LeetCode practice/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Two Sum.*LeetCode/i })).toBeVisible();
  });

  test('concept detail links to mock interview rep', async ({ page }) => {
    await page.goto('/concepts/array-hashing');
    await expect(page.getByText(/Mock interview reps/i)).toBeVisible();
    await page.getByRole('link', { name: /Two Sum variants/i }).click();
    await expect(page).toHaveURL(/\/mock\?prompt=mock-two-sum-variants/);
    await expect(page.getByText(/Two Sum variants/i).first()).toBeVisible();
  });

  test('legacy URLs redirect into the Learning OS and /build loads Build Lab', async ({ page }) => {
    await page.goto('/concepts');
    await expect(page).toHaveURL(/\/learn\/all$/);
    await page.goto('/drills');
    await expect(page).toHaveURL(/\/practice$/);
    await page.goto('/reviews');
    await expect(page).toHaveURL(/\/practice\/all\?tab=reviews$/);
    await page.goto('/build');
    await expect(page).toHaveURL(/\/build$/);
    await expect(page.getByRole('heading', { name: 'Build Lab', exact: true })).toBeVisible();
    await page.goto('/notes');
    await expect(page).toHaveURL(/\/progress\/all\?tab=notes$/);
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/progress\/all$/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/today$/);
  });

  test('core loop: concept detail links to a drill', async ({ page }) => {
    await page.goto('/concepts/bm25');
    await page.getByRole('link', { name: /Calculate a BM25 score/i }).first().click();
    await expect(page).toHaveURL(/\/drills\//);
    await expect(page.getByRole('button', { name: /Mark solved/i })).toBeVisible();
  });

  test('playground loads artifact template from query param', async ({ page }) => {
    await page.goto('/playground?artifact=simulate-random-processes');
    await expect(page).toHaveURL(/artifact=simulate-random-processes/);
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.monaco-editor').first()).toContainText(/coinFlips/);
  });

  test('gated concept shows proof-based unlock banner', async ({ page }) => {
    await page.goto('/concepts/search-evals');
    await expect(page.getByText(/Gated — complete one unlock path/i)).toBeVisible();
    await expect(page.getByText(/Solve a drill for Hypothesis Testing/i)).toBeVisible();
  });

  test('math roadmap detail links artifacts to playground', async ({ page }) => {
    await page.goto('/roadmaps/prob-stats-30d');
    await expect(page.getByRole('heading', { name: /Probability & Statistics/i })).toBeVisible();
    const artifactLink = page.getByRole('link', { name: /Simulate coin flips/i }).first();
    await artifactLink.click();
    await expect(page).toHaveURL(/\/playground\?artifact=/);
  });
});