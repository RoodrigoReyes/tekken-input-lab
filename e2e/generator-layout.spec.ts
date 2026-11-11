import { expect, test } from '@playwright/test';

test('generator options panel scrolls on its own on wide screens', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Stacked layout on small screens: the page scrolls instead.');
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto('/#/generator');
  await expect(page.getByText('Loading the combo guide')).toHaveCount(0, { timeout: 10_000 });
  const options = page.getByRole('complementary', { name: 'Generator options' });
  const box = await options.evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight, overflow: getComputedStyle(el).overflowY }));
  expect(box.overflow).toBe('auto');
  expect(box.scroll).toBeGreaterThan(box.client);
  // The panel fits in the viewport below the header.
  expect((await options.boundingBox())!.height).toBeLessThanOrEqual(700 - 72);

  // Once the page scrolls, the panel sticks under the header and its own scroll reaches the last option.
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(async () => Math.round((await options.boundingBox())!.y)).toBe(72);
  await options.hover();
  await page.mouse.wheel(0, 2000);
  await expect.poll(() => options.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect(options.getByText('Only pieces without notation warnings')).toBeInViewport();
});
