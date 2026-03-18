# am-grupo-erp Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-17

## Active Technologies

- TypeScript 5.8 + React 19 + Vite 6 (frontend SPA)
- Supabase (Auth, PostgreSQL, Storage, Edge Functions, Realtime)
- Deno + TypeScript (Edge Functions runtime)
- @google/genai — Gemini 1.5 Flash (server-side only, via Edge Functions)
- DOMPurify (XSS sanitization)
- Motion (micro-animations)
- Lucide React (icons)
- Tailwind CSS v4 (via @tailwindcss/vite)

## Project Structure

```text
src/
├── views/           # Full-page views (one per module/route)
├── components/      # Reusable UI components (domain-organized: juridico/, etc.)
├── hooks/           # Custom React hooks (data fetching + business logic)
├── types/           # TypeScript type definitions
└── lib/
    └── supabase.ts  # Supabase client (sessionStorage, no localStorage)

supabase/
├── functions/       # Deno Edge Functions (snake_case names)
└── migrations/      # SQL migrations (apply via supabase db push)
```

## Commands

```bash
npm run dev          # Start Vite dev server on port 3000
npm run build        # Production build
npm run lint         # TypeScript type-check (tsc --noEmit)
supabase db push     # Apply pending migrations
supabase functions deploy <name>   # Deploy an Edge Function
supabase functions serve <name>    # Local Edge Function dev
```

## Code Style

- **Components**: max 150–200 lines; logic in hooks, UI in component
- **Colors**: always use CSS variables from `index.css` — never hardcode hex values
- **Auth**: sessionStorage only (never localStorage); session expires on browser close
- **API calls**: all external API calls (Gmail, Gemini, etc.) via Edge Functions — never from frontend
- **Tokens**: OAuth provider_token retrieved server-side via `get_user_provider_token()` RPC
- **XSS**: all HTML from external sources sanitized with DOMPurify before rendering
- **Secrets**: in `.env` or Supabase Edge Function secrets — never in source code

## Active Features

- **001-legal-summaries** (`specs/001-legal-summaries/`): AI-powered legal process summaries — Gemini extraction, legal_processes table, ProcessDetailsModal with 5 tabs

## Recent Changes

- 2026-03-17: Added `legal_processes` table + RLS + Supabase Storage (`legal-documents` bucket)
- 2026-03-17: Refactored OAuth provider_token to server-side only (Edge Function RPC)
- 2026-03-17: Installed DOMPurify for XSS protection on email HTML rendering
- 2026-03-17: Auth session changed to sessionStorage (expires on browser close)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
