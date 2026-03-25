import { useState, type DragEvent, type MouseEvent } from 'react';
import {
  Plus,
  FolderPlus,
  Search,
  List,
  Home,
  FolderOpen,
  Folder,
  ChevronRight,
  X,
  Scale,
  Clock,
  CheckCircle2,
  RefreshCw,
  Check,
  ChevronDown as ChevronDownIcon,
  GripVertical,
  Trash2,
  Pencil,
  MoreHorizontal,
} from 'lucide-react';
import { ProcessDetailsModal } from '../components/juridico/ProcessDetailsModal';
import { ProcessUploadDrawer } from '../components/juridico/ProcessUploadDrawer';
import { ProcessSummaryCard } from '../components/juridico/ProcessSummaryCard';
import { useLegalProcesses } from '../hooks/useLegalProcesses';
import { useFolders } from '../hooks/useFolders';
import type { LegalProcess, KanbanStage } from '../types/legalProcess';
import type { FolderWithProcessCount } from '../types/folder';

const KANBAN_STAGES: { id: KanbanStage; color: string }[] = [
  { id: 'Pendentes',                    color: 'border-slate-400' },
  { id: 'Aceites',                      color: 'border-blue-500' },
  { id: 'Perícia Agendada',             color: 'border-indigo-500' },
  { id: 'Periciado Não Compareceu',     color: 'border-orange-500' },
  { id: 'Revisando Laudo/Impugnação',   color: 'border-amber-500' },
  { id: 'Aguardando Manifestações',     color: 'border-purple-500' },
  { id: 'Aguardando Pagamento',         color: 'border-red-500' },
  { id: 'Finalizado',                   color: 'border-emerald-500' },
  { id: 'Não Realizado',               color: 'border-rose-500' },
];

const FOLDER_COLORS = [
  { id: 'blue',   hex: '#3b82f6' },
  { id: 'green',  hex: '#22c55e' },
  { id: 'yellow', hex: '#eab308' },
  { id: 'orange', hex: '#f97316' },
  { id: 'red',    hex: '#ef4444' },
  { id: 'purple', hex: '#a855f7' },
  { id: 'pink',   hex: '#ec4899' },
  { id: 'slate',  hex: '#64748b' },
];

const GROUP_VISIBLE_COUNT = 5;

