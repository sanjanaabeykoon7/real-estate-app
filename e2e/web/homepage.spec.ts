import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/real estate/i);
  await expect(page.locator('body')).toBeVisible();
});
