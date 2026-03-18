# Implementation Plan: Legal Process Summaries

**Branch**: `001-legal-summaries` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-legal-summaries/spec.md`

## Summary

Implement AI-powered legal process summaries within the Juridico module. Users upload judicial documents (PDF/DOCX/images); a Supabase Edge Function calls Gemini 1.5 Flash to extract parties, dates, quesitos, documents, and generate executive/process summaries. All results are persisted in Supabase with strict per-user RLS. The existing `JuridicoProcessos` view and `ProcessDetailsModal` component are upgraded from mocked data to real data.

---

## Technical Context

**Language/Version**: TypeScript 5.8 (frontend) + TypeScript/Deno (Edge Functions)
**Primary Dependencies**: React 19 + Vite 6 + @supabase/supabase-js@2 + @google/genai (Edge Function only, server-side)
**Storage**: PostgreSQL (Supabase) + Supabase Storage bucket `legal-documents`
**Testing**: Vitest (unit) + manual browser verification per constitution workflow §4
**Target Platform**: Web (React SPA) + Supabase Edge (Deno)
**Project Type**: Web application — Juridico module feature
**Performance Goals**: AI analysis complete ≤ 5 min for ≤ 200-page documents (SC-002); UI response < 300ms for DB reads
**Constraints**: All AI calls via Edge Functions only (Constitution V); no hardcoded colors (Constitution VI); RLS on all tables (Constitution III)
**Scale/Scope**: Single-user file upload, up to 50MB per document; concurrent users handled by Supabase infra

---

## Constitution Check

*GATE: Must pass before implementation begins.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I — Supabase Única Fonte de Verdade** | ✅ PASS | All persistence via Supabase. Gemini called from Edge Function. |
| **II — Auth Google SSO** | ✅ PASS | No new auth. Existing session required. User JWT validated in Edge Function. |
| **III — Privacidade por Usuário** | ✅ PASS | RLS on `legal_processes` (all 4 operations). Storage policies scoped to `auth.uid()`. |
| **IV — Clean Code** | ✅ PASS | Components split by responsibility; logic in hooks; max 200 lines per component. |
| **V — Segurança** | ✅ PASS | `GEMINI_API_KEY` set as Supabase secret (server-side only). DOMPurify for any HTML rendering. |
| **VI — Design Consistente** | ✅ PASS | Existing design system reused. No hardcoded colors. |
| **VII — Sessão Obrigatória** | ✅ PASS | Existing session guard in App.tsx covers all routes. |
| **VIII — Tradução Automática** | ⚠️ DEFERRED | i18n scoped to future sprint. UI labels in PT-BR for now (consistent with existing app). |

**Gate Result: PASS** — Implementation may proceed.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-legal-summaries/
├── plan.md              ← this file
├── spec.md              ← feature specification
├── research.md          ← Phase 0 research decisions
├── data-model.md        ← database schema + types
├── quickstart.md        ← developer setup guide
├── contracts/
│   └── edge-functions.md  ← API contracts
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code Layout

```text
src/
├── types/
│   └── legalProcess.ts          ← LegalProcess TypeScript types (NEW)
├── hooks/
│   └── useLegalProcesses.ts     ← CRUD + Realtime subscription hook (NEW)
├── views/
│   └── JuridicoProcessos.tsx    ← UPGRADE: connect to real Supabase data
└── components/
    └── juridico/
        ├── ProcessUploadDrawer.tsx      ← NEW: file upload + role selection
        ├── ProcessDetailsModal.tsx      ← UPGRADE: real data, 5 tabs
        ├── ProcessAnalysisProgress.tsx  ← NEW: loading state during AI analysis
        └── ProcessSummaryCard.tsx       ← NEW: card for list/grid view

supabase/
├── functions/
│   └── analyze_legal_process/
│       └── index.ts             ← NEW: Gemini extraction Edge Function
└── migrations/
    └── 20260317000001_create_legal_processes.sql  ← NEW: table + RLS + storage
