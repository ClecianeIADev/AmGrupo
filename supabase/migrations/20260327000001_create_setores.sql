-- Migration: create_setores
-- Feature: 003-rh-module (Parte 1 — base table, extended in Parte 3)
-- Purpose: Sector/department table for HR module
-- Date: 2026-03-27

-- ── TABLE: setores ─────────────────────────────────────────────────────────────
-- Note: manager_id and status columns are added later in 20260327000005
CREATE TABLE public.setores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT setores_name_not_empty CHECK (length(trim(name)) > 0)
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_setores_user_id ON public.setores(user_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus setores — select"
  ON public.setores FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuário acessa apenas seus setores — insert"
  ON public.setores FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário acessa apenas seus setores — update"
  ON public.setores FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário acessa apenas seus setores — delete"
  ON public.setores FOR DELETE
  USING (user_id = auth.uid());

-- ── TRIGGER: updated_at ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_setores_updated_at
  BEFORE UPDATE ON public.setores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
