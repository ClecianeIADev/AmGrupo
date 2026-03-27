# Data Model: Módulo RH — 003-rh-module

**Phase**: 1 — Design & Contracts
**Date**: 2026-03-27
**Branch**: `003-rh-module`

---

## Entidades

### 1. `setores` (criado na Parte 1, estendido na Parte 3)

Representa um setor/departamento da empresa. Referenciado pelo dashboard (distribuição por setor) e pela tela de Setores (Parte 3).

```sql
CREATE TABLE setores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  manager_id  UUID REFERENCES profissionais(id) ON DELETE SET NULL,  -- adicionado na Parte 3
  status      BOOLEAN NOT NULL DEFAULT true,                         -- adicionado na Parte 3
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Índices**:
- `idx_setores_user_id` ON `setores(user_id)`
- `idx_setores_name` ON `setores(user_id, name)`

**RLS**: Habilitado — usuário só acessa seus próprios setores.

**Nota**: Criado com campos básicos na Parte 1. `manager_id` e `status` adicionados na Parte 3 via migration.

---

### 2. `profissionais` (criado na Parte 1)

Entidade central do módulo. Representa um colaborador da empresa.

```sql
CREATE TABLE profissionais (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificação
  nome_completo        TEXT NOT NULL,
  email                TEXT NOT NULL,
  telefone             TEXT,
  endereco             TEXT,
  data_nascimento      DATE,
  genero               TEXT CHECK (genero IN ('masculino', 'feminino', 'outros')),
  foto_url             TEXT,

  -- Vínculo organizacional
  setor_id             UUID REFERENCES setores(id) ON DELETE SET NULL,
  cargo                TEXT,
  tipo_contrato        TEXT,                    -- CLT, PJ, Estágio, Temporário
  gestor_imediato_id   UUID REFERENCES profissionais(id) ON DELETE SET NULL,

  -- Datas de trabalho
  data_admissao        DATE NOT NULL,
  data_desligamento    DATE,

  -- Férias (simples, sem tabela separada)
  ferias_inicio        DATE,
  ferias_fim           DATE,
  ferias_status        TEXT CHECK (ferias_status IN ('approved', 'pending')),

  -- Desenvolvimento
  competencias_tecnicas TEXT[],                -- array de strings
  observacoes_internas  TEXT,
  pdi                   TEXT,                  -- campo de texto simples

  -- Status
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),

  -- Timestamps
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Índices**:
- `idx_profissionais_user_id` ON `profissionais(user_id)`
- `idx_profissionais_setor_id` ON `profissionais(setor_id)`
- `idx_profissionais_status` ON `profissionais(user_id, status)`
- `idx_profissionais_data_nascimento` ON `profissionais(user_id, data_nascimento)` — para aniversariantes

**RLS**: Habilitado — usuário só acessa seus próprios profissionais.

**Validações no frontend**:
- `email` imutável após criação (campo disabled na edição)
- `data_desligamento` obrigatória quando `status = 'disabled'`
- `foto_url` via Supabase Storage bucket `profissional-fotos` (máx 5MB, PNG/JPG)

---

### 3. `historico_profissional` (criado na Parte 2)

Timeline de eventos automáticos gerados pelo sistema sobre cada profissional.

