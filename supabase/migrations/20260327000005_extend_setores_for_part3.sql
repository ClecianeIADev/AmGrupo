-- Migration: extend_setores_for_part3
-- Feature: 003-rh-module (Parte 3 — Setores)
-- Purpose: Add manager_id and status columns to setores table
-- Date: 2026-03-27
-- Note: Runs after create_profissionais so the FK reference is valid

-- ── ALTER: setores ─────────────────────────────────────────────────────────────
ALTER TABLE public.setores
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status     BOOLEAN NOT NULL DEFAULT true;

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_setores_name ON public.setores(user_id, name);
