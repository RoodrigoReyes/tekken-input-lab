import { expect, test } from '@playwright/test';

test('explore: edit a copy of a community combo without touching the original', async ({ page }) => {
  await page.goto('/#/explore');
  const card = page.locator('article').first();
  await expect(card).toBeVisible();
  const source = (await card.locator('p.font-mono').textContent()) ?? '';

  await card.getByRole('link', { name: 'Edit a copy' }).click();
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  const notation = page.getByLabel('Notation', { exact: true });
  await expect(notation).not.toHaveValue('');
  await expect(page.getByLabel('Notes')).toHaveValue(/^Source: https:\/\/tekken8combo\.kagewebsite\.com\//);

  // Edit the copy and save it as a new library combo.
  await page.getByLabel('Combo name').fill('My edited copy');
  await notation.fill(`${await notation.inputValue()} > 1,2`);
  await page.getByRole('button', { name: 'Save combo' }).click();
  await expect(page.getByRole('heading', { name: 'My edited copy' })).toBeVisible();

  // The community combo is unchanged.
  await page.goto('/#/explore');
  await expect(page.locator('article').first().locator('p.font-mono')).toHaveText(source);
});

test('explore: edit a copy of a Tekken 6 piece', async ({ page }) => {
  await page.goto('/#/explore');
  await page.getByRole('button', { name: 'T6', exact: true }).click();
  await page.getByLabel('Character').selectOption({ label: 'Kazuya' });
  const wall = page.getByRole('heading', { name: 'Wall combos' }).locator('..');
  await wall.getByRole('link', { name: 'Edit a copy' }).first().click();
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  await expect(page.getByLabel('Game')).toHaveValue('t6');
  await expect(page.getByLabel('Notation', { exact: true })).toHaveValue(/B!/);
});
