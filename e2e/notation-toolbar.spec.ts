import { expect, test } from '@playwright/test';

test('token buttons can be undone and redone with Ctrl+Z / Ctrl+Shift+Z', async ({ page }) => {
  await page.goto('/#/new');
  const notation = page.getByLabel('Notation', { exact: true });
  await notation.fill('df');

  await page.getByRole('button', { name: '+ (Pressed together)' }).click();
  await page.getByRole('button', { name: '1', exact: true }).click();
  await expect(notation).toHaveValue('df+1');
  await expect(notation).toBeFocused();

  await page.keyboard.press('Control+z');
  await expect(notation).toHaveValue('df+');
  await page.keyboard.press('Control+z');
  await expect(notation).toHaveValue('df');

  await page.keyboard.press('Control+Shift+z');
  await expect(notation).toHaveValue('df+');
  await page.keyboard.press('Control+Shift+z');
  await expect(notation).toHaveValue('df+1');
});
