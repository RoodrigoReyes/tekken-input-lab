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

  // Same preference in the generator's combo display.
  await page.getByRole('link', { name: 'TTT2 Generator' }).click();
  const built = page.getByRole('region', { name: 'Built combo' });
  await expect(built.getByRole('radio', { name: '2P · Right' })).toBeChecked();
  await expect(built.locator('svg[data-side]')).toHaveAttribute('data-side', 'right');
  await built.getByRole('radio', { name: '1P · Left' }).click();
  await expect(built.locator('svg[data-side]')).toHaveAttribute('data-side', 'left');
  await built.getByRole('radio', { name: '2P · Right' }).click();

  // Survives a reload.
  await page.reload();
  await expect(page.getByRole('region', { name: 'Built combo' }).getByRole('radio', { name: '2P · Right' })).toBeChecked();
});
