# Implementation Plan: Módulo RH — Gestão de Profissionais e Setores

**Branch**: `003-rh-module` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-rh-module/spec.md`

---

## Summary

Integração do Módulo RH com banco de dados real. Dividido em 3 partes independentes e incrementais, seguindo a mesma divisão da spec.

> **⚠️ Diferença crítica entre partes**:
> - **Partes 1 e 2** — As views de UI já existem com dados mock (`RHDashboard.tsx`, `RHProfissionais.tsx`, `RHPerfil.tsx`). O trabalho é substituir dados mock por hooks reais (banco + storage). **Não criar UI do zero.**
> - **Parte 3 (Setores)** — **Nenhuma view ou componente de UI existe para setores.** `RHSetores.tsx` e `SectorDrawer.tsx` precisam ser criados inteiramente do zero, incluindo layout, tabela, paginação, busca e drawer de criação/edição. A sub-aba "Setores" em `RHProfissionais.tsx` também é nova.

---

## Technical Context

**Language/Version**: TypeScript 5.8 + React 19
**Primary Dependencies**: Supabase JS Client, Vite 6, Motion, Lucide React, Tailwind CSS v4
**Storage**: PostgreSQL via Supabase (RLS habilitado) + Supabase Storage (fotos + documentos)
**Testing**: Vitest (unitários de hooks e funções utilitárias)
**Target Platform**: Web SPA — localhost:3000 (dev), Supabase hosted (prod)
**Project Type**: Web application (SPA + Supabase backend)
**Performance Goals**: Dashboard carrega em < 2s; busca de profissionais em < 500ms (client-side)
**Constraints**: Sessão via sessionStorage; RLS em todas as tabelas; cores via CSS variables apenas
**Scale/Scope**: Dezenas a centenas de profissionais por usuário; sem requisito de escala massiva

---

## Constitution Check

| Princípio | Status | Justificativa |
|-----------|--------|---------------|
| I. Supabase como fonte única | PASS | Todas as operações via Supabase client ou Edge Functions |
| II. Google SSO (NON-NEGOTIABLE) | PASS | Nenhuma nova rota de auth — usa sessão existente |
| III. Privacidade por usuário (NON-NEGOTIABLE) | PASS | RLS em todas as tabelas + filtro `user_id` em todos os hooks |
| IV. Clean Code / Componentes pequenos | PASS | Views existentes serão refatoradas se > 200 linhas; hooks separados |
| V. Segurança — sem secrets no frontend | PASS | Upload via Supabase Storage client; sem API keys expostas |
| VI. Design consistente | PASS | Nenhum componente novo criará cores hardcoded; usar CSS vars |
| VII. Sessão obrigatória / sessionStorage | PASS | Supabase client já configurado com sessionStorage em `supabase.ts` |
| IX. Evidence-Based Execution | PASS | Cada parte entrega migrations aplicadas, hooks testáveis e tela funcional |
| Separação de ambientes | PASS | Migrations via `supabase db push`; testes em DEV apenas |

**Resultado**: ✅ Todos os gates passam. Implementação pode prosseguir.

---

## Project Structure

### Documentation (esta feature)

```text
specs/003-rh-module/
├── spec.md          ✅ Completo (3 partes)
├── plan.md          ✅ Este arquivo
├── research.md      ✅ Completo
├── data-model.md    ✅ Completo
└── tasks.md         📋 Próximo passo (/speckit.tasks)
```

### Source Code

```text
src/
├── types/
│   └── rh.ts                         [CRIAR] — Todos os tipos do módulo RH
├── hooks/
│   ├── useRHDashboard.ts             [CRIAR] — Métricas, distribuição, aniversários, férias
│   ├── useProfessionals.ts           [CRIAR] — CRUD profissionais + histórico automático
│   └── useSetores.ts                 [CRIAR] — CRUD setores + contagem de colaboradores
├── views/
│   ├── RHDashboard.tsx               [MODIFICAR] — Conectar ao hook useRHDashboard
│   ├── RHProfissionais.tsx           [MODIFICAR] — Conectar + sub-abas + remover botão "Ver Perfil"
│   ├── RHPerfil.tsx                  [MODIFICAR] — Conectar ao useProfessionals
│   └── RHSetores.tsx                 [CRIAR] — Tela de listagem de setores (Parte 3)
└── components/
    └── rh/
        └── SectorDrawer.tsx          [CRIAR] — Drawer de criação/edição de setores (Parte 3)

