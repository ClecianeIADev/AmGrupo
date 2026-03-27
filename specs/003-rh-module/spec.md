# Feature Specification: Módulo RH — Gestão de Profissionais

**Feature Branch**: `003-rh-module`
**Created**: 2026-03-25
**Status**: Draft
**Input**: Módulo de gestão de funcionários da empresa com dashboard de métricas, listagem e administração de profissionais
**Scope**: Parte 1 — Dashboard de Gestão | Parte 2 — Gestão de Profissionais | Parte 3 — Sistema de Setores

---

## Contexto

O módulo RH permite que o usuário gerencie os profissionais da empresa. Através do menu lateral "RH", o usuário acessa duas telas principais: **Dashboard** (painel de métricas) e **Profissionais** (listagem e gestão individual).

As telas de layout já existem no sistema com dados fictícios. Esta spec define os requisitos funcionais para tornar o módulo operacional com dados reais: Dashboard (Parte 1) e Gestão de Profissionais (Parte 2).

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

### User Story 8 — Listagem e Busca de Profissionais (Priority: P1)

A tela de listagem já existe no front. O usuário visualiza todos os profissionais cadastrados em grid de cards. Cada card mostra: foto (ou iniciais quando não há foto), nome, cargo, status badge e departamento. Ao clicar no card, o usuário é levado ao perfil do profissional.

**Funcionalidades a implementar (novas)**:
- Integração com banco de dados (substituir dados mock por dados reais da tabela `profissionais`)
- SearchBox filtra por nome ou email em tempo real (client-side)
- Ao limpar o campo de busca, todos os profissionais voltam a aparecer
- Filtro por status: Ativo, Férias, Desativado
- Filtro por departamento (dropdown com departamentos cadastrados na tabela `departamentos`)
- Status badge derivado: active + sem férias atuais = "Ativo" (verde), active + em período de férias = "Férias" (amber), disabled = "Desativado" (vermelho)
- Estado vazio quando não há profissionais cadastrados (mensagem + botão para criar o primeiro)

**Remoções do front atual**:
- Remover botão "Ver Perfil" dos cards — navegação ao perfil é feita clicando no card inteiro

**Why this priority**: A listagem é o ponto de entrada do módulo de Profissionais. Sem ela funcionando com dados reais, nenhuma outra funcionalidade pode ser utilizada.

**Independent Test**: Pode ser testado inserindo profissionais no banco e verificando se aparecem nos cards, se a busca filtra corretamente e se os filtros de status/departamento funcionam.

**Acceptance Scenarios**:

1. **Given** existem 8 profissionais cadastrados pelo usuário, **When** o usuário acessa a tela de Profissionais, **Then** 8 cards são exibidos com nome, cargo, status badge e departamento de cada um
2. **Given** o usuário digita "Sarah" no campo de busca, **When** existe uma profissional chamada "Sarah Jenkins", **Then** apenas o card de Sarah Jenkins é exibido
3. **Given** o usuário digita "sarah@" no campo de busca, **When** existe uma profissional com email contendo "sarah@", **Then** apenas o card correspondente é exibido
4. **Given** o usuário limpa o campo de busca, **When** o campo fica vazio, **Then** todos os profissionais voltam a ser exibidos
5. **Given** o usuário seleciona filtro de status "Ativo", **When** existem 6 profissionais ativos e 2 desativados, **Then** apenas os 6 ativos são exibidos
6. **Given** o usuário seleciona filtro de departamento "Comercial", **When** existem 2 profissionais no departamento Comercial, **Then** apenas esses 2 são exibidos
7. **Given** nenhum profissional está cadastrado, **When** o usuário acessa a tela, **Then** é exibido estado vazio com mensagem e botão para criar o primeiro profissional, texto com sugestão para criar primeiro os departamentos 
8. **Given** o usuário clica no card de um profissional, **When** o card é clicado, **Then** o sistema navega para a tela de perfil desse profissional

---

### User Story 9 — Criação de Profissional (Priority: P1)

Popup slide-in já existe no front. Expandir com todos os campos do formulário:

