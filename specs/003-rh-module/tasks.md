# Tasks: Módulo RH — Gestão de Profissionais e Setores

**Feature**: `003-rh-module`
**Input**: `specs/003-rh-module/plan.md`, `specs/003-rh-module/spec.md`, `specs/003-rh-module/data-model.md`
**Branch**: `003-rh-module`

**Organização**: 3 partes independentes e incrementais, espelhando a divisão da spec.
- **PARTE 1**: Dashboard de Métricas (substituir mock por dados reais)
- **PARTE 2**: Gestão de Profissionais (CRUD completo, documentos, histórico, PDI)
- **PARTE 3**: Sistema de Setores (tela nova, criada do zero)

---

## Phase 1: Setup — Tipos TypeScript

**Propósito**: Criar os tipos compartilhados que todas as 3 partes utilizam. Sem isso, nenhuma parte pode ser implementada.

**⚠️ CRÍTICO**: Completar antes de qualquer parte.

- [x] T001 Criar `src/types/rh.ts` com todos os tipos e DTOs definidos em `specs/003-rh-module/data-model.md`: `ProfissionalStatus`, `Genero`, `FeriasStatus`, `HistoricoTipo`, `Setor`, `SectorWithCount`, `Profissional`, `ProfissionalWithRelations`, `HistoricoProfissional`, `DocumentoProfissional`, `CreateProfissionalDTO`, `CreateSetorDTO`

**Checkpoint**: `src/types/rh.ts` existe e compila sem erros (`npm run lint`).

---

## PARTE 1 — Dashboard de Métricas

> **Contexto**: As views `src/views/RHDashboard.tsx` já existe com dados mock. O trabalho é criar as migrations, o hook e substituir os dados fictícios por dados reais — **não criar nova tela do zero**.

### Phase 2: Foundations — Migrations Parte 1

**Propósito**: Criar as tabelas base necessárias para o dashboard funcionar.

**⚠️ CRÍTICO**: Aplicar antes de implementar o hook.

- [x] T002 Criar migration `supabase/migrations/20260327000001_create_setores.sql` com a tabela `setores` (id, user_id, name, created_at, updated_at), índice `idx_setores_user_id`, RLS habilitado e policy `"Usuário acessa apenas seus setores"` conforme `specs/003-rh-module/plan.md` seção 1.1
- [x] T003 [P] Criar migration `supabase/migrations/20260327000002_create_profissionais.sql` com a tabela `profissionais` e todos os campos definidos em `specs/003-rh-module/plan.md` seção 1.1 (incluindo `setor_id FK→setores ON DELETE SET NULL`), todos os 4 índices e RLS
- [x] T004 Aplicar as migrations da Parte 1 com `supabase db push` e verificar que ambas as tabelas foram criadas sem erros

**Checkpoint**: `supabase db push` sem erros; tabelas `setores` e `profissionais` existem no banco.

---

### Phase 3: User Story 1 — KPIs do Dashboard (Priority: P1)

**Goal**: Os 4 cards de indicadores-chave (Total, Ativos, Contratações do Mês, Rotatividade) exibem valores reais do banco.

**Independent Test**: Inserir profissionais com status e datas variados e verificar se os 4 cards exibem os valores corretos.

- [ ] T005 [US1] Criar `src/hooks/useRHDashboard.ts` com a estrutura base do hook (estado `loading`, `error`, interface `RHDashboardData`), e implementar a query de KPIs: `total`, `ativos`, `contratacoesMes` (admissões no mês/ano atual), `turnoverPercent` (desligamentos no mês / total × 100, 1 casa decimal) — todas filtradas por `user_id` via RLS
- [ ] T006 [US1] Substituir todos os 4 cards KPI hardcoded em `src/views/RHDashboard.tsx` pelos dados de `useRHDashboard()`, adicionar loading skeleton em cada card e exibir "0" quando não há dados

---

### Phase 4: User Story 2 — Distribuição por Setor (Priority: P1)

**Goal**: Barras de progresso proporcionais por setor, ordenadas do maior para o menor.

**Independent Test**: Inserir profissionais em 3 setores e verificar se as barras refletem as proporções corretas.

- [ ] T007 [US2] Adicionar query `distribuicaoSetores` no `src/hooks/useRHDashboard.ts`: JOIN profissionais→setores, COUNT por setor, calcular percentual relativo ao maior (100%), ordenar DESC por total
- [ ] T008 [US2] Substituir a seção "Distribuição por Setor" mock em `src/views/RHDashboard.tsx` pelos dados reais, adicionar empty state quando não há setores com profissionais