supabase/
├── migrations/
│   ├── 20260327000001_create_setores.sql
│   ├── 20260327000002_create_profissionais.sql
│   ├── 20260327000003_create_historico_profissional.sql
│   ├── 20260327000004_create_documentos_profissional.sql
│   └── 20260327000005_extend_setores_for_part3.sql
```

---

## PARTE 1 — Dashboard de Métricas

**Objetivo**: Substituir todos os dados mock do `RHDashboard.tsx` por dados reais do Supabase.

**Dependências**: Nenhuma (é o ponto de partida).

### 1.1 Migrations

**`20260327000001_create_setores.sql`**
```sql
-- Tabela básica de setores (campos manager_id e status adicionados na Parte 3)
CREATE TABLE setores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_setores_user_id ON setores(user_id);

ALTER TABLE setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus setores"
  ON setores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**`20260327000002_create_profissionais.sql`**
```sql
CREATE TABLE profissionais (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo         TEXT NOT NULL,
  email                 TEXT NOT NULL,
  telefone              TEXT,
  endereco              TEXT,
  data_nascimento       DATE,
  genero                TEXT CHECK (genero IN ('masculino', 'feminino', 'outros')),
  foto_url              TEXT,
  setor_id              UUID REFERENCES setores(id) ON DELETE SET NULL,
  cargo                 TEXT,
  tipo_contrato         TEXT,
  gestor_imediato_id    UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  data_admissao         DATE NOT NULL,
  data_desligamento     DATE,
  ferias_inicio         DATE,
  ferias_fim            DATE,
  ferias_status         TEXT CHECK (ferias_status IN ('approved', 'pending')),
  competencias_tecnicas TEXT[],
  observacoes_internas  TEXT,
  pdi                   TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profissionais_user_id ON profissionais(user_id);
CREATE INDEX idx_profissionais_setor_id ON profissionais(setor_id);
CREATE INDEX idx_profissionais_status ON profissionais(user_id, status);
CREATE INDEX idx_profissionais_nascimento ON profissionais(user_id, data_nascimento);

ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus profissionais"
  ON profissionais FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 1.2 Tipo: `src/types/rh.ts`

Criar conforme definido em `data-model.md` — tipos `Setor`, `Profissional`, `ProfissionalWithRelations` e DTOs.

### 1.3 Hook: `src/hooks/useRHDashboard.ts`

**Responsabilidade única**: Buscar todos os dados necessários para o `RHDashboard.tsx`.

**Queries a implementar**:

```typescript
// 1. KPIs — via query única na tabela profissionais
// total, ativos, contratações no mês atual, desligamentos no mês (para turnover)

// 2. Distribuição por setor
// SELECT setor_id, setores.name, COUNT(*) as total
// FROM profissionais JOIN setores ON setor_id = setores.id
// WHERE profissionais.user_id = user_id
// GROUP BY setor_id, setores.name
// ORDER BY total DESC

// 3. Gênero e diversidade
// SELECT genero, COUNT(*) FROM profissionais WHERE user_id = ... GROUP BY genero

// 4. Aniversariantes do mês atual
// WHERE EXTRACT(MONTH FROM data_nascimento) = EXTRACT(MONTH FROM now())
// AND user_id = ...
// ORDER BY EXTRACT(DAY FROM data_nascimento)