- Foto de perfil (PNG/JPG, máx 5MB, upload via Supabase Storage)
- Nome Completo (obrigatório)
- Email Corporativo (obrigatório, imutável após cadastro)
- Telefone (input formatado para telefone brasileiro: (XX) XXXXX-XXXX)
- Endereço
- Departamento (select — opções vindas da tabela `departamentos` no Supabase)
- Cargo
- Data de Admissão
- Tipo de Contrato (texto livre, ex: "CLT", "PJ", "Estágio")
- Gestor Imediato (select com profissionais já cadastrados — exibe foto + nome)
- Férias (data início + data fim)
- Competências Técnicas (tags/texto)
- Observações Internas (textarea)
- Gênero (3 opções: Feminino, Masculino, Outros)
- Status (toggle: active/disabled — default: active)
- Aniversário (data)
- PDI (campo de texto)
- Data de Desligamento (visível apenas se status desativado, obrigatório nesse caso, aviso vermelho abaixo do campo: "Profissional desativado requer data de desligamento")

**Importante**: Campo de Documentos NÃO aparece no popup de criação — apenas na tela de perfil.

Ao salvar: cria registro no banco + entry automática no histórico com tipo "admissão" e data de admissão registrada.

**Why this priority**: O cadastro de profissionais é a funcionalidade fundacional — todas as outras (perfil, dashboard, filtros) dependem de ter profissionais cadastrados.

**Independent Test**: Pode ser testado preenchendo o formulário com todos os campos e verificando se o registro é criado corretamente no banco e se o histórico de admissão é gerado.

**Acceptance Scenarios**:

1. **Given** o usuário clica em "+ Adicionar Profissional", **When** o popup abre, **Then** todos os campos do formulário são exibidos com o status toggle ativo por padrão
2. **Given** o usuário preenche todos os campos obrigatórios e clica em "Criar Profissional", **When** os dados são válidos, **Then** o profissional é criado no banco e aparece na grid de cards
3. **Given** o usuário desativa o toggle de status, **When** o campo Data de Desligamento não está preenchido, **Then** o botão "Criar Profissional" fica desabilitado e uma mensagem em vermelho aparece: "Profissional desativado requer data de desligamento"
4. **Given** o usuário faz upload de uma foto PNG de 3MB, **When** a foto é válida, **Then** ela é armazenada no Supabase Storage e a URL é salva no registro
5. **Given** o usuário tenta fazer upload de uma foto de 8MB, **When** o arquivo excede 5MB, **Then** uma mensagem de erro é exibida
6. **Given** o profissional é criado com sucesso, **When** o registro é salvo, **Then** um entry no histórico é criado automaticamente com tipo "admissão" e a data de admissão

---

### User Story 10 — Perfil do Profissional: Aba Informações (Priority: P1)

Tela de perfil já existe no front. Implementar integração com dados reais.

**Sidebar (card lateral esquerdo)**:
- Foto do profissional (ou iniciais quando não há foto)
- Nome, cargo
- Status badge (Ativo/Férias/Desativado)
- Email, telefone, localidade (cidade/estado derivado do endereço)

**Remoções do front atual**:
- Remover card "Métricas de Performance" da sidebar

**Aba "Informações Gerais"** — exibe todos os campos em grid:
- Departamento
- Data de Admissão
- Endereço (col-span-2)
- Tipo de Contrato
- Gestor Imediato (com foto do profissional gestor + nome)
- Aniversário
- Gênero
- Observações Internas
- Data de Desligamento (se aplicável)

**Cars inferiores (card lateral esquerdo)**
- Manter informações de Próximas Férias no card separado das informações gerais
-  Manter informações de Competências Técnicas no card separado das informações gerais 

**Nota**: Email e telefone já estão visíveis na sidebar e não precisam ser duplicados na aba Informações.

**Why this priority**: O perfil é a visão detalhada do profissional — é essencial para consulta rápida de informações e gestão do colaborador.

**Independent Test**: Pode ser testado acessando o perfil de um profissional cadastrado e verificando se todos os campos exibem os dados corretos do banco.

**Acceptance Scenarios**:

1. **Given** o usuário clica no card de "Sarah Jenkins", **When** a tela de perfil carrega, **Then** a sidebar exibe foto, nome "Sarah Jenkins", cargo "Head de Comercial", badge "Ativo", email e telefone
2. **Given** o profissional tem endereço "São Paulo, SP", **When** o perfil carrega, **Then** a localidade na sidebar exibe "São Paulo, SP - Brasil"
3. **Given** o profissional tem gestor imediato "Alex Moraes", **When** a aba Informações Gerais é exibida, **Then** o campo "Gestor Imediato" mostra a foto de Alex Moraes e o nome
4. **Given** o profissional tem competências ["Negociação B2B", "CRM Salesforce"], **When** a aba Informações é exibida, **Then** as competências aparecem como tags inline
5. **Given** o profissional não tem férias agendadas, **When** o card de ferias é exibido, **Then** mostra "Sem férias agendadas"

---

### User Story 11 — Edição de Profissional (Priority: P1)

