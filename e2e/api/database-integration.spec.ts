import { execFileSync } from 'node:child_process';
import { test, expect, type Page } from '@playwright/test';

const webBaseUrl = process.env.PLAYWRIGHT_WEB_BASE_URL ?? 'http://localhost:3002';
const agentEmail = process.env.PLAYWRIGHT_AGENT_EMAIL;
const agentPassword = process.env.PLAYWRIGHT_AGENT_PASSWORD;

if (!agentEmail || !agentPassword) {
  throw new Error('PLAYWRIGHT_AGENT_EMAIL and PLAYWRIGHT_AGENT_PASSWORD are required');
}

function queryDockerDatabase(sql: string) {
  return execFileSync(
    'docker',
    ['exec', '-i', 'real-estate-postgres', 'psql', '-U', 'dev', '-d', 'realestate', '-tA'],
    { input: `${sql}\n`, encoding: 'utf8' },
  ).trim();
}

async function loginAsAgent(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'User Profile' }).click();
  await page.getByPlaceholder('Email').fill(agentEmail);
  await page.getByPlaceholder('Password').fill(agentPassword);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard\/profile/);
}

test('registration API creates a user that is readable in PostgreSQL', async ({ request }) => {
  const email = `api-integration-${Date.now()}@example.com`;
  const response = await request.post(`${webBaseUrl}/api/auth/register`, {
    data: {
      name: 'API Integration User',
      email,
      password: 'Playwright123!',
      role: 'USER',
    },
  });

  expect(response.status()).toBe(200);
  expect((await response.json()).user.email).toBe(email);

  const databaseRow = queryDockerDatabase(
    `select "name" || '|' || "role" from "User" where "email" = '${email}';`,
  );
  expect(databaseRow).toBe('API Integration User|USER');

  queryDockerDatabase(`delete from "User" where "email" = '${email}';`);
});

test('authenticated listing API changes persist and can be read from PostgreSQL', async ({ page }) => {
  await loginAsAgent(page);

  const title = `API Integration Listing ${Date.now()}`;
  const createResponse = await page.request.post(`${webBaseUrl}/api/listings`, {
    data: {
      title,
      description: 'Created through the real listing API.',
      price: 1250000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      location: 'Colombo',
      images: ['https://example.com/integration-test.jpg'],
      published: false,
      address: {
        street: 'Integration Test Street',
        city: 'Colombo',
        state: 'Western Province',
        zipCode: '00100',
        country: 'Sri Lanka',
      },
    },
  });

  expect(createResponse.status()).toBe(201);
  const listing = await createResponse.json();
  expect(listing.title).toBe(title);

  const databaseRow = queryDockerDatabase(
    `select "title" || '|' || "location" from "Listing" where "id" = '${listing.id}';`,
  );
  expect(databaseRow).toBe(`${title}|Colombo`);

  const readResponse = await page.request.get(`${webBaseUrl}/api/listings`);
  expect(readResponse.ok()).toBeTruthy();
  expect((await readResponse.json()).some((item: { id: string }) => item.id === listing.id)).toBeTruthy();

  const deleteResponse = await page.request.delete(`${webBaseUrl}/api/listings/${listing.id}`);
  expect(deleteResponse.ok()).toBeTruthy();
  expect(
    queryDockerDatabase(`select count(*) from "Listing" where "id" = '${listing.id}';`),
  ).toBe('0');
});

test('protected API routes reject unauthenticated requests', async ({ request }) => {
  const listingsResponse = await request.get(`${webBaseUrl}/api/listings`);
  expect(listingsResponse.status()).toBe(401);

  const favoriteResponse = await request.post(`${webBaseUrl}/api/favorites`, {
    data: { listingId: 'missing-listing-id' },
  });
  expect(favoriteResponse.status()).toBe(401);
});

test('registration API rejects invalid input with a validation error', async ({ request }) => {
  const response = await request.post(`${webBaseUrl}/api/auth/register`, {
    data: {
      name: '',
      email: 'not-an-email',
      password: 'short',
    },
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe('VALIDATION_ERROR');
});
