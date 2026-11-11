import { expect, test } from '@playwright/test';

test('motions are bare arrows by default; the frame toggle is shared and remembered', async ({ page }) => {
  await page.goto('/#/new');
  await page.getByLabel('Notation', { exact: true }).fill('cd+4,1, ff+3');
  const preview = page.getByRole('region', { name: 'Live preview' });
  const svg = preview.locator('svg[data-motion-frame]');
  const toggle = preview.getByRole('button', { name: 'Frame motions' });

  await expect(svg).toHaveAttribute('data-motion-frame', 'off');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(preview.locator('[aria-label="cd"] rect')).toHaveCount(0);

  await toggle.click();
  await expect(svg).toHaveAttribute('data-motion-frame', 'on');
  await expect(preview.locator('[aria-label="cd"] rect, [aria-label="ff"] rect')).toHaveCount(2);
  // The notation text is never rewritten.
  await expect(page.getByLabel('Notation', { exact: true })).toHaveValue('cd+4,1, ff+3');

  // Same preference in the generator, which has its own toggle.
  await page.getByRole('link', { name: 'TTT2 Generator' }).click();
  const options = page.getByRole('complementary', { name: 'Generator options' });
  await expect(options.getByRole('button', { name: 'Frame motions' })).toHaveAttribute('aria-pressed', 'true');
  const first = page.getByRole('listitem', { name: 'Generated combo 1', exact: true });
  await expect(first.locator('svg[data-motion-frame]')).toHaveAttribute('data-motion-frame', 'on');

  // Survives a reload.
  await page.reload();
  await expect(page.getByRole('complementary', { name: 'Generator options' }).getByRole('button', { name: 'Frame motions' })).toHaveAttribute('aria-pressed', 'true');
});
