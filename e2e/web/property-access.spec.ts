import { test, expect } from '@playwright/test';

const agentEmail = process.env.PLAYWRIGHT_AGENT_EMAIL;
const agentPassword = process.env.PLAYWRIGHT_AGENT_PASSWORD;

if (!agentEmail || !agentPassword) {
  throw new Error('PLAYWRIGHT_AGENT_EMAIL and PLAYWRIGHT_AGENT_PASSWORD are required');
}
import type { Page } from '@playwright/test';

async function loginAsAgent(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'User Profile' }).click();
  await page.getByPlaceholder('Email').fill(agentEmail);
  await page.getByPlaceholder('Password').fill(agentPassword);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard\/profile/);
}

test('user can view property details', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'View Details' }).first().click();

  await expect(page).toHaveURL(/\/listings\/.+/);
  await expect(page.getByRole('heading', { name: 'Villa 1' })).toBeVisible();
  await expect(page.getByText('300,000')).toBeVisible();
  await expect(page.getByText('Austin')).toBeVisible();
  await expect(page.getByText('Lovely home in a quiet neighborhood.')).toBeVisible();
});

test('authenticated user can add and remove a favorite', async ({ page }) => {
  await loginAsAgent(page);
  await page.goto('/');
  await page.locator('a[href^="/listings/"]').first().click();
  await expect(page).toHaveURL(/\/listings\/.+/);

  const favoriteButton = page.locator(
    'button[title="Add to favorites"], button[title="Remove from favorites"]',
  ).first();
  if ((await favoriteButton.getAttribute('title')) === 'Remove from favorites') {
    await favoriteButton.click();
    await expect(page.locator('button[title="Add to favorites"]')).toBeVisible();
  }
  await favoriteButton.click();
  await expect(page.locator('button[title="Remove from favorites"]')).toBeVisible();

  await page.goto('/dashboard/favorites');
  await expect(page.getByRole('heading', { name: 'My Favorites' })).toBeVisible();
  await expect(page.getByText('Villa 1')).toBeVisible();
});

test('unauthenticated user cannot access the dashboard', async ({ page }) => {
  await page.goto('/dashboard/profile');

  await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
  await expect(page.getByText('Please log in to access your dashboard.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to Home' })).toBeVisible();
});
