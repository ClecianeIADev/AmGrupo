# am-grupo-erp Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-27

## Active Technologies
- TypeScript 5.8 + React 19 + Supabase JS Client, Vite 6, Motion, Lucide React, Tailwind CSS v4 (003-rh-module)
- PostgreSQL via Supabase (RLS habilitado) + Supabase Storage (fotos + documentos) (003-rh-module)

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
- **002-process-folders** (`specs/002-process-folders/`): Folder-based process organization — custom folders with colors, stage grouping (Pendente/Em Andamento/Finalizado), search, full RLS isolation. **Reuses existing UI screens** — focus on database integration and hooks.

## Database Schema Updates

### 002-process-folders (current)
- New table: `process_folders` (id, user_id, name, color, created_at, updated_at)
- Modified: `legal_processes` + column `folder_id` (UUID FK, ON DELETE NULLIFY)
- Indexes: `idx_process_folders_user_id`, `idx_legal_processes_folder_id`, `idx_legal_processes_folder_stage`, `idx_process_folders_name`
- RLS policies enforcing user isolation on `process_folders` table

## Frontend Components & Hooks (002-process-folders)

**UI Screens Already Exist** (no new components needed):
- Folder grid — exists in Jurídico > Pipelines > Contencioso Cível > Pastas (existing layout)
- Folder contents view with stage grouping — existing
- Process search within folder — existing
- Note: All visualization reuses existing infrastructure; focus is on database integration

**Modified Components** (minimal changes):
- `ProcessDetailsModal.tsx` — Add "Pasta" dropdown field for folder selection/change
- `ProcessUploadDrawer.tsx` — Support `contextFolderId` prop, link processes to folder on creation

**New Hooks** (in `src/hooks/`):
- `useFolders()` — Folder CRUD + Realtime subscriptions
- `useFolderContents(folderId)` — Fetch + group processes by stage
- `useFolderSearch(folderId, searchTerm)` — Debounced search within folder

**New Types** (in `src/types/folder.ts`):
- `ProcessFolder` — Core folder entity
- `FolderWithProcessCount` — Folder + process count

## Recent Changes
- 003-rh-module: Added TypeScript 5.8 + React 19 + Supabase JS Client, Vite 6, Motion, Lucide React, Tailwind CSS v4

- 2026-03-24: Specification complete for 002-process-folders feature
- 2026-03-24: Created database schema for `process_folders` table with RLS

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
