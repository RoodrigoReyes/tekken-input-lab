import { expect, test } from '@playwright/test';

test('generate a TTT2 team combo from the guide, use it and save it', async ({ page }) => {
  // The editor links to the generator when the game is TTT2.
  await page.goto('/#/new');
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  await page.getByLabel('Game').selectOption('ttt2');
  // Unsaved work survives the trip to the generator and back.
  await page.getByLabel('Notes').fill('Keep me');
  await page.getByRole('link', { name: /Generate from guide/ }).click();

  await expect(page.getByRole('heading', { name: 'TTT2 Combo Generator' })).toBeVisible();
  const options = page.getByRole('complementary', { name: 'Generator options' });
  const results = page.getByRole('region', { name: 'Generated combos' });
  await expect(page.getByText('Loading the combo guide')).toHaveCount(0, { timeout: 10_000 });
  await options.getByLabel('Point character').selectOption('Kazuya');
  await options.getByLabel('Tag-in teammate').selectOption('Nina');

  const status = results.getByRole('status');
  await expect(status).toContainText('36 combos · 2 routes reaching B! × 9 TA fillers × 2 enders');
  await expect(results.getByRole('listitem', { name: 'Generated combo 1', exact: true })).toBeVisible();

  // Wall context switches lists; starters filter routes.
  // Radio group: arrow keys move the selection.
  await options.getByRole('radio', { name: 'Open ground' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(options.getByRole('radio', { name: 'At the wall' })).toBeChecked();
  await expect(options.getByRole('radio', { name: 'At the wall' })).toBeFocused();
  await expect(status).toContainText('× 4 TA fillers × 3 enders');
  await options.getByRole('radio', { name: 'Open ground' }).click();
  await options.getByLabel('Starter', { exact: true }).selectOption('EWGF');
  await expect(status).toContainText('18 combos');

  // Same character twice asks for two different characters.
  await options.getByLabel('Tag-in teammate').selectOption('Kazuya');
  await expect(results.getByText('Same character chosen twice')).toBeVisible();
  await options.getByLabel('Tag-in teammate').selectOption('Nina');

  await results.getByRole('listitem', { name: 'Generated combo 1', exact: true }).getByRole('button', { name: 'Use this combo' }).click();
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  const notation = page.getByLabel('Notation', { exact: true });
  await expect(notation).toHaveValue(/^Kazuya:\nEWGF > b\+2,4 > db\+2 B! > TA!\nNina:\n/);
  await expect(page.getByLabel('Combo name')).toHaveValue('Kazuya + Nina: EWGF → TA!');
  await expect(page.getByLabel('Notes')).toHaveValue(/^Keep me\n\nGenerated from/);
  await expect(page.getByRole('region', { name: 'Live preview' }).locator('svg text', { hasText: 'NINA' })).toBeVisible();

  await page.getByRole('button', { name: 'Save combo' }).click();
  await expect(page.getByRole('heading', { name: 'Kazuya + Nina: EWGF → TA!' })).toBeVisible();
  await expect(page.getByText('#generated')).toBeVisible();
  await expect(page.getByText(/Not tested yet/)).toBeVisible();
});
