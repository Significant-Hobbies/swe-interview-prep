import { expect, test } from '@playwright/test';

const repairedTracingConfiguration = `application:
  env:
    # @slot propagators
    OTEL_PROPAGATORS: tracecontext,baggage
    # @slot sampler
    OTEL_TRACES_SAMPLER: parentbased_traceidratio
    # @slot sampler-ratio
    OTEL_TRACES_SAMPLER_ARG: "0.10"
    # @slot trace-exporter
    OTEL_TRACES_EXPORTER: otlp
    # @slot otlp-endpoint
    OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4317

collector:
  # @slot otlp-receiver
  receivers: { otlp: { protocols: { grpc: {} } } }
  processors:
    batch: {}
  # @slot cloud-exporter
  exporters: { googlecloud: {} }
  service:
    pipelines:
      # @slot trace-pipeline
      traces: { receivers: [otlp], processors: [batch], exporters: [googlecloud] }
`;

test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  });
  await page
    .addStyleTag({ content: '[data-saasmaker-widget]{display:none!important}' })
    .catch(() => {});
});

test('Systems Lab catalog and runner stay bounded at required review widths', async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/labs');
    await expect(
      page.getByRole('heading', { name: 'Make the mechanism move.', exact: true })
    ).toBeVisible();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
      )
    ).toBe(true);

    await page.goto('/labs/trace-propagation-sampling');
    await expect(
      page.getByRole('heading', {
        name: 'Trace context and the sampling branch',
        exact: true,
      })
    ).toBeVisible();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
      )
    ).toBe(true);

    for (const label of ['Freeze prediction', 'Validate build', 'Finish', 'Replay']) {
      const control = page.getByRole('button', { name: label, exact: true });
      await expect(control).toBeVisible();
      expect((await control.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  }
});

test('a guest can complete a deterministic lab using only the keyboard', async ({ page }) => {
  await page.goto('/labs/trace-propagation-sampling');
  await expect(
    page.getByRole('heading', {
      name: 'Trace context and the sampling branch',
      exact: true,
    })
  ).toBeVisible();

  const prediction = page.getByRole('radio', {
    name: 'No. The in-process sampling branch drops it before export.',
    exact: true,
  });
  await prediction.focus();
  await page.keyboard.press('Space');
  await expect(prediction).toBeChecked();

  const freeze = page.getByRole('button', { name: 'Freeze prediction', exact: true });
  await freeze.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Prediction frozen', { exact: true })).toBeVisible();

  const configuration = page.getByRole('textbox', {
    name: 'Edit observability/telemetry.yaml',
    exact: true,
  });
  await configuration.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(repairedTracingConfiguration);

  const validate = page.getByRole('button', { name: 'Validate build', exact: true });
  await validate.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('configuration verified', { exact: true })).toBeVisible();
  await expect(page.getByText('8/8 pass', { exact: true })).toBeVisible();

  const finish = page.getByRole('button', { name: 'Finish', exact: true });
  await finish.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Your prediction matched', exact: true })
  ).toBeVisible();

  const explanation = page.getByRole('textbox', {
    name: 'Explain the causal chain',
    exact: true,
  });
  await explanation.focus();
  await page.keyboard.insertText(
    'ParentBased selects the remote-parent delegate, the sampling evidence records DROP, and a sampled incoming parent would change the outcome.'
  );
  await expect(explanation).toHaveValue(/sampling evidence records DROP/);
  await expect(page.getByText(/Saved locally/)).toBeVisible();
});
