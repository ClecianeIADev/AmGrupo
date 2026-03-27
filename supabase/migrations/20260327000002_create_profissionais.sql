-- Migration: create_profissionais
-- Feature: 003-rh-module (Parte 1)
-- Purpose: Core professionals/employees table for HR module
-- Date: 2026-03-27

-- ── TABLE: profissionais ───────────────────────────────────────────────────────
CREATE TABLE public.profissionais (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificação
  nome_completo         TEXT NOT NULL,
  email                 TEXT NOT NULL,
  telefone              TEXT,
  endereco              TEXT,
  data_nascimento       DATE,
  genero                TEXT CHECK (genero IN ('masculino', 'feminino', 'outros')),
  foto_url              TEXT,

  -- Vínculo organizacional
  setor_id              UUID REFERENCES public.setores(id) ON DELETE SET NULL,
  cargo                 TEXT,
  tipo_contrato         TEXT,
  gestor_imediato_id    UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,

  -- Datas de trabalho
  data_admissao         DATE NOT NULL,
  data_desligamento     DATE,

  -- Férias (simples, sem tabela separada)
  ferias_inicio         DATE,
  ferias_fim            DATE,
  ferias_status         TEXT CHECK (ferias_status IN ('approved', 'pending')),

  -- Desenvolvimento
  competencias_tecnicas TEXT[],
  observacoes_internas  TEXT,
  pdi                   TEXT,

  -- Status
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT profissionais_nome_not_empty CHECK (length(trim(nome_completo)) > 0),
  CONSTRAINT profissionais_email_not_empty CHECK (length(trim(email)) > 0)
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profissionais_user_id
  ON public.profissionais(user_id);

CREATE INDEX IF NOT EXISTS idx_profissionais_setor_id
  ON public.profissionais(setor_id);

CREATE INDEX IF NOT EXISTS idx_profissionais_status
  ON public.profissionais(user_id, status);

CREATE INDEX IF NOT EXISTS idx_profissionais_data_nascimento
  ON public.profissionais(user_id, data_nascimento);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus profissionais — select"
  ON public.profissionais FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuário acessa apenas seus profissionais — insert"
  ON public.profissionais FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário acessa apenas seus profissionais — update"
  ON public.profissionais FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário acessa apenas seus profissionais — delete"
  ON public.profissionais FOR DELETE
  USING (user_id = auth.uid());

-- ── TRIGGER: updated_at ───────────────────────────────────────────────────────
CREATE TRIGGER update_profissionais_updated_at
  BEFORE UPDATE ON public.profissionais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
