import { defineConfig, devices } from '@playwright/test';

const webBaseURL = process.env.PLAYWRIGHT_WEB_BASE_URL ?? 'http://localhost:3002';
const adminBaseURL =
  process.env.PLAYWRIGHT_ADMIN_BASE_URL ?? 'http://localhost:3003';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: webBaseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  metadata: {
    webBaseURL,
    adminBaseURL,
    testUserEmail: process.env.PLAYWRIGHT_TEST_USER_EMAIL ?? '',
    testUserPassword: process.env.PLAYWRIGHT_TEST_USER_PASSWORD ?? '',
    adminEmail: process.env.PLAYWRIGHT_ADMIN_EMAIL ?? '',
    adminPassword: process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? '',
  },
  projects: [
    {
      name: 'web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: webBaseURL,
      },
      testMatch: /e2e\/(?:web|api)\/.*\.spec\.ts/,
    },
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: adminBaseURL,
      },
      testMatch: /e2e\/admin\/.*\.spec\.ts/,
    },
  ],
});
