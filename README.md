# Real Estate Hub

A comprehensive real estate platform built as a monorepo using Turborepo. This application enables users to browse, list, and manage properties, with dedicated interfaces for web users and administrators. It includes features for property listings, user authentication, favorites management, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Database Management](#database-management)

## Features

- **Web Page + User Dashboard**: Browse properties, search by location/price/bedrooms, add to favorites, and manage personal profiles.
- **Admin Dashboard**: Manage listings and users.
- **Property Management**: Create, edit, and publish listings with image uploads via Cloudinary.
- **Authentication**: Secure user registration and login using NextAuth with role-based access (User, Agent, Moderator, Super Admin).
- **Favorites System**: Save and view favorite properties.
- **Search and Filtering**: Advanced search capabilities for properties.
- **Responsive Design**: Mobile-friendly UI using Tailwind CSS.
- **Documentation App**: Built-in docs for development and usage reference.

## Tech Stack

### Frontend
- **React Framework**: Next.js 15
- **UI Library**: Custom React component library
- **Styling framework**: Tailwind CSS

### Backend
- **Server-side API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (with JWT)
- **File Storage**: Cloudinary

### Development & Architecture
- **Monorepo Tool**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript
- **State Management**: TanStack Query (React Query)
- **Code Quality**: ESLint + Prettier with custom configurations

### Infrastructure
- **Build System**: Next.js with Turbopack
- **Deployment**: 
- **CI/CD**: 

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database (local or hosted, e.g., via Docker)
- Environment variables: Set up `.env` files in relevant apps/packages (e.g., `DATABASE_URL`, `NEXTAUTH_SECRET`, Cloudinary credentials)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sanjanaabeykoon7/real-estate-app.git
   cd real-estate-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   - Update `DATABASE_URL` in `.env` (root or packages/database).
   - Run migrations and seed:
     ```bash
     pnpm run db:migrate
     pnpm run db:seed
     ```

### Running the Application

- Start all apps in development mode:
  ```bash
  pnpm dev
  ```

- Individual apps:
  - Web: `http://localhost:3002` (main user interface)
  - Admin: `http://localhost:3003` (admin dashboard)
  - Docs: `http://localhost:3001` (documentation)

- Build for production:
  ```bash
  pnpm build
  ```

- Lint and type-check:
  ```bash
  pnpm lint
  pnpm check-types
  ```

## Project Structure

This is a Turborepo monorepo with the following structure:

```
├── README.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── turbo.json
├── apps/
│   ├── admin/          # Admin dashboard (Next.js)
│   ├── docs/           # Documentation site (Next.js)
│   └── web/            # Main web app (Next.js)
└── packages/
    ├── database/       # Prisma schema, migrations, and client
    ├── eslint-config/  # Shared ESLint configurations
    ├── typescript-config/ # Shared TypeScript configs
    └── ui/             # Shared React UI components
```

- **apps/web**: Handles user-facing features like property browsing, favorites, and dashboards.
- **apps/admin**: Admin tools for managing users and listings.
- **packages/database**: Prisma setup with schema for Users, Listings, and SavedProperties.
- **packages/ui**: Reusable components like `ImageUpload`.

## Database Management

- Schema: Defined in `packages/database/prisma/schema.prisma`.
- Commands (from root):
  - Generate client: `pnpm run db:generate`
  - Push schema: `pnpm run db:push`
  - Run migrations: `pnpm run db:migrate`
  - Seed data: `pnpm run db:seed`
  - Studio: `pnpm run db:studio` (Prisma Studio at http://localhost:5432)

Default seeded users:
- Admin: `admin@realestate.com` / `admin@1234` (SUPER_ADMIN)
- Agent: `agent@realestate.com` / `agent@1234` (AGENT, with sample listings)

---

<!--# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
