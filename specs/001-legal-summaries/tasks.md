# Tasks: Legal Process Summaries

**Input**: Design documents from `/specs/001-legal-summaries/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅
**Tests**: Not requested — no test tasks generated.
**Organization**: Tasks grouped by user story for independent delivery and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: Which user story this task belongs to (US1…US7)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create file structure and TypeScript types before any implementation begins.

- [ ] T001 Create migration file `supabase/migrations/20260317000001_create_legal_processes.sql` (empty file, ready to fill in Phase 2)
- [ ] T002 [P] Create Edge Function directory and entry point file `supabase/functions/analyze_legal_process/index.ts` (empty stub)
- [ ] T003 [P] Create TypeScript types file `src/types/legalProcess.ts` with `LegalProcess`, `ProcessStatus`, `ProcessRole`, `Party`, `ProcessEvent`, `Quesito`, `RelevantDocument`, `SuggestedExamination`, `CriticalDate` interfaces (full definitions from `data-model.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, RLS, Storage, and hook skeleton. MUST complete before ANY user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Write `legal_processes` table DDL in `supabase/migrations/20260317000001_create_legal_processes.sql` — all columns from `data-model.md` (id, user_id, document_path, document_name, document_mime_type, process_name, process_number, professional_role, status + CHECK, status_message, executive_summary, process_summary, parties JSONB, events_timeline JSONB, quesitos JSONB, relevant_documents JSONB, suggested_examinations JSONB, critical_dates JSONB, extraction_confidence FLOAT, extraction_errors JSONB, created_at, updated_at)
- [ ] T005 Add indexes to migration file `supabase/migrations/20260317000001_create_legal_processes.sql` — `idx_legal_processes_user_id` and `idx_legal_processes_status`
- [ ] T006 Add `set_updated_at()` trigger function and trigger to migration file `supabase/migrations/20260317000001_create_legal_processes.sql`
- [ ] T007 Add RLS policies (ENABLE ROW LEVEL SECURITY + 4 policies: SELECT, INSERT, UPDATE, DELETE all using `user_id = auth.uid()`) to migration file `supabase/migrations/20260317000001_create_legal_processes.sql`
- [ ] T008 Add Supabase Storage bucket `legal-documents` (private, 50MB limit, allowed MIME types) and 3 storage policies (INSERT/SELECT/DELETE scoped to `auth.uid()`) to migration file `supabase/migrations/20260317000001_create_legal_processes.sql`
- [ ] T009 Apply migration by running `supabase db push` and verify table + RLS + storage bucket exist in Supabase Dashboard
- [ ] T010 Create `src/hooks/useLegalProcesses.ts` skeleton — export `useLegalProcesses()` hook with typed state (`processes: LegalProcess[]`, `loading: boolean`, `error: string | null`) and empty function stubs: `fetchProcesses`, `createProcess`, `deleteProcess`, `subscribeToProcess`

**Checkpoint**: `legal_processes` table exists in DB, RLS blocks cross-user SELECT, Storage bucket created. Hook file exists with correct TypeScript signatures.

---

## Phase 3: User Story 1 + 3.5 — Legal Process Registration & Privacy (Priority: P1) 🎯 MVP START

**Goal**: Users can upload a legal process document, select their professional role, see the process in their list, and delete it. No other user can see this process.

**Independent Test** (US1 from spec): Upload a valid PDF document → confirm process record is created in `legal_processes` with `status = 'pending'` and `user_id = auth.uid()`. Verify a second logged-in user cannot see the process. Verify unsupported file type shows an error.

### Implementation

