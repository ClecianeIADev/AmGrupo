-- Migration: create_process_folders
-- Feature: 002-process-folders
-- Purpose: Folder-based organization for legal processes
-- Date: 2026-03-24

-- ── TABLE: process_folders ────────────────────────────────────────────────────
CREATE TABLE public.process_folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#3b82f6',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT folder_color_not_empty CHECK (length(color) > 0),
  CONSTRAINT folder_name_not_empty CHECK (length(trim(name)) > 0)
);

-- ── COLUMN: legal_processes.folder_id ────────────────────────────────────────
-- ON DELETE SET NULL: deleting a folder orphans its processes (does not delete them)
ALTER TABLE public.legal_processes
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.process_folders(id) ON DELETE SET NULL;

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_process_folders_user_id       ON public.process_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_process_folders_name          ON public.process_folders(user_id, name);
CREATE INDEX IF NOT EXISTS idx_legal_processes_folder_id     ON public.legal_processes(folder_id);
CREATE INDEX IF NOT EXISTS idx_legal_processes_folder_stage  ON public.legal_processes(folder_id, kanban_stage);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE public.process_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own folders"
  ON public.process_folders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own folders"
  ON public.process_folders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own folders"
  ON public.process_folders FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own folders"
  ON public.process_folders FOR DELETE
  USING (user_id = auth.uid());

-- ── TRIGGER: updated_at ───────────────────────────────────────────────────────
-- update_updated_at_column() may already exist from prior migrations; use CREATE OR REPLACE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_process_folders_updated_at
  BEFORE UPDATE ON public.process_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
