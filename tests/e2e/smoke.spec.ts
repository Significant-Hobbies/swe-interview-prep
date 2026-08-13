import { expect, test } from '@playwright/test';

import { clickNav } from './nav';

// Bypass Login by seeding guest mode in localStorage before page load.
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  });
  // SaaSMaker feedback widget overlays bottom-right and intercepts clicks.
  await page
    .addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' })
    .catch(() => {});
});

test.describe('Learning OS smoke', () => {
  test('root redirects to Dashboard and shows resumable learning state', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Pick up where you left off.' })).toBeVisible();
    await expect(page.getByText('Learning now')).toBeVisible();
    await expect(page.getByText('Next in practice')).toBeVisible();
  });

  test('Learn page searches the complete catalogue and keeps browse-all visible', async ({
    page,
  }) => {
    await page.goto('/learn');
    await expect(
      page.getByRole('heading', { name: 'Understand the system.', exact: true })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /All \d+ concepts/ })).toBeVisible();
    await page.getByRole('searchbox', { name: /Search all concepts/i }).fill('idempotency');
    await expect(page.getByRole('link', { name: /Idempotency/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse all concepts' })).toBeVisible();
  });

  test('Practice opens the Playground with the complete problem selector', async ({ page }) => {
    await page.goto('/practice');
    const selector = page.getByLabel(/Choose a practice problem/i);
    await expect(selector).toBeVisible({ timeout: 15000 });
    await selector.click();
    await expect(
      page.getByRole('searchbox', { name: /Search every practice problem/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse complete catalogue/i })).toBeVisible();
  });

  test('Practice → Reviews view on drill browser', async ({ page }) => {
    await page.goto('/practice/all?tab=reviews');
    await expect(
      page.getByText(/No reviews yet|How well did you recall it|Reveal answer/i)
    ).toBeVisible();
  });

  test('Playground loads the Monaco editor', async ({ page }) => {
    await page.goto('/playground');
    if ((page.viewportSize()?.width ?? 1024) <= 500) {
      await page.getByRole('button', { name: 'Code', exact: true }).click();
    }
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
    await expect(page.getByRole('img', { name: /roadmap graph/i })).toBeVisible();
  });

  test('public share roadmap works without sign-in', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/share/roadmaps/prob-stats-30d');
    await expect(page.getByRole('heading', { name: /Probability & Statistics/i })).toBeVisible();
    await expect(page.getByText(/Sign in to track progress/i)).toBeVisible();
    await context.close();
  });

  test('onboarding is optional and catalog stays browsable', async ({ context, page }) => {
    await context.addInitScript(() => {
      localStorage.removeItem('swe-os:onboarding-v1');
    });
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: /Pick your primary path/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /90-Day AI Search/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /LLD Practice/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Probability & Statistics/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Interview prep', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Skip — explore the catalog/i })).toBeVisible();
    await clickNav(page, 'Learn');
    await expect(page).toHaveURL(/\/learn$/);
    await expect(page.getByRole('searchbox', { name: /Search all concepts/i })).toBeVisible();
  });

  // Titles must match `ROADMAP_GROUPS` in src/lib/roadmapGroups.ts. They cannot
  // be imported here — that module pulls in JSON imports Playwright's loader
  // rejects without import attributes — so this list is maintained by hand.
  // It asserted 'Systems internals' and 'AI & retrieval' until now; both were
  // renamed in 41d6114 and the test simply stayed red, because e2e does not
  // run in CI. Update this list when a group is renamed.
  test('Explore page lists all roadmap groups', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.getByRole('heading', { name: /Explore everything/i })).toBeVisible();
    for (const title of [
      'Interview prep',
      'Systems & platforms',
      'AI-native systems',
      'Mathematics',
      'Software building',
      'Multimodal & spatial',
    ]) {
      await expect(
        page.getByRole('heading', { name: title, exact: true }),
        `roadmap group "${title}" is rendered`
      ).toBeVisible();
    }
    await expect(page.getByRole('region', { name: 'Playground' })).toBeVisible();
  });

  test('primary top nav navigates between tabs', async ({ page }) => {
    await page.goto('/dashboard');
    await clickNav(page, 'Learn');
    await expect(page).toHaveURL(/\/learn$/);
    await clickNav(page, 'Wars');
    await expect(page).toHaveURL(/\/wars$/);
    await clickNav(page, 'Dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
    await clickNav(page, 'Practice');
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
    await expect(page).toHaveURL(/\/practice\/all$/);
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
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto('/today');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('core loop: concept detail links to a drill', async ({ page }) => {
    await page.goto('/concepts/bm25');
    await page
      .getByRole('link', { name: /Calculate a BM25 score/i })
      .first()
      .click();
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