export function JuridicoProcessos({ onNavigate: _onNavigate }: { onNavigate: (view: string) => void }) {
  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'grouped'>('kanban');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<LegalProcess | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [newFolderName, setNewFolderName] = useState('');
  const [dragOverStage, setDragOverStage] = useState<KanbanStage | null>(null);
  const [folderGridSearch, setFolderGridSearch] = useState('');

  // Edit folder state
  const [editingFolder, setEditingFolder] = useState<FolderWithProcessCount | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderColor, setEditFolderColor] = useState('#3b82f6');

  // "Ver mais" expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const {
    processes, loading, createProcess, deleteProcess,
    invokeAnalysis, retryAnalysis, subscribeToProcess,
    uploadProcessDocument, deleteProcessDocument, updateProcessStage,
  } = useLegalProcesses();

  const {
    folders, loadingFolders, createFolder, updateFolder, deleteFolder,
    filteredGrouped, loadingContents, fetchFolderContents,
    folderSearch, setFolderSearch, linkProcessToFolder,
  } = useFolders();

  function handleDragStart(e: DragEvent<HTMLDivElement>, processId: string) {
    e.dataTransfer.setData('processId', processId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, stage: KanbanStage) {
    e.preventDefault();
    setDragOverStage(null);
    const processId = e.dataTransfer.getData('processId');
    if (processId) updateProcessStage(processId, stage);
  }

  function openEditFolder(e: MouseEvent<HTMLElement>, folder: FolderWithProcessCount) {
    e.stopPropagation();
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderColor(folder.color);
  }

  async function handleSaveEditFolder() {
    if (!editingFolder || !editFolderName.trim()) return;
    await updateFolder(editingFolder.id, { name: editFolderName.trim(), color: editFolderColor });
    setEditingFolder(null);
  }

  function toggleExpandGroup(key: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <main className="flex-1 overflow-hidden p-6 lg:p-8 bg-slate-50 flex flex-col relative">
      {/* Header Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => { setViewMode('kanban'); setSelectedFolderId(null); }}
            className={`pb-3 px-1 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'kanban'
              ? 'text-primary border-primary'
              : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'
              }`}
          >
            <List size={18} className={viewMode === 'kanban' ? 'fill-primary/20' : ''} />
            Processos
          </button>
          <button
            onClick={() => { setViewMode('grid'); setSelectedFolderId(null); }}
            className={`pb-3 px-1 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'grid' || viewMode === 'grouped'
              ? 'text-primary border-primary'
              : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'
              }`}
          >
            <FolderOpen size={18} className={viewMode === 'grid' || viewMode === 'grouped' ? 'fill-primary/20' : ''} />
            Pastas
          </button>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'kanban' && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/20"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Novo Processo</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {/* ── KANBAN BOARD ── */}
        {viewMode === 'kanban' && (
          loading ? (
            <div className="flex gap-4 h-full overflow-x-auto pb-4">
              {KANBAN_STAGES.map(stage => (
                <div key={stage.id} className="flex flex-col w-72 flex-shrink-0">
                  <div className="h-8 bg-slate-200 rounded-lg animate-pulse mb-3" />
                  <div className={`flex-1 bg-slate-100 rounded-xl p-2 border-t-4 ${stage.color} flex flex-col gap-3`}>
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white rounded-xl p-4 flex flex-col gap-3 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-6 bg-slate-100 rounded-full w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 h-full overflow-x-auto pb-4">
              {KANBAN_STAGES.map(stage => {
                const stageProcesses = processes.filter(p => (p.kanban_stage ?? 'Pendentes') === stage.id);
                const isOver = dragOverStage === stage.id;
                return (
                  <div
                    key={stage.id}
                    className="flex flex-col w-72 flex-shrink-0 max-h-full"
                    onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                    onDragLeave={() => setDragOverStage(null)}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide">{stage.id}</h3>
                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {stageProcesses.length}
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    <div
                      className={`flex-1 overflow-y-auto rounded-xl p-2 flex flex-col gap-3 border-t-4 transition-colors ${stage.color} ${
                        isOver ? 'bg-slate-200' : 'bg-slate-100'
                      }`}
                    >
                      {stageProcesses.length === 0 && !isOver && (
                        <p className="text-xs text-slate-400 text-center py-8">Nenhum processo</p>
                      )}
                      {stageProcesses.map(process => (
                        <div
                          key={process.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, process.id)}
                          className="cursor-grab active:cursor-grabbing group/drag"
                        >
                          <div className="flex items-center justify-end px-1 pb-0.5 opacity-0 group-hover/drag:opacity-100 transition-opacity">
                            <GripVertical size={14} className="text-slate-400" />
                          </div>
                          <ProcessSummaryCard
                            process={process}
                            onClick={(p) => setSelectedProcess(p)}
                            onDelete={(p) => deleteProcess(p)}
                            onRetry={(p) => retryAnalysis(p.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── FOLDERS GRID ── */}
        {viewMode === 'grid' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setIsNewFolderModalOpen(true)}
                className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <FolderPlus size={18} className="text-primary" />
                Nova Pasta
              </button>
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-slate-400" size={20} />
                </div>
                <input
                  value={folderGridSearch}
                  onChange={e => setFolderGridSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-shadow shadow-sm"
                  placeholder="Buscar pasta..."
                  type="text"
                />
              </div>
            </div>

            {loadingFolders ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto content-start">
                  {folders
                    .filter(f => !folderGridSearch || f.name.toLowerCase().includes(folderGridSearch.toLowerCase()))
                    .map(folder => (
                      <div
                        key={folder.id}
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setViewMode('grouped');
                          fetchFolderContents(folder.id);
                        }}
                        className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group bg-white"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Folder style={{ color: folder.color }} size={24} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate uppercase">{folder.name}</p>
                            <p className="text-xs text-slate-400">{folder.process_count} processo{folder.process_count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        {/* Action buttons — visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => openEditFolder(e, folder)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
                            title="Editar pasta"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Excluir pasta"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  }
                  {folders.filter(f => !folderGridSearch || f.name.toLowerCase().includes(folderGridSearch.toLowerCase())).length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
                      <Folder size={36} className="text-slate-200" />
                      <p className="text-sm text-slate-400">
                        {folderGridSearch ? 'Nenhuma pasta encontrada.' : 'Nenhuma pasta criada. Clique em "Nova Pasta" para começar.'}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                  {folders.length} pasta{folders.length !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </div>
        )}

        {/* ── GROUPED FOLDER VIEW ── */}
        {viewMode === 'grouped' && (() => {
          const activeFolder = folders.find(f => f.id === selectedFolderId);
          return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
              <div className="flex items-center justify-between text-sm text-slate-500 font-medium mb-6">
                <div className="flex items-center">
                  <Home size={18} className="mr-1" />
                  <span className="mx-2 text-slate-300">/</span>
                  <button onClick={() => { setViewMode('grid'); setSelectedFolderId(null); }} className="text-primary hover:underline font-semibold cursor-pointer">
                    Pastas
                  </button>
                  <span className="mx-2 text-slate-300">/</span>
                  <span className="text-slate-900 font-bold uppercase">{activeFolder?.name ?? '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative hidden sm:block w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-slate-400" size={16} />
                    </div>
                    <input
                      value={folderSearch}
                      onChange={e => setFolderSearch(e.target.value)}
                      className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow shadow-sm"
                      placeholder="Buscar nesta pasta..."
                      type="text"
                    />
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Plus size={16} />
                    Novo Processo
                  </button>
                </div>
              </div>

              {loadingContents ? (
                <div className="flex flex-col gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="flex flex-col gap-6 overflow-y-auto flex-1">
                  {(
                    [
                      { key: 'Pendente' as const, color: 'bg-yellow-500', label: 'Pendente' },
                      { key: 'EmAndamento' as const, color: 'bg-primary', label: 'Em Andamento' },
                      { key: 'Finalizado' as const, color: 'bg-green-500', label: 'Finalizado' },
                    ] as const
                  ).map(({ key, color, label }) => {
                    const procs = filteredGrouped[key];
                    const isExpanded = expandedGroups.has(key);
                    const hasMore = procs.length > GROUP_VISIBLE_COUNT;
                    const visibleProcs = isExpanded ? procs : procs.slice(0, GROUP_VISIBLE_COUNT);

                    return (
                      <details key={key} className="group bg-slate-100/50 rounded-xl border border-slate-200 transition-all" open>
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-200/50 transition-colors list-none rounded-xl">
                          <div className="flex items-center gap-3">
                            <ChevronDownIcon className="text-slate-400 transition-transform group-open:rotate-180" size={20} />
                            <div className={`size-2 rounded-full ${color}`} />
                            <h3 className="font-bold text-slate-700">{label}</h3>
                            <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold border border-slate-200">{procs.length}</span>
                          </div>
                        </summary>
                        <div className="px-4 pb-4 pt-2 flex flex-col gap-3">
                          {procs.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">Sem processos</p>
                          ) : (
                            <>
                              {visibleProcs.map(p => (
                                <div
                                  key={p.id}
                                  onClick={() => setSelectedProcess(p)}
                                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                                >
                                  <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                      <Scale className="text-purple-500" size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-slate-900 truncate">
                                          {p.process_number ?? p.process_name ?? p.document_name}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 border border-slate-200 rounded-full shrink-0">{p.professional_role}</span>
                                      </div>
                                      {p.process_name && p.process_number && (
                                        <p className="text-xs text-slate-500 truncate">{p.process_name}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    {p.status === 'completed' && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                                        <CheckCircle2 size={12} />Concluído
                                      </span>
                                    )}
                                    {p.status === 'processing' && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                                        <RefreshCw size={12} />Em análise
                                      </span>
                                    )}
                                    {p.status === 'pending' && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                                        <Clock size={12} />Aguardando
                                      </span>
                                    )}
                                    <ChevronRight size={20} className="text-slate-400" />
                                  </div>
                                </div>
                              ))}
                              {hasMore && (
                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={() => toggleExpandGroup(key)}
                                    className="text-xs font-semibold text-primary hover:text-blue-700 transition-colors"
                                  >
                                    {isExpanded ? 'Ver menos' : `Ver mais (${procs.length - GROUP_VISIBLE_COUNT})`}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── New Folder Modal ── */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => { setIsNewFolderModalOpen(false); setNewFolderName(''); }} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-primary font-bold">
                <FolderPlus size={20} />
                <span>Nova Pasta</span>
              </div>
              <button onClick={() => { setIsNewFolderModalOpen(false); setNewFolderName(''); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: selectedColor + '20' }}>
                <Folder style={{ color: selectedColor }} size={64} fill={selectedColor} />
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Nome da pasta</label>
                  <input
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value.slice(0, 30))}
                    maxLength={30}
                    className="block w-full px-4 py-3 rounded-lg border border-primary ring-1 ring-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-slate-900 transition-shadow"
                    placeholder="Digite o nome da pasta"
                    type="text"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-slate-400">{newFolderName.length}/30</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">Cor da pasta</label>
                  <div className="grid grid-cols-4 gap-4">
                    {FOLDER_COLORS.map((color) => (
                      <div key={color.id} onClick={() => setSelectedColor(color.hex)} className="relative cursor-pointer">
                        <div
                          className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${selectedColor === color.hex ? 'border-slate-400' : 'border-transparent hover:border-slate-200'}`}
                          style={{ backgroundColor: color.hex + '20' }}
                        >
                          <Folder style={{ color: color.hex }} size={32} fill={selectedColor === color.hex ? color.hex : 'none'} />
                          {selectedColor === color.hex && (
                            <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-0.5 shadow-sm">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => { setIsNewFolderModalOpen(false); setNewFolderName(''); }}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!newFolderName.trim()}
                onClick={async () => {
                  if (!newFolderName.trim()) return;
                  await createFolder(newFolderName.trim(), selectedColor);
                  setIsNewFolderModalOpen(false);
                  setNewFolderName('');
                  setSelectedColor('#3b82f6');
                }}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Folder Modal ── */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditingFolder(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Pencil size={20} />
                <span>Editar Pasta</span>
              </div>
              <button onClick={() => setEditingFolder(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: editFolderColor + '20' }}>
                <Folder style={{ color: editFolderColor }} size={64} fill={editFolderColor} />
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Nome da pasta</label>
                  <input
                    value={editFolderName}
                    onChange={e => setEditFolderName(e.target.value.slice(0, 30))}
                    maxLength={30}
                    className="block w-full px-4 py-3 rounded-lg border border-primary ring-1 ring-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-slate-900 transition-shadow"
                    placeholder="Nome da pasta"
                    type="text"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-slate-400">{editFolderName.length}/30</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">Cor da pasta</label>
                  <div className="grid grid-cols-4 gap-4">
                    {FOLDER_COLORS.map((color) => (
                      <div key={color.id} onClick={() => setEditFolderColor(color.hex)} className="relative cursor-pointer">
                        <div
                          className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${editFolderColor === color.hex ? 'border-slate-400' : 'border-transparent hover:border-slate-200'}`}
                          style={{ backgroundColor: color.hex + '20' }}
                        >
                          <Folder style={{ color: color.hex }} size={32} fill={editFolderColor === color.hex ? color.hex : 'none'} />
                          {editFolderColor === color.hex && (
                            <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-0.5 shadow-sm">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingFolder(null)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!editFolderName.trim()}
                onClick={handleSaveEditFolder}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <ProcessUploadDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreate={createProcess}
        onAnalyze={invokeAnalysis}
        onSubscribe={subscribeToProcess}
        contextFolderId={viewMode === 'grouped' ? selectedFolderId : null}
        onLinkToFolder={linkProcessToFolder}
      />
      <ProcessDetailsModal
        isOpen={selectedProcess !== null}
        onClose={() => setSelectedProcess(null)}
        process={selectedProcess}
        onUploadDocument={uploadProcessDocument}
        onDeleteDocument={deleteProcessDocument}
        onFolderChange={linkProcessToFolder}
        folders={folders}
      />
    </main>
  );
}
