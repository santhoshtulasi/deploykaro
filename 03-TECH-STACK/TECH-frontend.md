# TECH STACK — Frontend
## DeployKaro: Frontend Technology Decisions

---

## Framework: Next.js 14 (App Router)

**Why Next.js 14:**
- Server-side rendering for fast initial page load (critical for Tier-2/3 city users on slow connections)
- App Router enables streaming responses (mentor chat streams token by token)
- Built-in image optimization for animation assets
- Edge runtime support for low-latency API routes

**Key Next.js Features Used:**
- `app/` directory with React Server Components
- Streaming with `Suspense` for mentor chat responses
- `next/image` for optimized animation asset delivery
- Route handlers for lightweight BFF (Backend for Frontend) API calls

---

## Language: TypeScript (strict mode)

All frontend code in TypeScript with strict mode enabled.
No `any` types allowed. All API responses typed with Zod schemas.

---

## Styling: Tailwind CSS + shadcn/ui

**Tailwind CSS:**
- Utility-first, no custom CSS files
- Custom design tokens for DeployKaro brand colors
- Dark mode support (many developers prefer dark mode)

**shadcn/ui:**
- Accessible component library built on Radix UI
- Copy-paste components, not a dependency (full control)
- Used for: Dialog, Tabs, Progress, Badge, Button, Card

---

## Animation: Framer Motion + D3.js

**Framer Motion:**
- All concept animations (Layer 1 and Layer 2 visuals)
- Page transitions
- Mentor chat message entrance animations
- Achievement badge reveal animations

**D3.js:**
- Interactive infrastructure diagrams
- Pipeline flow visualizations
- Real-time data visualizations (monitoring dashboards in Track 5)

---

## Terminal: xterm.js + WebContainers API

**xterm.js:**
- Browser-based terminal emulator
- Full ANSI color support (colored Docker output)
- Copy-paste support
- Resize handling

**WebContainers API (StackBlitz):**
- Runs Node.js natively in the browser via WebAssembly
- No backend needed for Node.js sandbox exercises
- Instant environment — no spin-up time

**For Docker exercises:**
- WebContainers handles Node.js/npm tasks
- Docker commands routed to backend sandbox service (ECS task)

---

## Internationalization: i18next + react-i18next

**Languages Supported (MVP):**
- English (en)
- Tamil (ta) — UI labels and static text
- Kannada (kn) — UI labels and static text
- Telugu (te) — UI labels and static text

**Note:** Dynamic mentor responses are handled by AI personas, not i18n files.
i18n covers: navigation labels, button text, error messages, onboarding UI.

---

## State Management

**Zustand** (lightweight, no boilerplate):
- User session state (persona, language, current track, progress)
- Mentor chat history (last 50 messages)
- Sandbox terminal state

**React Query (TanStack Query):**
- Server state management
- API calls with caching, retry, background refresh
- Optimistic updates for progress tracking

---

## Frontend Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (login, signup)
│   ├── (dashboard)/            # Main app pages
│   │   ├── tracks/             # Learning tracks
│   │   ├── mentor/             # Mentor chat
│   │   └── sandbox/            # Terminal sandbox
│   └── api/                    # Route handlers (BFF)
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── mentor/                 # Mentor chat components
│   ├── visual/                 # Animation components
│   ├── terminal/               # xterm.js wrapper
│   └── tracks/                 # Track/module components
│
├── lib/
│   ├── nvidia.ts               # NVIDIA NIM API client
│   ├── auth.ts                 # Auth utilities
│   └── analytics.ts            # Event tracking
│
├── stores/                     # Zustand stores
├── hooks/                      # Custom React hooks
└── types/                      # TypeScript type definitions
```

---

## Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5s |
| Time to Interactive (TTI) | < 3s |
| Mentor first response | < 2s |
| Animation load time | < 500ms |
| Lighthouse Performance Score | > 85 |
| Works on 3G connection | Yes |