```sql
CREATE TABLE historico_profissional (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL CHECK (tipo IN ('admissao', 'mudanca_cargo', 'mudanca_departamento', 'desligamento')),
  descricao       TEXT NOT NULL,
  data_evento     DATE NOT NULL,
  dados_anteriores JSONB,                      -- snapshot do estado anterior (nullable)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Índices**:
- `idx_historico_profissional_id` ON `historico_profissional(profissional_id)`
- `idx_historico_user_id` ON `historico_profissional(user_id)`

**RLS**: Habilitado — filtro por `user_id`.

**Geração automática** (via hook `useProfessionals`):
| Evento | Tipo | Descrição |
|--------|------|-----------|
| Criação do profissional | `admissao` | "Admissão em {data_admissao}" |
| Edição do cargo | `mudanca_cargo` | "Mudança de cargo: {anterior} → {novo}" |
| Edição do setor | `mudanca_departamento` | "Mudança de departamento: {anterior} → {novo}" |
| Desativação de status | `desligamento` | "Desligamento em {data_desligamento}" |

---

### 4. `documentos_profissional` (criado na Parte 2)

Arquivos vinculados ao profissional, armazenados no Supabase Storage.

```sql
CREATE TABLE documentos_profissional (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_arquivo    TEXT NOT NULL,
  storage_path    TEXT NOT NULL,               -- path no bucket profissional-documentos
  mime_type       TEXT,
  tamanho_bytes   BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Índices**:
- `idx_documentos_profissional_id` ON `documentos_profissional(profissional_id)`
- `idx_documentos_user_id` ON `documentos_profissional(user_id)`

**RLS**: Habilitado — filtro por `user_id`.

**Storage bucket**: `profissional-documentos` (máx 10MB por arquivo).

---

## Relacionamentos

```
auth.users
  ├── setores (user_id)
  │     └── profissionais (setor_id) ──[SET NULL on delete]
  └── profissionais (user_id)
        ├── profissionais (gestor_imediato_id) ──[SET NULL on delete]
        ├── historico_profissional (profissional_id) ──[CASCADE]
        ├── documentos_profissional (profissional_id) ──[CASCADE]
        └── setores (manager_id) ──[SET NULL on delete]
```

---

## Migrations — Ordem de Aplicação

| # | Arquivo | Conteúdo | Parte |
|---|---------|----------|-------|
| 1 | `20260327000001_create_setores.sql` | Tabela `setores` (sem manager_id/status) + RLS | Parte 1 |
| 2 | `20260327000002_create_profissionais.sql` | Tabela `profissionais` + índices + RLS | Parte 1 |
| 3 | `20260327000003_create_historico_profissional.sql` | Tabela `historico_profissional` + RLS | Parte 2 |
| 4 | `20260327000004_create_documentos_profissional.sql` | Tabela `documentos_profissional` + RLS | Parte 2 |
| 5 | `20260327000005_extend_setores_for_part3.sql` | Adiciona `manager_id`, `status` em `setores` | Parte 3 |

---

## Tipos TypeScript

**Arquivo**: `src/types/rh.ts`

```typescript
export type ProfissionalStatus = 'active' | 'disabled'
export type Genero = 'masculino' | 'feminino' | 'outros'
export type FeriasStatus = 'approved' | 'pending'
export type HistoricoTipo = 'admissao' | 'mudanca_cargo' | 'mudanca_departamento' | 'desligamento'

export interface Setor {
  id: string
  user_id: string
  name: string
  manager_id: string | null
  status: boolean
  created_at: string
  updated_at: string
}

export interface SectorWithCount extends Setor {
  profissionais_count: number
  manager?: Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'>
}

export interface Profissional {
  id: string
  user_id: string
  nome_completo: string
  email: string
  telefone: string | null
  endereco: string | null
  data_nascimento: string | null
  genero: Genero | null
  foto_url: string | null
  setor_id: string | null
  cargo: string | null
  tipo_contrato: string | null
  gestor_imediato_id: string | null
  data_admissao: string
  data_desligamento: string | null
  ferias_inicio: string | null
  ferias_fim: string | null
  ferias_status: FeriasStatus | null
  competencias_tecnicas: string[]
  observacoes_internas: string | null
  pdi: string | null
  status: ProfissionalStatus
  created_at: string
  updated_at: string
}

export interface ProfissionalWithRelations extends Profissional {
  setor?: Pick<Setor, 'id' | 'name'> | null
  gestor?: Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'> | null
  /** Status visual derivado */
  badge_status: 'Ativo' | 'Férias' | 'Desativado'
}

export interface HistoricoProfissional {
  id: string
  profissional_id: string
  user_id: string
  tipo: HistoricoTipo
  descricao: string
  data_evento: string
  dados_anteriores: Record<string, unknown> | null
  created_at: string
}

export interface DocumentoProfissional {
  id: string
  profissional_id: string
  user_id: string
  nome_arquivo: string
  storage_path: string
  mime_type: string | null
  tamanho_bytes: number | null
  created_at: string
}

// DTOs
export interface CreateProfissionalDTO {
  nome_completo: string
  email: string
  telefone?: string
  endereco?: string
  data_nascimento?: string
  genero?: Genero
  setor_id?: string
  cargo?: string
  tipo_contrato?: string
  gestor_imediato_id?: string
  data_admissao: string
  ferias_inicio?: string
  ferias_fim?: string
  ferias_status?: FeriasStatus
  competencias_tecnicas?: string[]
  observacoes_internas?: string
  pdi?: string
  status?: ProfissionalStatus
}

export interface CreateSetorDTO {
  name: string
  manager_id?: string
  status?: boolean
}
```

---

## Storage Buckets

| Bucket | Uso | Limite | Formatos |
|--------|-----|--------|----------|
| `profissional-fotos` | Foto de perfil do profissional | 5MB | PNG, JPG/JPEG |
| `profissional-documentos` | Documentos gerais do profissional | 10MB | Qualquer |

**Path convention**:
- Fotos: `{user_id}/{profissional_id}/avatar.{ext}`
- Documentos: `{user_id}/{profissional_id}/{timestamp}_{nome_arquivo}`
