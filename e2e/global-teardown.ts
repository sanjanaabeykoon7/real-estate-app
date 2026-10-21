import { execFileSync } from 'node:child_process';

export default function globalTeardown() {
  const databaseContainer =
    process.env.PLAYWRIGHT_DATABASE_CONTAINER ?? 'real-estate-postgres-test';
  if (process.env.PLAYWRIGHT_TEST_DATABASE !== 'true' && !process.env.PLAYWRIGHT_DATABASE_CONTAINER) {
    return;
  }

  const cleanupSql = `
    delete from "SavedProperty"
    where "userId" in (select "id" from "User" where "email" like 'playwright-%')
       or "listingId" in (select "id" from "Listing" where "title" like 'Playwright %');
    delete from "Listing" where "title" like 'Playwright %';
    delete from "User" where "email" like 'playwright-%';
  `;

  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      databaseContainer,
      'psql',
      '-U',
      process.env.PLAYWRIGHT_DATABASE_USER ?? 'test',
      '-d',
      process.env.PLAYWRIGHT_DATABASE_NAME ?? 'realestate_test',
    ],
    { input: cleanupSql, stdio: ['pipe', 'inherit', 'inherit'] },
  );
}
