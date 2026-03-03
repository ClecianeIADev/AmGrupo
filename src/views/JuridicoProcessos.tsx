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
  RefreshCw,
  CheckCircle2,
  ChevronDown as ChevronDownIcon,
  MoreHorizontal,
  Check
} from 'lucide-react';

export function JuridicoProcessos({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'grouped'>('list');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
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
      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select className="appearance-none bg-slate-50 border-slate-200 text-sm rounded-lg px-3 py-2 pr-10 focus:ring-primary focus:border-primary text-slate-700 min-w-[140px]">
              <option value="">Todos os Estágios</option>
              <option>Triagem</option>
              <option>Documentação</option>
              <option>Em Análise</option>
              <option>Concluído</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <div className="relative">
            <select className="appearance-none bg-slate-50 border-slate-200 text-sm rounded-lg px-3 py-2 pr-10 focus:ring-primary focus:border-primary text-slate-700 min-w-[140px]">
              <option value="">Prioridade</option>
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <div className="relative">
            <select className="appearance-none bg-slate-50 border-slate-200 text-sm rounded-lg px-3 py-2 pr-10 focus:ring-primary focus:border-primary text-slate-700 min-w-[140px]">
              <option value="">Responsável</option>
              <option>Alex Moraes</option>
              <option>Ana Costa</option>
              <option>Michael Chen</option>
              <option>David Ross</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'list' && (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/20 mr-4"
            >
              <Plus size={20} />
              Novo Processo
            </button>
          )}
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Ordenar por:</span>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
            <Calendar size={16} />
            Data
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
            <ArrowDownAZ size={16} />
            A-Z
          </button>
          
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <List size={20} />
          </button>
          <button 
            onClick={() => setViewMode('grouped')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grouped' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto ${viewMode === 'list' ? 'bg-white rounded-xl border border-slate-200 shadow-sm' : ''} relative`}>
        {viewMode === 'list' ? (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Process Title / Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Lawyer</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-semibold text-sm">Indenização por Danos Morais</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5">00124-2023</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">Silva & Santos Logística Ltda.</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="size-1.5 rounded-full bg-slate-400"></span> Triagem
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase">Alta</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-cover bg-center border border-white" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=ana")'}}></div>
                    <span className="text-sm text-slate-700 font-medium">Ana Costa</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-semibold text-sm">Ação Trabalhista - Reclamação</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5">00892-2023</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">Grupo Varejo Nacional</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                    <span className="size-1.5 rounded-full bg-amber-400"></span> Documentação
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase">Alta</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-cover bg-center border border-white" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=michael")'}}></div>
                    <span className="text-sm text-slate-700 font-medium">Michael Chen</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-semibold text-sm">Liminar - Suspensão de Serviços</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5">00155-2024</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">NetConnect Telecom</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <span className="size-1.5 rounded-full bg-primary"></span> Em Análise
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase">Alta</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-cover bg-center border border-white" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=alex")'}}></div>
                    <span className="text-sm text-slate-700 font-medium">Alex Moraes</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
              {/* Row 4 */}
              <tr className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-semibold text-sm">Cobrança Indevida</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5">00129-2023</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">Tech Solutions SA</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="size-1.5 rounded-full bg-slate-400"></span> Triagem
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 uppercase">Média</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold border border-slate-200 shadow-sm">--</div>
                    <span className="text-sm text-slate-500 italic">Não atribuído</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
              {/* Row 5 */}
              <tr className="hover:bg-slate-50/80 transition-colors group opacity-75">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-semibold text-sm line-through decoration-slate-400">Recurso Especial</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5">00098-2022</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">Transportadora Veloz</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span> Concluído
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">Baixa</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-cover bg-center border border-white" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=ana")'}}></div>
                    <span className="text-sm text-slate-700 font-medium">Ana Costa</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : viewMode === 'grid' ? (
          <div className="p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Novo Processo
                </button>
                <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
                <button 
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FolderPlus size={20} />
                  Nova Pasta
                </button>
                <button className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Square size={20} />
                  Selecionar
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
                <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm shrink-0">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grouped')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grouped' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-slate-500 font-medium mb-4">
              <Home size={18} className="mr-1" />
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900 font-semibold">Meus Processos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto content-start">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FolderOpen className="text-red-500" size={24} />
                  <span className="text-sm font-bold text-slate-800 truncate">_ERRO</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FolderOpen className="text-green-500" size={24} />
                  <span className="text-sm font-bold text-slate-800 truncate">_TRIAL</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder className="text-blue-500" size={24} />
                  <span className="text-sm font-bold text-slate-700 truncate uppercase">Abraao Dos Reis Schott</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded-full hover:bg-white/50">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder className="text-blue-500" size={24} />
                  <span className="text-sm font-bold text-slate-700 truncate uppercase">Adenor Israel De Oliveira</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded-full hover:bg-white/50">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder className="text-blue-500" size={24} />
                  <span className="text-sm font-bold text-slate-700 truncate uppercase">Adler Lucena (Cancelado)</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded-full hover:bg-white/50">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder className="text-blue-500" size={24} />
                  <span className="text-sm font-bold text-slate-700 truncate uppercase">Adrio Luis Gonçalves</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded-full hover:bg-white/50">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder className="text-blue-500" size={24} />
                  <span className="text-sm font-bold text-slate-700 truncate uppercase">Akram Tayser Fattash</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded-full hover:bg-white/50">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder className="text-blue-500" size={24} />
                  <span className="text-sm font-bold text-slate-700 truncate uppercase">Alan Eidi Handa</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded-full hover:bg-white/50">
                  <MoreVertical size={20} />
                </button>
              </div>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  Novo Processo
                </button>
                <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
                <button 
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FolderPlus size={20} />
                  Nova Pasta
                </button>
                <button className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Square size={20} />
                  Selecionar
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
                <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm shrink-0">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grouped')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grouped' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-slate-500 font-medium mb-6">
              <Home size={18} className="mr-1" />
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-500">Processos</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900 font-bold">ADRIO LUIS GONÇALVES DE LIMA</span>
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
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
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
    </main>
  );
}
