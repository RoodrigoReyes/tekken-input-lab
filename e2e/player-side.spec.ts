import { expect, test, type Locator } from '@playwright/test';

/** On phones the display controls sit folded under the display. */
async function showDisplayOptions(region: Locator): Promise<void> {
  await region.waitFor();
  const fold = region.getByText('Display options');
  if (await fold.isVisible()) await fold.click();
}

test('2P side mirrors the arcade display in the editor and the TTT2 generator, and is remembered', async ({ page }) => {
  await page.goto('/#/new');
  await page.getByLabel('Notation', { exact: true }).fill('df+1, f+2');
  const preview = page.getByRole('region', { name: 'Live preview' });
  const svg = preview.locator('svg[data-side]');
  await showDisplayOptions(preview);
  await expect(svg).toHaveAttribute('data-side', 'left');
  await expect(preview.locator('[data-direction="df"] > g')).toHaveAttribute('transform', /^rotate\(45 /);

  await preview.getByRole('radio', { name: '2P · Right' }).click();
  await expect(svg).toHaveAttribute('data-side', 'right');
  await expect(preview.locator('[data-direction="df"] > g')).toHaveAttribute('transform', /^rotate\(135 /);
  await expect(preview.locator('[data-direction="f"] > g')).toHaveAttribute('transform', /^rotate\(180 /);
  // The notation text is never rewritten.
  await expect(page.getByLabel('Notation', { exact: true })).toHaveValue('df+1, f+2');

  // Same preference in the generator's combo display.
  // The editor hides the tab bar on phones (its save bar takes the place), so go by URL.
  await page.goto('/#/generator');
  const built = page.getByRole('region', { name: 'Built combo' });
  await showDisplayOptions(built);
  await expect(built.getByRole('radio', { name: '2P · Right' })).toBeChecked();
  await expect(built.locator('svg[data-side]')).toHaveAttribute('data-side', 'right');
  await built.getByRole('radio', { name: '1P · Left' }).click();
  await expect(built.locator('svg[data-side]')).toHaveAttribute('data-side', 'left');
  await built.getByRole('radio', { name: '2P · Right' }).click();

  // Survives a reload.
  await page.reload();
  await showDisplayOptions(page.getByRole('region', { name: 'Built combo' }));
  await expect(page.getByRole('region', { name: 'Built combo' }).getByRole('radio', { name: '2P · Right' })).toBeChecked();
});
