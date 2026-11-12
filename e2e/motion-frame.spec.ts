import { expect, test, type Locator } from '@playwright/test';

/** On phones the display controls sit folded under the display. */
async function showDisplayOptions(region: Locator): Promise<void> {
  await region.waitFor();
  const fold = region.getByText('Display options');
  if (await fold.isVisible()) await fold.click();
}

test('motions are bare arrows by default; the frame toggle is shared and remembered', async ({ page }) => {
  await page.goto('/#/new');
  await page.getByLabel('Notation', { exact: true }).fill('cd+4,1, ff+3');
  const preview = page.getByRole('region', { name: 'Live preview' });
  const svg = preview.locator('svg[data-motion-frame]');
  await showDisplayOptions(preview);
  const toggle = preview.getByRole('button', { name: 'Frame motions' });

  await expect(svg).toHaveAttribute('data-motion-frame', 'off');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(preview.locator('[aria-label="cd"] rect')).toHaveCount(0);

  await toggle.click();
  await expect(svg).toHaveAttribute('data-motion-frame', 'on');
  await expect(preview.locator('[aria-label="cd"] rect, [aria-label="ff"] rect')).toHaveCount(2);
  // The notation text is never rewritten.
  await expect(page.getByLabel('Notation', { exact: true })).toHaveValue('cd+4,1, ff+3');

  // Same preference in the generator's combo display.
  // The editor hides the tab bar on phones (its save bar takes the place), so go by URL.
  await page.goto('/#/generator');
  const built = page.getByRole('region', { name: 'Built combo' });
  await showDisplayOptions(built);
  await expect(built.getByRole('button', { name: 'Frame motions' })).toHaveAttribute('aria-pressed', 'true');
  await expect(built.locator('svg[data-motion-frame]')).toHaveAttribute('data-motion-frame', 'on');

  // Survives a reload.
  await page.reload();
  await showDisplayOptions(page.getByRole('region', { name: 'Built combo' }));
  await expect(page.getByRole('region', { name: 'Built combo' }).getByRole('button', { name: 'Frame motions' })).toHaveAttribute('aria-pressed', 'true');
});
