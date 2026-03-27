import { useState } from 'react';
import { Search, Filter, Plus, X, Camera, Users, UserPlus } from 'lucide-react';

export function RHProfissionais({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // We expose a global function to open the modal from the header
  // This is a simple way to connect the header button to this component's state
  if (typeof window !== 'undefined') {
    (window as any).openAddProfessionalModal = () => setIsAddModalOpen(true);
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

        {/* Sub-tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
          <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white shadow-sm">
            Profissionais
          </button>
          <button
            onClick={() => onNavigate('rh-setores')}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Setores
          </button>
        </div>

        {/* Header/Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            </div>
            <input 
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-shadow" 
              placeholder="Buscar por nome, cargo ou departamento..." 
              type="text"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
              <Filter size={18} />
              <span className="hidden sm:inline">Status:</span>
            </div>
            <select className="form-select block w-full md:w-48 pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white text-slate-900">
              <option>Todos os Status</option>
              <option>Ativo</option>
              <option>Férias</option>
              <option>Afastado</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Ativo</span>
            <div className="size-24 rounded-full bg-cover bg-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=sarah")'}}></div>
            <h3 className="text-slate-900 font-bold text-lg">Sarah Jenkins</h3>
            <p className="text-slate-500 text-sm font-medium">Head de Comercial</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Comercial</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Ativo</span>
            <div className="size-24 rounded-full bg-cover bg-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=michael")'}}></div>
            <h3 className="text-slate-900 font-bold text-lg">Michael Chen</h3>
            <p className="text-slate-500 text-sm font-medium">Desenvolvedor Senior</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Tecnologia</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">Férias</span>
            <div className="size-24 rounded-full bg-cover bg-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=david")'}}></div>
            <h3 className="text-slate-900 font-bold text-lg">David Ross</h3>
            <p className="text-slate-500 text-sm font-medium">Gerente de RH</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Recursos Humanos</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">Afastado</span>
            <div className="size-24 rounded-full bg-cover bg-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all grayscale" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=emily")'}}></div>
            <h3 className="text-slate-900 font-bold text-lg">Emily White</h3>
            <p className="text-slate-500 text-sm font-medium">Analista de Marketing</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Marketing</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Ativo</span>
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all">
              <span className="text-2xl font-bold text-primary">RM</span>
            </div>
            <h3 className="text-slate-900 font-bold text-lg">Roberto Mendes</h3>
            <p className="text-slate-500 text-sm font-medium">Controller Financeiro</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Financeiro</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Ativo</span>
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all">
              <span className="text-2xl font-bold text-primary">JP</span>
            </div>
            <h3 className="text-slate-900 font-bold text-lg">Juliana Paes</h3>
            <p className="text-slate-500 text-sm font-medium">Jurídico Pleno</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Jurídico</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>

          {/* Card 7 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Ativo</span>
            <div className="size-24 rounded-full bg-cover bg-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=alex")'}}></div>
            <h3 className="text-slate-900 font-bold text-lg">Alex Moraes</h3>
            <p className="text-slate-500 text-sm font-medium">Administrador</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Gestão</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>

          {/* Card 8 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center relative shadow-sm hover:shadow-md transition-all group">
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Ativo</span>
            <div className="size-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4 ring-4 ring-slate-50 group-hover:ring-primary/20 transition-all">
              <span className="text-2xl font-bold text-indigo-500">FA</span>
            </div>
            <h3 className="text-slate-900 font-bold text-lg">Fernanda Alves</h3>
            <p className="text-slate-500 text-sm font-medium">UX Designer</p>
            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Produto</div>
            <button 
              onClick={() => onNavigate('rh-perfil')}
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-primary hover:text-white text-slate-700 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              Ver Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Add Professional Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[50] flex justify-end">
          <div className="w-full max-w-[480px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="text-primary" size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Adicionar Profissional</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                <div className="relative group cursor-pointer">
                  <div className="size-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <Users className="text-slate-400 group-hover:text-primary/50 transition-colors" size={32} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md border border-white">
                    <Camera size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Foto do Profissional</h3>
                  <p className="text-xs text-slate-500">Recomendado: 400x400px (PNG, JPG)</p>
                </div>
              </div>
              
              <form className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="nome">Nome Completo</label>
                  <input 
                    className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400" 
                    id="nome" 
                    placeholder="Ex: Ana Souza" 
                    type="text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="email">E-mail Corporativo</label>
                  <input 
                    className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400" 
                    id="email" 
                    placeholder="Ex: ana.souza@amgrupo.com.br" 
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="telefone">Telefone</label>
                    <input 
                      className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400" 
                      id="telefone" 
                      placeholder="(00) 00000-0000" 
                      type="tel"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="data_admissao">Data de Admissão</label>
                    <input 
                      className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow" 
                      id="data_admissao" 
                      type="date"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="departamento">Departamento</label>
                    <select className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow" id="departamento" defaultValue="">
                      <option disabled value="">Selecione...</option>
                      <option>Administrativo</option>
                      <option>Comercial</option>
                      <option>Financeiro</option>
                      <option>Marketing</option>
                      <option>Recursos Humanos</option>
                      <option>Tecnologia</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="cargo">Cargo</label>
                    <input 
                      className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400" 
                      id="cargo" 
                      placeholder="Ex: Analista Júnior" 
                      type="text"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-[2] px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-colors shadow-lg shadow-primary/20 text-sm"
              >
                Criar Profissional
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
