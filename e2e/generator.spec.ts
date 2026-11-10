import { expect, test } from '@playwright/test';

test('generate a TTT2 team combo from the guide, use it and save it', async ({ page }) => {
  await page.goto('/#/new');
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  await page.getByLabel('Game').selectOption('ttt2');

  const panel = page.locator('details', { hasText: 'Generate from guide' });
  await expect(panel.getByText('Loading the combo guide')).toHaveCount(0, { timeout: 10_000 });
  await panel.getByLabel('Team: point (starts the combo)').selectOption('Kazuya');
  await panel.getByLabel('Team: tag-in teammate').selectOption('Nina');

  const status = panel.getByRole('status');
  await expect(status).toContainText('36 combos · 2 routes reaching B! × 9 TA fillers × 2 enders');
  await expect(panel.getByRole('listitem', { name: 'Generated combo 1', exact: true })).toBeVisible();

  // Wall context switches lists; starters filter routes.
  await panel.getByLabel('Where').selectOption('wall');
  await expect(status).toContainText('× 4 TA fillers × 3 enders');
  await panel.getByLabel('Where').selectOption('open');
  await panel.getByLabel('Starter', { exact: true }).selectOption('EWGF');
  await expect(status).toContainText('18 combos');

  await panel.getByRole('listitem', { name: 'Generated combo 1', exact: true }).getByRole('button', { name: 'Use this combo' }).click();
  const notation = page.getByLabel('Notation', { exact: true });
  await expect(notation).toHaveValue(/^Kazuya:\nEWGF > b\+2,4 > db\+2 B! > TA!\nNina:\n/);
  await expect(page.getByLabel('Combo name')).toHaveValue('Kazuya + Nina: EWGF → TA!');
  await expect(page.getByRole('region', { name: 'Live preview' }).locator('svg text', { hasText: 'NINA' })).toBeVisible();

  await page.getByRole('button', { name: 'Save combo' }).click();
  await expect(page.getByRole('heading', { name: 'Kazuya + Nina: EWGF → TA!' })).toBeVisible();
  await expect(page.getByText('#generated')).toBeVisible();
  await expect(page.getByText(/Not tested yet/)).toBeVisible();
});
