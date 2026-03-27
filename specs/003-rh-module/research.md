# Research: Módulo RH — 003-rh-module

**Phase**: 0 — Outline & Research
**Date**: 2026-03-27
**Branch**: `003-rh-module`

---

## 1. Estado Atual do Código

**Decisão**: As views de UI das Partes 1 e 2 já existem com dados mock. O foco da implementação dessas partes é integração com banco. A Parte 3 (Setores) não tem nenhuma view existente — tudo precisa ser criado.

**Evidência — UI existente (Partes 1 e 2)**:
- `src/views/RHDashboard.tsx` — Dashboard completo com dados fictícios hardcoded
- `src/views/RHProfissionais.tsx` — Grid de cards com dados mock + drawer de criação
- `src/views/RHPerfil.tsx` — Perfil com 4 abas (Informações, Documentos, Histórico, PDI) com dados mock

**Evidência — UI inexistente (Parte 3)**:
- `src/views/RHSetores.tsx` — **NÃO EXISTE**: tela de listagem de setores precisa ser criada do zero
- `src/components/rh/SectorDrawer.tsx` — **NÃO EXISTE**: drawer de criação/edição de setores precisa ser criado do zero
- Sub-aba "Setores" em `RHProfissionais.tsx` — **NÃO EXISTE**: navegação por sub-abas precisa ser adicionada

**Implicação**:
- Partes 1 e 2: não criar novas telas — substituir dados mock por hooks reais.
- Parte 3: criar layout, componentes e hooks inteiramente do zero, seguindo o design system existente (CSS variables, padrão de drawers, tabela paginada).

---

## 2. Modelo de Dados: Uma tabela ou duas para Departamentos/Setores?

**Decisão**: Uma única tabela `setores` unifica os conceitos de "departamento" (Parte 2) e "setor" (Parte 3).

**Rationale**:
- A Parte 2 do spec referencia uma tabela `departamentos` (id, nome, user_id, created_at)
- A Parte 3 do spec define uma entidade `Sector` mais rica (+ manager_id, status)
- Criar duas tabelas separadas geraria redundância e complexidade desnecessária
- A tabela `setores` com todos os campos satisfaz ambas as partes
- O campo na tabela de profissionais será `setor_id` (FK → setores)

**Alternativa rejeitada**: Manter `departamentos` (Parte 2) separada de `setores` (Parte 3) — rejeitada por duplicação.

---

## 3. Status Badge dos Profissionais

**Decisão**: Derivado no frontend com base em campos do banco.

**Lógica**:
```
status = "disabled" → badge "Desativado" (vermelho)
status = "active" AND hoje entre ferias_inicio e ferias_fim → badge "Férias" (amber)
status = "active" AND sem férias ativas → badge "Ativo" (verde)
```

**Rationale**: Não armazenar status derivado no banco — evita inconsistências. Calcular client-side com dados já disponíveis no registro do profissional.

**Alternativa rejeitada**: Campo `computed_status` no banco — rejeitado por acoplamento e necessidade de triggers.

---

## 4. Férias: Tabela separada ou campos no profissional?

**Decisão**: Campos `ferias_inicio` e `ferias_fim` diretamente na tabela `profissionais` (solução simples).

**Rationale**:
- A spec define férias como campos simples (data início e data fim) — sem sistema complexo de aprovação
- A tabela `ferias_profissional` seria necessária apenas para histórico de múltiplas férias
- A view de "Férias Agendadas" no dashboard busca profissionais com férias futuras/em andamento
- O campo `status_ferias` (approved/pending) é armazenado como campo adicional: `ferias_status`

**Alternativa considerada**: Tabela separada `ferias_profissional` — mantida como opção futura mas não necessária para MVP.

---

## 5. Histórico: Geração Automática

**Decisão**: Gerado no hook `useProfessionals` ao detectar mudanças nos campos monitorados.

**Campos monitorados**:
- Criação → entry "admissão" com `data_admissao` do profissional
- Edição cargo → entry "mudança_cargo" com valores anterior/novo
- Edição departamento → entry "mudança_departamento" com valores anterior/novo
- Desativação de status → entry "desligamento" com `data_desligamento`

**Rationale**: Lógica de negócio no hook, não em trigger de banco — mais fácil de debugar e testar. A spec não exige triggers de banco.

---

## 6. Upload de Fotos e Documentos

**Decisão**: Supabase Storage com buckets pré-definidos.

| Bucket | Conteúdo | Limite | Formatos |
|--------|----------|--------|----------|
| `profissional-fotos` | Foto de perfil | 5MB | PNG, JPG |
| `profissional-documentos` | Documentos gerais | 10MB | Qualquer |

**Rationale**: Já definido na spec e alinhado com o padrão existente no módulo jurídico (`process-documents` bucket).

---

## 7. Exportação de Relatório (Parte 1, P2)

**Decisão**: Exportação client-side em PDF usando `window.print()` ou biblioteca leve — sem Edge Function.

**Rationale**:
- Complexidade baixa para MVP: capturar o estado atual do dashboard e gerar PDF
- Edge Functions são necessárias apenas para chamadas a APIs externas — não é o caso aqui
- A spec classifica exportação como P2 (baixa prioridade)

---

## 8. Busca de Profissionais

**Decisão**: Filtragem client-side sobre os dados já carregados.

**Rationale**:
- A spec especifica busca "em tempo real" — implica client-side sem round-trip ao banco
- Volume esperado é pequeno (dezenas ou centenas de profissionais por usuário)
- Padrão já usado em outros módulos do projeto (useLegalProcesses)

---

## 9. Padrão de Hooks

**Decisão**: Seguir padrão de `useFolders.ts` e `useLegalProcesses.ts`.

**Estrutura**:
```typescript
// Estado
const [items, setItems] = useState<T[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

// CRUD
async function create(data: CreateDTO): Promise<T>
async function update(id: string, data: UpdateDTO): Promise<T>
async function remove(id: string): Promise<void>

// Realtime (quando aplicável)
useEffect(() => {
  const channel = supabase.channel(...)
    .on('postgres_changes', ..., () => fetchAll())
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [])
```

---

## 10. Ordem de Implementação

Parte 1 (Dashboard) depende de:
- Tabelas `setores`, `profissionais` criadas
- RLS habilitado em ambas

Parte 2 (Profissionais) depende de:
- Tabelas `historico_profissional`, `documentos_profissional` criadas
- Buckets Storage criados

Parte 3 (Setores) depende de:
- Tabela `setores` já existe (criada na Parte 1)
- Campo `setor_id` em `profissionais` adicionado

**Dependência crítica**: A Parte 1 cria o schema base que as Partes 2 e 3 estendem.