---

### Phase 5: User Story 3 — Gênero e Diversidade (Priority: P1)

**Goal**: Gráfico circular com distribuição por gênero (Masculino, Feminino, Outros) com total no centro.

**Independent Test**: Inserir profissionais com diferentes gêneros e verificar porcentagens no gráfico.

- [ ] T009 [US3] Adicionar query `generos` no `src/hooks/useRHDashboard.ts`: COUNT por gênero; profissionais sem gênero contabilizados em "outros"
- [ ] T010 [US3] Substituir gráfico de gênero mock em `src/views/RHDashboard.tsx` pelos dados reais, adicionar empty state (todos 0%) quando não há profissionais

---

### Phase 6: User Story 4 — Aniversariantes do Mês (Priority: P1)

**Goal**: Lista de profissionais aniversariando no mês atual, ordenados por data mais próxima, com badges "Hoje", "Amanhã", "Em X dias".

**Independent Test**: Inserir profissionais com nascimentos no mês atual e verificar ordem e badges.

- [ ] T011 [US4] Adicionar query `aniversariantes` no `src/hooks/useRHDashboard.ts`: filtrar por `EXTRACT(MONTH FROM data_nascimento) = mês atual`, ordenar por `EXTRACT(DAY FROM data_nascimento)`, calcular `diasAteAniversario` para cada profissional (Hoje=0, Amanhã=1, etc.); profissionais sem data de nascimento excluídos
- [ ] T012 [US4] Substituir seção de aniversariantes mock em `src/views/RHDashboard.tsx` pelos dados reais, adicionar badges de proximidade (Hoje/Amanhã/Em X dias), mostrar apenas 5 por padrão com link "ver mais" para exibir os demais, adicionar empty state

---

### Phase 7: User Story 5 — Férias Agendadas (Priority: P1)

**Goal**: Lista de profissionais com férias futuras ou em andamento, com período, duração e status (Aprovado/Pendente).

**Independent Test**: Inserir férias com diferentes datas e status e verificar se a lista exibe corretamente.

- [ ] T013 [US5] Adicionar query `feriasAgendadas` no `src/hooks/useRHDashboard.ts`: filtrar profissionais onde `ferias_fim >= now()` (futuras ou em andamento), incluir duração em dias calculada no frontend
- [ ] T014 [US5] Substituir seção de férias agendadas mock em `src/views/RHDashboard.tsx` pelos dados reais, exibir período "DD MMM - DD MMM (N dias)", badge "Aprovado" (verde) ou "Pendente" (âmbar), adicionar empty state

---

### Phase 8: User Story 6 — Privacidade de Dados (Priority: P1)

**Goal**: Todas as queries do dashboard filtram exclusivamente por `user_id` do usuário autenticado.

**Independent Test**: Criar 2 usuários distintos com profissionais diferentes e verificar isolamento total.

- [ ] T015 [US6] Verificar em `src/hooks/useRHDashboard.ts` que TODAS as queries utilizam `supabase.auth.getUser()` para obter `user_id` (nunca dados do cliente) e que o RLS está habilitado nas tabelas — corrigir qualquer query que não filtre por `user_id`

---

### Phase 9: User Story 7 — Exportar Relatório (Priority: P2)

**Goal**: Botão "Exportar Relatório" gera snapshot das métricas atuais.

- [ ] T016 [US7] Implementar "Exportar Relatório" em `src/views/RHDashboard.tsx` usando `window.print()` com estilos de impressão aplicados; desabilitar botão enquanto `loading === true`

**Checkpoint PARTE 1**: Dashboard carrega dados reais em < 2s; KPIs precisos; isolamento por usuário verificado.

---

## PARTE 2 — Gestão de Profissionais

> **Contexto**: As views `src/views/RHProfissionais.tsx` e `src/views/RHPerfil.tsx` já existem com dados mock. O trabalho é criar as migrations, o hook e conectar as views existentes — **não criar novas telas do zero**.

### Phase 10: Foundations — Migrations Parte 2

**Propósito**: Criar tabelas de histórico e documentos, e configurar os buckets de Storage.

**⚠️ CRÍTICO**: Aplicar antes de implementar o hook de profissionais.

