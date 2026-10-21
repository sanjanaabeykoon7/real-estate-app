import { test, expect, type Page } from '@playwright/test';

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD are required');
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.locator('#email').fill(adminEmail);
  await page.locator('#password').fill(adminPassword);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/listings/);
}

test('admin can log in and log out', async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page.getByRole('heading', { name: 'Manage Listings' })).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('#email')).toBeVisible();
});

test('non-admin user is rejected from the admin panel', async ({ page }) => {
  const email = `playwright-user-${Date.now()}@example.com`;
  const response = await page.request.post('http://localhost:3002/api/auth/register', {
    data: {
      name: 'Playwright Regular User',
      email,
      password: 'Playwright123!',
      role: 'USER',
    },
  });
  expect(response.ok()).toBeTruthy();

  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('Playwright123!');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
});

test('admin can create and manage a listing', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('button', { name: 'Add Listing' }).click();

  const title = `Playwright Listing ${Date.now()}`;
  await page.locator('input[name="title"]').fill(title);
  await page.locator('textarea[name="description"]').fill('Created by an end-to-end test.');
  await page.locator('input[name="price"]').fill('750000');
  await page.locator('input[name="beds"]').fill('3');
  await page.locator('input[name="baths"]').fill('2');
  await page.locator('input[name="sqft"]').fill('1800');
  await page.locator('input[name="location"]').fill('Colombo');
  const createListingResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/listings') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Create Listing' }).click();
  await createListingResponse;
  await expect(page.getByText(title)).toBeVisible();
});

test('admin can create and view a user', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Users' }).click();
  await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible();

  const email = `playwright-admin-user-${Date.now()}@example.com`;
  await page.getByRole('button', { name: 'Add User' }).click();
  await page.locator('input[name="name"]').fill('Playwright Admin Test User');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Playwright123!');
  await page.locator('select[name="role"]').selectOption('USER');
  await page.getByRole('button', { name: 'Create User' }).click();

  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText('Playwright Admin Test User')).toBeVisible();
});

test('image upload shows a validation error for an empty file', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('button', { name: 'Add Listing' }).click();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'empty.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(0),
  });

  await expect(page.getByText('No file provided')).toBeVisible();
});
