import { expect, test } from '@playwright/test';

const jobDescription = `We are hiring a Senior Backend Engineer.
You will design reliable APIs and build idempotent distributed workflows.
Kubernetes experience is required. Payroll compliance experience is preferred.`;

const analysis = {
  roleTitle: 'Senior Backend Engineer',
  summary: 'A backend role focused on reliable services and production operation.',
  requirements: [
    {
      label: 'Reliable API design',
      importance: 'must',
      sourcePhrase: 'design reliable APIs',
      conceptIds: ['api-design', 'idempotency'],
      confidence: 0.95,
      rationale: 'The catalog covers API contracts and replay-safe request handling.',
    },
    {
      label: 'Kubernetes operation',
      importance: 'must',
      sourcePhrase: 'Kubernetes experience is required',
      conceptIds: ['containers-kubernetes'],
      confidence: 0.98,
      rationale: 'The catalog directly covers containers and Kubernetes reconciliation.',
    },
  ],
  unsupported: [
    {
      label: 'Payroll compliance',
      importance: 'preferred',
      sourcePhrase: 'Payroll compliance experience is preferred',
      rationale: 'The current curriculum does not cover payroll regulation.',
    },
  ],
};

test('maps a job description, activates the sanitized target, and opens its Sweep', async ({
  page,
}) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ text: JSON.stringify(analysis) })}\n\ndata: [DONE]\n\n`,
    })
  );

  await page.goto('/learn');
  await expect(page.getByRole('link', { name: /prepare for a role/i })).toBeVisible();
  await page.getByRole('link', { name: /prepare for a role/i }).click();
  await expect(
    page.getByRole('heading', { name: /turn the role into a learning target/i })
  ).toBeVisible();

  await page.getByLabel('Role title').fill('Senior Backend Engineer');
  await page.getByLabel('Job description').fill(jobDescription);
  await page.getByRole('button', { name: /map role to curriculum/i }).click();

  await expect(page.getByRole('heading', { name: 'Senior Backend Engineer' })).toBeVisible();
  await expect(page.getByText('Why these concepts matched')).toBeVisible();
  await expect(page.getByText('Payroll compliance', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /edit input/i }).click();
  await page
    .getByLabel('Job description')
    .fill(`${jobDescription}\nObservability experience is also required.`);
  await expect(page.getByText('Why these concepts matched')).not.toBeVisible();
  await page.getByLabel('Job description').fill(jobDescription);
  await page.getByRole('button', { name: /map role to curriculum/i }).click();
  await expect(page.getByText('Why these concepts matched')).toBeVisible();

  await page.getByRole('button', { name: /use this as my target/i }).click();
  await expect(page.getByText('Active role target')).toBeVisible();
  await expect(page.getByRole('link', { name: /start role sweep/i }).first()).toBeVisible();

  if (process.env.CAPTURE_ROLE_FIT === '1') {
    await page.locator('.skip-link').evaluate((element) => {
      (element as HTMLElement).style.display = 'none';
    });
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.screenshot({
        path: `artifacts/design/role-fit-after-${width}.png`,
        fullPage: true,
      });
    }
  }

  await page.reload();
  await expect(page.getByText('Saved learning target')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Senior Backend Engineer' }).last()).toBeVisible();
  await expect(page.getByText(/original job description was not retained/i)).toBeVisible();

  await page
    .getByRole('link', { name: /sweep role concepts/i })
    .first()
    .click();
  await expect(page.getByText(/role sweep · senior backend engineer/i)).toBeVisible();
  await expect(page.getByText(/remaining/i)).toBeVisible();
});
