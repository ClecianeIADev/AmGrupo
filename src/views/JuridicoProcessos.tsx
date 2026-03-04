import { useState } from 'react';
import {
  Plus,
  FolderPlus,
  Square,
  Search,
  LayoutGrid,
  List,
  Home,
  FolderOpen,
  MoreVertical,
  MoreHorizontal,
  Folder,
  ChevronRight,
  Calendar,
  ArrowDownAZ,
  X,
  Scale,
  Upload,
  Zap,
  FilePlus,
  CloudUpload,
  ChevronDown,
  Clock,
  User,
  Building2,
  CheckCircle2,
  GripVertical,
  RefreshCw,
  Check,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import { ProcessDetailsModal } from '../components/juridico/ProcessDetailsModal';

export function JuridicoProcessos({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'grouped'>('list');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isProcessDetailsModalOpen, setIsProcessDetailsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('blue');

  const folderColors = [
    { id: 'blue', class: 'bg-blue-50 text-blue-500 border-blue-500' },
    { id: 'green', class: 'bg-green-50 text-green-500 border-green-500' },
    { id: 'yellow', class: 'bg-yellow-50 text-yellow-500 border-yellow-500' },
    { id: 'orange', class: 'bg-orange-50 text-orange-500 border-orange-500' },
    { id: 'red', class: 'bg-red-50 text-red-500 border-red-500' },
    { id: 'purple', class: 'bg-purple-50 text-purple-500 border-purple-500' },
    { id: 'pink', class: 'bg-pink-50 text-pink-500 border-pink-500' },
    { id: 'slate', class: 'bg-slate-50 text-slate-500 border-slate-500' },
  ];

  return (
    <main className="flex-1 overflow-hidden p-6 lg:p-8 bg-slate-50 flex flex-col relative">
      {/* Header Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => { setViewMode('list'); setSelectedFolder(null); }}
            className={`pb-3 px-1 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'list'
              ? 'text-primary border-primary'
              : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'
              }`}
          >
            <List size={18} className={viewMode === 'list' ? 'fill-primary/20' : ''} />
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
          {(viewMode === 'list') && (
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
      <div className={`flex-1 overflow-y-auto ${viewMode === 'list' ? '' : 'bg-white rounded-xl border border-slate-200 shadow-sm'} relative`}>
        {viewMode === 'list' ? (
          <div className="kanban-container h-full overflow-x-auto overflow-y-hidden flex gap-5 min-w-0">
            {/* Column: Triagem */}
            <div className="flex flex-col w-80 flex-shrink-0 max-h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700">TRIAGEM</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">R$ 0,00</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <div className="kanban-column flex-1 overflow-y-auto bg-slate-100 rounded-xl p-2 flex flex-col gap-3 border-t-4 border-slate-400">
                {/* Card 1 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Indenização por Danos Morais
                    </h4>
                    <GripVertical size={18} className="text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">Silva & Santos Logística Ltda.</p>
                    <span className="font-bold text-slate-900"># 00124-2023</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-cover bg-center border border-white shrink-0" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?u=ana")' }}></div>
                    </div>
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
                      Alta
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Cobrança Indevida
                    </h4>
                    <GripVertical size={18} className="text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">Tech Solutions SA</p>
                    <span className="font-bold text-slate-900"># 00129-2023</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold shrink-0 shadow-sm border border-white">-</div>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
                      Média
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Revisão Contratual
                    </h4>
                    <GripVertical size={18} className="text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">Oliveira Comércio Varejista</p>
                    <span className="font-bold text-slate-900"># 00135-2024</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-cover bg-center border border-white shrink-0" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?u=david")' }}></div>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
                      Baixa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column: Documentação */}
            <div className="flex flex-col w-80 flex-shrink-0 max-h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700">DOCUMENTAÇÃO</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">2</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">R$ 0,00</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="kanban-column flex-1 overflow-y-auto bg-slate-100 rounded-xl p-2 flex flex-col gap-3 border-t-4 border-amber-400">
                {/* Card 4 */}
                <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Ação Trabalhista - Reclamação
                    </h4>
                    <GripVertical size={18} className="text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">Grupo Varejo Nacional</p>
                    <span className="font-bold text-slate-900"># 00892-2023</span>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-medium mt-2 w-fit">
                      <Clock size={12} />
                      Pendente
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-cover bg-center border border-white shrink-0" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?u=michael")' }}></div>
                    </div>
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
                      Alta
                    </span>
                  </div>
                </div>

                {/* Card 5 */}
                <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Execução Fiscal
                    </h4>
                    <GripVertical size={18} className="text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">Indústria e Comércio ABC</p>
                    <span className="font-bold text-slate-900"># 00101-2022</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-cover bg-center border border-white shrink-0" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?u=sarah")' }}></div>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
                      Média
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column: Em Análise */}
            <div className="flex flex-col w-80 flex-shrink-0 max-h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700">EM ANÁLISE</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">1</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">R$ 0,00</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="kanban-column flex-1 overflow-y-auto bg-slate-100 rounded-xl p-2 flex flex-col gap-3 border-t-4 border-blue-500">
                {/* Card 6 */}
                <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Liminar - Suspensão de Serviços
                    </h4>
                    <GripVertical size={18} className="text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">NetConnect Telecom</p>
                    <span className="font-bold text-slate-900"># 00155-2024</span>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-purple-50 text-purple-600 text-[10px] font-medium mt-2 w-fit">
                      <Clock size={12} />
                      Prazo: 24h
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-cover bg-center border border-white shrink-0" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?u=alex")' }}></div>
                    </div>
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
                      Alta
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column: Concluído */}
            <div className="flex flex-col w-80 flex-shrink-0 max-h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700">CONCLUÍDO</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">1</span>
                  <span className="text-slate-400 text-xs font-medium ml-1">R$ 0,00</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="kanban-column flex-1 overflow-y-auto bg-slate-100 rounded-xl p-2 flex flex-col gap-3 border-t-4 border-emerald-500">
                {/* Card 7 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative opacity-80 hover:opacity-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm line-through decoration-slate-400">
                      Recurso Especial
                    </h4>
                    <CheckCircle2 size={18} className="text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">Transportadora Veloz</p>
                    <span className="font-bold text-emerald-600"># 00098-2022</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-cover bg-center border border-white shrink-0 grayscale" style={{ backgroundImage: 'url("https://i.pravatar.cc/150?u=ana")' }}></div>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded shrink-0 uppercase">
                      Baixa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6 h-full flex flex-col">
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
        ) : (
          <div className="p-6 h-full flex flex-col">
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

            <div className="flex flex-col gap-6">
              {/* Pendente Group */}
              <details className="group bg-slate-100/50 rounded-xl overflow-hidden border border-slate-200 transition-all" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-200/50 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <ChevronDownIcon className="text-slate-400 transition-transform group-open:rotate-180" size={20} />
                    <div className="size-2 rounded-full bg-yellow-500"></div>
                    <h3 className="font-bold text-slate-700">Pendente</h3>
                    <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold border border-slate-200">2</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                  </button>
                </summary>
                <div className="p-4 pt-0 flex flex-col gap-3">
                  {/* Process Card 1 */}
                  <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
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
                        <Clock size={12} />
                        Aguardando documentação
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  {/* Process Card 2 */}
                  <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <Scale className="text-purple-500" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">0001681-53.2024.8.16.0192</h3>
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 border border-slate-200 rounded-full">Perito Judicial</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <User className="text-orange-400" size={16} />
                            <span className="truncate">DULCE TENFEN ANDRETTA</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="text-pink-500" size={16} />
                            <span className="truncate">MUNICÍPIO DE CAFELÂNDIA – PR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                        <Clock size={12} />
                        Aguardando início
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <ChevronRight size={20} />
                      </button>
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
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                  </button>
                </summary>
                <div className="p-4 pt-0 flex flex-col gap-3">
                  {/* Process Card 3 */}
                  <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
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
                        <RefreshCw size={12} />
                        Em análise
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <ChevronRight size={20} />
                      </button>
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
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                  </button>
                </summary>
                <div className="p-4 pt-0 flex flex-col gap-3">
                  {/* Process Card 4 */}
                  <div onClick={() => setIsProcessDetailsModalOpen(true)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
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
                        <CheckCircle2 size={12} />
                        Concluído
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <ChevronRight size={20} />
                      </button>
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

      {/* Drawer Overlay */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>

        {/* Drawer Panel */}
        <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-xl font-bold text-slate-900">Novo Processo</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
            <p className="text-slate-600 text-sm leading-relaxed">
              Selecione seu tipo de atuação e envie o processo judicial completo para análise pela IA, ou crie o processo agora e envie depois.
            </p>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">Tipo de atuação</label>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Scale size={20} />
                  </div>
                  <span className="font-medium text-slate-900">Perito Judicial</span>
                </div>
                <button className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Alterar</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">Etapa inicial no Kanban</label>
              <div className="relative">
                <select className="block w-full pl-4 pr-10 py-3 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-primary focus:border-primary sm:text-sm shadow-sm appearance-none cursor-pointer hover:border-slate-300 transition-colors">
                  <option>Pendente</option>
                  <option>Em Análise</option>
                  <option>Concluído</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">Como deseja criar?</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex flex-col p-4 border-2 border-primary bg-blue-50/50 rounded-xl cursor-pointer transition-all hover:shadow-md">
                  <input type="radio" name="create_method" className="sr-only" defaultChecked />
                  <div className="flex items-start justify-between mb-3">
                    <Upload className="text-primary" size={24} />
                    <div className="absolute top-4 right-4 size-4 rounded-full border border-primary bg-primary flex items-center justify-center">
                      <div className="size-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900 text-sm mb-1">Upload PDF</span>
                  <span className="text-xs text-slate-500 mb-2">A IA extrai os dados</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 w-fit">
                    <Zap size={10} className="mr-1" /> 1 crédito
                  </span>
                </label>

                <label className="relative flex flex-col p-4 border border-slate-200 bg-white rounded-xl cursor-pointer hover:border-slate-300 transition-all hover:shadow-sm">
                  <input type="radio" name="create_method" className="sr-only" />
                  <div className="flex items-start justify-between mb-3">
                    <FilePlus className="text-slate-400" size={24} />
                  </div>
                  <span className="font-semibold text-slate-900 text-sm mb-1">Sem PDF agora</span>
                  <span className="text-xs text-slate-500 mb-2">Preencha manualmente</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 w-fit">
                    Gratuito
                  </span>
                </label>
              </div>
            </div>

            <div className="relative group">
              <div className="border-2 border-dashed border-primary/30 bg-blue-50 rounded-xl p-8 text-center hover:bg-blue-50/80 hover:border-primary transition-all cursor-pointer">
                <div className="mx-auto size-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CloudUpload className="text-slate-400" size={32} />
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">Arraste o processo judicial</p>
                <p className="text-xs text-slate-500 mb-4">ou clique para selecionar</p>
                <div className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Envie o processo judicial completo — a IA extrairá as informações automaticamente. Máximo 300 MB.
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-primary/30">
              Criar Processo
            </button>
          </div>
        </div>
      </div>
      <ProcessDetailsModal
        isOpen={isProcessDetailsModalOpen}
        onClose={() => setIsProcessDetailsModalOpen(false)}
      />
    </main>
  );
}
