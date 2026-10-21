import { execFileSync } from 'node:child_process';

export default function globalTeardown() {
  if (process.env.PLAYWRIGHT_TEST_DATABASE !== 'true') {
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
    ['exec', '-i', 'real-estate-postgres-test', 'psql', '-U', 'test', '-d', 'realestate_test'],
    { input: cleanupSql, stdio: ['pipe', 'inherit', 'inherit'] },
  );
}