// 5. Férias agendadas (futuras ou em andamento)
// WHERE (ferias_inicio >= now() OR ferias_fim >= now())
// AND user_id = ...
```

**Interface retornada**:
```typescript
interface RHDashboardData {
  kpis: { total: number; ativos: number; contratacoesMes: number; turnoverPercent: number }
  distribuicaoSetores: { setor_id: string; name: string; total: number; percentual: number }[]
  generos: { masculino: number; feminino: number; outros: number }
  aniversariantes: ProfissionalWithRelations[]
  feriasAgendadas: ProfissionalWithRelations[]
  loading: boolean
  error: string | null
}
```

### 1.4 View: `RHDashboard.tsx` (modificar)

- Importar e chamar `useRHDashboard()`
- Substituir cada bloco de dados mock pelo dado real do hook
- Adicionar estados de loading (skeleton) e empty state para cada seção
- Botão "Exportar Relatório" → implementar `window.print()` com estilos de impressão (P2)

### 1.5 Verificação da Parte 1

- [ ] `supabase db push` aplica migrations sem erro
- [ ] Dashboard carrega dados reais (inserir 2-3 profissionais de teste)
- [ ] KPIs exibem valores corretos (verificar com contagem manual)
- [ ] Distribuição por setor exibe proporções corretas
- [ ] Aniversariantes do mês aparecem ordenados por proximidade
- [ ] Férias agendadas aparecem com status correto
- [ ] Dois usuários distintos veem apenas seus próprios dados

---

## PARTE 2 — Gestão de Profissionais

**Objetivo**: Conectar `RHProfissionais.tsx` e `RHPerfil.tsx` com dados reais. Implementar criação, edição, upload de foto e documentos, e histórico automático.

**Dependências**: Parte 1 concluída (tabelas `setores` e `profissionais` existem).

### 2.1 Migrations

**`20260327000003_create_historico_profissional.sql`**
```sql
CREATE TABLE historico_profissional (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL CHECK (tipo IN ('admissao', 'mudanca_cargo', 'mudanca_departamento', 'desligamento')),
  descricao       TEXT NOT NULL,
  data_evento     DATE NOT NULL,
  dados_anteriores JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_historico_profissional_id ON historico_profissional(profissional_id);
CREATE INDEX idx_historico_user_id ON historico_profissional(user_id);

ALTER TABLE historico_profissional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas histórico dos seus profissionais"
  ON historico_profissional FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**`20260327000004_create_documentos_profissional.sql`**
```sql
CREATE TABLE documentos_profissional (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_arquivo    TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  mime_type       TEXT,
  tamanho_bytes   BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documentos_profissional_id ON documentos_profissional(profissional_id);
CREATE INDEX idx_documentos_user_id ON documentos_profissional(user_id);

ALTER TABLE documentos_profissional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas documentos dos seus profissionais"
  ON documentos_profissional FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 2.2 Hook: `src/hooks/useProfessionals.ts`

**Responsabilidades**:
- Listar todos os profissionais do usuário com relações (setor, gestor)
- CRUD: criar, editar, excluir profissional
- Upload de foto de perfil (bucket `profissional-fotos`, máx 5MB)
- Upload/download/exclusão de documentos (bucket `profissional-documentos`, máx 10MB)
- Geração automática de histórico nas operações que o requerem
- Derivar `badge_status` de cada profissional

**Lógica de badge_status** (função pura, testável):
```typescript
function deriveBadgeStatus(p: Profissional): 'Ativo' | 'Férias' | 'Desativado' {
  if (p.status === 'disabled') return 'Desativado'
  const today = new Date()
  if (p.ferias_inicio && p.ferias_fim) {
    const start = new Date(p.ferias_inicio)
    const end = new Date(p.ferias_fim)
    if (today >= start && today <= end) return 'Férias'
  }
  return 'Ativo'
}
```

**Geração de histórico automático**:
```typescript
// Ao criar: inserir entry tipo 'admissao' com data_admissao do form
// Ao editar cargo: se cargo mudou, inserir entry 'mudanca_cargo'
// Ao editar setor: se setor_id mudou, inserir entry 'mudanca_departamento'
// Ao editar status → disabled: inserir entry 'desligamento' com data_desligamento
```

### 2.3 View: `RHProfissionais.tsx` (modificar)

- Importar `useProfessionals()` e `useSetores()` (para o filtro de departamento)
- Remover botão "Ver Perfil" dos cards — clique no card navega ao perfil
- Substituir dados mock por dados reais
- Implementar filtro por status e por setor (client-side sobre array carregado)
- Implementar busca por nome/email (client-side)
- Estado vazio quando `profissionais.length === 0`

### 2.4 View: `RHPerfil.tsx` (modificar)

- Buscar profissional pelo `id` da URL (via `useParams` ou prop de navegação)
- **Aba Informações**: exibir dados reais, popup de edição funcional
- **Aba Documentos**: listar, fazer upload e excluir documentos via `useProfessionals`
- **Aba Histórico**: listar eventos do `historico_profissional` ordenados do mais recente
- **Aba PDI**: campo de texto editável com auto-save (debounced) ou botão "Salvar"

### 2.5 Verificação da Parte 2

- [ ] Criar profissional via drawer → aparece no grid
- [ ] Busca por nome/email filtra em tempo real
- [ ] Filtro por status funciona (Ativo / Férias / Desativado)
- [ ] Filtro por setor funciona (dropdown com setores do usuário)
- [ ] Badge de status derivado corretamente (testar os 3 casos)
- [ ] Editar cargo → histórico registra "mudança_cargo" automaticamente
- [ ] Desativar profissional sem data de desligamento → botão bloqueado
- [ ] Upload de foto (< 5MB) → foto aparece no perfil
- [ ] Upload de documento → aparece na aba Documentos com nome e tamanho
- [ ] Email permanece imutável na edição (campo disabled)
- [ ] Histórico exibe eventos na ordem correta (mais recente primeiro)

---

## PARTE 3 — Sistema de Setores

**Objetivo**: Criar a tela de listagem e gestão de setores. Adicionar sub-abas "Profissionais" / "Setores" na tela principal do módulo RH.

**Dependências**: Parte 1 concluída (`setores` table existe). Parte 2 recomendada (profissionais cadastrados para popular contagem).

### 3.1 Migration

**`20260327000005_extend_setores_for_part3.sql`**
```sql
-- Adicionar campos manager_id e status à tabela setores existente
ALTER TABLE setores
  ADD COLUMN manager_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  ADD COLUMN status BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX idx_setores_name ON setores(user_id, name);
```

### 3.2 Hook: `src/hooks/useSetores.ts`

**Responsabilidades**:
- Listar setores com contagem de profissionais e dados do gestor
- CRUD: criar, editar, excluir setor (exclusão: profissionais ficam com `setor_id = null`)

**Query com contagem**:
```typescript
// SELECT setores.*,
//   COUNT(profissionais.id) as profissionais_count,
//   gestor.nome_completo as gestor_nome,
//   gestor.foto_url as gestor_foto
// FROM setores
// LEFT JOIN profissionais ON profissionais.setor_id = setores.id
// LEFT JOIN profissionais gestor ON setores.manager_id = gestor.id
// WHERE setores.user_id = user_id
// GROUP BY setores.id, gestor.id
// ORDER BY setores.name
```

### 3.3 View: `src/views/RHSetores.tsx` (criar do zero — sem mock existente)

**Estrutura da tela**:
```
[SearchBox "Pesquisar setores..."] [+ Adicionar Setor]

TABELA:
| NOME DO SETOR | COLABORADORES | GESTOR RESPONSÁVEL | STATUS | AÇÕES |
|---------------|---------------|--------------------|--------|-------|
| Tecnologia    | 42            | [foto] Michael C.  | [●]    | ✏️ 🗑️ |

Mostrando 5 de 12 setores cadastrados    [< 1 2 3 >]
```

**Regras**:
- Paginação: 5 itens por página
- Busca: client-side por nome, em tempo real
- Toggle de status: inline (sem drawer)
- Excluir: dialog de confirmação antes de excluir
- Estado vazio quando não há setores

### 3.4 Componente: `src/components/rh/SectorDrawer.tsx` (criar do zero — sem mock existente)

Drawer lateral reutilizável para criação e edição de setores.

**Props**:
```typescript
interface SectorDrawerProps {
  open: boolean
  onClose: () => void
  sector?: Setor | null          // null = modo criação, preenchido = modo edição
  profissionais: Profissional[]  // lista para autocomplete do gestor
  onSave: (data: CreateSetorDTO) => Promise<void>
}
```

**Campos**:
- Nome (input, obrigatório)
- Status (toggle ativo/desativo, ativo por padrão)
- Gestor Responsável (input com filtro sobre `profissionais`, exibe foto + nome)

### 3.5 View: `RHProfissionais.tsx` (modificar — sub-abas)

Adicionar nav de sub-abas no topo:
```tsx
<div className="sub-tabs">
  <button onClick={() => setActiveTab('profissionais')} className={activeTab === 'profissionais' ? 'active' : ''}>
    Profissionais
  </button>
  <button onClick={() => setActiveTab('setores')} className={activeTab === 'setores' ? 'active' : ''}>
    Setores
  </button>
</div>

{activeTab === 'profissionais' && <ProfissionaisGrid />}
{activeTab === 'setores' && <RHSetores />}  {/* ou navegar para /rh/setores */}
```

**Decisão de navegação**: Montar `RHSetores` como sub-componente ou rota separada — preferir rota separada (`/rh/setores`) para URL independente e link direto.

### 3.6 Verificação da Parte 3

- [ ] Sub-abas "Profissionais" e "Setores" visíveis na tela principal
- [ ] Clicar em "Setores" navega para tela de setores
- [ ] Paginação exibe 5 setores por página com controles corretos
- [ ] Busca por nome filtra em tempo real
- [ ] "+ Adicionar Setor" abre drawer com campos corretos
- [ ] Criar setor → aparece na tabela com gestor e status corretos
- [ ] Editar setor → dados atualizados refletidos imediatamente
- [ ] Excluir setor com profissionais → profissionais continuam acessíveis sem setor
- [ ] Contagem de colaboradores é precisa por setor
- [ ] Isolamento: nenhum setor de outro usuário aparece

---

## Regras Transversais (todas as partes)

- **RLS obrigatório**: toda tabela nova tem RLS habilitado com política por `user_id`
- **Cores**: usar apenas variáveis CSS (`var(--color-primary)`, etc.) — nunca hex hardcoded
- **Componentes**: máx 150-200 linhas; extrair lógica para hooks
- **Validação de arquivos**: verificar tamanho antes do upload (5MB fotos, 10MB documentos)
- **Dados sensíveis**: nunca expor em logs ou artefatos — mascarar em testes
- **Sessão**: usar `supabase.auth.getUser()` para obter `user_id` — nunca confiar em dados do cliente
- **Criação de UI ausente (NON-NEGOTIABLE)**: Durante a implementação de qualquer parte, se for identificado que um elemento de layout, componente ou sub-tela necessário para a feature ainda não existe no código — independentemente de estar listado ou não neste plano —, ele DEVE ser criado antes de prosseguir. Não assumir que o elemento existe; verificar no código antes de usar. Qualquer UI faltante descoberta durante a implementação deve ser tratada como bloqueador e resolvida na mesma parte.

---

## Artefatos de Entrega por Parte

### Parte 1
- 2 migrations SQL aplicadas com `supabase db push`
- `src/types/rh.ts` com todos os tipos
- `src/hooks/useRHDashboard.ts`
- `RHDashboard.tsx` conectado a dados reais

### Parte 2
- 2 migrations SQL adicionais
- `src/hooks/useProfessionals.ts`
- `RHProfissionais.tsx` e `RHPerfil.tsx` conectados
- Buckets Storage criados e funcionais

### Parte 3
- 1 migration SQL (extend setores)
- `src/hooks/useSetores.ts`
- `src/views/RHSetores.tsx` (nova tela)
- `src/components/rh/SectorDrawer.tsx` (novo componente)
- Sub-abas em `RHProfissionais.tsx`