- [ ] T017 Criar migration `supabase/migrations/20260327000003_create_historico_profissional.sql` com tabela `historico_profissional`, índices e RLS conforme `specs/003-rh-module/plan.md` seção 2.1
- [ ] T018 [P] Criar migration `supabase/migrations/20260327000004_create_documentos_profissional.sql` com tabela `documentos_profissional`, índices e RLS conforme `specs/003-rh-module/plan.md` seção 2.1
- [ ] T019 Aplicar as migrations da Parte 2 com `supabase db push` e verificar criação das tabelas
- [ ] T020 Criar os buckets Supabase Storage `profissional-fotos` (limite 5MB, aceitar PNG/JPG) e `profissional-documentos` (limite 10MB) via Supabase CLI ou dashboard; confirmar que os buckets existem antes de prosseguir

**Checkpoint**: `supabase db push` sem erros; tabelas `historico_profissional` e `documentos_profissional` existem; buckets criados.

---

### Phase 11: User Story 8 — Listagem e Busca (Priority: P1)

**Goal**: Grid de cards com profissionais reais, busca por nome/email, filtros por status e departamento.

**Independent Test**: Inserir 8 profissionais e verificar grid, busca e filtros.

- [ ] T021 [US8] Criar `src/hooks/useProfessionals.ts` com `fetchAll()` retornando todos os profissionais do usuário com joins em `setores` e gestor, e função pura `deriveBadgeStatus(p: Profissional)` que retorna `'Ativo' | 'Férias' | 'Desativado'` conforme lógica do `specs/003-rh-module/plan.md` seção 2.2
- [ ] T022 [US8] Conectar `src/views/RHProfissionais.tsx` ao `useProfessionals()`: remover dados mock, remover botão "Ver Perfil" dos cards, tornar o card inteiro clicável para navegar ao perfil, adicionar loading state e empty state com mensagem e botão para criar primeiro profissional
- [ ] T023 [US8] Adicionar busca em tempo real (por nome e email) em `src/views/RHProfissionais.tsx` usando filtro client-side sobre o array carregado; mostrar mensagem "Nenhum profissional encontrado" quando sem resultados
- [ ] T024 [US8] Adicionar filtro por status (dropdown: Ativo, Férias, Desativado) e filtro por departamento (dropdown com setores do usuário) em `src/views/RHProfissionais.tsx`; ambos aplicados client-side cumulativamente

---

### Phase 12: User Story 9 — Criação de Profissional (Priority: P1)

**Goal**: Drawer de criação com todos os campos, upload de foto, validações e geração automática de histórico de admissão.

**Independent Test**: Preencher o formulário, salvar e verificar registro no banco + entry de histórico.

- [ ] T025 [US9] Adicionar `createProfissional(data: CreateProfissionalDTO, fotoFile?: File)` ao `src/hooks/useProfessionals.ts`: validar foto (≤5MB, PNG/JPG), fazer upload para bucket `profissional-fotos` com path `{user_id}/{profissional_id}/avatar.{ext}`, inserir na tabela `profissionais`, criar entry automático em `historico_profissional` com tipo `'admissao'` usando a `data_admissao` informada pelo usuário
- [ ] T026 [US9] Conectar o drawer de criação em `src/views/RHProfissionais.tsx` com todos os campos do formulário definidos na User Story 9 da spec: foto (upload com preview), nome, email, telefone (máscara BR), endereço, departamento (select de setores), cargo, data admissão, tipo contrato, gestor imediato (select excluindo o próprio), férias (datas), competências, observações, gênero, status toggle, aniversário, PDI; validar que desativar status exige data de desligamento (bloquear botão + aviso vermelho); chamar `useProfessionals.createProfissional()`

---

### Phase 13: User Story 10 — Perfil: Aba Informações (Priority: P1)

**Goal**: Sidebar e aba "Informações Gerais" do perfil exibem dados reais; "Métricas de Performance" removido.

**Independent Test**: Acessar o perfil de um profissional e verificar se todos os campos mostram dados corretos do banco.

- [ ] T027 [US10] Conectar `src/views/RHPerfil.tsx` ao `useProfessionals()`: buscar profissional pelo `id` da rota, exibir dados reais na sidebar (foto/iniciais, nome, cargo, badge status, email, telefone, localidade), remover card "Métricas de Performance" da sidebar, manter card "Próximas Férias" e card "Competências Técnicas" separados
- [ ] T028 [US10] Preencher aba "Informações Gerais" em `src/views/RHPerfil.tsx` com dados reais: departamento, data admissão, endereço, tipo contrato, gestor imediato (foto + nome, oculto quando não definido), aniversário, gênero, observações internas, data de desligamento (quando aplicável)

