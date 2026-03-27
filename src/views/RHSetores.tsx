import { useState, useMemo } from 'react'
import { Search, Plus, Pencil, Trash2, Building2, Users } from 'lucide-react'
import { useSetores } from '../hooks/useSetores'
import { SectorDrawer } from '../components/rh/SectorDrawer'
import type { SectorWithCount } from '../types/rh'

const ITEMS_PER_PAGE = 5
const ICON_COLORS = [
  'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600',
  'bg-violet-100 text-violet-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600',
]

function managerInitials(name: string) {
  return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

interface Props { onNavigate: (view: string) => void }

export function RHSetores({ onNavigate }: Props) {
  const { setores, loading, profissionais, createSetor, updateSetor, deleteSetor } = useSetores()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editSetor, setEditSetor] = useState<SectorWithCount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SectorWithCount | null>(null)

  const filtered = useMemo((): SectorWithCount[] => {
    const q = search.trim().toLowerCase()
    return q ? setores.filter((s: SectorWithCount) => s.name.toLowerCase().includes(q)) : setores
  }, [setores, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const curPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((curPage - 1) * ITEMS_PER_PAGE, curPage * ITEMS_PER_PAGE)

  function openAdd() { setEditSetor(null); setDrawerOpen(true) }
  function openEdit(s: SectorWithCount) { setEditSetor(s); setDrawerOpen(true) }

  async function handleSave(data: { name: string; manager_id: string | null; status: boolean }) {
    if (editSetor) await updateSetor(editSetor.id, data)
    else await createSetor(data)
    setDrawerOpen(false)
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

        {/* Sub-tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
          <button onClick={() => onNavigate('rh-profissionais')} className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">Profissionais</button>
          <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white shadow-sm">Setores</button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-none rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="Pesquisar departamentos por nome..." value={search} onChange={(e: { target: { value: string } }) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/20 transition-colors whitespace-nowrap">
            <Plus size={18} />Adicionar Setor
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center"><div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <Building2 className="text-slate-300" size={40} />
              <p className="text-slate-500 font-medium">{search ? 'Nenhum setor encontrado para essa busca.' : 'Nenhum setor cadastrado ainda.'}</p>
              {!search && <button onClick={openAdd} className="text-primary text-sm font-semibold hover:underline">+ Criar primeiro setor</button>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="border-b border-slate-100 bg-slate-50/50">
                    <tr>
                      {['Nome do Setor', 'Colaboradores', 'Gestor Responsável', 'Status', 'Ações'].map((h: string) => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pageItems.map((setor: SectorWithCount, idx: number) => (
                      <tr key={setor.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${ICON_COLORS[((curPage - 1) * ITEMS_PER_PAGE + idx) % ICON_COLORS.length]}`}>
                              {setor.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{setor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-slate-500"><Users size={14} /><span className="text-sm">{setor.profissionais_count}</span></div></td>
                        <td className="px-6 py-4">
                          {setor.manager ? (
                            <div className="flex items-center gap-2">
                              {setor.manager.foto_url ? <img src={setor.manager.foto_url} className="size-7 rounded-full object-cover" alt="" /> : <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{managerInitials(setor.manager.nome_completo)}</div>}
                              <span className="text-sm text-slate-700">{setor.manager.nome_completo}</span>
                            </div>
                          ) : <span className="text-sm text-slate-400">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => updateSetor(setor.id, { status: !setor.status })} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${setor.status ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            <span className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${setor.status ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(setor)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"><Pencil size={15} /></button>
                            <button onClick={() => setDeleteTarget(setor)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">Mostrando {Math.min((curPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(curPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} setor{filtered.length !== 1 ? 'es' : ''} cadastrado{filtered.length !== 1 ? 's' : ''}</p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i: number) => i + 1).map((n: number) => (
                      <button key={n} onClick={() => setPage(n)} className={`size-8 rounded-lg text-sm font-semibold transition-colors ${curPage === n ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{n}</button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <SectorDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} sector={editSetor} profissionais={profissionais} onSave={handleSave} />

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Excluir setor?</h3>
            <p className="text-slate-500 text-sm mb-6">Tem certeza que deseja excluir o setor <strong>{deleteTarget.name}</strong>? Os profissionais vinculados não serão excluídos.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm">Cancelar</button>
              <button onClick={async () => { await deleteSetor(deleteTarget.id); setDeleteTarget(null) }} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors text-sm">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
