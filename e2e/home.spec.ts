import { expect, test } from '@playwright/test';

test('home: two entry points, recent combos and a single create button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Turn notation into arcade commands' })).toBeVisible();
  const start = page.getByRole('navigation', { name: 'Get started' });
  await expect(start.getByRole('link')).toHaveCount(2);
  // Games are listed oldest first.
  await expect(start.getByRole('list', { name: 'Supported games' }).getByRole('listitem')).toHaveText(['T6', 'TTT2', 'T7', 'T8']);
  // Home has its own create card: no second "+ New" button in the top bar.
  await expect(page.getByRole('link', { name: 'New combo' })).toHaveCount(0);
  await expect(page.getByText('No combos yet')).toBeVisible();

  // The editor's game list follows the same order.
  await start.getByRole('link', { name: /^Create a combo/ }).click();
  await expect(page.getByLabel('Game').locator('option')).toHaveText(['Tekken 6', 'Tekken Tag Tournament 2', 'Tekken 7', 'Tekken 8']);
  await page.getByLabel('Combo name').fill('Home test');
  await page.getByLabel('Notation', { exact: true }).fill('df+1, f+2');
  await page.getByRole('button', { name: 'Save combo' }).click();
  await expect(page.getByRole('heading', { name: 'Home test' })).toBeVisible();

  // Saved combos show up on the home page, with a link to the library.
  await page.getByRole('link', { name: 'Tekken Input Lab home' }).click();
  const recent = page.getByRole('region', { name: 'Recent combos' });
  await expect(recent.getByRole('link', { name: 'Home test' })).toBeVisible();
  await recent.getByRole('link', { name: /View library/ }).click();
  await expect(page.getByRole('heading', { name: 'Combo Library' })).toBeVisible();
  // One create button in the library: the top bar's.
  await expect(page.getByRole('link', { name: /new combo/i })).toHaveCount(1);

  // The generator card opens the generator.
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Get started' }).getByRole('link', { name: /^TTT2 combo generator/ }).click();
  await expect(page.getByRole('heading', { name: 'TTT2 Combo Generator' })).toBeVisible();
});