```

---

## Implementation Phases

> **FIRST STEP** (as requested): Database schema before any frontend or Edge Function work.

---

### Phase 1 — Database Foundation *(FIRST — blocks all other work)*

**Goal**: Create the `legal_processes` table, RLS policies, storage bucket, and TypeScript types. All subsequent phases depend on this.

#### 1.1 — Migration: Create `legal_processes` table

File: `supabase/migrations/20260317000001_create_legal_processes.sql`

```sql
-- ============================================================
-- TABLE: legal_processes
-- ============================================================
CREATE TABLE public.legal_processes (
  -- Identity
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document reference (Supabase Storage)
  document_path          TEXT NOT NULL,
  document_name          TEXT NOT NULL,
  document_mime_type     TEXT NOT NULL,

  -- Process identification (auto-extracted by AI)
  process_name           TEXT,
  process_number         TEXT,

  -- Registration
  professional_role      TEXT NOT NULL,

  -- Processing state
  status                 TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','processing','completed','needs_review','error')),
  status_message         TEXT,

  -- AI-generated text summaries
  executive_summary      TEXT,
  process_summary        TEXT,

  -- AI-extracted structured arrays
  parties                JSONB NOT NULL DEFAULT '[]',
  events_timeline        JSONB NOT NULL DEFAULT '[]',
  quesitos               JSONB NOT NULL DEFAULT '[]',
  relevant_documents     JSONB NOT NULL DEFAULT '[]',
  suggested_examinations JSONB NOT NULL DEFAULT '[]',
  critical_dates         JSONB NOT NULL DEFAULT '[]',

  -- Extraction quality
  extraction_confidence  FLOAT CHECK (extraction_confidence BETWEEN 0 AND 1),
  extraction_errors      JSONB NOT NULL DEFAULT '[]',

  -- Audit
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_legal_processes_user_id ON public.legal_processes(user_id);
CREATE INDEX idx_legal_processes_status  ON public.legal_processes(user_id, status);

-- Auto-update updated_at
CREATE TRIGGER trg_legal_processes_updated_at
  BEFORE UPDATE ON public.legal_processes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.legal_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own processes"
  ON public.legal_processes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own processes"
  ON public.legal_processes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own processes"
  ON public.legal_processes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own processes"
  ON public.legal_processes FOR DELETE
  USING (user_id = auth.uid());
```

#### 1.2 — Supabase Storage Bucket & Policies

```sql
-- Storage bucket (also create via Supabase Dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal-documents',
  'legal-documents',
  false,
  52428800,  -- 50MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

#### 1.3 — TypeScript Types

File: `src/types/legalProcess.ts`

Full type definitions from `data-model.md` — `LegalProcess`, `ProcessStatus`, `ProcessRole`, and all entity sub-types.

**Deliverable**: Migration applied + TypeScript types committed.
**Test**: `supabase db push` succeeds; RLS blocks cross-user SELECT in SQL Editor.

---

### Phase 2 — Edge Function: `analyze_legal_process`

**Goal**: Implement the Gemini-powered extraction worker.

**File**: `supabase/functions/analyze_legal_process/index.ts`

#### 2.1 — Function skeleton (auth + ownership check)
- Validate `Authorization` header → JWT → user
- Fetch process row: `WHERE id = process_id AND user_id = caller` → 403 if not found
- Check status is `'pending'` → 409 if already processing/completed

#### 2.2 — Document download
- Use admin client to generate a signed URL for `process.document_path`
- Download bytes via `fetch(signedUrl)`

#### 2.3 — Format normalization
- PDF / JPG / PNG → use as-is
- DOCX → server-side conversion to PDF (or extract text via mammoth-compatible Deno lib)

#### 2.4 — Gemini extraction
- Set `status = 'processing'` before calling Gemini
- Build structured prompt (see `research.md` R-007)
- Call Gemini 1.5 Flash with `response_mime_type: 'application/json'`
- Parse response JSON

#### 2.5 — Persist results
- UPSERT all extracted fields to `legal_processes`
- Compute final status: `extraction_confidence >= 0.7` → `'completed'`; else → `'needs_review'`
- On any Gemini/network error → `status = 'error'`, `status_message = error.message`

**CORS**: Use `getCorsHeaders(req)` pattern from existing edge functions.
**Secrets**: `GEMINI_API_KEY` via `Deno.env.get('GEMINI_API_KEY')`.

**Test**: Upload a sample PDF via SQL insert + invoke locally with `supabase functions serve`.

---

### Phase 3 — Frontend Hook: `useLegalProcesses`

**Goal**: Encapsulate all Supabase interactions for the Processos view.

**File**: `src/hooks/useLegalProcesses.ts`

```typescript
// Responsibilities:
// - fetchProcesses()          → SELECT with user RLS
// - createProcess(file, role) → upload to Storage + INSERT row + invoke edge function
// - deleteProcess(id)         → DELETE storage + DELETE row
// - subscribeToProcess(id)    → Realtime UPDATE subscription
```

Keeps `JuridicoProcessos.tsx` and modal components free of Supabase calls — they only call hook methods and render state.

**Test**: Unit test with Vitest mocking `supabase` client.

---

### Phase 4 — Upload Flow: `ProcessUploadDrawer`

**Goal**: New component replacing the existing mock upload drawer in `JuridicoProcessos.tsx`.

**File**: `src/components/juridico/ProcessUploadDrawer.tsx`

UX flow:
1. Drag-and-drop or click to select file (PDF/DOCX/JPG/PNG)
2. Select professional role (Perito / Assistente Técnico / Advogado / Outro)
3. Confirm → show `ProcessAnalysisProgress` (progress indicator)
4. Realtime subscription on new process row
5. On `completed/needs_review` → open `ProcessDetailsModal`

**Constraints**:
- Max 150 lines; split logic into `useLegalProcesses` hook
- No hardcoded colors; use `var(--color-primary)` and design system classes
- Show FR-003 time warning: "Análise IA: aprox. 5 minutos"

**File**: `src/components/juridico/ProcessAnalysisProgress.tsx`
- Displays animated progress indicator during `processing` status
- Shows elapsed time vs. 5-minute estimate
- Accessible via ARIA live region

---

### Phase 5 — Process Details: Upgrade `ProcessDetailsModal`

**Goal**: Replace mocked `ProcessDetailsModal` with real data from `LegalProcess`.

**File**: `src/components/juridico/ProcessDetailsModal.tsx` (upgrade existing)

Five tabs (matching spec user stories):

| Tab | US | Content |
|-----|-----|---------|
| **Resumo Executivo** | US-3 | `executive_summary` text + `critical_dates` alerts |
| **Resumo do Processo** | US-4 | `process_summary` + `events_timeline` chronology |
| **Quesitos** | US-5 | `quesitos[]` grouped by party |
| **Documentos Relevantes** | US-6 | `relevant_documents[]` with category badges |
| **Exames Sugeridos** | US-7 | `suggested_examinations[]` with priority chips |

**Additional display**: parties list, `professional_role` badge, `extraction_confidence` indicator, `needs_review` warning banner.

**XSS protection**: Any HTML content rendered via `DOMPurify.sanitize()` (already in project).

---

### Phase 6 — Upgrade `JuridicoProcessos` View

**Goal**: Connect the existing view to real data from `useLegalProcesses` hook.

**File**: `src/views/JuridicoProcessos.tsx` (upgrade existing)

Changes:
- Replace mock data arrays with hook state
- Add loading skeleton for initial fetch
- `ProcessSummaryCard` component for grid/list items (NEW — max 80 lines)
- Wire `ProcessUploadDrawer` to the "Novo Processo" button
- Wire `ProcessDetailsModal` with real `LegalProcess` data
- Handle `needs_review` status with visual warning badge (amber)
- Handle `error` status with retry option

---

### Phase 7 — Verification & Edge Cases

**Goal**: Manual browser testing per constitution workflow §4.

Checklist:
- [ ] Upload PDF → status transitions `pending → processing → completed`
- [ ] `ProcessDetailsModal` shows all 5 tabs with real extracted data
- [ ] User A cannot see User B's processes (test with 2 accounts)
- [ ] Unsupported file type shows clear error (before upload attempt)
- [ ] Realtime subscription updates UI without page refresh
- [ ] `needs_review` banner appears when extraction_confidence < 0.7
- [ ] Delete process removes both DB row and Storage file
- [ ] Mobile layout of `ProcessUploadDrawer` works at 375px

---

## Complexity Tracking

> No constitution violations. No additional justifications required.

---

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Spec | `specs/001-legal-summaries/spec.md` | ✅ Complete |
| Research | `specs/001-legal-summaries/research.md` | ✅ Complete |
| Data Model | `specs/001-legal-summaries/data-model.md` | ✅ Complete |
| Contracts | `specs/001-legal-summaries/contracts/edge-functions.md` | ✅ Complete |
| Quickstart | `specs/001-legal-summaries/quickstart.md` | ✅ Complete |
| Tasks | `specs/001-legal-summaries/tasks.md` | ⏳ Run `/speckit.tasks` |
