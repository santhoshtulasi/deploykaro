---
description: Run Prisma database migrations and seed the DeployKaro database
---

# Run Database Migrations & Seed

Use this workflow whenever you make schema changes or need to reset and reseed the database.

## Prerequisites

- Docker must be running (`deploykaro-postgres` healthy)
- Run all commands from the content service directory

## Steps

1. Verify the database is reachable:
```bash
docker compose ps deploykaro-postgres
```

2. Navigate to the content service:
```bash
cd d:\deploykaro\services\content
```

3. Generate the Prisma client (always do this after schema changes):
```bash
npx prisma generate
```

4. Run pending migrations:
```bash
npx prisma migrate dev
```

5. Seed the database with initial data:
```bash
npx prisma db seed
```

6. (Optional) Open Prisma Studio to visually verify the data:
```bash
npx prisma studio
```
> Prisma Studio opens at http://localhost:5555

## Full Reset (wipe everything and start fresh)

If you need to start from scratch:
```bash
cd d:\deploykaro\services\content
npx prisma migrate reset
```
> This will: drop all tables → re-run all migrations → re-run seed

## Verify Success

After seeding, check that data was inserted:
```bash
cd d:\deploykaro\services\content
npx prisma studio
```

Look for rows in: `Module`, `Concept`, `Track`, `User` tables.
