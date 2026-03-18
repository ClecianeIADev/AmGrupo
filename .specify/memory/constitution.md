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

**Version**: 1.2.0 | **Ratificada**: 2026-03-16 | **Última Alteração**: 2026-03-17 (Adição de regra de tradução automática)
