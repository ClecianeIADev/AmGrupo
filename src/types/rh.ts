// Types for the RH module (003-rh-module)

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
  manager?: Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'> | undefined
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
  /** Visual status derived client-side */
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
  manager_id?: string | null
  status?: boolean
}
