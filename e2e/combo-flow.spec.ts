import { expect, test } from '@playwright/test';

const NOTATION = 'qcf+1 > uf+2,1 B! > SSL 1~b~uf+4 > f+1,2,1+2';

test('create, view, persist, and delete a combo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Combo Library' })).toBeVisible();
  await expect(page.getByText('No combos yet')).toBeVisible();

  await page.getByRole('link', { name: 'Create a combo' }).click();
  await page.getByLabel('Game').selectOption('t6');
  await page.getByLabel('Character', { exact: true }).fill('Kazuya');
  await page.getByLabel('Combo name').fill('T6 test combo');
  await page.getByLabel('Notation', { exact: true }).fill(NOTATION);

  // Live preview: B! is valid in T6 → no warnings; the Bound label is rendered.
  const preview = page.getByRole('region', { name: 'Live preview' });
  await expect(preview.locator('svg text', { hasText: 'BOUND' })).toBeVisible();
  await expect(page.getByLabel('Notation diagnostics')).toHaveCount(0);

  // Switching to T7 warns about Bound without changing the notation.
  await page.getByLabel('Game').selectOption('t7');
  await expect(page.getByLabel('Notation diagnostics')).toContainText('not a juggle extender');
  await page.getByLabel('Game').selectOption('t6');

  await page.getByRole('button', { name: 'Save combo' }).click();
  await expect(page.getByRole('heading', { name: 'T6 test combo' })).toBeVisible();
  await expect(page.locator('pre')).toHaveText(NOTATION);

  // Survives a reload (IndexedDB).
  await page.reload();
  await expect(page.locator('pre')).toHaveText(NOTATION);

  await page.getByRole('link', { name: '← Library' }).click();
  await expect(page.getByRole('link', { name: 'T6 test combo' })).toBeVisible();
  await page.getByLabel('Search combos').fill('ssl 1~b');
  await expect(page.getByRole('link', { name: 'T6 test combo' })).toBeVisible();
  await page.getByLabel('Search combos').fill('nothing matches');
  await expect(page.getByText('No combos match these filters.')).toBeVisible();
  await page.getByLabel('Search combos').fill('');

  await page.getByRole('link', { name: 'T6 test combo' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('No combos yet')).toBeVisible();
});

test('TTT2 sections differ by dialect', async ({ page }) => {
  await page.goto('/#/new');
  await page.getByLabel('Game').selectOption('ttt2');
  await page.getByLabel('Character', { exact: true }).fill('Kazuya');
  await page.getByLabel('Partner').fill('Armor King');
  await page.getByLabel('Notation', { exact: true }).fill('EWGF, EWGF, df+1,2~5 ; 3+4,2 ; cd+3 W!');

  const preview = page.getByRole('region', { name: 'Live preview' });
  await expect(preview.locator('[aria-label="Tag Assault"]')).toHaveCount(0);
  await expect(page.getByLabel('Character for section 3')).toContainText('unassigned');

  await page.getByLabel('Notation dialect').selectOption('kage-ttt2');
  await expect(preview.locator('[aria-label="Tag Assault"]')).toHaveCount(2);
  await expect(page.getByLabel('Character for section 3')).toContainText('Auto: Kazuya');
});
