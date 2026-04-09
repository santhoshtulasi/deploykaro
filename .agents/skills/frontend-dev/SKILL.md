---
name: frontend-dev
description: How to develop and debug the DeployKaro Next.js frontend — running dev server, building, environment variables, and common debugging steps.
---

## Overview

The DeployKaro frontend is a **Next.js 14** application using the App Router, TypeScript, and NextAuth for authentication.

- **Location:** `d:\deploykaro\frontend\`
- **Dev URL:** http://localhost:3000
- **Package manager:** npm (or pnpm)
- **Auth:** NextAuth v5 (connected to Keycloak on port 8080)

## Structure

```
d:\deploykaro\frontend\
├── app\                   ← Next.js App Router pages & layouts
│   ├── (auth)\            ← Auth-related pages (login, register)
│   ├── (dashboard)\       ← Protected dashboard pages
│   └── api\               ← API routes (including NextAuth)
├── components\            ← Reusable React components
├── lib\                   ← Utilities, auth config, API clients
├── public\                ← Static assets
├── .env.local             ← Frontend env vars (NextAuth, API URLs)
└── next.config.ts         ← Next.js configuration
```

## Commands

### Install dependencies
```bash
cd d:\deploykaro\frontend
npm install
```

### Start development server
```bash
cd d:\deploykaro\frontend
npm run dev
# Opens at http://localhost:3000
```

### Build for production
```bash
cd d:\deploykaro\frontend
npm run build
```

### Type check (without building)
```bash
cd d:\deploykaro\frontend
npx tsc --noEmit
```

### Lint
```bash
cd d:\deploykaro\frontend
npm run lint
```

## Key Environment Variables (frontend .env.local)

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-char-secret>
AUTH_ISSUER=http://localhost:8080/realms/deploykaro
AUTH_CLIENT_ID=deploykaro-app
AUTH_CLIENT_SECRET=local-dev-secret
NEXT_PUBLIC_CONTENT_API_URL=http://localhost:3001
NEXT_PUBLIC_MENTOR_AI_URL=http://localhost:8000
```

## Common Issues

- **NextAuth 404 on /api/auth/** → Make sure `NEXTAUTH_URL` is set correctly in `.env.local`
- **Keycloak redirect fails** → Keycloak must be running on port 8080. Check `docker compose ps`.
- **TypeScript errors on build** → Run `npx tsc --noEmit` first to see all type errors.
- **Content API 500 errors** → Ensure `services/content` is running on port 3001.
- **Hydration errors** → Usually caused by mismatched server/client rendering — check use of `useEffect` for browser-only code.
