import type { Page } from '@playwright/test';

/**
 * Click a primary nav destination at any viewport.
 *
 * `SiteHeader` renders the Primary nav only at `lg:` and above; below that the
 * same destinations live inside a `<details>` "Menu" disclosure
 * (`nav aria-label="Compact"`), so the mobile project cannot click the header
 * links directly.
 *
 * Commit 4de5acc ("unify navigation across learning surfaces") also deleted the
 * `div.fixed.bottom-0` bottom tab bar that the mobile specs used to drive.
 * Those specs stayed red afterwards without anyone noticing, because e2e does
 * not run in CI and the WebKit browser was never installed locally.
 */
export async function clickNav(page: Page, name: string) {
  // Scope to the header and take the first match: the same destination exists
  // twice in the DOM at all times (Primary nav + the collapsed Compact menu),
  // so an unscoped role query is a strict-mode violation.
  const header = page.locator('header');
  const primary = header.getByRole('link', { name, exact: true }).first();
  // `isVisible()` is an instantaneous check with no auto-wait. Called straight
  // after a navigation the header is briefly unpainted, so a bare isVisible()
  // reports false and this would wrongly fall back to the compact menu — which
  // is itself hidden at desktop widths, and the click then hangs for the full
  // timeout. Wait briefly for the real answer instead.
  try {
    await primary.waitFor({ state: 'visible', timeout: 3000 });
    await primary.click();
    return;
  } catch {
    // Below `lg` the Primary nav genuinely never appears; use the disclosure.
  }
  await header.locator('summary', { hasText: 'Menu' }).click();
  await page
    .getByRole('navigation', { name: 'Compact' })
    .getByRole('link', { name, exact: true })
    .click();
}