Popup slide-in de edição já existe no front. Expandir com todos os campos.

- Todos os campos editáveis exceto Email (campo bloqueado com ícone de cadeado)
- Toggle de Status: ao desativar → campo Data de Desligamento aparece e é obrigatório (aviso vermelho: "Profissional desativado requer data de desligamento")
- Ao reativar Status → campo Data de Desligamento desaparece
- Ao salvar: atualiza registro no banco
- Se cargo mudou → cria entry automática no histórico: tipo "mudança_cargo", descrição "Mudança de cargo: {cargo_anterior} → {cargo_novo}"
- Se status mudou para disabled → cria entry no histórico: tipo "desligamento", com data de desligamento registrada

**Why this priority**: A edição permite manter os dados atualizados e gerenciar mudanças de cargo e desligamentos — funcionalidade core do módulo.

**Independent Test**: Pode ser testado editando campos de um profissional e verificando se as alterações são persistidas no banco e se o histórico é atualizado automaticamente.

**Acceptance Scenarios**:

1. **Given** o usuário clica em "Editar" no perfil de Sarah Jenkins, **When** o popup abre, **Then** todos os campos são preenchidos com os dados atuais e o campo Email está bloqueado com ícone de cadeado
2. **Given** o usuário altera o cargo de "Head de Comercial" para "Diretora Comercial" e salva, **When** a edição é salva, **Then** o cargo é atualizado no banco e um entry de histórico é criado: "Mudança de cargo: Head de Comercial → Diretora Comercial"
3. **Given** o usuário desativa o toggle de status, **When** o campo Data de Desligamento não está preenchido, **Then** o botão "Salvar Alterações" fica desabilitado e aviso vermelho aparece
4. **Given** o usuário desativa o toggle de status e preenche data de desligamento "25/03/2026", **When** salva, **Then** o status é atualizado para "disabled", data de desligamento é salva, e um entry de histórico tipo "desligamento" é criado com a data
5. **Given** o usuário reativa o toggle de status, **When** o toggle volta para ativo, **Then** o campo Data de Desligamento desaparece

---

### User Story 12 — Perfil: Aba Documentos (Priority: P1)

- Lista de documentos já adicionados ao profissional
- Botão "Adicionar Documento" para upload de arquivos (máx 10MB por arquivo)
- Upload via Supabase Storage (bucket `profissional-documentos`)
- Cada documento mostra: nome do arquivo, tipo, tamanho, data de upload
- Possibilidade de download e exclusão de documentos (exclusão com dialog de confirmação)

**Why this priority**: Documentos do profissional (contratos, certidões, etc.) são informações essenciais para a gestão de RH e compliance.

**Independent Test**: Pode ser testado fazendo upload de um documento, verificando se aparece na lista, fazendo download e exclusão.

**Acceptance Scenarios**:

1. **Given** o usuário acessa a aba "Documentos" de um profissional, **When** não há documentos, **Then** estado vazio é exibido com botão "Adicionar Documento"
2. **Given** o usuário clica em "Adicionar Documento" e seleciona um arquivo PDF de 5MB, **When** o upload é concluído, **Then** o documento aparece na lista com nome, tipo "PDF", tamanho "5MB" e data de upload
3. **Given** o usuário tenta fazer upload de um arquivo de 15MB, **When** o arquivo excede 10MB, **Then** mensagem de erro é exibida
4. **Given** o usuário clica em download de um documento, **When** o download inicia, **Then** o arquivo é baixado com sucesso
5. **Given** o usuário clica em excluir um documento, **When** o dialog de confirmação aparece e o usuário confirma, **Then** o documento é removido do Storage e da lista

---

### User Story 13 — Perfil: Aba Histórico (Priority: P2)

Timeline visual com eventos do profissional, gerados automaticamente pelo sistema:

- **Admissão**: criado ao cadastrar profissional — registra a data de admissão informada pelo usuário (não a data de criação no sistema)
- **Mudança de cargo**: criado ao editar cargo — descrição: "Mudança de cargo: {anterior} → {novo}"
- **Mudança de departamento**: criado ao editar departamento — descrição: "Mudança de departamento: {anterior} → {novo}"
- **Desligamento**: criado ao desativar status — registra a data de desligamento informada pelo usuário (não a data da alteração no sistema)

Cada entry mostra: data do evento, tipo do evento e descrição.
Timeline ordenada do mais recente para o mais antigo.

**Why this priority**: O histórico é importante para auditoria e rastreabilidade, mas não bloqueia o uso principal do módulo.

