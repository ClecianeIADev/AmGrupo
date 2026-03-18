# Data Model: Legal Process Summaries

**Feature**: 001-legal-summaries
**Date**: 2026-03-17
**DB**: Supabase (PostgreSQL)

---

## Entities

### 1. `legal_processes` (primary table)

Stores each judicial process uploaded by a user along with all AI-extracted summaries and metadata.

```sql
CREATE TABLE public.legal_processes (
  -- Identity
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document reference (Supabase Storage)
  document_path         TEXT NOT NULL,   -- storage path: {user_id}/{id}/{filename}
  document_name         TEXT NOT NULL,   -- original uploaded filename
  document_mime_type    TEXT NOT NULL,   -- application/pdf | image/jpeg | image/png | application/vnd...

  -- Process identification (auto-extracted by AI)
  process_name          TEXT,            -- descriptive name extracted from document
  process_number        TEXT,            -- e.g. "1029511-60.2023.8.26.0506"

  -- Registration metadata
  professional_role     TEXT NOT NULL,   -- 'Perito' | 'Assistente Técnico' | 'Advogado' | 'Outro'

  -- Processing state
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processing', 'completed', 'needs_review', 'error')),
  status_message        TEXT,            -- human-readable status or error description

  -- AI-generated summaries (populated after analysis)
  executive_summary     TEXT,            -- concise executive summary with critical issues
  process_summary       TEXT,            -- chronological case history narrative

  -- AI-extracted structured data (JSONB arrays)
  parties               JSONB NOT NULL DEFAULT '[]',
  -- [{name: string, role: string, representative: string|null}]

  events_timeline       JSONB NOT NULL DEFAULT '[]',
  -- [{date: string, event: string, outcome: string|null}]

  quesitos              JSONB NOT NULL DEFAULT '[]',
  -- [{id: string, party: string, text: string, source_page: number|null}]

  relevant_documents    JSONB NOT NULL DEFAULT '[]',
  -- [{name: string, type: string, category: string, date: string|null, parties: string[], summary: string}]

  suggested_examinations JSONB NOT NULL DEFAULT '[]',
  -- [{name: string, justification: string, priority: 'critical'|'recommended'|'optional'}]

  critical_dates        JSONB NOT NULL DEFAULT '[]',
  -- [{date: string, description: string, type: 'deadline'|'hearing'|'decision'|'other', is_past: boolean}]

  -- Extraction quality
  extraction_confidence FLOAT CHECK (extraction_confidence BETWEEN 0 AND 1),
  extraction_errors     JSONB NOT NULL DEFAULT '[]',
  -- [string] — flagged ambiguous or unreadable sections

  -- Audit
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- Primary access pattern: list user's processes
CREATE INDEX idx_legal_processes_user_id ON public.legal_processes(user_id);

-- Status polling (Realtime subscription filter)
CREATE INDEX idx_legal_processes_status ON public.legal_processes(user_id, status);

-- Full-text search (future)
CREATE INDEX idx_legal_processes_process_number ON public.legal_processes(process_number);
```

---

## Row Level Security (RLS)

```sql
ALTER TABLE public.legal_processes ENABLE ROW LEVEL SECURITY;

-- SELECT: users see only their own processes
CREATE POLICY "Users select own processes"
  ON public.legal_processes FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: users can only create processes linked to themselves
CREATE POLICY "Users insert own processes"
  ON public.legal_processes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: users can only update their own processes
CREATE POLICY "Users update own processes"
  ON public.legal_processes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: users can only delete their own processes
CREATE POLICY "Users delete own processes"
  ON public.legal_processes FOR DELETE
  USING (user_id = auth.uid());
```

---

## Supabase Storage

### Bucket: `legal-documents`

```
Type: private (no public access)
Max file size: 50MB
Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp,
                    application/vnd.openxmlformats-officedocument.wordprocessingml.document

Path convention: {user_id}/{process_id}/{original_filename}
```

### Storage Policies

```sql
-- Users can only upload to their own folder
CREATE POLICY "Users upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only read their own documents
CREATE POLICY "Users read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own documents
CREATE POLICY "Users delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'legal-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Auto-update Trigger

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_legal_processes_updated_at
  BEFORE UPDATE ON public.legal_processes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## State Machine: `status`

```
pending ──► processing ──► completed
                │
                ├──► needs_review  (confidence < 0.7 or extraction_errors non-empty)
                │
                └──► error         (Gemini API failure, unsupported format, etc.)
```

Transitions managed exclusively by `analyze_legal_process` Edge Function.
Frontend is read-only on `status`; it subscribes via Supabase Realtime.

---

## TypeScript Type (frontend)

```typescript
// src/types/legalProcess.ts

export type ProcessStatus = 'pending' | 'processing' | 'completed' | 'needs_review' | 'error';
export type ProcessRole   = 'Perito' | 'Assistente Técnico' | 'Advogado' | 'Outro';

export interface Party               { name: string; role: string; representative: string | null; }
export interface ProcessEvent        { date: string; event: string; outcome: string | null; }
export interface Quesito             { id: string; party: string; text: string; source_page: number | null; }
export interface RelevantDocument    { name: string; type: string; category: string; date: string | null; parties: string[]; summary: string; }
export interface SuggestedExamination { name: string; justification: string; priority: 'critical' | 'recommended' | 'optional'; }
export interface CriticalDate        { date: string; description: string; type: 'deadline' | 'hearing' | 'decision' | 'other'; is_past: boolean; }

export interface LegalProcess {
  id:                     string;
  user_id:                string;
  document_path:          string;
  document_name:          string;
  document_mime_type:     string;
  process_name:           string | null;
  process_number:         string | null;
  professional_role:      ProcessRole;
  status:                 ProcessStatus;
  status_message:         string | null;
  executive_summary:      string | null;
  process_summary:        string | null;
  parties:                Party[];
  events_timeline:        ProcessEvent[];
  quesitos:               Quesito[];
  relevant_documents:     RelevantDocument[];
  suggested_examinations: SuggestedExamination[];
  critical_dates:         CriticalDate[];
  extraction_confidence:  number | null;
  extraction_errors:      string[];
  created_at:             string;
  updated_at:             string;
}
```