---

### Phase 14: User Story 11 — Edição de Profissional (Priority: P1)

**Goal**: Drawer de edição com todos os campos, email bloqueado, auto-histórico para cargo/desligamento.

**Independent Test**: Editar cargo de um profissional e verificar entry de histórico criado.

- [ ] T029 [US11] Adicionar `updateProfissional(id, data, fotoFile?)` ao `src/hooks/useProfessionals.ts`: comparar cargo anterior vs novo (criar entry `'mudanca_cargo'`), comparar `setor_id` anterior vs novo (criar entry `'mudanca_departamento'`), ao desativar status criar entry `'desligamento'` com `data_desligamento`; persistir alterações na tabela `profissionais`
- [ ] T030 [US11] Conectar drawer de edição em `src/views/RHProfissionais.tsx` ou `src/views/RHPerfil.tsx` com todos os campos pré-preenchidos, campo email bloqueado com `disabled` e ícone de cadeado (Lucide `Lock`), lógica de data de desligamento obrigatória ao desativar status, chamar `useProfessionals.updateProfissional()`

---

### Phase 15: User Story 12 — Perfil: Aba Documentos (Priority: P1)

**Goal**: Upload, listagem, download e exclusão de documentos no perfil.

**Independent Test**: Fazer upload de um PDF, verificar na lista, baixar e excluir com confirmação.

- [ ] T031 [US12] Adicionar `uploadDocumento()`, `fetchDocumentos()`, `deleteDocumento()` ao `src/hooks/useProfessionals.ts`: upload para bucket `profissional-documentos` (path `{user_id}/{profissional_id}/{timestamp}_{nome_arquivo}`), validar tamanho ≤10MB, salvar metadados em `documentos_profissional`, exclusão remove do Storage e da tabela
- [ ] T032 [US12] Implementar aba "Documentos" em `src/views/RHPerfil.tsx`: lista com nome, tipo, tamanho formatado (ex: "5 MB"), data de upload; botão "Adicionar Documento" com input file; ícone de download; ícone de lixeira com dialog de confirmação antes de excluir; empty state

---

### Phase 16: User Story 13 — Perfil: Aba Histórico (Priority: P2)

**Goal**: Timeline de eventos ordenada do mais recente, gerada automaticamente nas operações de CRUD.

**Independent Test**: Criar profissional, alterar cargo, desativar — verificar 3 entries na timeline na ordem correta.

- [ ] T033 [US13] Implementar aba "Histórico" em `src/views/RHPerfil.tsx`: buscar `historico_profissional` ordenado por `data_evento DESC`, exibir cada entry como item de timeline com data, tipo (badge) e descrição; empty state quando histórico vazio

---

### Phase 17: User Story 14 — Perfil: Aba PDI (Priority: P2)

**Goal**: Campo de texto do PDI persistido no banco.

**Independent Test**: Escrever conteúdo no PDI, salvar, recarregar a página e verificar persistência.

- [ ] T034 [US14] Implementar aba "PDI" em `src/views/RHPerfil.tsx`: textarea com conteúdo carregado do campo `profissionais.pdi`, botão "Salvar" que chama `useProfessionals.updateProfissional()` com o campo `pdi` atualizado

**Checkpoint PARTE 2**: Criar profissional → aparece no grid; busca/filtros funcionam; perfil exibe dados reais; histórico gerado automaticamente; documentos uploadados e acessíveis.

---

## PARTE 3 — Sistema de Setores

> **Contexto**: Nenhuma view ou componente de UI para setores existe no código. `src/views/RHSetores.tsx`, `src/components/rh/SectorDrawer.tsx` e as sub-abas precisam ser **criados inteiramente do zero**, seguindo o design system existente (CSS variables, padrão Lucide icons, layout de tabela do sistema).

### Phase 18: Foundations — Migration Parte 3

**Propósito**: Estender a tabela `setores` com `manager_id` e `status`.

