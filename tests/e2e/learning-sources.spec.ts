import { expect, test } from '@playwright/test';

const fixtureUser = {
  id: 'e2e-learning-owner',
  email: 'owner@example.test',
  name: 'Learning Owner',
};

test.beforeEach(async ({ context, page }) => {
  await context.addInitScript((user) => {
    localStorage.removeItem('dsa-prep-guest');
    localStorage.setItem('dsa-prep-profile', JSON.stringify(user));
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  }, fixtureUser);
  await page.route('**/api/auth/verify', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: fixtureUser }),
    })
  );
  await page.route('**/api/learning/reader', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        source: {
          id: 'reader',
          kind: 'reader',
          label: 'Reader',
          description: 'Private saved blogs and articles.',
          canonicalUrl: 'https://reader.example.test',
          itemCount: 0,
          syncStatus: 'fresh',
        },
        items: [],
      }),
    })
  );
});

test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'This check exercises both viewports in Chromium.'
);

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    )
  ).toBe(false);
}

test('authenticated catalog and daily session remain responsive', async ({ page }) => {
  await page.goto('/sources');
  await expect(
    page.getByRole('heading', { name: 'One place for everything worth learning.' })
  ).toBeVisible();
  await expect(page.getByPlaceholder('Search projects, papers, tracks, or topics')).toBeVisible();
  await expect(page.getByText(/available items/)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto('/session/2026-07-13/e2e-responsive');
  await expect(page.getByText('Daily learning session')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Learn, recall, schedule.' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'I studied these · ask me questions' })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/sources');
  await expect(
    page.getByRole('heading', { name: 'One place for everything worth learning.' })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto('/session/2026-07-13/e2e-responsive');
  await expect(page.getByText('Daily learning session')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'I studied these · ask me questions' })
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
