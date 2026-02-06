import { expect, test } from '@playwright/test';

test('homepage loads and shows hero + quick search', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /find rodeos/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /find events near your location/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /search events/i })).toBeVisible();
});