- [ ] T011 [P] [US1] Implement `fetchProcesses()` in `src/hooks/useLegalProcesses.ts` — Supabase SELECT from `legal_processes` ordered by `created_at DESC`; update `processes` state
- [ ] T012 [P] [US1] Implement `deleteProcess(id: string)` in `src/hooks/useLegalProcesses.ts` — delete Storage file at `process.document_path`, then DELETE from `legal_processes`
- [ ] T013 [US1] Implement `createProcess(file: File, role: ProcessRole)` in `src/hooks/useLegalProcesses.ts` — upload file to Supabase Storage at path `{user_id}/{uuid}/{filename}`, INSERT row to `legal_processes` with `status: 'pending'`, return created `LegalProcess`
- [ ] T014 [US1] Create `src/components/juridico/ProcessUploadDrawer.tsx` — slide-over panel with: drag-and-drop file input (PDF/DOCX/JPG/PNG), file format validation showing clear error for unsupported types (FR-001, US1-AC3), professional role selector (`Perito` / `Assistente Técnico` / `Advogado` / `Outro`), FR-003 time warning text "Análise IA: aprox. 5 minutos", confirm button calling `createProcess()` from hook, loading state during upload, max 150 lines (split logic to hook)
- [ ] T015 [US1] Create `src/components/juridico/ProcessSummaryCard.tsx` — card component for list/grid rendering: shows `process_name || document_name`, `process_number`, `professional_role` badge, `status` chip (color-coded: pending=gray, processing=blue, completed=green, needs_review=amber, error=red), `created_at` formatted date, delete button — max 80 lines, no hardcoded colors
- [ ] T016 [US1] Upgrade `src/views/JuridicoProcessos.tsx` — replace all mock data arrays with `useLegalProcesses()` hook state; show loading skeleton during `loading = true`; wire "Novo Processo" button to open `ProcessUploadDrawer`; render `ProcessSummaryCard` for each process in list/grid mode; wire delete action

**Checkpoint**: Upload PDF → appears in list with status "pending" → delete removes it. Cross-user isolation verified manually (open incognito with second account — list is empty).

---

## Phase 4: User Story 2 — AI-Powered Document Analysis & Extraction (Priority: P1)

**Goal**: After process creation, Edge Function downloads the document, sends it to Gemini, extracts all legal entities, and updates the process record. Frontend shows real-time status progression.

**Independent Test** (US2 from spec): Register a process → verify `status` transitions `pending → processing → completed` in the DB. Verify extracted fields (`process_name`, `parties`, `quesitos`, `events_timeline`) are non-empty. Verify `extraction_confidence` is populated.

### Implementation

- [ ] T017 [US2] Implement JWT validation + process ownership check in `supabase/functions/analyze_legal_process/index.ts` — validate `Authorization` header, get user via `supabase.auth.getUser(jwt)`, fetch process row WHERE `id = process_id AND user_id = caller`, return 401/403/404 on failure
- [ ] T018 [US2] Implement status guard + `processing` transition in `supabase/functions/analyze_legal_process/index.ts` — return 409 if status is not `pending`; UPDATE `status = 'processing'` before calling Gemini
- [ ] T019 [US2] Implement document download in `supabase/functions/analyze_legal_process/index.ts` — use admin client to generate signed URL for `process.document_path`, download bytes via `fetch(signedUrl)`
- [ ] T020 [US2] Implement Gemini 1.5 Flash extraction in `supabase/functions/analyze_legal_process/index.ts` — build inline_data part from document bytes + MIME type, send structured JSON extraction prompt (from `research.md` R-007) with `response_mime_type: 'application/json'`, parse JSON response; use `Deno.env.get('GEMINI_API_KEY')`
- [ ] T021 [US2] Implement result persistence in `supabase/functions/analyze_legal_process/index.ts` — UPSERT all extracted fields to `legal_processes`; set `status = 'completed'` if `extraction_confidence >= 0.7` else `'needs_review'`; on any error set `status = 'error'` and `status_message = error.message` (do NOT expose stack trace)
- [ ] T022 [US2] Implement `subscribeToProcess(processId, callback)` in `src/hooks/useLegalProcesses.ts` — Supabase Realtime channel on `postgres_changes` for UPDATE on `legal_processes` WHERE `id = processId`; unsubscribe when status reaches terminal state
- [ ] T023 [US2] Implement `invokeAnalysis(processId)` in `src/hooks/useLegalProcesses.ts` — calls `supabase.functions.invoke('analyze_legal_process', { body: { process_id } })`; starts Realtime subscription; updates `processes` state on each change
- [ ] T024 [US2] Create `src/components/juridico/ProcessAnalysisProgress.tsx` — animated progress indicator shown during `status = 'processing'`; displays elapsed time counter vs 5-minute estimate; ARIA live region for accessibility; max 80 lines
- [ ] T025 [US2] Wire analysis invocation into `src/components/juridico/ProcessUploadDrawer.tsx` — after `createProcess()` succeeds, call `invokeAnalysis(newProcess.id)` and show `ProcessAnalysisProgress`; on completion/error close drawer and refresh list
- [ ] T026 [US2] Set `GEMINI_API_KEY` as Supabase Edge Function secret via `supabase secrets set GEMINI_API_KEY=...` and deploy with `supabase functions deploy analyze_legal_process`