**Independent Test**: Pode ser testado criando um profissional, alterando o cargo, desativando o status, e verificando se todos os eventos aparecem na timeline na ordem correta.

**Acceptance Scenarios**:

1. **Given** um profissional tem o campo "data de admissão" com data 01/01/2026 criado no sistema em 02/02/2026, **When** a aba Histórico é acessada, **Then** exibe entry "Admissão" com data "01/01/2026" (data de admissão informada, não a data de criação)
2. **Given** o cargo foi alterado de "Analista" para "Sênior" em 15/03/2026, **When** a aba Histórico é acessada, **Then** exibe entry "Mudança de cargo: Analista → Sênior" com data "15/03/2026"
3. **Given** o departamento foi alterado de "Financeiro" para "Comercial" em 20/03/2026, **When** a aba Histórico é acessada, **Then** exibe entry "Mudança de departamento: Financeiro → Comercial" com data "20/03/2026"
4. **Given** o status foi desativado com data de desligamento 10/04/2026, **When** a aba Histórico é acessada, **Then** exibe entry "Desligamento" com data "10/04/2026" (data de desligamento informada, não a data da alteração)
5. **Given** existem 5 eventos no histórico, **When** a aba é carregada, **Then** os eventos são exibidos do mais recente para o mais antigo
6. **Given** nenhum histórico além da admissão, **When** a aba é acessada, **Then** apenas o evento de admissão é exibido

---

### User Story 14 — Perfil: Aba PDI (Priority: P2)

Plano de Desenvolvimento Individual do profissional.

- Campo de texto para anotações e planejamento de desenvolvimento
- Conteúdo persistido no campo `pdi` da tabela profissionais
- Botão "Salvar" para persistir alterações

**Why this priority**: O PDI é uma funcionalidade de valor agregado para gestão de pessoas, mas não é bloqueante para o funcionamento básico do módulo.

**Independent Test**: Pode ser testado escrevendo conteúdo no campo PDI, salvando, e recarregando a página para verificar se o conteúdo persiste.

**Acceptance Scenarios**:

1. **Given** o usuário acessa a aba PDI de um profissional sem PDI salvo, **When** a aba carrega, **Then** o campo de texto está vazio
2. **Given** o usuário escreve "Desenvolver habilidades de liderança" e clica em "Salvar", **When** a operação é concluída, **Then** o conteúdo é persistido no banco, a aba PDI é atualizada automaticamente, o conteúdo salvo é exibido

---

### Edge Cases

**Dashboard (Parte 1)**:
- O que acontece quando o mês muda enquanto o dashboard está aberto? O sistema deve recalcular as métricas de "Contratações (Mês)" e "Rotatividade" com base no novo mês ao recarregar a página
- O que acontece quando um profissional não possui data de nascimento cadastrada? Ele não aparece na lista de aniversariantes
- O que acontece quando um profissional não possui gênero cadastrado? Ele é contabilizado na categoria "Outros"
- O que acontece quando férias de um profissional já passaram? Elas não aparecem na lista de "Férias Agendadas" (somente férias futuras ou em andamento)
- O que acontece quando existem muitos aniversariantes/férias no mês? A lista deve exibir um texto de ver mais quando atingir o limite de 5 aniversarios no card, quando o usuario clicar em ver mais ele mostra os demais profissionais
- Como lidar com porcentagens de Rotatividade com muitas casas decimais? Arredondar para 1 casa decimal (ex: 4.0%, 1.5%)

**Profissionais (Parte 2)**:
- O que acontece se o usuário tentar cadastrar um email já existente para outro profissional? O sistema exibe erro "Email já cadastrado"
- O que acontece se o usuário desativar o status sem preencher data de desligamento? O botão salvar fica desabilitado e aviso em vermelho é exibido: "Profissional desativado requer data de desligamento"
- O que acontece se o usuário tentar editar o email de um profissional? O campo está bloqueado (disabled + ícone de cadeado)
- O que acontece ao excluir um documento? Dialog de confirmação é exibido antes da exclusão
- O que acontece se o gestor imediato selecionado for o próprio profissional? O sistema impede a seleção (não lista o próprio profissional nas opções)
- O que acontece quando não há profissionais cadastrados? Estado vazio com mensagem e botão para criar o primeiro profissional
- O que acontece ao buscar e não encontrar resultados? Mensagem "Nenhum profissional encontrado"
- O que acontece se a foto de perfil exceder 5MB ou for formato inválido? Erro de validação exibido
- O que acontece se um documento exceder 10MB? Erro de validação exibido
- O que acontece quando um profissional está em período de férias? O badge no card exibe "Férias" (amber) ao invés de "Ativo"
- O que acontece quando o gestor imediato não foi adicionado ao profissional? O campo "Gestor Imediato" não é exibido no front (oculto, não mostra "Não informado")

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

