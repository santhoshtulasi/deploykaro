---
name: prisma-db
description: How to work with Prisma ORM in DeployKaro — running migrations, seeding the database, generating the client, and resetting the database.
---

## Overview

DeployKaro uses **Prisma ORM** in the Content Service (`d:\deploykaro\services\content\`) to manage the PostgreSQL schema, migrations, and seed data.

- **Schema file:** `d:\deploykaro\services\content\prisma\schema.prisma`
- **Seed file:** `d:\deploykaro\services\content\prisma\seed.ts`
- **DATABASE_URL:** `postgresql://deploykaro:deploykaro@localhost:5432/deploykaro`

## Prerequisites

- Docker must be running with `deploykaro-postgres` healthy
- Must run all Prisma commands from inside `d:\deploykaro\services\content\`

## Commands

### Generate Prisma Client (after schema changes)
```bash
cd d:\deploykaro\services\content
npx prisma generate
```

### Run Migrations (apply schema changes to DB)
```bash
cd d:\deploykaro\services\content
npx prisma migrate dev --name <migration-name>
```

### Apply Migrations in CI / prod (no prompt)
```bash
npx prisma migrate deploy
```

### Seed the database
```bash
cd d:\deploykaro\services\content
npx prisma db seed
```

### Open Prisma Studio (visual DB browser)
```bash
cd d:\deploykaro\services\content
npx prisma studio
# Opens at http://localhost:5555
```

### Reset DB (wipe + re-migrate + re-seed)
```bash
cd d:\deploykaro\services\content
npx prisma migrate reset
```

### Inspect current DB schema
```bash
cd d:\deploykaro\services\content
npx prisma db pull
```

## Common Issues

- **"Can't reach database server"** → Docker postgres not running. Run `docker compose --env-file .env.local up -d`.
- **"Unknown field in input type"** → Prisma client is out of sync. Run `npx prisma generate`.
- **Migration drift** → Run `npx prisma migrate status` to see pending migrations.
- **Seed fails with type error** → Check that field names in `seed.ts` match the Prisma schema column mappings (not the DB column names — use the Prisma model field names).

## Schema Conventions

- Model field names use **camelCase** (e.g., `examDomains`)
- DB column names use **snake_case** (e.g., `exam_domains`) — mapped via `@map`
- Always run `npx prisma generate` after editing `schema.prisma`