**Checkpoint**: Upload real PDF → watch status change to `processing` → then `completed` in UI without page refresh. Inspect `legal_processes` row in Supabase Dashboard — all JSONB columns populated.

---

## Phase 5: User Story 3 — Executive Summary Dashboard (Priority: P1)

**Goal**: After AI analysis, user opens the process and sees an Executive Summary with critical issues, key dates, and immediate action items.

**Independent Test** (US3 from spec): Complete-analysis process → click process card → Executive Summary tab displays `executive_summary` text, `critical_dates` list with visual deadline highlighting.

### Implementation

- [ ] T027 [US3] Upgrade `src/components/juridico/ProcessDetailsModal.tsx` — update props interface to accept `process: LegalProcess | null`; populate modal header with `process_name`, `process_number`, `professional_role` badge; show `needs_review` amber warning banner when applicable; show `error` state; keep existing UI shell
- [ ] T028 [US3] Implement 5-tab navigation in `src/components/juridico/ProcessDetailsModal.tsx` — tab bar with: Resumo Executivo, Resumo do Processo, Quesitos, Documentos Relevantes, Exames Sugeridos; tab state management; active tab indicator using design system variables
- [ ] T029 [US3] Implement Executive Summary tab content in `src/components/juridico/ProcessDetailsModal.tsx` — render `process.executive_summary` as formatted text; render `process.critical_dates` as a list with color-coded chips (past=gray, upcoming deadline=red, hearing=amber, decision=blue); `extraction_confidence` progress bar at bottom
- [ ] T030 [US3] Wire `ProcessDetailsModal` to process list in `src/views/JuridicoProcessos.tsx` — pass selected `LegalProcess` object (from hook state) to modal; `ProcessSummaryCard` click opens modal with that process's data

**Checkpoint**: Click any `completed` process → Executive Summary tab shows real AI-generated text + critical dates with color coding.

---

## Phase 6: User Story 4 — Process Historical Summary & Chronology (Priority: P2)

**Goal**: User can view a chronological timeline of all case events extracted from the document.

**Independent Test** (US4 from spec): Open a completed process → navigate to "Resumo do Processo" tab → see `events_timeline` rendered in date order with past/upcoming visual distinction.

### Implementation

- [ ] T031 [US4] Implement Process Summary tab content in `src/components/juridico/ProcessDetailsModal.tsx` — render `process.process_summary` narrative text; below it, render `process.events_timeline[]` as a vertical timeline component (date + event + outcome); visually distinguish past events from upcoming procedural dates; sort by date ascending

**Checkpoint**: "Resumo do Processo" tab shows chronological timeline with real extracted events.

---

## Phase 7: User Story 5 — Quesitos Management & Organization (Priority: P2)

**Goal**: User can review all technical questions organized by originating party.

**Independent Test** (US5 from spec): Open a process with quesitos → "Quesitos" tab lists all `quesitos[]` grouped by `party` field; each shows `text` and `source_page` reference.

### Implementation

- [ ] T032 [US5] Implement Quesitos tab content in `src/components/juridico/ProcessDetailsModal.tsx` — group `process.quesitos[]` by `party`; render each group with party header; each quesito shows index number, full text, and `source_page` badge if available; empty state message when no quesitos found

**Checkpoint**: "Quesitos" tab shows quesitos correctly grouped by party with source page references.

---