#### Profissionais — Listagem e Busca (Parte 2)

- **FR-016**: O sistema DEVE exibir todos os profissionais do usuário autenticado em grid de cards com foto/iniciais, nome, cargo, status badge e departamento
- **FR-017**: O sistema DEVE filtrar profissionais em tempo real ao digitar no campo de busca (por nome ou email)
- **FR-018**: O sistema DEVE restaurar a lista completa de profissionais ao limpar o campo de busca
- **FR-019**: O sistema DEVE filtrar profissionais pelo status selecionado no dropdown (Ativo, Férias, Desativado)
- **FR-020**: O sistema DEVE filtrar profissionais pelo departamento selecionado (opções vindas da tabela `departamentos`)
- **FR-021**: Ao clicar no card do profissional, o sistema DEVE navegar para a tela de perfil do profissional

#### Profissionais — Criação e Edição (Parte 2)

- **FR-022**: O popup de criação DEVE exibir todos os campos especificados ao clicar em "+ Adicionar Profissional"
- **FR-023**: O campo Email DEVE ser imutável após a criação do profissional (disabled + ícone de cadeado na edição)
- **FR-024**: O campo Telefone DEVE aceitar e formatar no padrão brasileiro (XX) XXXXX-XXXX
- **FR-025**: Quando o toggle de Status for desativado (disabled), o campo Data de Desligamento DEVE aparecer como obrigatório com aviso em vermelho: "Profissional desativado requer data de desligamento"
- **FR-026**: Quando o toggle de Status for ativado (active), o campo Data de Desligamento DEVE desaparecer
- **FR-027**: O campo Gestor Imediato DEVE listar apenas profissionais já cadastrados pelo mesmo usuário (exibindo foto + nome), excluindo o próprio profissional
- **FR-028**: O sistema DEVE fazer upload da foto de perfil no Supabase Storage (bucket `profissional-fotos`, máx 5MB, PNG/JPG) e armazenar a URL no registro

#### Profissionais — Histórico Automático (Parte 2)

- **FR-029**: Ao criar um profissional, o sistema DEVE criar automaticamente um entry no histórico com tipo "admissão" e a data de admissão informada pelo usuário (não a data de criação no sistema)
- **FR-030**: Ao alterar o cargo durante edição, o sistema DEVE criar automaticamente um entry no histórico com tipo "mudança_cargo" e descrição "Mudança de cargo: {cargo_anterior} → {cargo_novo}"
- **FR-031**: Ao alterar o departamento durante edição, o sistema DEVE criar automaticamente um entry no histórico com tipo "mudança_departamento" e descrição "Mudança de departamento: {departamento_anterior} → {departamento_novo}"
- **FR-032**: Ao desativar o status durante edição, o sistema DEVE criar automaticamente um entry no histórico com tipo "desligamento" e a data de desligamento informada pelo usuário

#### Profissionais — Documentos (Parte 2)

- **FR-033**: A aba Documentos DEVE permitir upload de arquivos (máx 10MB por arquivo) com armazenamento no Supabase Storage (bucket `profissional-documentos`)
- **FR-034**: A aba Documentos DEVE permitir download e exclusão de documentos, com dialog de confirmação prévia para exclusão

#### Profissionais — Perfil e PDI (Parte 2)

- **FR-035**: A aba Histórico DEVE exibir timeline de eventos ordenada do mais recente para o mais antigo
- **FR-036**: A aba PDI DEVE persistir o conteúdo de texto no campo `pdi` da tabela profissionais
- **FR-037**: O status badge no card DEVE ser derivado: active + sem férias atuais = "Ativo" (verde), active + em período de férias = "Férias" (amber), disabled = "Desativado" (vermelho)
- **FR-038**: O campo "Gestor Imediato" NÃO DEVE ser exibido no front quando não houver gestor cadastrado para o profissional

#### Segurança e Dados (Parte 2)

- **FR-039**: Todas as operações CRUD nos profissionais DEVEM respeitar RLS com filtro por user_id do usuário autenticado
- **FR-040**: Os departamentos disponíveis no select DEVEM vir da tabela `departamentos` no Supabase, filtrados pelo user_id

### Key Entities