- [x] T035 Criar migration `supabase/migrations/20260327000005_extend_setores_for_part3.sql`: `ALTER TABLE setores ADD COLUMN manager_id UUID REFERENCES profissionais(id) ON DELETE SET NULL, ADD COLUMN status BOOLEAN NOT NULL DEFAULT true` + índice `idx_setores_name ON setores(user_id, name)` conforme `specs/003-rh-module/plan.md` seção 3.1
- [x] T036 Aplicar migration da Parte 3 com `supabase db push` e verificar que `setores` agora possui `manager_id` e `status`

---

### Phase 19: User Story 15 — Listagem de Setores (Priority: P1)

**Goal**: Tela de setores com tabela paginada (5/página), colunas corretas e sub-abas na tela de Profissionais.

**Independent Test**: Navegar RH → Profissionais → aba "Setores" com ao menos 1 setor e verificar tabela com todas as colunas.

- [x] T037 [US15] Criar `src/hooks/useSetores.ts` com `fetchAll()` retornando setores do usuário com `profissionais_count` (COUNT via JOIN) e dados do gestor (`gestor.nome_completo`, `gestor.foto_url`), função `createSetor()`, `updateSetor()`, `deleteSetor()`; todas as operações filtradas por `user_id`
- [x] T038 [P] [US15] Criar `src/views/RHSetores.tsx` do zero: tabela com colunas (Nome com ícone colorido, Colaboradores count, Gestor foto+nome, Status toggle inline, Ações lápis+lixeira usando Lucide `Pencil`/`Trash2`), paginação numérica de 5 itens/página com rodapé "Mostrando X de Y setores cadastrados", loading state, empty state com orientação para criar o primeiro setor; usar apenas `var(--color-*)` do `index.css`
- [x] T039 [US15] Adicionar sub-abas "Profissionais" e "Setores" no topo de `src/views/RHProfissionais.tsx`; ao clicar em "Setores" navegar para `/rh/setores` (rota separada) ou renderizar `<RHSetores />` conforme roteamento existente no projeto

---

### Phase 20: User Story 16 — Criar Setor (Priority: P1)

**Goal**: Drawer lateral de criação com campos, validação e persistência imediata na tabela.

**Independent Test**: Criar um setor via drawer e verificar que aparece na tabela com informações corretas.

- [x] T040 [P] [US16] Criar `src/components/rh/SectorDrawer.tsx` do zero: aceitar props `{ open, onClose, sector?: Setor | null, profissionais: Profissional[], onSave }`, campo Nome (input obrigatório), Status (toggle, ativo por padrão), Gestor Responsável (input com filtro client-side sobre `profissionais` exibindo foto + nome), botão "Salvar" desabilitado se Nome vazio; seguir o padrão visual de drawers existentes no projeto
- [x] T041 [US16] Adicionar botão "+ Adicionar Setor" em `src/views/RHSetores.tsx`, abrir `SectorDrawer` com `sector={null}` (modo criação), ao salvar chamar `useSetores.createSetor()` e atualizar a lista imediatamente

---

### Phase 21: User Story 17 — Editar Setor (Priority: P2)

**Goal**: Ícone de lápis abre drawer com dados pré-preenchidos; alterações refletidas na tabela após salvar.

**Independent Test**: Editar nome de um setor e verificar atualização na tabela.

- [x] T042 [US17] Conectar ícone de lápis em `src/views/RHSetores.tsx` para abrir `SectorDrawer` com `sector={setorSelecionado}` (modo edição com dados pré-preenchidos); ao salvar chamar `useSetores.updateSetor()` e atualizar a tabela

---

### Phase 22: User Story 18 — Excluir Setor (Priority: P2)

**Goal**: Ícone de lixeira com confirmação; profissionais vinculados permanecem sem setor após exclusão.

**Independent Test**: Excluir setor com profissionais vinculados; verificar que profissionais ainda existem com `setor_id = null`.

- [x] T043 [US18] Conectar ícone de lixeira em `src/views/RHSetores.tsx` para abrir modal de confirmação simples (texto: "Tem certeza que deseja excluir o setor \{nome\}? Os profissionais vinculados não serão excluídos."); ao confirmar chamar `useSetores.deleteSetor()` (ON DELETE SET NULL garante profissionais intactos)

---

### Phase 23: User Story 19 — Pesquisar Setores por Nome (Priority: P3)

**Goal**: SearchBox filtra a tabela em tempo real; paginação aplica-se ao resultado filtrado.

