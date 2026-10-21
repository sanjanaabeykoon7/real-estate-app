import { test, expect } from '@playwright/test';

const agentEmail = process.env.PLAYWRIGHT_AGENT_EMAIL;
const agentPassword = process.env.PLAYWRIGHT_AGENT_PASSWORD;

if (!agentEmail || !agentPassword) {
  throw new Error('PLAYWRIGHT_AGENT_EMAIL and PLAYWRIGHT_AGENT_PASSWORD are required');
}

test('user can register an account', async ({ page }) => {
  const email = `playwright-${Date.now()}@example.com`;

  await page.goto('/');
  await page.getByRole('button', { name: 'User Profile' }).click();
  await page.getByRole('button', { name: 'Register here!' }).click();

  await page.getByPlaceholder('Full Name').fill('Playwright User');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password', { exact: true }).fill('Playwright123!');
  await page.getByPlaceholder('Retype Password').fill('Playwright123!');
  await page.getByRole('button', { name: 'Select User Type' }).click();
  await page.getByRole('button', { name: 'Property Buyer/Renter' }).click();
  await page.getByLabel('terms').check();
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(/\/dashboard\/profile/);
  await expect(page.getByRole('heading', { name: 'Playwright User' })).toBeVisible();
});

test('user can log in and log out', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'User Profile' }).click();
  await page.getByPlaceholder('Email').fill(agentEmail);
  await page.getByPlaceholder('Password').fill(agentPassword);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/dashboard\/profile/);
  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: 'User Profile' })).toBeVisible();
});

test('user can browse properties', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Latest Properties' })).toBeVisible();
  await expect(page.getByText('Villa 1')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Details' }).first()).toBeVisible();
});

test('user can search and filter properties', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Location').fill('Austin');
  await page.getByLabel('Bedrooms').selectOption('4');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page).toHaveURL(/city=Austin/);
  await expect(page).toHaveURL(/beds=4/);
  await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible();
  await expect(page.getByText(/found .* properties matching your criteria/i)).toBeVisible();
});
