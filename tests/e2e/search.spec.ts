import { expect, test } from '@playwright/test';

test('location search routes to events with params', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/location/i).fill('Boise, ID');
  await page.getByLabel(/radius/i).selectOption('100');
  await page.getByRole('button', { name: /search events/i }).click();
  await expect(page).toHaveURL(/events\?location=Boise%2C\+ID&radius=100/);
  await expect(page.getByText(/active filter/i)).toBeVisible();
});
