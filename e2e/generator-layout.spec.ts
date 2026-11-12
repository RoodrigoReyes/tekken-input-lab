import { expect, test } from '@playwright/test';

test('generator: the three phases sit side by side and the combo is visible without scrolling', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Stacked layout on small screens: the page scrolls instead.');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/generator');
  await expect(page.getByText('Loading the combo guide')).toHaveCount(0, { timeout: 10_000 });
  const phases = ['Phase 1: Route', 'Phase 2: TA filler', 'Phase 3: Ender'].map((name) => page.getByRole('region', { name }));
  const tops = await Promise.all(phases.map(async (p) => Math.round((await p.boundingBox())!.y)));
  expect(new Set(tops).size).toBe(1);
  await expect(page.getByRole('region', { name: 'Built combo' }).locator('svg').first()).toBeInViewport();
});