**Independent Test**: Digitar "Tec" e verificar que apenas "Tecnologia" aparece; limpar e verificar retorno de todos.

- [x] T044 [US19] Adicionar `SearchBox` em `src/views/RHSetores.tsx` com filtro client-side por nome em tempo real (case-insensitive); paginação deve aplicar-se aos resultados filtrados; mostrar "Nenhum setor encontrado" quando sem resultados; ao limpar o campo restaurar lista completa

**Checkpoint PARTE 3**: Sub-abas visíveis; tabela de setores exibe dados reais com paginação; CRUD completo funciona; isolamento por usuário verificado; profissionais intactos após exclusão de setor.

---

## Phase 24: Polish & Verificações Transversais

**Propósito**: Garantir consistência de design, qualidade de código e sem erros de tipagem.

- [x] T045 [P] Verificar em todos os arquivos novos/modificados que não há cores hex hardcoded (`#fff`, `#3b82f6`, etc.) — substituir por variáveis CSS `var(--color-*)` de `src/index.css`
- [x] T046 [P] Verificar que nenhum componente novo ou modificado ultrapassa 200 linhas; extrair em sub-componentes menores se excedido (ex: separar tabela de setores da paginação em componente próprio)
- [x] T047 [P] Executar `npm run lint` (tsc --noEmit) e corrigir todos os erros de tipagem TypeScript

---

## Dependencies & Execution Order

### Dependências de Fase

```
T001 (tipos) → obrigatório antes de qualquer fase
T002, T003 → T004 (aplicar migrations P1) → T005-T016 (dashboard)
T017, T018 → T019 (aplicar migrations P2) → T020 (buckets) → T021-T034 (profissionais)
T035 → T036 (aplicar migration P3) → T037-T044 (setores)
T045-T047 (polish) → após todas as partes desejadas
```

### Dependências por Parte

- **PARTE 1** depende de: T001 (tipos), T004 (migrations aplicadas)
- **PARTE 2** depende de: T001, T019 (migrations P2 aplicadas), T020 (buckets), T021 (hook base)
- **PARTE 3** depende de: T001, T036 (migration P3 aplicada), T037 (hook setores), T038 (view base), T040 (SectorDrawer)

### Oportunidades de Paralelismo

- **T002 e T003**: Arquivos diferentes — executar em paralelo
- **T017 e T018**: Arquivos diferentes — executar em paralelo
- **T038 e T040**: Arquivos diferentes (`RHSetores.tsx` vs `SectorDrawer.tsx`) — executar em paralelo
- **T045, T046, T047**: Verificações independentes — executar em paralelo

---

## Parallel Example: PARTE 3

```bash
# Executar em paralelo (arquivos diferentes):
Task T038: Criar src/views/RHSetores.tsx (tabela + paginação + empty state)
Task T040: Criar src/components/rh/SectorDrawer.tsx (drawer de criação/edição)
```

---

## Implementation Strategy

### MVP: Apenas PARTE 1 (Dashboard)

1. Completar Phase 1: Setup (T001)
2. Completar Phase 2: Migrations P1 (T002-T004)
3. Completar Phases 3-9: Dashboard (T005-T016)
4. **VALIDAR**: Dashboard exibe dados reais, KPIs corretos, isolamento verificado

### Entrega Incremental

1. Completar Setup + Foundations P1 → PARTE 1 funcional
2. Completar Foundations P2 → PARTE 2 funcional (adiciona CRUD de profissionais)
3. Completar Foundation P3 → PARTE 3 funcional (adiciona gestão de setores)
4. Completar Polish → entrega final

### Regra de UI Ausente (NON-NEGOTIABLE)

Durante a implementação, se for identificado qualquer elemento de UI, componente ou sub-tela necessário que ainda não existe no código e não está listado nas tarefas — **ele deve ser criado antes de prosseguir**. Não assumir que existe; verificar primeiro no código.

---

## Notes

- `[P]` = tarefas que podem rodar em paralelo (arquivos diferentes, sem dependências entre si)
- `[USX]` = qual User Story da spec essa tarefa atende (rastreabilidade)
- Cada parte é um incremento completo e testável independentemente
- Commits sugeridos: após cada checkpoint de parte
- **PARTE 1 e 2**: substituir mock por dados reais — não recriar a UI do zero
- **PARTE 3**: criar UI inteiramente do zero (`RHSetores.tsx`, `SectorDrawer.tsx`, sub-abas)
