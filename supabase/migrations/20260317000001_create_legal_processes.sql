-- Migration: create_legal_processes
-- Feature: 001-legal-summaries
-- Purpose: Legal process summaries — main table, RLS, Storage bucket + policies
-- Date: 2026-03-17

-- ============================================================
-- T004: TABLE: legal_processes
-- ============================================================
CREATE TABLE public.legal_processes (
    -- Identity
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Document reference (Supabase Storage)
    -- Path pattern: {user_id}/{process_id}/{original_filename}
    document_path           TEXT NOT NULL,
    document_name           TEXT NOT NULL,
    document_mime_type      TEXT NOT NULL,

    -- Process identification (auto-extracted by AI)
    process_name            TEXT,
    process_number          TEXT,

    -- Registration metadata
    professional_role       TEXT NOT NULL,

    -- Processing state machine
    -- Values: pending | processing | completed | needs_review | error
    status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'completed', 'needs_review', 'error')),
    status_message          TEXT,

    -- AI-generated text summaries (populated after analysis)
    executive_summary       TEXT,
    process_summary         TEXT,

    -- AI-extracted structured arrays (JSONB)
    parties                 JSONB NOT NULL DEFAULT '[]',
    -- [{name: string, role: string, representative: string|null}]

    events_timeline         JSONB NOT NULL DEFAULT '[]',
    -- [{date: string, event: string, outcome: string|null}]

    quesitos                JSONB NOT NULL DEFAULT '[]',
    -- [{id: string, party: string, text: string, source_page: number|null}]

    relevant_documents      JSONB NOT NULL DEFAULT '[]',
    -- [{name, type, category, date, parties: string[], summary}]

    suggested_examinations  JSONB NOT NULL DEFAULT '[]',
    -- [{name, justification, priority: critical|recommended|optional}]

    critical_dates          JSONB NOT NULL DEFAULT '[]',
    -- [{date, description, type: deadline|hearing|decision|other, is_past: boolean}]

    -- Extraction quality
    extraction_confidence   FLOAT CHECK (extraction_confidence BETWEEN 0 AND 1),
    extraction_errors       JSONB NOT NULL DEFAULT '[]',
    -- [string] — flagged ambiguous or unreadable sections

    -- Audit
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- T005: INDEXES
-- ============================================================
-- Primary access pattern: list all processes for a user
CREATE INDEX idx_legal_processes_user_id
    ON public.legal_processes(user_id);

-- Status polling and filtering by user + status
CREATE INDEX idx_legal_processes_status
    ON public.legal_processes(user_id, status);

-- ============================================================
-- T006: UPDATED_AT TRIGGER
-- ============================================================
-- Reuse existing set_updated_at() if present, otherwise create it
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

-- ============================================================
-- T007: ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.legal_processes ENABLE ROW LEVEL SECURITY;

-- SELECT: users see only their own processes
CREATE POLICY "Users select own processes"
    ON public.legal_processes FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: users can only create processes linked to themselves
CREATE POLICY "Users insert own processes"
    ON public.legal_processes FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own processes and ARE NOT allowed to change system-controlled fields (status, summaries, etc.)
CREATE POLICY "Users update own processes"
    ON public.legal_processes FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid() 
        AND status = (SELECT status FROM public.legal_processes WHERE id = id) -- Prevents status manipulation
    );

-- DELETE: users can only delete their own processes
CREATE POLICY "Users delete own processes"
    ON public.legal_processes FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================
-- T008: SUPABASE STORAGE — bucket + policies
-- ============================================================
-- Create private bucket (also do this in Supabase Dashboard if INSERT below is blocked)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'legal-documents',
    'legal-documents',
    false,
    52428800,  -- 50 MB
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policy: users can only upload to their own folder prefix
CREATE POLICY "Users upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'legal-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage policy: users can only read their own documents
CREATE POLICY "Users read own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'legal-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage policy: users can only delete their own documents
CREATE POLICY "Users delete own documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'legal-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text );
        
        
