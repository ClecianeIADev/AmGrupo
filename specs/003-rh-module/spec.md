# Feature Specification: Módulo RH — Gestão de Profissionais

**Feature Branch**: `003-rh-module`
**Created**: 2026-03-25
**Status**: Draft
**Input**: Módulo de gestão de funcionários da empresa com dashboard de métricas, listagem e administração de profissionais
**Scope**: Parte 1 — Dashboard de Gestão

---

## Contexto

O módulo RH permite que o usuário gerencie os profissionais da empresa. Através do menu lateral "RH", o usuário acessa duas telas principais: **Dashboard** (painel de métricas) e **Profissionais** (listagem e gestão individual).

As telas de layout já existem no sistema com dados fictícios. Esta spec define os requisitos funcionais para tornar o módulo operacional com dados reais, começando pelo Dashboard.

**Nota sobre o layout**: As telas de Dashboard de Gestão, Profissionais, Perfil do Profissional, popups de criação e edição já existem no sistema e não precisam ser recriadas. Apenas funcionalidades novas ou integrações com dados reais devem ser implementadas. Todo elemento visual novo deve seguir o design padrão existente (cores via CSS variables, fontes, componentes reutilizáveis).

**Nota sobre navegação**: O fluxo de navegação RH > Dashboard / Profissionais já está implementado no menu lateral e não precisa ser alterado.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Dashboard de Métricas KPI (Priority: P1)

O usuário acessa o Dashboard de Gestão do módulo RH e visualiza 4 cards de indicadores-chave no topo da tela, todos calculados em tempo real a partir dos dados de profissionais cadastrados no banco de dados:

1. **Total de Colaboradores**: número total de profissionais cadastrados
2. **Colaboradores Ativos**: número de profissionais com status "active"
3. **Contratações (Mês)**: número de profissionais cuja data de admissão está dentro do mês e ano atuais (identificados automaticamente pelo sistema)
4. **Rotatividade (Turnover)**: percentual calculado como (número de desligamentos no mês atual / total de colaboradores) × 100

**Why this priority**: Os KPIs são a informação mais crítica do dashboard — permitem ao gestor ter uma visão instantânea da saúde do quadro de colaboradores. Sem esses indicadores, o dashboard não tem utilidade.

**Independent Test**: Pode ser testado inserindo profissionais com diferentes status e datas de admissão no banco e verificando se os 4 cards exibem os valores corretos.

**Acceptance Scenarios**:

1. **Given** existem 50 profissionais cadastrados no banco, **When** o usuário acessa o Dashboard, **Then** o card "Total de Colaboradores" exibe "50"
2. **Given** dos 50 profissionais, 45 possuem status "active", **When** o usuário acessa o Dashboard, **Then** o card "Colaboradores Ativos" exibe "45"
3. **Given** 3 profissionais possuem data de admissão no mês/ano atuais, **When** o usuário acessa o Dashboard, **Then** o card "Contratações (Mês)" exibe "03"
4. **Given** 2 profissionais possuem data de desligamento no mês atual e existem 50 no total, **When** o usuário acessa o Dashboard, **Then** o card "Rotatividade" exibe "4.0%"
5. **Given** nenhum profissional está cadastrado, **When** o usuário acessa o Dashboard, **Then** todos os cards KPI exibem "0" (e Rotatividade exibe "0%")

---

### User Story 2 — Distribuição por Setor (Priority: P1)

O usuário visualiza no dashboard uma seção "Distribuição por Setor" que exibe barras de progresso proporcionais mostrando a quantidade de profissionais em cada departamento. As barras são proporcionais ao departamento com mais colaboradores (que ocupa 100% da largura). A lista é ordenada do departamento com mais profissionais para o menor.

**Why this priority**: A distribuição por setor é informação essencial para o gestor entender a composição da equipe e identificar desequilíbrios de headcount entre departamentos.

**Independent Test**: Pode ser testado inserindo profissionais em diferentes departamentos e verificando se as barras refletem corretamente a proporção e a contagem.