## Phase 8: User Story 6 — Relevant Documents Triage & Categorization (Priority: P2)

**Goal**: User sees all relevant attached documents organized by type with extracted metadata.

**Independent Test** (US6 from spec): Open a process → "Documentos Relevantes" tab lists `relevant_documents[]` with category badges, dates, party mentions, and brief summaries.

### Implementation

- [ ] T033 [US6] Implement Relevant Documents tab content in `src/components/juridico/ProcessDetailsModal.tsx` — render `process.relevant_documents[]` as cards; each card shows: document name, `category` badge (color-coded: Relatório=blue, Laudo=purple, Correspondência=gray, etc.), `date`, `parties[]` list, `summary` text; sort by date; empty state when none

**Checkpoint**: "Documentos Relevantes" tab shows document cards with category badges.

---

## Phase 9: User Story 7 — AI-Suggested Examinations & Diagnostics (Priority: P3)

**Goal**: User sees AI-suggested examinations with justifications and priority levels.

**Independent Test** (US7 from spec): Open a process → "Exames Sugeridos" tab shows `suggested_examinations[]` each with name, justification text, and priority chip (critical=red, recommended=amber, optional=gray).

### Implementation

- [ ] T034 [US7] Implement Suggested Examinations tab content in `src/components/juridico/ProcessDetailsModal.tsx` — render `process.suggested_examinations[]` as cards; each shows exam name, `justification` text, and `priority` chip (critical/recommended/optional with distinct colors using design system variables); sort by priority (critical first); empty state when none

**Checkpoint**: "Exames Sugeridos" tab shows prioritized exam suggestions with justifications.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Final UX refinements, error handling, and manual verification checklist.

- [ ] T035 [P] Add `extraction_confidence` percentage indicator and `needs_review` amber badge to `src/components/juridico/ProcessSummaryCard.tsx`
- [ ] T036 [P] Add parties summary (count + first 2 names) to `src/components/juridico/ProcessDetailsModal.tsx` header section
- [ ] T037 [P] Handle `error` status in `src/views/JuridicoProcessos.tsx` — show error icon on card + retry button that calls `invokeAnalysis(process.id)` (re-sets status to pending before re-invoking)
- [ ] T038 [P] Handle `needs_review` status in `src/views/JuridicoProcessos.tsx` — amber warning badge on card; modal warning banner with explanation text
- [ ] T039 Validate mobile layout at 375px viewport for `src/components/juridico/ProcessUploadDrawer.tsx` — ensure drag-drop zone, role selector, and confirm button are all visible and usable
- [ ] T040 Execute manual browser verification checklist from `plan.md` Phase 7 — document results: upload PDF ✓, status transitions ✓, cross-user isolation ✓, unsupported file error ✓, Realtime update ✓, needs_review banner ✓, delete cleans storage ✓, mobile layout ✓

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1+US3.5)**: Depends on Phase 2 — no dependency on other user stories
- **Phase 4 (US2)**: Depends on Phase 3 (needs an uploaded process to analyze)
- **Phase 5 (US3)**: Depends on Phase 4 (needs completed analysis data to display)
- **Phase 6 (US4)**: Depends on Phase 5 (adds tab to existing modal)
- **Phase 7 (US5)**: Depends on Phase 5 (adds tab to existing modal)
- **Phase 8 (US6)**: Depends on Phase 5 (adds tab to existing modal) — **parallel with US5**
- **Phase 9 (US7)**: Depends on Phase 5 (adds tab to existing modal) — **parallel with US4/US5/US6**
- **Polish (Final)**: Depends on all user story phases

### User Story Dependencies

- **US1+US3.5 (P1)**: After Foundational — independent entry point
- **US2 (P1)**: After US1 (requires existing process record)
- **US3 (P1)**: After US2 (requires completed extraction data)
- **US4 (P2)**: After US3 (adds 1 tab to modal)
- **US5 (P2)**: After US3 (adds 1 tab to modal) — **parallel with US4**
- **US6 (P2)**: After US3 (adds 1 tab to modal) — **parallel with US4, US5**
- **US7 (P3)**: After US3 (adds 1 tab to modal) — **parallel with US4, US5, US6**

