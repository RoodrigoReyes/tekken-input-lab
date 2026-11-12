import { expect, test } from '@playwright/test';

test('build a TTT2 team combo phase by phase, use it and save it', async ({ page }) => {
  // The editor links to the generator when the game is TTT2.
  await page.goto('/#/new');
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  await page.getByLabel('Game').selectOption('ttt2');
  // Unsaved work survives the trip to the generator and back.
  await page.getByRole('button', { name: /Combo details/ }).click();
  await page.getByLabel('Notes').fill('Keep me');
  await page.getByRole('link', { name: /Generate from guide/ }).click();

  await expect(page.getByRole('heading', { name: 'TTT2 Combo Generator' })).toBeVisible();
  const options = page.getByRole('group', { name: 'Generator options' });
  const result = page.getByRole('region', { name: 'Generated combo' });
  await expect(page.getByText('Loading the combo guide')).toHaveCount(0, { timeout: 10_000 });
  await options.getByLabel('Point character').selectOption('Kazuya');
  await options.getByLabel('Tag-in teammate').selectOption('Nina');

  // One combo at a time, built from three layers.
  const status = result.getByRole('status');
  await expect(status).toContainText('routes reaching B!');
  const route = result.getByRole('region', { name: 'Phase 1: Route' });
  const filler = result.getByRole('region', { name: 'Phase 2: TA filler' });
  const ender = result.getByRole('region', { name: 'Phase 3: Ender' });
  await expect(route.getByText(/^Kazuya · 1\//)).toBeVisible();
  await expect(filler.getByText(/^Nina · /)).toBeVisible();
  await expect(route.getByLabel('About this route')).toContainText('When');

  // Pick the EWGF route from the dropdown.
  const ewgf = await route.getByLabel('Route', { exact: true }).locator('option', { hasText: /^EWGF · / }).first().getAttribute('value');
  await route.getByLabel('Route', { exact: true }).selectOption(ewgf!);
  const notation = result.getByLabel('Combo notation');
  await expect(notation).toContainText(/^Kazuya:\nEWGF > /);

  // Step through enders with the arrows: the combo follows.
  const before = await notation.textContent();
  await ender.getByRole('button', { name: 'Next ender' }).click();
  await expect(notation).not.toHaveText(before!);
  await ender.getByRole('button', { name: 'Previous ender' }).click();
  await expect(notation).toHaveText(before!);

  // The arcade display shows the built combo.
  await expect(result.getByRole('region', { name: 'Built combo' }).locator('[data-kind="sectionHeader"]').first()).toContainText(/kazuya/i);

  // Wall context switches the lists.
  await options.getByRole('radio', { name: 'At the wall' }).click();
  await expect(status).toContainText('4 TA fillers · 3 enders');
  await options.getByRole('radio', { name: 'Open ground' }).click();

  // Same character twice asks for two different characters.
  await options.getByLabel('Tag-in teammate').selectOption('Kazuya');
  await expect(result.getByText('Same character chosen twice')).toBeVisible();
  await options.getByLabel('Tag-in teammate').selectOption('Nina');

  // Swap: the teammate starts the combo instead.
  await options.getByRole('button', { name: 'Swap point and teammate' }).click();
  await expect(options.getByLabel('Point character')).toHaveValue('Nina');
  await expect(options.getByLabel('Tag-in teammate')).toHaveValue('Kazuya');
  await expect(notation).toContainText(/^Nina:\n/);
  await options.getByRole('button', { name: 'Swap point and teammate' }).click();
  await expect(options.getByLabel('Point character')).toHaveValue('Kazuya');
  await route.getByLabel('Route', { exact: true }).selectOption(ewgf!);

  // Folding the setup leaves a one-line summary.
  await options.getByRole('button', { name: /Team & setup/ }).click();
  await expect(options.getByText('Kazuya → Nina · Open ground')).toBeVisible();
  await expect(options.getByLabel('Point character')).toBeHidden();
  await options.getByRole('button', { name: /Team & setup/ }).click();

  await result.getByRole('button', { name: 'Use this combo' }).click();
  await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();
  const editorNotation = page.getByLabel('Notation', { exact: true });
  await expect(editorNotation).toHaveValue(/^Kazuya:\nEWGF > b\+2,4 > db\+2 B! > TA!\nNina:\n/);
  await expect(page.getByLabel('Combo name')).toHaveValue('Kazuya + Nina: EWGF → TA!');
  await expect(page.getByLabel('Notes')).toHaveValue(/^Keep me\n\nGenerated from/);
  await expect(page.getByRole('region', { name: 'Live preview' }).locator('svg text', { hasText: 'NINA' })).toBeVisible();

  await page.getByRole('button', { name: 'Save combo' }).click();
  await expect(page.getByRole('heading', { name: 'Kazuya + Nina: EWGF → TA!' })).toBeVisible();
  await expect(page.getByText('#generated')).toBeVisible();
  await expect(page.getByText(/Not tested yet/)).toBeVisible();
});
