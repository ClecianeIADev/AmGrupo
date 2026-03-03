import { Menu, Search, Bell, ChevronDown, Plus, Pencil, Save, Download } from 'lucide-react';

export function Header({ currentView }: { currentView: string }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 hover:text-primary">
          <Menu size={24} />
        </button>

        {currentView === 'dashboard' && (
          <div className="flex flex-col">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight leading-tight">Dashboard Comercial</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Comercial</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-primary font-medium">Dashboard</span>
            </div>
          </div>
        )}

        {currentView === 'kanban' && (
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">Comercial <span className="text-slate-400 font-medium">/ CRM</span></h2>
          </div>
        )}

        {currentView === 'cadastro-clientes' && (
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">Cadastro <span className="text-slate-400 font-medium">/ Clientes</span></h2>
          </div>
        )}

        {currentView === 'detail' && (
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">
              Comercial <span className="text-slate-400 font-medium">/ CRM / TechCorp Industries</span>
            </h2>
          </div>
        )}
        {currentView === 'financeiro-settings' && (
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">Financeiro / Configurações</h2>
          </div>
        )}
        {currentView === 'financeiro-gerenciar' && (
          <div className="flex items-center gap-2 text-lg">
            <span className="text-slate-500 font-medium">Financeiro</span>
            <span className="text-slate-300">/</span>
            <h2 className="text-slate-900 font-bold tracking-tight">Gerenciar</h2>
          </div>
        )}
        {currentView === 'juridico-pipelines' && (
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight">Jurídico</h2>
          </div>
        )}
        {currentView === 'juridico-processos' && (
          <div className="flex flex-col">
            <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                  <span className="inline-flex items-center hover:text-primary transition-colors cursor-pointer">
                    Jurídico
                  </span>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-sm mx-1">&gt;</span>
                    <span className="hover:text-primary transition-colors cursor-pointer">Pipelines</span>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="text-sm mx-1">&gt;</span>
                    <span className="font-medium text-slate-900">Contencioso Cível</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        )}
        {currentView === 'rh-dashboard' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">RH</span>
            <span className="text-slate-300">/</span>
            <h2 className="text-slate-900 font-bold tracking-tight text-lg">Dashboard de Gestão</h2>
          </div>
        )}
        {currentView === 'rh-profissionais' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">RH</span>
            <span className="text-slate-300">/</span>
            <h2 className="text-slate-900 font-bold tracking-tight text-lg">Profissionais</h2>
          </div>
        )}
        {currentView === 'rh-perfil' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 hover:text-primary cursor-pointer transition-colors">RH</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 hover:text-primary cursor-pointer transition-colors">Profissionais</span>
            <span className="text-slate-300">/</span>
            <h2 className="text-slate-900 font-bold tracking-tight text-lg">Sarah Jenkins</h2>
          </div>
        )}
      </div>

      {(currentView === 'dashboard' || currentView === 'kanban' || currentView.startsWith('financeiro') || currentView.startsWith('juridico') || currentView.startsWith('rh')) && (
        <div className={`hidden md:flex flex-1 max-w-lg mx-6 ${currentView === 'financeiro-gerenciar' || currentView === 'juridico-processos' || currentView.startsWith('rh') ? 'opacity-0 pointer-events-none' : ''}`}>
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-shadow"
              placeholder={currentView === 'dashboard' ? "Pesquisar contratos, clientes..." : currentView === 'financeiro-settings' ? "Search settings, accounts..." : currentView === 'juridico-pipelines' ? "Buscar processos, clientes ou documentos..." : currentView === 'cadastro-clientes' ? "Search modules, invoices, or clients..." : "Search opportunities..."}
              type="text"
            />
            {(currentView === 'dashboard' || currentView === 'financeiro-settings' || currentView === 'juridico-pipelines') && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs border border-slate-300 rounded px-1.5 py-0.5">⌘ K</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {currentView === 'juridico-processos' && (
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-shadow"
                placeholder="Buscar processos (Ex: 00123...)"
                type="text"
              />
            </div>
          </div>
        )}
        {currentView === 'kanban' && (
          <button
            onClick={() => (window as any).openNewOpportunityModal?.()}
            className="hidden md:flex bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/30 items-center gap-2 transition-all">
            <Plus size={18} />
            Nova Oportunidade
          </button>
        )}
        {currentView === 'rh-dashboard' && (
          <button className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/20">
            <Download size={18} />
            Exportar Relatório
          </button>
        )}
        {currentView === 'rh-profissionais' && (
          <button
            onClick={() => (window as any).openAddProfessionalModal?.()}
            className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/20"
          >
            <Plus size={18} />
            Adicionar Profissional
          </button>
        )}
        {currentView === 'rh-perfil' && (
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-200">
              <Download size={18} />
              Exportar
            </button>
            <button
              onClick={() => (window as any).openEditProfessionalModal?.()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-primary/20"
            >
              <Pencil size={18} />
              Editar
            </button>
          </div>
        )}

        {currentView === 'detail' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window as any).openEditOpportunityModal?.()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Pencil size={16} />
              Editar
            </button>
          </div>
        )}

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        <button className="flex items-center gap-3 pl-2 rounded-lg hover:bg-slate-50 transition-colors p-1 pr-2">
          <img src="https://i.pravatar.cc/150?u=alex" alt="Alex Moraes" className="size-9 rounded-full border border-slate-200 object-cover" />
          <div className="hidden lg:flex flex-col items-start text-sm">
            <span className="font-semibold text-slate-900 leading-tight">Alex Moraes</span>
            <span className="text-slate-500 text-xs leading-tight">Admin</span>
          </div>
          <ChevronDown size={18} className="text-slate-400 hidden lg:block" />
        </button>
      </div>
    </header>
  );
}
