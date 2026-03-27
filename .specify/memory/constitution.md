# AM Grupo ERP Constitution

## Core Principles

### I. Supabase como Única Fonte de Verdade
Toda persistência e autenticação passa pelo Supabase. Nenhuma chamada direta a APIs externas deve existir no frontend — use Edge Functions (`supabase/functions/`) para isso. O schema do banco é auditado e toda operação DDL deve ser registrada como migration via `apply_migration` — nunca manualmente pelo painel do Supabase.

### II. Autenticação via Google SSO (NON-NEGOTIABLE)
O único método de login é Google OAuth via Supabase Auth. Login com email/senha está proibido e não deve ser reintroduzido. Toda sessão autenticada deve preservar o `provider_token` do Google para uso nas Edge Functions de integração com Gmail.

### III. Privacidade de Dados por Usuário (NON-NEGOTIABLE)
Cada usuário autenticado só deve visualizar dados que lhe pertencem. Queries ao Supabase devem sempre filtrar por `user_id`. Row-Level Security (RLS) deve ser habilitada em todas as tabelas que armazenam dados privados. Nenhuma query deve retornar dados de outros usuários, mesmo que acidentalmente.

### IV. Clean Code e Componentes Pequenos
Funções devem fazer apenas uma coisa. Nomes de variáveis, funções e componentes devem ser auto-descritivos — sem abreviações obscuras. Componentes React têm no máximo 150–200 linhas; lógica e UI devem ser separadas. Código duplicado (3x ou mais) deve ser extraído para uma função reutilizável (DRY — Don't Repeat Yourself).

### V. Segurança de Dados e Código
Segredos (API keys, tokens, URLs de banco) nunca no código-fonte — usar `.env`. Nunca renderizar HTML vindo do usuário diretamente (prevenção XSS). Sempre validar entrada de usuário. Sempre usar queries parametrizadas via Supabase client (prevenção SQL Injection). Edge Functions que chamam APIs externas (Gmail, etc.) são o único ponto de saída autorizado.Nunca expor chaves, tokens ou segredos no frontend

### VII. Sessão Obrigatória via Google — Expiração ao Fechar o Navegador (NON-NEGOTIABLE)
Nenhum usuário pode acessar qualquer rota do sistema sem estar autenticado via Google OAuth. Qualquer acesso sem sessão válida redireciona imediatamente para a tela de login. A sessão é armazenada exclusivamente em `sessionStorage` (nunca em `localStorage`), garantindo que ao fechar o navegador ou aba a sessão seja automaticamente encerrada — sem "lembrar" o login entre sessões distintas. O token do Google (`google_provider_token`) segue a mesma regra: gravado em `sessionStorage` e removido ao deslogar ou ao encerrar o navegador. O cliente Supabase deve ser instanciado com `storage: window.sessionStorage` e `persistSession: true`.

### VI. Design Consistente e Premium
Todo novo componente deve seguir o design system do projeto: paleta de cores via variáveis CSS em `index.css`, fontes via Google Fonts (Inter/Outfit), e padrões de cards/tabelas já estabelecidos. É proibido usar cores hardcoded (`#fff`, `red`) — usar variáveis (`var(--color-primary)`). Micro-animações são encorajadas via Motion. Componentes devem ser reutilizáveis e consistentes entre módulos.

### VIII. Tradução Automática baseada no Sistema (NON-NEGOTIABLE)
O sistema deve identificar automaticamente o idioma/localidade do computador do usuário e adaptar a interface e comunicações de acordo. A experiência inicial do usuário deve ser sempre no seu idioma nativo detectado, sem necessidade de configuração manual prévia.

### IX. Verificação Baseada em Provas — Evidence-Based Execution (NON-NEGOTIABLE)
Toda execução de tarefa, feature ou automação deve ser validada por evidências concretas (artefatos). Respostas baseadas apenas em descrição textual ou logs NÃO são consideradas suficientes.

**O que é proibido:**
- Declarar sucesso sem prova verificável
- Confiar apenas em logs como evidência
- Responder "feito" sem output real
- Executar tarefas sem gerar evidências persistentes

**O que é obrigatório:**

1. **Geração de Artefatos** — Toda feature deve produzir pelo menos um dos seguintes: arquivos gerados (`.json`, `.pdf`, `.csv`, `.html`), screenshots da execução, logs estruturados, outputs de testes automatizados, ou respostas reais de APIs.

2. **Validação da Execução** — A execução só é válida se: o resultado puder ser verificado externamente, o artefato for reproduzível, e houver evidência clara de funcionamento.

3. **Testes Automatizados** — Sempre que possível: criar testes (unitários ou integração), executar após implementação, e retornar resultado como evidência.

4. **Prova de Funcionamento** — Para cada feature implementada, incluir: o que foi feito, evidência concreta (artefato), e como validar manualmente (passo a passo).

5. **Estrutura de Resposta Obrigatória** — Toda resposta de implementação deve seguir o formato:
   - **## Status** (Sucesso / Falha)
   - **## Implementação** (Resumo técnico)
   - **## Artefatos Gerados** (Lista de arquivos, outputs, prints)
   - **## Testes** (Resultado dos testes executados)
   - **## Como Validar** (Passo a passo para verificação)
   - **## Limitações / Observações** (Se houver)

6. **Regra de Ouro** — Se não houver artefato verificável, a tarefa deve ser considerada incompleta.

7. **Mentalidade Esperada** — O agente deve agir como engenheiro de software profissional, QA (garantia de qualidade) e auditor técnico. Objetivo: entregas confiáveis, auditáveis, reproduzíveis e baseadas em evidência real.

---

## Segurança e Ambientes Operacionais

### 9. Separação de Ambientes
Toda execução deve respeitar os ambientes: **DEV** (desenvolvimento local), **STAGING** (testes e validação), **PROD** (ambiente real de usuários).
- Testes automatizados devem rodar apenas em DEV ou STAGING
- Nunca executar testes destrutivos em PROD
- Nunca alterar, excluir ou popular dados reais sem autorização explícita
- Toda ação em PROD deve ser tratada como crítica

### 10. Proteção de Dados Sensíveis
É proibido expor em artefatos: senhas, tokens, chaves de API, dados bancários, CPF/RG/telefone/endereço, dados privados de usuários. Sempre mascarar ou anonimizar dados. Sempre usar dados fictícios em testes. Nunca incluir credenciais reais em screenshots, vídeos, logs ou código.

### 11. Uso Seguro de Testes Automatizados
Toda automação deve evitar: ações irreversíveis, exclusão em massa, envio de emails reais, pagamentos reais, consumo desnecessário de APIs externas. Se uma ação tiver potencial destrutivo, deve haver confirmação explícita antes da execução.

### 12. Controle de Evidências
Artefatos gerados devem: ser armazenados em local separado, organizados por data/feature/execução, não conter dados sensíveis, e poder ser removidos facilmente após auditoria.

### 13. Logs Seguros
Logs devem ser estruturados, evitar exposição de credenciais e stack traces desnecessárias em produção, e destacar erros críticos. Nunca registrar: senhas, tokens, headers de autenticação, cookies, dados privados.

### 14. Regra de Segurança Máxima
Se houver dúvida sobre risco, impacto ou exposição: não executar automaticamente, explicar o risco, solicitar confirmação explícita.

### 15. Detecção Proativa de Vulnerabilidades
Durante qualquer teste, implementação ou validação, buscar ativamente por: falhas de autenticação/autorização, exposição de rotas privadas, dados sensíveis expostos, campos sem validação, inputs vulneráveis a injeção, permissões excessivas, dependências vulneráveis, configurações inseguras, headers ausentes, armazenamento inseguro de credenciais, upload inseguro de arquivos, e possíveis falhas de XSS, SQL Injection, CSRF, SSRF e Path Traversal.

### 16. Correção Obrigatória de Vulnerabilidades
Se uma vulnerabilidade for identificada: explicar o risco, pedir permissão para corrigir, explicar a correção, gerar evidência, e executar novos testes. A vulnerabilidade só é considerada resolvida se houver prova de que não ocorre mais, teste cobrindo o caso, e evidência reproduzível da correção.

### 17. Testes de Segurança Automatizados
Sempre que possível, incluir testes validando: rotas protegidas, regras de permissão, sanitização de inputs, limite de uploads, validação de arquivos, expiração de sessão, controle de acesso, rate limiting, headers de segurança, e comportamento diante de payloads maliciosos.

### 18. Dependências Vulneráveis
Sempre verificar dependências em busca de vulnerabilidades conhecidas. Se houver dependências críticas vulneráveis: atualizar automaticamente quando seguro, informar impactos e possíveis breaking changes, e gerar relatório das vulnerabilidades encontradas.

### 19. Regra de Segurança Crítica
Nenhuma feature pode ser considerada concluída se houver vulnerabilidade crítica conhecida sem correção ou mitigação documentada.

### 20. Headers e Configurações Seguras
Verificar se a aplicação utiliza: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `SameSite` em cookies, `Secure` e `HttpOnly` em cookies, e HTTPS obrigatório.

---

## Restrições Técnicas

- **Stack permitida**: React + Vite + TypeScript. Nenhum framework adicional sem aprovação explícita.
- **Estilização**: Vanilla CSS + variáveis customizadas em `index.css`. Tailwind está proibido sem deliberação explícita.
- **Edge Functions**: Escritas em TypeScript/Deno, com responsabilidade única. Nomeadas em `snake_case` (ex: `send_gmail_reply`, `fetch_gmail_inbox`). Toda chamada a API externa (Gmail API, etc.) vive aqui — nunca no frontend.
- **Banco de dados**: Alterações de schema somente via `apply_migration`. Nunca editar tabelas diretamente pelo painel do Supabase.
- **Autenticação**: Exclusivamente Google OAuth 2.0 via Supabase Auth. Nenhum outro provider sem aprovação.
- **Testes**: Usar Vitest para unitários e de componentes. Toda função utilitária crítica deve ter cobertura de teste. Testes de API validam contratos das Edge Functions.
- **Internacionalização (i18n)**: Implementar detecção de locale via `navigator.language` ou APIs equivalentes do sistema para garantir a tradução automática conforme a identificação do computador do usuário.

---

## Workflow de Desenvolvimento

1. **Feature começa com spec**: Toda nova feature de médio/grande porte documenta o objetivo, user stories e critérios de aceite antes da implementação.
2. **Arquitetura por domínio**: Organizar código seguindo Domain-Driven Design — módulos separados por domínio (`clients`, `legal`, `finance`, `sales`, `hr`). Evitar acoplamento entre domínios.
3. **Edge Functions isoladas**: Cada função com responsabilidade única. Nenhuma Edge Function deve acumular múltiplas responsabilidades.
4. **Verificação manual antes de concluir**: O desenvolvedor testa os fluxos críticos no browser antes de considerar a tarefa concluída.
5. **Migrations documentadas**: Toda alteração de schema tem uma migration versionada com descrição do motivo.

---

## Governance

Esta constituição tem precedência sobre qualquer outro padrão ou convenção do projeto. Alterações exigem documentação do motivo e revisão de impacto. Toda ambiguidade de implementação deve ser resolvida consultando este documento primeiro. Nenhum PR que viole os princípios I, II ou III deve ser aprovado.

**Version**: 1.3.0 | **Ratificada**: 2026-03-16 | **Última Alteração**: 2026-03-27 (Adição de princípio IX — Verificação Baseada em Provas e seção de Segurança e Ambientes Operacionais)