- **Profissional**: Representa um funcionário da empresa. Atributos: nome_completo, email, telefone, endereco, departamento_id (FK para departamentos), cargo, data_admissao, data_desligamento (nullable), tipo_contrato, gestor_imediato_id (FK para profissionais, nullable), ferias_inicio, ferias_fim, competencias_tecnicas (array de strings), observacoes_internas, genero (feminino/masculino/outros), foto_url, status (active/disabled), data_aniversario, pdi, user_id, created_at, updated_at
- **Departamento**: Representa um setor da empresa. Atributos: id, nome, user_id, created_at
- **Documento do Profissional**: Representa um arquivo associado a um profissional. Atributos: id, profissional_id, user_id, nome_arquivo, storage_path, mime_type, tamanho, created_at
- **Histórico do Profissional**: Representa um evento na trajetória do profissional. Atributos: id, profissional_id, user_id, tipo (admissao/mudanca_cargo/mudanca_departamento/desligamento), descricao, data_evento, dados_anteriores (JSON, quando aplicável), created_at

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

#### Profissionais (Parte 2)

- **SC-009**: O usuário consegue criar um profissional com todos os campos em menos de 3 minutos
- **SC-010**: A busca por nome ou email retorna resultados filtrados em menos de 500ms (client-side)
- **SC-011**: O email do profissional permanece imutável em 100% das tentativas de edição
- **SC-012**: Status desativado sem data de desligamento bloqueia o salvamento em 100% dos casos (validação impede salvar)
- **SC-013**: O histórico registra automaticamente 100% das mudanças de cargo e desligamentos sem intervenção manual
- **SC-014**: Documentos uploadados são armazenados e recuperáveis do Supabase Storage com sucesso
- **SC-015**: Nenhum profissional de outro usuário é visível em qualquer tela do módulo (isolamento total por user_id)
- **SC-016**: O sistema exibe estados vazios apropriados quando não há profissionais, documentos ou histórico

---

## Assumptions

### Dashboard (Parte 1)
- A exportação de relatório será em formato PDF
- A sessão do usuário é via Google OAuth com sessionStorage (conforme constituição)

### Profissionais (Parte 2)
- Departamentos vêm da tabela `departamentos` no Supabase (criada e gerenciada pelo usuário, com RLS por user_id)
- A lista de status possíveis do profissional é fixa: active (ativo), disabled (desativado)
- O status visual nos cards (Ativo/Férias/Desativado) é derivado do campo `status` combinado com as datas de férias
- O gênero possui 3 opções: feminino, masculino, outros
- Tipo de contrato é campo de texto livre (ex: "CLT", "PJ", "Estágio", "Temporário")
- Competências técnicas são armazenadas como array de strings no banco
- Férias são campos simples (data início e data fim) no registro do profissional — sem sistema complexo de aprovação
- Foto de perfil: máx 5MB, formatos PNG/JPG, armazenada em bucket `profissional-fotos` no Supabase Storage
- Documentos: máx 10MB por arquivo, armazenados em bucket `profissional-documentos` no Supabase Storage
- PDI é um campo de texto simples (não editor rich text)
- Gestor imediato é um select que lista apenas profissionais ativos do mesmo usuário (exibindo foto + nome)
- Navegação ao perfil do profissional é por click direto no card (sem botão "Ver Perfil" separado)

---

## Parte 3 — Sistema de Setores (Departamentos)

### Contexto

A Parte 3 adiciona gestão completa de setores (departamentos) ao módulo RH. Os setores permitem que o usuário organize seus profissionais em unidades organizacionais. A tela de Profissionais recebe navegação por sub-abas ("Profissionais" e "Setores"), e uma nova tela de listagem de setores é criada.

---

### User Story 15 — Visualizar Lista de Setores (Priority: P1)

O usuário acessa RH → Profissionais e clica na sub-aba "Setores". O sistema exibe uma tabela paginada com todos os setores cadastrados por ele: nome do setor (com ícone), número de colaboradores vinculados, gestor responsável (foto + nome), toggle de status e ações de editar/excluir.

**Why this priority**: Base de todo o fluxo de setores. Sem ela nenhuma outra funcionalidade tem contexto visual. Entrega valor imediato ao gestor que precisa auditar a estrutura departamental.

**Independent Test**: Navegar até RH → Profissionais → aba "Setores" com ao menos um setor cadastrado e verificar que a tabela exibe todas as colunas corretamente.

**Acceptance Scenarios**:

1. **Given** o usuário está em RH → Profissionais, **When** ele clica na sub-aba "Setores", **Then** a tela de setores exibe tabela com colunas: Nome do Setor, Colaboradores, Gestor Responsável, Status e Ações.
2. **Given** existem 12 setores cadastrados, **When** o usuário carrega a tela, **Then** 5 setores são exibidos e a paginação mostra "Mostrando 5 de 12 setores cadastrados" com botões 1, 2, 3.
3. **Given** o usuário está na tela de Setores, **When** ele navega para a página 2, **Then** os próximos 5 setores são exibidos.
4. **Given** não há setores cadastrados, **When** o usuário acessa a aba "Setores", **Then** um estado vazio é exibido com orientação para criar o primeiro setor.

---

### User Story 16 — Criar Novo Setor (Priority: P1)

O usuário clica em "+ Adicionar Setor" e preenche o formulário no drawer lateral: nome do setor, status (ativo por padrão via toggle) e gestor responsável (autocomplete dos profissionais existentes). Ao salvar, o setor aparece imediatamente na lista.

**Why this priority**: Funcionalidade central — sem criação de setores, toda a feature está bloqueada.

**Independent Test**: Criar um setor, salvar e verificar que aparece na tabela com as informações corretas.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de Setores, **When** clica em "+ Adicionar Setor", **Then** um drawer lateral abre com campos: Nome (obrigatório), Status (toggle, ativo por padrão), Gestor Responsável (autocomplete).
2. **Given** o drawer está aberto com dados válidos, **When** o usuário clica em "Salvar", **Then** o setor é persistido, o drawer fecha e o novo setor aparece na lista.
3. **Given** o campo Nome está vazio, **When** o usuário clica em "Salvar", **Then** mensagem de validação é exibida e o setor não é criado.
4. **Given** o usuário digita no campo "Gestor Responsável", **When** digita parte do nome, **Then** apenas profissionais cadastrados pelo mesmo usuário que correspondem são sugeridos.

---

### User Story 17 — Editar Setor (Priority: P2)

O usuário clica no ícone de lápis de um setor. O drawer lateral de edição abre com os dados atuais pré-preenchidos. O usuário altera os campos e salva. As mudanças são refletidas imediatamente na tabela.

**Why this priority**: Necessário para manter dados de setores atualizados, mas pressupõe que a criação (P1) já existe.

**Independent Test**: Editar nome ou gestor de um setor e verificar que a tabela reflete as mudanças após salvar.

**Acceptance Scenarios**:

1. **Given** o usuário clica no ícone de lápis, **Then** o drawer de edição abre com todos os campos pré-preenchidos.
2. **Given** o usuário altera o nome e salva, **Then** o novo nome é refletido imediatamente na tabela.
3. **Given** o usuário altera o status para desativado e salva, **Then** o toggle na tabela passa a mostrar estado desativado.

---

### User Story 18 — Excluir Setor (Priority: P2)

O usuário clica no ícone de lixeira. Uma confirmação é solicitada. Ao confirmar, o setor é removido. Os profissionais vinculados permanecem no sistema, apenas sem setor associado.

**Why this priority**: Necessário para manutenção de dados, mas não bloqueia o uso básico.

**Independent Test**: Excluir um setor com profissionais vinculados e verificar que eles continuam existindo sem setor associado.

**Acceptance Scenarios**:

1. **Given** o usuário clica no ícone de lixeira, **Then** uma confirmação é exibida antes de qualquer exclusão.
2. **Given** o usuário confirma a exclusão, **Then** o setor é removido e os profissionais vinculados permanecem na base sem setor.
3. **Given** o usuário cancela a confirmação, **Then** nenhuma alteração é feita.

---

### User Story 19 — Pesquisar Setores por Nome (Priority: P3)

O usuário digita no campo de busca da tela de Setores. A tabela filtra em tempo real mostrando apenas setores cujo nome contém o termo. Ao limpar a busca, todos os setores voltam a ser exibidos.

**Why this priority**: Melhora a usabilidade para usuários com muitos setores, mas a feature funciona sem busca.

**Acceptance Scenarios**:

1. **Given** existem setores "Tecnologia", "Financeiro" e "Marketing", **When** o usuário digita "Tec", **Then** apenas "Tecnologia" é exibido.
2. **Given** há um termo digitado, **When** o usuário limpa o campo, **Then** todos os setores voltam a ser exibidos.
3. **Given** o usuário pesquisa um nome inexistente, **Then** uma mensagem "Nenhum setor encontrado" é exibida.

---

### Edge Cases (Parte 3)