**Acceptance Scenarios**:

1. **Given** existem 3 departamentos com 20, 10 e 5 profissionais respectivamente, **When** o dashboard carrega, **Then** o primeiro departamento exibe barra a 100%, o segundo a 50%, e o terceiro a 25%, cada um com o número de colaboradores ao lado
2. **Given** um novo departamento (setor) é criado ao cadastrar um novo setor na tela de 'setores' que será criada, **When** o dashboard é recarregado, **Then** o novo departamento aparece na lista
3. **Given** nenhum profissional está cadastrado, **When** o dashboard carrega, **Then** a seção "Distribuição por Setor" exibe estado vazio (sem barras)

---

### User Story 3 — Gênero e Diversidade (Priority: P1)

O usuário visualiza no dashboard um gráfico circular (donut chart) que mostra a distribuição de gênero dos profissionais cadastrados. O gráfico exibe o número total de profissionais no centro e, abaixo dele, a porcentagem de cada categoria: **Masculino**, **Feminino** e **Outros**.

**Why this priority**: Métricas de diversidade são essenciais para compliance e decisões estratégicas de RH. A visualização gráfica permite análise imediata.

**Independent Test**: Pode ser testado inserindo profissionais com diferentes valores de gênero e verificando se o gráfico e as porcentagens estão corretos.

**Acceptance Scenarios**:

1. **Given** existem 100 profissionais: 55 masculino, 35 feminino, 10 outros, **When** o dashboard carrega, **Then** o gráfico exibe "100" no centro, com legendas "Masculino 55%", "Feminino 35%", "Outros 10%"
2. **Given** todos os profissionais são do mesmo gênero, **When** o dashboard carrega, **Then** o gráfico exibe 100% para essa categoria e 0% para as demais
3. **Given** nenhum profissional cadastrado, **When** o dashboard carrega, **Then** o gráfico exibe "0" no centro com todas as porcentagens a 0%

---

### User Story 4 — Aniversariantes do Mês (Priority: P1)

O usuário visualiza uma lista dos profissionais que fazem aniversário no mês atual. Cada item mostra: foto (ou iniciais), nome, data de aniversário, departamento, e uma indicação de proximidade (ex: "Amanhã", "Em 4 dias"). A lista é ordenada pela data mais próxima primeiro.

**Why this priority**: Aniversários são uma funcionalidade social importante para engajamento e cultura organizacional. Permite ao gestor parabenizar colaboradores no momento certo.

**Independent Test**: Pode ser testado inserindo profissionais com datas de nascimento no mês atual e verificando se aparecem na lista com a ordem e indicações corretas.

**Acceptance Scenarios**:

1. **Given** 3 profissionais fazem aniversário no mês atual (dias 5, 12, 25), e hoje é dia 3, **When** o dashboard carrega, **Then** a lista exibe os 3 profissionais ordenados por data mais próxima (dia 5 primeiro), com a indicação "Em 2 dias" para o primeiro
2. **Given** um profissional faz aniversário amanhã, **When** o dashboard carrega, **Then** o item exibe o badge "Amanhã" destacado
3. **Given** um profissional faz aniversário hoje, **When** o dashboard carrega, **Then** o item exibe o badge "Hoje" destacado
4. **Given** nenhum profissional faz aniversário no mês atual, **When** o dashboard carrega, **Then** a seção exibe mensagem de nenhum aniversario proximo

---

### User Story 5 — Férias Agendadas (Priority: P1)

O usuário visualiza uma lista dos profissionais que possuem férias agendadas. Cada item mostra: foto (ou iniciais), nome, período das férias (data início - data fim com duração em dias), e status das férias (Aprovado ou Pendente). 

**Why this priority**: Visibilidade de férias agendadas é essencial para planejamento de recursos e continuidade operacional.

**Independent Test**: Pode ser testado inserindo registros de férias para profissionais e verificando se a lista exibe corretamente os períodos e status.

**Acceptance Scenarios**:

1. **Given** 2 profissionais possuem férias agendadas (um com status "approved", outro com "pending"), **When** o dashboard carrega, **Then** a lista exibe ambos com seus respectivos badges de status ("Aprovado" em verde, "Pendente" em azul)
2. **Given** férias de 10 Nov a 25 Nov, **When** exibidas na lista, **Then** mostra "10 Nov - 25 Nov (15 dias)"
3. **Given** nenhum profissional possui férias agendadas, **When** o dashboard carrega, **Then** a seção exibe mensagem de estado vazio

---

### User Story 6 — Privacidade de Dados no Dashboard (Priority: P1)

Todas as métricas e listas do dashboard são calculadas exclusivamente a partir dos profissionais que pertencem ao usuário autenticado. Um usuário nunca deve visualizar dados de profissionais cadastrados por outro usuário. O sistema deve garantir isolamento completo de dados por usuário em todas as consultas.

**Why this priority**: A privacidade de dados é um requisito não-negociável da constituição do projeto (Princípio III). Sem essa garantia, o sistema não pode ser utilizado.

**Independent Test**: Pode ser testado criando profissionais com 2 usuários diferentes e verificando que cada um só vê métricas dos seus próprios profissionais.

**Acceptance Scenarios**:

1. **Given** o Usuário A cadastrou 30 profissionais e o Usuário B cadastrou 20, **When** o Usuário A acessa o Dashboard, **Then** o "Total de Colaboradores" exibe "30" (não 50)
2. **Given** o Usuário A está autenticado, **When** qualquer consulta ao banco é feita pelo Dashboard, **Then** a consulta filtra automaticamente por user_id do usuário autenticado
3. **Given** um usuário não autenticado tenta acessar o Dashboard, **When** a página carrega, **Then** o sistema redireciona para a tela de login

---

### User Story 7 — Exportar Relatório do Dashboard (Priority: P2)

O usuário pode clicar no botão "Exportar Relatório" no cabeçalho do Dashboard para gerar um arquivo com as métricas atuais. O relatório contém um snapshot de todos os KPIs, distribuição por setor, métricas de diversidade, lista de aniversariantes e férias agendadas.

**Why this priority**: Exportação é importante para compartilhamento e arquivo, mas não bloqueia o uso principal do dashboard. Pode ser implementado depois das métricas em tempo real.

**Independent Test**: Pode ser testado clicando no botão e verificando se o arquivo gerado contém todos os dados exibidos no dashboard.

**Acceptance Scenarios**:

1. **Given** o dashboard exibe métricas válidas, **When** o usuário clica em "Exportar Relatório", **Then** um arquivo é gerado e baixado contendo todas as métricas atuais
2. **Given** o dashboard está carregando dados, **When** o usuário clica em "Exportar Relatório", **Then** o botão fica desabilitado até o carregamento terminar

---

### Edge Cases

