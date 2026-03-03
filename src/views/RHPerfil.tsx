import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar as CalendarIcon, Edit, Download, X, Camera, Lock } from 'lucide-react';

export function RHPerfil() {
  const [activeTab, setActiveTab] = useState('informacoes');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Expose function for header
  if (typeof window !== 'undefined') {
    (window as any).openEditProfessionalModal = () => setIsEditModalOpen(true);
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar Profile */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm">
            <div className="relative">
              <div className="size-32 rounded-full bg-cover bg-center ring-4 ring-slate-50 mb-6" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=sarah")'}}></div>
              <span className="absolute bottom-6 right-2 size-6 bg-emerald-500 border-4 border-white rounded-full"></span>
            </div>
            <h3 className="text-slate-900 font-bold text-2xl">Sarah Jenkins</h3>
            <p className="text-slate-500 font-medium mb-4">Head de Comercial</p>
            <span className="px-4 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Ativo</span>
            
            <div className="w-full mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="text-slate-400" size={18} />
                <span className="text-sm truncate">sarah.jenkins@amgrupo.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="text-slate-400" size={18} />
                <span className="text-sm">+55 (11) 98877-6655</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-left">
                <MapPin className="text-slate-400 shrink-0" size={18} />
                <span className="text-sm">São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4">Métricas de Performance</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-500">Satisfação da Equipe</span>
                  <span className="text-primary">94%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-500">Metas Trimestrais</span>
                  <span className="text-emerald-500">102%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Tabs */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex gap-1 shadow-sm overflow-x-auto">
            <button 
              onClick={() => setActiveTab('informacoes')}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'informacoes' ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Informações
            </button>
            <button 
              onClick={() => setActiveTab('documentos')}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'documentos' ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Documentos
            </button>
            <button 
              onClick={() => setActiveTab('historico')}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'historico' ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Histórico
            </button>
            <button 
              onClick={() => setActiveTab('pdi')}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pdi' ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              PDI
            </button>
          </div>

          {activeTab === 'informacoes' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Informações Gerais</h3>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Corporativo</label>
                      <p className="text-slate-900 font-medium">sarah.jenkins@amgrupo.com</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone</label>
                      <p className="text-slate-900 font-medium">+55 (11) 98877-6655</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Departamento</label>
                      <p className="text-slate-900 font-medium">Comercial</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data de Admissão</label>
                      <p className="text-slate-900 font-medium">12 de Janeiro de 2022</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço</label>
                      <p className="text-slate-900 font-medium">Av. das Nações Unidas, 14401 - Vila Gertrudes, São Paulo - SP, 04794-000</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo de Contrato</label>
                      <p className="text-slate-900 font-medium">CLT (Efetivo)</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gestor Imediato</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="size-6 rounded-full bg-cover bg-center" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=alex")'}}></div>
                        <p className="text-slate-900 font-medium">Alex Moraes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-slate-900 font-bold mb-4">Competências Técnicas</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">Negociação B2B</span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">CRM Salesforce</span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">Gestão de Equipes</span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">Key Account Mgmt</span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">Planejamento Estratégico</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-slate-900 font-bold mb-4">Próximas Férias</h3>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <CalendarIcon size={24} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold">15 de Setembro</p>
                      <p className="text-slate-500 text-xs">Período de 15 dias solicitado</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'informacoes' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <span className="text-slate-400">Conteúdo em desenvolvimento</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Aba {activeTab}</h3>
              <p className="text-slate-500 max-w-md">Esta seção está sendo desenvolvida e estará disponível em breve.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Professional Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[50] flex justify-end">
          <div className="w-full max-w-[480px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Edit className="text-primary" size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Editar Profissional</h2>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                <div className="relative group">
                  <div className="size-20 rounded-xl bg-cover bg-center border-4 border-slate-100" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=sarah")'}}></div>
                  <button className="absolute -bottom-1 -right-1 size-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sarah Jenkins</h3>
                  <p className="text-sm text-slate-500">sarah.jenkins@amgrupo.com.br</p>
                </div>
              </div>
              
              <form className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="nome">Nome Completo</label>
                  <input 
                    className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow" 
                    id="nome" 
                    type="text" 
                    defaultValue="Sarah Jenkins"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="email">E-mail Corporativo</label>
                  <div className="relative">
                    <input 
                      className="block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-sm cursor-not-allowed" 
                      disabled 
                      id="email" 
                      type="email" 
                      defaultValue="sarah.jenkins@amgrupo.com.br"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="telefone">Telefone</label>
                    <input 
                      className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow" 
                      id="telefone" 
                      type="tel" 
                      defaultValue="(11) 98765-4321"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="departamento">Departamento</label>
                    <input 
                      className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow" 
                      id="departamento" 
                      type="text" 
                      defaultValue="Comercial"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="cargo">Cargo</label>
                  <input 
                    className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow" 
                    id="cargo" 
                    type="text" 
                    defaultValue="Head de Comercial"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Observações Internas</label>
                  <textarea 
                    className="block w-full px-4 py-3 bg-slate-50 border-none rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow resize-none" 
                    placeholder="Adicione notas sobre o profissional..." 
                    rows={4}
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-[2] px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-colors shadow-lg shadow-primary/20 text-sm"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
