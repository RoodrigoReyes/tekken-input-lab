import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const NOTATION = 'df+2 > 1,2 > T! > dash > f+2,1';

test('export SVG/PNG and back up / restore the library', async ({ page }) => {
  await page.goto('/#/new');
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  await page.getByLabel('Character', { exact: true }).fill('Jin');
  await page.getByLabel('Combo name').fill('Export me');
  await page.getByLabel('Notation', { exact: true }).fill(NOTATION);
  await page.getByRole('button', { name: 'Save combo' }).click();
  await expect(page.getByRole('heading', { name: 'Export me' })).toBeVisible();

  const svgDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  await page.getByRole('button', { name: 'Export SVG' }).click();
  const svg = await readFile(await (await svgDownload).path(), 'utf8');
  expect(svg).toContain('<svg');
  expect(svg).toContain('TORNADO');

  const pngDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  await page.getByRole('button', { name: 'Export PNG' }).click();
  const png = await readFile(await (await pngDownload).path());
  expect(png.subarray(1, 4).toString()).toBe('PNG');

  await page.getByRole('link', { name: '← Library' }).click();
  const jsonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const backupPath = await (await jsonDownload).path();
  const backup = JSON.parse(await readFile(backupPath, 'utf8'));
  expect(backup.combos[0].notation).toBe(NOTATION);

  // Wipe IndexedDB, then restore from the backup.
  await page.evaluate(() => new Promise((resolve) => { const r = indexedDB.deleteDatabase('tekken-input-lab'); r.onsuccess = r.onerror = r.onblocked = resolve; }));
  await page.reload();
  await expect(page.getByText('No combos yet')).toBeVisible();
  await page.getByLabel('Import backup file').setInputFiles(backupPath);
  await expect(page.getByRole('link', { name: 'Export me' })).toBeVisible();
  await page.getByRole('link', { name: 'Export me' }).click();
  await expect(page.locator('pre')).toHaveText(NOTATION);
});