- Ao excluir um setor que era o único setor de um profissional, o profissional fica com `sector_id` nulo e continua acessível normalmente.
- Se o gestor responsável de um setor for excluído do sistema, o campo gestor do setor fica vazio; o setor continua existindo.
- Nomes de setores duplicados são permitidos (o usuário gerencia a nomenclatura).
- A paginação aplica-se também aos resultados filtrados pela busca.

---

### Functional Requirements (Parte 3)

**Navegação:**
- **FR-041**: O sistema DEVE exibir sub-abas "Profissionais" e "Setores" na tela principal de RH → Profissionais.

**Listagem:**
- **FR-042**: O sistema DEVE exibir setores em tabela paginada (5 por página) com controles de navegação numéricos.
- **FR-043**: A tabela DEVE exibir por linha: nome do setor (com ícone), contagem de colaboradores vinculados, foto e nome do gestor responsável, toggle de status e ações (editar, excluir).
- **FR-044**: O sistema DEVE exibir apenas setores do usuário autenticado (isolamento por user_id).
- **FR-045**: A contagem de colaboradores DEVE refletir em tempo real o número de profissionais com `sector_id` apontando para aquele setor.

**Busca:**
- **FR-046**: O sistema DEVE filtrar setores por nome em tempo real conforme o usuário digita.
- **FR-047**: Ao limpar o campo de busca, o sistema DEVE restaurar a lista completa.

**Criação:**
- **FR-048**: Ao clicar em "+ Adicionar Setor", o sistema DEVE abrir um drawer lateral com campos: Nome (obrigatório), Status (toggle, ativo por padrão), Gestor Responsável (autocomplete de profissionais do usuário).
- **FR-049**: O sistema DEVE persistir o setor e exibi-lo na listagem imediatamente após salvar com sucesso.
- **FR-050**: O sistema DEVE bloquear o salvamento se o campo Nome estiver vazio.

**Edição:**
- **FR-051**: Ao clicar no ícone de lápis, o sistema DEVE abrir drawer de edição com dados atuais pré-preenchidos.
- **FR-052**: As alterações DEVEM ser persistidas e refletidas na tabela imediatamente após salvar.

**Exclusão:**
- **FR-053**: O sistema DEVE solicitar confirmação antes de excluir um setor.
- **FR-054**: Ao excluir um setor, o campo `sector_id` dos profissionais vinculados DEVE ser definido como nulo automaticamente (ON DELETE SET NULL). Os profissionais NÃO devem ser excluídos.

**Segurança:**
- **FR-055**: Todas as operações de leitura e escrita de setores DEVEM ser filtradas pelo `user_id` do usuário autenticado.
- **FR-056**: Nenhum usuário pode visualizar, editar ou excluir setores de outros usuários.

---

### Key Entities (Parte 3)

- **Setor**: Unidade organizacional criada pelo usuário. Atributos: id (UUID), user_id (FK → auth.users), name (texto, obrigatório), manager_id (UUID FK → profissionais, nullable), status (boolean — ativo/desativo), created_at, updated_at.
- **Relacionamento Setor–Profissional**: Um setor tem zero ou muitos profissionais. Um profissional pertence a zero ou um setor. O vínculo é feito pelo campo `sector_id` (UUID FK nullable) na tabela de profissionais. Ao excluir um setor, `sector_id` dos profissionais vinculados é automaticamente definido como nulo.

---

### Success Criteria (Parte 3)

- **SC-017**: Um gestor consegue criar um novo setor em menos de 60 segundos a partir da tela de Profissionais.
- **SC-018**: A filtragem por nome retorna resultados visíveis em menos de 300ms após o usuário digitar.
- **SC-019**: Ao excluir um setor com profissionais vinculados, 100% dos profissionais permanecem acessíveis sem perda de dados.
- **SC-020**: A listagem paginada exibe corretamente 5 setores por página para qualquer quantidade de setores cadastrados.
- **SC-021**: 100% das operações são restritas ao escopo do usuário autenticado — dados de outros usuários nunca são acessados.

---

### Assumptions (Parte 3)

- O campo "Gestor Responsável" é opcional; um setor pode ser criado sem gestor definido.
- A foto do gestor na tabela vem do perfil já existente do profissional no sistema.
- O ícone do setor na tabela usa um conjunto fixo pré-definido pelo sistema (sem personalização nesta versão).
- A confirmação de exclusão é um modal simples (não um segundo drawer).

### Out of Scope (Parte 3)

- Hierarquia de setores (sub-setores, árvore organizacional).
- Importação/exportação de setores via CSV.
- Histórico de alterações de setores.
- Permissões diferenciadas por setor.
- Vinculação profissional↔setor pela tela de Setores (gerenciado individualmente no perfil do profissional).