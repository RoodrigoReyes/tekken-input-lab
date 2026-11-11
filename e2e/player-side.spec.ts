import { expect, test } from '@playwright/test';

test('2P side mirrors the arcade display in the editor and the TTT2 generator, and is remembered', async ({ page }) => {
  await page.goto('/#/new');
  await page.getByLabel('Notation', { exact: true }).fill('df+1, f+2');
  const preview = page.getByRole('region', { name: 'Live preview' });
  const svg = preview.locator('svg[data-side]');
  await expect(svg).toHaveAttribute('data-side', 'left');
  await expect(preview.locator('[data-direction="df"] > g')).toHaveAttribute('transform', /^rotate\(45 /);

  await preview.getByRole('radio', { name: '2P · Right' }).click();
  await expect(svg).toHaveAttribute('data-side', 'right');
  await expect(preview.locator('[data-direction="df"] > g')).toHaveAttribute('transform', /^rotate\(135 /);
  await expect(preview.locator('[data-direction="f"] > g')).toHaveAttribute('transform', /^rotate\(180 /);
  // The notation text is never rewritten.
  await expect(page.getByLabel('Notation', { exact: true })).toHaveValue('df+1, f+2');

  // Same preference in the generator, which has its own toggle.
  await page.getByRole('link', { name: 'TTT2 Generator' }).click();
  const options = page.getByRole('complementary', { name: 'Generator options' });
  await expect(options.getByRole('radio', { name: '2P · Right' })).toBeChecked();
  const first = page.getByRole('listitem', { name: 'Generated combo 1', exact: true });
  await expect(first.locator('svg[data-side]')).toHaveAttribute('data-side', 'right');
  await options.getByRole('radio', { name: '1P · Left' }).click();
  await expect(first.locator('svg[data-side]')).toHaveAttribute('data-side', 'left');
  await options.getByRole('radio', { name: '2P · Right' }).click();

  // Survives a reload.
  await page.reload();
  await expect(page.getByRole('complementary', { name: 'Generator options' }).getByRole('radio', { name: '2P · Right' })).toBeChecked();
});