### Within Each Phase

- [P]-marked tasks in the same phase can run in parallel
- Hook implementations (T011, T012, T013) can run in parallel as they touch different functions
- Modal tab implementations (T031, T032, T033, T034) can run in parallel after T028

---

## Parallel Execution Example: Phase 2 (Foundational)

```
In parallel (T004–T008 write to same file sequentially, but T010 is independent):
  Worker A: T004 → T005 → T006 → T007 → T008 → T009 (migration + apply)
  Worker B: T010 (hook skeleton — different file)
```

## Parallel Execution Example: Phase 3 (US1)

```
In parallel after T010 (hook skeleton exists):
  Worker A: T011 (fetchProcesses) → T013 (createProcess) — same file, sequential
  Worker B: T012 (deleteProcess) — same file, after T013
  Worker C: T014 (ProcessUploadDrawer) — different file, fully parallel
  Worker D: T015 (ProcessSummaryCard) — different file, fully parallel
After T011–T015 complete:
  Worker A: T016 (JuridicoProcessos upgrade — wires all of the above)
```

## Parallel Execution Example: Phases 6–9 (P2/P3 tabs)

```
All four tab implementations can run in parallel after T028 (tab navigation exists):
  Worker A: T031 (US4 — Process Summary tab)
  Worker B: T032 (US5 — Quesitos tab)
  Worker C: T033 (US6 — Documents tab)
  Worker D: T034 (US7 — Examinations tab)
```

---

## Implementation Strategy

### MVP (P1 stories only — Phases 1–5)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T010) — **critical blocker**
3. Complete Phase 3: US1 — upload + list (T011–T016)
4. **VALIDATE**: Upload works, list shows processes, cross-user isolation confirmed
5. Complete Phase 4: US2 — AI analysis Edge Function (T017–T026)
6. **VALIDATE**: Analysis runs, status updates via Realtime
7. Complete Phase 5: US3 — Executive Summary tab (T027–T030)
8. **VALIDATE**: ProcessDetailsModal shows real AI data — **MVP READY**

### Incremental Delivery (add P2/P3 after MVP)

1. MVP ready → add Phase 6 (US4 — chronology tab)
2. Add Phase 7 (US5 — quesitos tab) in parallel
3. Add Phase 8 (US6 — documents tab) in parallel
4. Add Phase 9 (US7 — examinations tab) in parallel
5. Complete Polish phase

---

## Summary

| Phase | Tasks | Story | Priority |
|-------|-------|-------|----------|
| 1 — Setup | T001–T003 | — | Blocker |
| 2 — Foundational | T004–T010 | — | Blocker |
| 3 — Registration + Privacy | T011–T016 | US1, US3.5 | P1 🎯 |
| 4 — AI Analysis | T017–T026 | US2 | P1 |
| 5 — Executive Summary | T027–T030 | US3 | P1 |
| 6 — Chronology | T031 | US4 | P2 |
| 7 — Quesitos | T032 | US5 | P2 |
| 8 — Documents | T033 | US6 | P2 |
| 9 — Examinations | T034 | US7 | P3 |
| Polish | T035–T040 | — | Final |

**Total tasks**: 40
**P1 MVP tasks** (Phases 1–5): 30 tasks
**P2/P3 tasks** (Phases 6–9): 4 tasks (1 each — add tabs to existing modal)
**Polish tasks**: 6 tasks

**Parallel opportunities**:
- Phase 1: T002, T003 parallel
- Phase 2: T010 parallel with T004–T009
- Phase 3: T011–T015 parallel among themselves; T016 after all
- Phase 4: T017–T021 sequential in Edge Function; T022–T023 parallel with each other
- Phases 6–9: All 4 tab tasks parallel after T028

**Notes**:
- No test tasks generated (not requested in spec)
- US3.5 (Data Privacy) is enforced via RLS in Phase 2 — not a separate implementation phase
- All tasks follow constitution: no hardcoded colors, DOMPurify for HTML, Edge Function for Gemini, sessionStorage for auth
