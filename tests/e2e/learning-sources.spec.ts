import { expect, test } from '@playwright/test';

const fixtureUser = {
  id: 'e2e-learning-owner',
  email: 'owner@example.test',
  name: 'Learning Owner',
};

test.beforeEach(async ({ context, page }) => {
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url());
    return ['localhost', '127.0.0.1'].includes(hostname) ? route.continue() : route.abort();
  });
  await context.addInitScript((user) => {
    localStorage.removeItem('dsa-prep-guest');
    if (!sessionStorage.getItem('qa-reader-account-b'))
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

test('verification of the same cached account preserves a study in progress', async ({ page }) => {
  let release!: () => void;
  const verifying = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/auth/verify', async (route) => {
    await verifying;
    await route.fulfill({ json: { user: fixtureUser } });
  });
  await page.goto('/session/2026-11-24/held-verification');
  await page.getByRole('button', { name: /I studied these/ }).click();
  const questions = page.getByRole('heading', { name: 'Questions before scheduling' });
  await expect(questions).toBeVisible();
  const read = page.waitForResponse((response) => response.url().endsWith('/api/learning/reader'));
  release();
  await read;
  await expect(questions).toBeVisible();
});

for (const width of [390, 768, 1440]) {
  test(`Reader session retries a failed read without recording an empty study at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let attempts = 0;
    let failing = true;
    let populated = false;
    let denied = false;
    await page.route('**/api/auth/logout', (route) => route.fulfill({ json: { ok: true } }));
    await page.route('**/api/learning/reader', async (route) => {
      attempts += 1;
      if (failing) {
        await pending;
        await route.fulfill({ status: 503, json: { error: 'Synthetic Reader failure' } });
        return;
      }
      if (denied) {
        await route.fulfill({ status: 403, json: { error: 'Private source' } });
        return;
      }
      await route.fulfill({
        json: {
          items: populated
            ? [
                {
                  id: 'reader:qa',
                  sourceId: 'reader',
                  sourceKind: 'reader',
                  title: 'Synthetic Reader article',
                  summary: 'Test content',
                  canonicalUrl: 'https://example.invalid/qa',
                  tracks: [],
                  format: 'article',
                  estimatedMinutes: 8,
                  fingerprint: 'qa',
                },
              ]
            : [],
          source: { id: 'reader', kind: 'reader', label: 'Reader', itemCount: populated ? 1 : 0 },
        },
      });
    });

    const path = '/session/2026-11-24/e2e-reader?source=reader';
    const study = page.getByRole('button', { name: /I studied these/ });
    await page.goto(path);
    await expect(page.getByText('Loading Reader items…', { exact: true })).toBeVisible();
    await expect(study).toHaveCount(0);
    release();
    await expect(page.locator('main').getByRole('alert')).toHaveText(
      'Could not load Reader items.'
    );
    await expect(study).toHaveCount(0);
    const failureAttempts = attempts;
    failing = false;
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(
      page.getByText('No study items are available for this source.', { exact: false })
    ).toBeVisible();
    await expect(study).toHaveCount(0);
    expect(attempts).toBeGreaterThan(failureAttempts);
    expect(await page.evaluate(() => localStorage.getItem('swe-os:daily-sessions'))).toBeNull();

    populated = true;
    await page.reload();
    await expect(page.getByRole('heading', { name: /Synthetic Reader article/ })).toBeVisible();
    await expect(study).toBeEnabled();
    await study.click();
    await expect(page.getByRole('heading', { name: 'Questions before scheduling' })).toBeVisible();
    await page
      .getByRole('textbox', { name: /What will you remember/ })
      .fill('Synthetic completed study reflection.');
    await page.getByRole('button', { name: 'Finish and schedule reviews' }).click();
    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
    const kinds = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('swe-os:daily-sessions') || '[]').flatMap(
        (row: { kinds: string[] }) => row.kinds
      )
    );
    expect(kinds).toEqual(['external_learning_session']);
    const signedInAttempts = attempts;
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(
      page.getByText('Reader is available from its connected account.', { exact: false })
    ).toBeVisible();
    await expect(page.getByText('Synthetic Reader article', { exact: false })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Finish and schedule reviews' })).toHaveCount(0);
    expect(attempts).toBe(signedInAttempts);
    const accountB = { id: 'reader-e2e-b', email: 'b@example.test', name: 'Reader Test B' };
    await page.route('**/api/auth/verify', (route) => route.fulfill({ json: { user: accountB } }));
    denied = true;
    await page.evaluate((user) => {
      sessionStorage.setItem('qa-reader-account-b', '1');
      localStorage.setItem('dsa-prep-profile', JSON.stringify(user));
    }, accountB);
    const nonOwnerRead = page.waitForResponse(
      (response) => response.url().endsWith('/api/learning/reader') && response.status() === 403
    );
    await page.reload();
    await nonOwnerRead;
    await expect(
      page.getByText('Reader is available from its connected account.', { exact: false })
    ).toBeVisible();
    await expect(page.getByText('Synthetic Reader article', { exact: false })).toHaveCount(0);
    expect(attempts).toBeGreaterThan(signedInAttempts);
    await expectNoHorizontalOverflow(page);
  });
}
