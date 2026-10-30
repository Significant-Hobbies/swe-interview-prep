import { expect, test } from '@playwright/test';

test('cold guest entry defers settings and footer styles preserve the learning layout', async ({
  context,
  page,
}) => {
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    return ['127.0.0.1', 'localhost'].includes(host) ? route.continue() : route.abort();
  });
  const settingsRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('SettingsModal')) settingsRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Prepare for interviews/ })).toBeVisible();
  expect(settingsRequests).toEqual([]);
  await page.waitForFunction(
    () => !!document.querySelector<HTMLLinkElement>('link[data-studio-footer]')?.sheet
  );
  const geometry = await page.evaluate(() => {
    const stylesheet = document.querySelector<HTMLLinkElement>('link[data-studio-footer]')!;
    const hero = document.querySelector('[aria-labelledby="home-hero"] > div')!;
    const read = () => ({
      padding: getComputedStyle(hero).paddingLeft,
      width: hero.getBoundingClientRect().width,
    });
    const enabled = read();
    stylesheet.disabled = true;
    const disabled = read();
    stylesheet.disabled = false;
    return { enabled, disabled, restored: read() };
  });
  expect(geometry.enabled).toEqual(geometry.disabled);
  expect(geometry.restored).toEqual(geometry.enabled);

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  expect(settingsRequests.length).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'AI (optional)', exact: true }).click();
  const endpoint = page.getByPlaceholder('https://api.openai.com/v1');
  await endpoint.fill('https://example.invalid/unsaved-draft');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(endpoint).toHaveValue('https://example.invalid/unsaved-draft');
});