- O que acontece quando o mês muda enquanto o dashboard está aberto? O sistema deve recalcular as métricas de "Contratações (Mês)" e "Rotatividade" com base no novo mês ao recarregar a página
- O que acontece quando um profissional não possui data de nascimento cadastrada? Ele não aparece na lista de aniversariantes
- O que acontece quando um profissional não possui gênero cadastrado? Ele é contabilizado na categoria "Outros"
- O que acontece quando férias de um profissional já passaram? Elas não aparecem na lista de "Férias Agendadas" (somente férias futuras ou em andamento)
- O que acontece quando existem muitos aniversariantes/férias no mês? A lista deve exibir um texto de ver mais quando atingir o limite de 5 aniversarios no card, quando o usuario clicar em ver mais ele mostra os demais profissionais 
- Como lidar com porcentagens de Rotatividade com muitas casas decimais? Arredondar para 1 casa decimal (ex: 4.0%, 1.5%)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir o número total de profissionais cadastrados pelo usuário autenticado no card "Total de Colaboradores"
- **FR-002**: O sistema DEVE exibir o número de profissionais com status "active" no card "Colaboradores Ativos"
- **FR-003**: O sistema DEVE exibir o número de profissionais cuja data de admissão está no mês e ano atuais no card "Contratações (Mês)", formatando com zero à esquerda quando menor que 10 (ex: "03", "08")
- **FR-004**: O sistema DEVE calcular e exibir a taxa de rotatividade como (desligamentos no mês atual / total de colaboradores) × 100, arredondada a 1 casa decimal
- **FR-005**: O sistema DEVE exibir barras de progresso proporcionais por departamento na seção "Distribuição por Setor", ordenadas do maior para o menor, com o departamento com mais profissionais ocupando 100% da largura
- **FR-006**: O sistema DEVE exibir um gráfico circular com a distribuição de gênero (Masculino, Feminino, Outros), mostrando o total no centro e porcentagens abaixo
- **FR-007**: O sistema DEVE listar os profissionais que fazem aniversário no mês atual, ordenados pela data mais próxima, com foto/iniciais, nome, data, departamento e indicação de proximidade (Hoje, Amanhã, Em X dias)
- **FR-008**: O sistema DEVE listar os profissionais com férias agendadas (futuras ou em andamento), mostrando foto/iniciais, nome, período (data início - data fim), duração em dias e status (Aprovado/Pendente)
- **FR-009**: Todas as consultas do Dashboard DEVEM filtrar dados exclusivamente pelo user_id do usuário autenticado (isolamento por RLS)
- **FR-010**: O sistema DEVE redirecionar para a tela de login caso o usuário não esteja autenticado
- **FR-011**: O botão "Exportar Relatório" DEVE gerar um arquivo contendo todas as métricas atuais do dashboard
- **FR-012**: O sistema DEVE exibir estados vazios apropriados quando não há dados para exibir em qualquer seção do dashboard
- **FR-013**: Profissionais sem data de nascimento cadastrada NÃO DEVEM aparecer na lista de aniversariantes
- **FR-014**: Profissionais sem gênero cadastrado DEVEM ser contabilizados na categoria "Outros"
- **FR-015**: O layout existente do Dashboard DEVE ser mantido — nenhuma alteração visual exceto integração de dados reais no lugar dos dados mock

### Key Entities

- **Profissional**: Representa um funcionário da empresa. Atributos principais: nome completo, email corporativo, telefone, departamento, cargo, data de admissão, status (active, disabled), gênero (male, female, other), data de nascimento, endereço, tipo de contrato, gestor imediato, foto, competências técnicas, observações internas, data de desligamento (quando aplicável)
- **Férias**: Representa um período de férias agendado para um profissional. Atributos: profissional associado, data início, data fim, status (approved, pending)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O dashboard carrega e exibe todas as métricas em menos de 2 segundos após o acesso
- **SC-002**: 100% dos KPIs exibem valores precisos e verificáveis com os dados no banco
- **SC-003**: Um usuário nunca visualiza dados de profissionais que não lhe pertencem (isolamento total)
- **SC-004**: O dashboard exibe estados vazios coerentes quando o usuário não tem profissionais cadastrados
- **SC-005**: A taxa de rotatividade é calculada corretamente com precisão de 1 casa decimal
- **SC-006**: A lista de aniversariantes exibe a indicação de proximidade correta (Hoje, Amanhã, Em X dias) com base na data atual do sistema
- **SC-007**: A lista de férias agendadas exibe apenas férias futuras ou em andamento, com a duração calculada corretamente em dias
- **SC-008**: O relatório exportado contém as mesmas métricas exibidas no dashboard no momento da exportação

---

## Assumptions

- Os departamentos são um campo textual livre no cadastro do profissional (não uma tabela separada de departamentos)
- A lista de status possíveis do profissional é fixa: active (ativo), (disabled) desativado
- O gênero possui 3 opções: male (masculino), female (feminino), other (outros)
- A exportação de relatório será em formato PDF
- A sessão do usuário é via Google OAuth com sessionStorage (conforme constituição)