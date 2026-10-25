# Real Estate Hub

Real Estate Hub is a full-stack real estate platform built as a pnpm/Turborepo
monorepo. It provides a public property-browsing application, user dashboards,
and a separate administrator application for managing users and listings.

## Features

- Property browsing, details, search, and filtering
- User registration, login, logout, profiles, and protected dashboards
- Favorites management
- Listing creation, editing, publishing, and deletion
- Role-based authorization for users, agents, moderators, and administrators
- Admin user and listing management
- Cloudinary image uploads
- Responsive UI built with Tailwind CSS
- API and PostgreSQL persistence through Prisma

## Technology

- **Applications:** Next.js 15, React 19, TypeScript
- **Monorepo:** Turborepo and pnpm
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js with JWT sessions
- **File storage:** Cloudinary
- **Testing:** Vitest, Testing Library, and Playwright
- **Containers:** Docker and Docker Compose
- **CI:** GitHub Actions
- **Deployment:** Vercel for the web and admin applications, with Neon
  PostgreSQL

## Project structure

```text
apps/
├── admin/          # Administrator dashboard
├── docs/           # Documentation application
└── web/            # Public application, dashboards, and API routes

packages/
├── database/       # Prisma schema, migrations, client, and seed scripts
├── eslint-config/  # Shared ESLint configuration
├── typescript-config/ # Shared TypeScript configuration
└── ui/             # Shared UI components

e2e/
├── admin/          # Admin Playwright tests
├── api/            # API and database integration tests
└── web/            # Public web Playwright tests
```

The `web` application contains the public frontend and its Next.js API routes.
The `admin` application is a separate Next.js application.

## Prerequisites

- Node.js 18 or newer
- pnpm 9
- Docker Desktop for the local container workflow
- A PostgreSQL database for local development, testing, or deployment

Install dependencies from the repository root:

```bash
pnpm install
```

## Environment variables

Environment files are intentionally ignored by Git. Do not commit credentials
or copy production secrets into the repository.

For local development, configure the environment files used by each tool:

- `apps/web/.env` for the web application
- `apps/admin/.env.local` for the admin application
- `packages/database/.env` for Prisma commands
- `apps/web/.env.docker` and `apps/admin/.env.docker` for Docker Compose

Common application variables are:

```env
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-local-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

The admin application uses port `3003` and should use its own local
`NEXTAUTH_URL`. Vercel environment variables are configured in the Vercel
dashboard rather than committed to the repository.

## Local development

Start all development applications:

```bash
pnpm dev
```

Default local URLs:

- Web: <http://localhost:3002>
- Admin: <http://localhost:3003>
- Docs: <http://localhost:3001>

Run an individual application with a filter:

```bash
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter docs dev
```

## Database management

The Prisma schema and migrations are in
`packages/database/prisma`.

Generate Prisma Client:

```bash
pnpm db:generate
```

Apply the current schema during local development:

```bash
pnpm db:push
```

Apply committed migrations to a deployed database:

```bash
pnpm --filter database exec prisma migrate deploy
```

Seed the database:

```bash
pnpm db:seed
```

The seed script creates an administrator. It creates the demo agent and sample
listings only when `NODE_ENV` is not `production`. Provide `ADMIN_EMAIL` and
`ADMIN_PASSWORD` explicitly when seeding a deployed database.

For Neon or another hosted PostgreSQL provider, use the provider's connection
string in the command environment.

Open Prisma Studio with:

```bash
pnpm --filter database exec prisma studio
```

## Docker Desktop

The main Compose file runs PostgreSQL, web, and admin services:

```bash
docker compose up -d --build
```

Services and host ports:

- PostgreSQL: `localhost:5433`
- Web: <http://localhost:3002>
- Admin: <http://localhost:3003>

Stop the services and remove the local database volume:

```bash
docker compose down --volumes --remove-orphans
```

The Dockerfiles are:

- `apps/web/Dockerfile`
- `apps/admin/Dockerfile`

Both use multi-stage builds, generate the required Prisma Client, and run
Next.js standalone output.

## Testing

Run the Vitest unit, component, and backend validation tests:

```bash
pnpm test:run
```

The test database is isolated from local and production databases. Start and
seed it with:

```bash
pnpm test:db:reset
```

The isolated PostgreSQL container uses host port `5434`. Stop it with:

```bash
pnpm test:db:down
```

The Playwright suite covers:

- Web homepage, registration, login/logout, browsing, search, details,
  favorites, and protected routes
- Admin login/logout, authorization, listing management, user management, and
  upload validation
- Real API routes with direct PostgreSQL persistence assertions

Run the end-to-end suite after the required applications and test database are
running:

```bash
pnpm test:e2e
```

Playwright uses separate projects so web/API tests run against port `3002` and
admin tests run against port `3003`. Reports are written to
`playwright-report/`; screenshots, traces, and videos are retained for failed
tests according to the Playwright configuration.

## Quality checks

```bash
pnpm lint
pnpm check-types
pnpm build
```

The web and admin builds generate Prisma Client before running `next build`.

## GitHub Actions CI

The workflow in `.github/workflows/ci.yml` runs on pushes to `main` and on pull
requests. It:

1. Installs dependencies with the repository's pnpm version
2. Generates Prisma Client
3. Runs linting and TypeScript checks
4. Runs Vitest
5. Builds the Docker images
6. Starts PostgreSQL and initializes a CI database
7. Starts the web and admin containers
8. Installs Chromium and runs Playwright
9. Uploads Playwright reports and failure artifacts
10. Shuts down containers even when an earlier step fails

CI uses non-production credentials and a disposable Docker PostgreSQL database.

## Deployment

The web and admin applications are deployed as separate Vercel projects from
the `main` branch:

### Web project

- Root directory: `.`
- Build command: `pnpm --filter web build`
- Output directory: `apps/web/.next`
- Install command: `pnpm install --frozen-lockfile`

### Admin project

- Root directory: `.`
- Build command: `pnpm --filter admin build`
- Output directory: `apps/admin/.next`
- Install command: `pnpm install --frozen-lockfile`

Configure environment variables in each Vercel project. Use each project's
production URL as its `NEXTAUTH_URL`, and use a strong production
`NEXTAUTH_SECRET`. The web and admin projects may use the same Neon
`DATABASE_URL`, but each must have the credentials required by its own
application.

Before using the deployed applications, apply the committed Prisma migrations
to Neon and seed the production administrator. Use the Neon direct connection
for migrations:

```powershell
$env:DATABASE_URL="YOUR_NEON_DIRECT_CONNECTION_STRING"
pnpm.cmd --filter database exec prisma migrate deploy

$env:NODE_ENV="production"
$env:ADMIN_EMAIL="YOUR_PRODUCTION_ADMIN_EMAIL"
$env:ADMIN_PASSWORD="YOUR_PRODUCTION_ADMIN_PASSWORD"
pnpm.cmd --filter database db:seed
```

Keep a previous deployment available until the production checks
finish successfully.

## Security notes

- Never commit `.env` files, passwords, database URLs, or Cloudinary secrets.
- Use separate credentials for local development, CI, and production.
- Rotate any credential that has been exposed or shared.
- Do not use production credentials in tests or GitHub Actions.
