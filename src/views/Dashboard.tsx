import { DollarSign, FileText, Users, Flag, TrendingUp, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm font-medium">Receita Mensal</p>
              <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-lg">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">R$ 1.2M</h3>
            </div>
            <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp size={16} />
              +5.4% <span className="text-slate-400 font-normal">vs mês anterior</span>
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm font-medium">Total de Contratos</p>
              <div className="text-primary bg-blue-50 p-1.5 rounded-lg">
                <FileText size={20} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">142</h3>
            </div>
            <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
              <span className="text-lg leading-none">+</span>
              12 ativos <span className="text-slate-400 font-normal">este mês</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm font-medium">Novos Clientes</p>
              <div className="text-violet-500 bg-violet-50 p-1.5 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <h3 className="text-2xl font-bold text-slate-900">24</h3>
            </div>
            <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
              <TrendingUp size={16} />
              +12% <span className="text-slate-400 font-normal">vs mês anterior</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-500 text-sm font-medium">Metas de Vendas</p>
              <div className="text-amber-500 bg-amber-50 p-1.5 rounded-lg">
                <Flag size={20} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <h3 className="text-2xl font-bold text-slate-900">88%</h3>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
            <p className="text-emerald-600 text-sm font-medium mt-2 flex items-center gap-1">
              +5% <span className="text-slate-400 font-normal">acima do target</span>
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Novos Clientes por Mês</h3>
                <p className="text-slate-500 text-sm">Aquisição de novos clientes no último semestre</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="size-3 rounded-full bg-primary"></span>
                <span className="text-slate-600">2024</span>
              </div>
            </div>
            <div className="relative h-[300px] w-full flex items-end justify-between gap-2 pt-4 px-2">
              <div className="w-full h-full flex items-end justify-around gap-4">
                {[
                  { month: 'Jan', height: '45%', color: 'bg-primary/20 hover:bg-primary' },
                  { month: 'Fev', height: '60%', color: 'bg-primary/30 hover:bg-primary' },
                  { month: 'Mar', height: '55%', color: 'bg-primary/40 hover:bg-primary' },
                  { month: 'Abr', height: '75%', color: 'bg-primary/60 hover:bg-primary' },
                  { month: 'Mai', height: '65%', color: 'bg-primary/80 hover:bg-primary' },
                  { month: 'Jun', height: '85%', color: 'bg-primary', textClass: 'font-bold text-primary' },
                ].map((item, i) => (
                  <div key={i} className="w-full bg-slate-50 rounded-lg relative group h-full flex flex-col justify-end">
                    <div className={`w-full rounded-t-lg transition-all duration-500 ${item.color}`} style={{ height: item.height }}></div>
                    <span className={`text-xs mt-2 text-center ${item.textClass || 'text-slate-500'}`}>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Contratos por Status</h3>
              <div className="flex items-center justify-center py-4 relative">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e2e8f0" strokeWidth="12"></circle>
                  <circle className="text-emerald-500" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="160 251.2" strokeDashoffset="0" strokeWidth="12"></circle>
                  <circle className="text-amber-500" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="50 251.2" strokeDashoffset="-160" strokeWidth="12"></circle>
                  <circle className="text-red-500" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="41.2 251.2" strokeDashoffset="-210" strokeWidth="12"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">142</span>
                  <span className="text-xs text-slate-500">Total</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Ativo</span>
                  </div>
                  <span className="font-semibold text-slate-900">64%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">Em Renovação</span>
                  </div>
                  <span className="font-semibold text-slate-900">20%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500"></span>
                    <span className="text-slate-600">Cancelado</span>
                  </div>
                  <span className="font-semibold text-slate-900">16%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Contratos Vencendo
            </h3>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-red-900">TechSolutions Ltd</p>
                  <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded">2 dias</span>
                </div>
                <p className="text-xs text-red-700">Valor: R$ 45.000,00</p>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors">Detalhes</button>
                  <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors">Renovar</button>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-amber-900">Global Logistics S.A.</p>
                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">5 dias</span>
                </div>
                <p className="text-xs text-amber-700">Valor: R$ 12.500,00</p>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors">Detalhes</button>
                  <button className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-700 transition-colors">Contato</button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Últimas Atividades Comerciais</h3>
              <button className="text-sm text-primary font-medium hover:text-blue-600 transition-colors">Ver Todas</button>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="size-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm text-slate-900"><span className="font-semibold">Sarah Jenkins</span> fechou contrato com <span className="font-semibold text-primary">Inova Tech</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Novo Cliente - Enterprise</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">2 min atrás</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/150?u=michael" alt="Michael" className="size-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm text-slate-900"><span className="font-semibold">Michael Chen</span> enviou proposta para <span className="font-semibold text-primary">Beta Group</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Proposta #PROP-2490</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">15 min atrás</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">JS</div>
                  <div>
                    <p className="text-sm text-slate-900"><span className="font-semibold">Sistema</span> atualizou status de oportunidade</p>
                    <p className="text-xs text-slate-500 mt-0.5">Pipeline de Vendas</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">1h atrás</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/150?u=david" alt="David" className="size-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm text-slate-900"><span className="font-semibold">David Ross</span> agendou reunião com <span className="font-semibold">Emily White</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Apresentação de Produto</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">3h atrás</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
