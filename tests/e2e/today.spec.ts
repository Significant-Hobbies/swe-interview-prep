import { expect, test } from '@playwright/test';

import { clickNav } from './nav';

for (const width of [390, 768, 1440]) {
  for (const learner of ['visitor', 'new-guest', 'populated-guest'] as const) {
    test(`Today preserves the learning flow for ${learner} at ${width}px`, async ({
      context,
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      // Keep these synthetic learning sessions local; no analytics or auth/provider calls.
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' || url.hostname === 'localhost'
          ? route.continue()
          : route.abort();
      });
      await context.addInitScript((state) => {
        if (state !== 'visitor') localStorage.setItem('dsa-prep-guest', '1');
        if (state === 'populated-guest') {
          localStorage.setItem(
            'swe-os:drills',
            JSON.stringify({ 'build-tokenizer': { status: 'solved', attempts: 1, lastCode: '' } })
          );
        }
      }, learner);
      const errors: string[] = [];
      const verifyRequests: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        if (request.url().includes('/api/auth/verify')) verifyRequests.push(request.url());
      });
      if (learner === 'visitor') {
        await page.goto('/');
        await expect(page.getByRole('heading', { level: 1 })).toContainText(
          'Prepare for interviews by building understanding you can demonstrate.'
        );
        await page.getByRole('link', { name: 'Start learning' }).first().click();
        await expect(page).toHaveURL(/\/learn$/);
      }
      await page.goto('/dashboard');
      const main = page.getByRole('main');
      await expect(main.getByRole('heading', { level: 1 })).toContainText(
        'Build a causal model of Tokenization.'
      );
      await expect(main.getByText('Evidence required', { exact: true })).toBeVisible();
      await expect(main.getByRole('heading', { name: 'Supporting session map' })).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
      await page.waitForFunction(() =>
        Array.from(document.styleSheets).some(
          (sheet) => sheet.href?.endsWith('/footer.css') && sheet.cssRules.length > 0
        )
      );
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const primaryNav = page.getByRole('navigation', { name: 'Primary', exact: true });
      if (width >= 1024) {
        await expect(primaryNav).toBeVisible();
        await expect(primaryNav.getByRole('link', { name: 'Learn', exact: true })).toBeVisible();
        await primaryNav.locator('summary', { hasText: 'Browse' }).click();
        await expect(
          primaryNav.getByRole('link', { name: 'Learning sources', exact: true })
        ).toBeVisible();
        await primaryNav.getByRole('link', { name: 'Learning sources', exact: true }).click();
        await expect(page).toHaveURL(/\/sources$/);
        await expect(
          page.getByRole('heading', {
            name: 'One place for everything worth learning.',
            exact: true,
          })
        ).toBeVisible();
        await page.goto('/dashboard');
        await expect(main.getByRole('heading', { level: 1 })).toContainText('Tokenization');
      } else {
        await expect(primaryNav).not.toBeVisible();
        await expect(page.locator('header summary', { hasText: 'Menu' })).toBeVisible();
      }
      await expect(main.locator('#product-intro')).toHaveCount(0);
      const populated = learner === 'populated-guest';
      await expect(main.locator('#learning-now')).toHaveCount(populated ? 1 : 0);
      await expect(main.locator('#practice-now')).toHaveCount(populated ? 1 : 0);
      await expect(main.locator('#available-paths')).toHaveCount(populated ? 1 : 0);
      await expect(main.getByRole('heading', { name: 'Recently visited' })).toHaveCount(
        populated ? 1 : 0
      );
      await expect(main.getByRole('heading', { name: 'Progress', exact: true })).toHaveCount(
        populated ? 1 : 0
      );
      if (populated) await expect(main.getByText('1 attempt · solved')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width + 1
      );
      await page.screenshot({
        path: testInfo.outputPath(`today-${learner}-${width}.png`),
        fullPage: true,
        animations: 'disabled',
      });

      const action = main.getByRole('link', {
        name: populated ? 'Learn, then run the drill' : 'Start focused study',
      });
      await expect(action).toBeVisible();
      expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await action.focus();
      await expect(action).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(
        populated ? /\/drills\/build-tokenizer$/ : /\/study\/concept\/tokenization$/
      );
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.goto('/dashboard');
      const session = page.locator('[aria-labelledby="session-map"]');
      const firstStep = session.getByRole('link').first();
      const stepHref = await firstStep.getAttribute('href');
      expect(stepHref).toBeTruthy();
      await firstStep.click();
      await expect(page).toHaveURL(new RegExp(`${stepHref}$`));
      await page.goto('/dashboard');
      await clickNav(page, 'Learn');
      await expect(page).toHaveURL(/\/learn$/);
      await expect(page.getByRole('link', { name: /All \d+ concepts/ })).toBeVisible();
      await page.getByRole('link', { name: 'Browse the complete catalogue' }).click();
      await expect(page).toHaveURL(/\/learn\/all$/);
      expect(verifyRequests).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}
