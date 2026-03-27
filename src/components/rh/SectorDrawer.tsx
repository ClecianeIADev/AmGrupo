import { useState, useEffect, useRef } from 'react'
import { X, Building2 } from 'lucide-react'
import type { Profissional, SectorWithCount } from '../../types/rh'

interface Props {
  open: boolean
  onClose: () => void
  sector: SectorWithCount | null
  profissionais: Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'>[]
  onSave: (data: { name: string; manager_id: string | null; status: boolean }) => Promise<void>
}

export function SectorDrawer({ open, onClose, sector, profissionais, onSave }: Props) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState(true)
  const [managerId, setManagerId] = useState<string | null>(null)
  const [managerSearch, setManagerSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)
  const managerRef = useRef<HTMLDivElement>(null)

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setName(sector?.name ?? '')
      setStatus(sector?.status ?? true)
      setManagerId(sector?.manager_id ?? null)
      setManagerSearch(sector?.manager?.nome_completo ?? '')
      setSaving(false)
    }
  }, [open, sector])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (managerRef.current && !managerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredProfs = managerSearch.trim()
    ? profissionais.filter(p => p.nome_completo.toLowerCase().includes(managerSearch.toLowerCase()))
    : profissionais

  function selectManager(p: Pick<Profissional, 'id' | 'nome_completo' | 'foto_url'>) {
    setManagerId(p.id)
    setManagerSearch(p.nome_completo)
    setShowSuggestions(false)
  }

  function clearManager() {
    setManagerId(null)
    setManagerSearch('')
  }

  async function handleSubmit(e?: { preventDefault?: () => void }) {
    e?.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), manager_id: managerId, status })
    setSaving(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex justify-end">
      <div className="w-full max-w-[480px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="text-primary" size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {sector ? 'Editar Setor' : 'Adicionar Setor'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Nome do Setor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Nome do Setor <span className="text-red-400">*</span>
            </label>
            <input
              className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400"
              placeholder="Ex: Tecnologia"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Gestor Responsável — autocomplete */}
          <div className="space-y-1.5" ref={managerRef}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Gestor Responsável
            </label>
            <div className="relative">
              <input
                className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400"
                placeholder={profissionais.length === 0 ? 'Nenhum profissional cadastrado' : 'Buscar profissional...'}
                value={managerSearch}
                onChange={e => {
                  setManagerSearch(e.target.value)
                  setManagerId(null)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                disabled={profissionais.length === 0}
              />
              {managerId && (
                <button
                  type="button"
                  onClick={clearManager}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
              {showSuggestions && filteredProfs.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredProfs.map(p => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => selectManager(p)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                      >
                        {p.foto_url ? (
                          <img src={p.foto_url} className="size-7 rounded-full object-cover shrink-0" alt="" />
                        ) : (
                          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                            {p.nome_completo.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-slate-700">{p.nome_completo}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-slate-700">Status do Setor</p>
              <p className="text-xs text-slate-500">{status ? 'Setor ativo' : 'Setor desativado'}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(s => !s)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${status ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${status ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            disabled={!name.trim() || saving}
            onClick={handleSubmit}
            className="flex-[2] px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-colors shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
