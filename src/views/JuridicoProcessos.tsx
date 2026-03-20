import { useState, type DragEvent } from 'react';
import {
  Plus,
  FolderPlus,
  Search,
  List,
  Home,
  FolderOpen,
  MoreVertical,
  MoreHorizontal,
  Folder,
  ChevronRight,
  X,
  Scale,
  Clock,
  User,
  Building2,
  CheckCircle2,
  RefreshCw,
  Check,
  ChevronDown as ChevronDownIcon,
  GripVertical,
} from 'lucide-react';
import { ProcessDetailsModal } from '../components/juridico/ProcessDetailsModal';
import { ProcessUploadDrawer } from '../components/juridico/ProcessUploadDrawer';
import { ProcessSummaryCard } from '../components/juridico/ProcessSummaryCard';
import { useLegalProcesses } from '../hooks/useLegalProcesses';
import type { LegalProcess, KanbanStage } from '../types/legalProcess';

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

export function JuridicoProcessos({ onNavigate: _onNavigate }: { onNavigate: (view: string) => void }) {
  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'grouped'>('kanban');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<LegalProcess | null>(null);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [dragOverStage, setDragOverStage] = useState<KanbanStage | null>(null);

  const {
    processes, loading, createProcess, deleteProcess,
    invokeAnalysis, retryAnalysis, subscribeToProcess,
    uploadProcessDocument, deleteProcessDocument, updateProcessStage,
  } = useLegalProcesses();

  const folderColors = [
    { id: 'blue',   class: 'bg-blue-50 text-blue-500 border-blue-500' },
    { id: 'green',  class: 'bg-green-50 text-green-500 border-green-500' },
    { id: 'yellow', class: 'bg-yellow-50 text-yellow-500 border-yellow-500' },
    { id: 'orange', class: 'bg-orange-50 text-orange-500 border-orange-500' },
    { id: 'red',    class: 'bg-red-50 text-red-500 border-red-500' },
    { id: 'purple', class: 'bg-purple-50 text-purple-500 border-purple-500' },
    { id: 'pink',   class: 'bg-pink-50 text-pink-500 border-pink-500' },
    { id: 'slate',  class: 'bg-slate-50 text-slate-500 border-slate-500' },
  ];

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

  return (
    <main className="flex-1 overflow-hidden p-6 lg:p-8 bg-slate-50 flex flex-col relative">
      {/* Header Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => { setViewMode('kanban'); setSelectedFolder(null); }}
            className={`pb-3 px-1 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'kanban'
              ? 'text-primary border-primary'
              : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'
              }`}
          >
            <List size={18} className={viewMode === 'kanban' ? 'fill-primary/20' : ''} />
            Processos
          </button>
          <button
            onClick={() => { setViewMode('grid'); setSelectedFolder(null); }}
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
            /* Skeleton */
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
                    {/* Column header */}
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

                    {/* Column body */}
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
                          {/* Drag handle row */}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <FolderPlus size={18} className="text-primary" />
                  Nova Pasta
                </button>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-slate-400" size={20} />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-shadow shadow-sm"
                    placeholder="Buscar nesta pasta..."
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto content-start">
              {[
                { name: '_ERRO', color: 'red' },
                { name: '_TRIAL', color: 'green' },
                { name: 'Abraao Dos Reis Schott', color: 'blue' },
                { name: 'Adenor Israel De Oliveira', color: 'blue' },
                { name: 'Adler Lucena (Cancelado)', color: 'blue' },
                { name: 'Adrio Luis Gonçalves', color: 'blue' },
                { name: 'Akram Tayser Fattash', color: 'blue' },
                { name: 'Alan Eidi Handa', color: 'blue' },
              ].map((folder, idx) => (
                <div
                  key={idx}
                  onClick={() => { setSelectedFolder(folder.name); setViewMode('grouped'); }}
                  className={`bg-${folder.color}-50 border border-${folder.color}-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {folder.color === 'red' || folder.color === 'green' ? (
                      <FolderOpen className={`text-${folder.color}-500`} size={24} />
                    ) : (
                      <Folder className={`text-${folder.color}-500`} size={24} />
                    )}
                    <span className={`text-sm font-bold text-slate-${folder.color === 'red' || folder.color === 'green' ? '800' : '700'} truncate uppercase`}>{folder.name}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded-full hover:bg-white/50">
                    <MoreVertical size={20} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-6 border-t border-slate-200 pt-4">
              <span>Mostrando 1-8 de 428 processos</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50">Anterior</button>
                <button className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50">Próximo</button>
              </div>
            </div>
          </div>
        )}

        {/* ── GROUPED FOLDER VIEW ── */}
        {viewMode === 'grouped' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between text-sm text-slate-500 font-medium mb-6">
              <div className="flex items-center">
                <Home size={18} className="mr-1" />
                <span className="mx-2 text-slate-300">/</span>
                <button onClick={() => { setViewMode('grid'); setSelectedFolder(null); }} className="text-primary hover:underline font-semibold cursor-pointer">
                  Pastas
                </button>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-900 font-bold uppercase">{selectedFolder || 'PASTA'}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-slate-400" size={16} />
                  </div>
                  <input
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

            <div className="flex flex-col gap-6 overflow-y-auto flex-1">
              {/* Pendente Group */}
              <details className="group bg-slate-100/50 rounded-xl overflow-hidden border border-slate-200 transition-all" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-200/50 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <ChevronDownIcon className="text-slate-400 transition-transform group-open:rotate-180" size={20} />
                    <div className="size-2 rounded-full bg-yellow-500"></div>
                    <h3 className="font-bold text-slate-700">Pendente</h3>
                    <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold border border-slate-200">2</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                </summary>
                <div className="p-4 pt-0 flex flex-col gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <Scale className="text-purple-500" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">0004512-88.2025.8.16.0192</h3>
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 border border-slate-200 rounded-full">Perito Judicial</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <User className="text-orange-400" size={16} />
                            <span className="truncate">JOÃO PEDRO ALMEIDA</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="text-pink-500" size={16} />
                            <span className="truncate">BANCO DO BRASIL S.A.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                        <Clock size={12} />Aguardando documentação
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1"><ChevronRight size={20} /></button>
                    </div>
                  </div>
                </div>
              </details>

              {/* Em Andamento Group */}
              <details className="group bg-slate-100/50 rounded-xl overflow-hidden border border-slate-200 transition-all" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-200/50 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <ChevronDownIcon className="text-slate-400 transition-transform group-open:rotate-180" size={20} />
                    <div className="size-2 rounded-full bg-primary"></div>
                    <h3 className="font-bold text-slate-700">Em Andamento</h3>
                    <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold border border-slate-200">1</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                </summary>
                <div className="p-4 pt-0 flex flex-col gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <Scale className="text-purple-500" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">0001810-93.2025.8.16.0169</h3>
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 border border-slate-200 rounded-full">Perito Judicial</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <User className="text-orange-400" size={16} />
                            <span className="truncate">TATIANE SIQUEIRA PEDROSO SOUZA</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="text-pink-500" size={16} />
                            <span className="truncate">INSTITUTO NACIONAL DO SEGURO SOCIAL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                        <RefreshCw size={12} />Em análise
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1"><ChevronRight size={20} /></button>
                    </div>
                  </div>
                </div>
              </details>

              {/* Finalizado Group */}
              <details className="group bg-slate-100/50 rounded-xl overflow-hidden border border-slate-200 transition-all" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-200/50 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <ChevronDownIcon className="text-slate-400 transition-transform group-open:rotate-180" size={20} />
                    <div className="size-2 rounded-full bg-green-500"></div>
                    <h3 className="font-bold text-slate-700">Finalizado</h3>
                    <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold border border-slate-200">1</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                </summary>
                <div className="p-4 pt-0 flex flex-col gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <Scale className="text-purple-500" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">0002323-08.2018.8.16.0169</h3>
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 border border-slate-200 rounded-full">Perito Judicial</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <User className="text-orange-400" size={16} />
                            <span className="truncate">ROSELI CARNEIRO PINTO</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="text-pink-500" size={16} />
                            <span className="truncate">INSTITUTO NACIONAL DO SEGURO SOCIAL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                        <CheckCircle2 size={12} />Concluído
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1"><ChevronRight size={20} /></button>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsNewFolderModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform translate-x-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-primary font-bold">
                <FolderPlus size={20} />
                <span>Nova Pasta</span>
              </div>
              <button
                onClick={() => setIsNewFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-8">
                <Folder className="text-primary" size={64} fill="currentColor" />
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Nome da pasta</label>
                  <div className="relative">
                    <input
                      className="block w-full px-4 py-3 rounded-lg border border-primary ring-1 ring-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-slate-900 transition-shadow"
                      placeholder="Digite o nome da pasta"
                      type="text"
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-slate-400">0/30</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">Cor da pasta</label>
                  <div className="grid grid-cols-4 gap-4">
                    {folderColors.map((color) => (
                      <div
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className="relative cursor-pointer group"
                      >
                        <div className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${selectedColor === color.id ? color.class : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                          <Folder className={selectedColor === color.id ? color.class.split(' ')[1] : color.class.split(' ')[1]} size={32} fill={selectedColor === color.id ? "currentColor" : "none"} />
                          {selectedColor === color.id && (
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
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-colors"
              >
                Criar
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
      />
      <ProcessDetailsModal
        isOpen={selectedProcess !== null}
        onClose={() => setSelectedProcess(null)}
        process={selectedProcess}
        onUploadDocument={uploadProcessDocument}
        onDeleteDocument={deleteProcessDocument}
      />
    </main>
  );
}
