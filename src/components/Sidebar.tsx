import {
  LayoutGrid,
  LayoutDashboard,
  Building2,
  ClipboardList,
  Briefcase,
  CircleDollarSign,
  Scale,
  Megaphone,
  Users,
  Landmark,
  Settings,
  LogOut
} from 'lucide-react';

export function Sidebar({ currentView, setCurrentView }: { currentView: string, setCurrentView: (v: string) => void }) {
  return (
    <aside className="w-72 bg-white flex flex-col border-r border-slate-200 transition-colors duration-300 flex-shrink-0 z-20 hidden lg:flex">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
        <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
          <LayoutGrid className="text-white" size={24} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 text-lg font-bold leading-none">AM Grupo</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">Enterprise ERP</p>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto py-4">
        <button onClick={() => setCurrentView('dashboard')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentView === 'dashboard' ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <LayoutDashboard size={20} className={currentView === 'dashboard' ? '' : 'group-hover:text-primary transition-colors'} />
          Dashboard
        </button>
        <div className="pt-4 pb-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Modules</div>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
          <Building2 size={20} className="group-hover:text-primary transition-colors" />
          Administrativo
        </button>
        <button onClick={() => setCurrentView('cadastro-clientes')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentView.startsWith('cadastro') ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <ClipboardList size={20} className={currentView.startsWith('cadastro') ? 'fill-primary/20' : 'group-hover:text-primary transition-colors'} />
          Cadastro
        </button>
        <button onClick={() => setCurrentView('kanban')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentView === 'kanban' || currentView === 'detail' ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Briefcase size={20} className={currentView === 'kanban' || currentView === 'detail' ? 'fill-primary/20' : 'group-hover:text-primary transition-colors'} />
          Comercial
        </button>
        <button onClick={() => setCurrentView('financeiro-gerenciar')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentView.startsWith('financeiro') ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <CircleDollarSign size={20} className={currentView.startsWith('financeiro') ? 'fill-primary/20' : 'group-hover:text-primary transition-colors'} />
          Financeiro
        </button>
        {currentView.startsWith('financeiro') && (
          <div className="flex flex-col gap-1 ml-9 mt-1 mb-2">
            <button onClick={() => setCurrentView('financeiro-gerenciar')} className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${currentView === 'financeiro-gerenciar' ? 'text-primary font-semibold bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Gerenciar</button>
            <button onClick={() => setCurrentView('financeiro-settings')} className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${currentView === 'financeiro-settings' ? 'text-primary font-semibold bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Configurações</button>
          </div>
        )}
        <button onClick={() => setCurrentView('juridico-pipelines')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentView.startsWith('juridico') ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Scale size={20} className={currentView.startsWith('juridico') ? 'fill-primary/20' : 'group-hover:text-primary transition-colors'} />
          Jurídico
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
          <Megaphone size={20} className="group-hover:text-primary transition-colors" />
          Marketing
        </button>
        <button onClick={() => setCurrentView('rh-dashboard')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${currentView.startsWith('rh') ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Users size={20} className={currentView.startsWith('rh') ? 'fill-primary/20' : 'group-hover:text-primary transition-colors'} />
          RH
        </button>
        {currentView.startsWith('rh') && (
          <div className="flex flex-col gap-1 ml-9 mt-1 mb-2">
            <button onClick={() => setCurrentView('rh-dashboard')} className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${currentView === 'rh-dashboard' ? 'text-primary font-semibold bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Dashboard</button>
            <button onClick={() => setCurrentView('rh-profissionais')} className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${currentView === 'rh-profissionais' || currentView === 'rh-perfil' ? 'text-primary font-semibold bg-primary/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>Profissionais</button>
          </div>
        )}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
          <Landmark size={20} className="group-hover:text-primary transition-colors" />
          Contábil
        </button>
      </nav>
      <div className="p-4 border-t border-slate-200 flex flex-col gap-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
          <Settings size={20} />
          Settings
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
