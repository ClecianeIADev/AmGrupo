import { Users, CheckCircle, UserPlus, TrendingDown, MoreHorizontal, Cake, Calendar as CalendarIcon } from 'lucide-react';

export function RHDashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth bg-slate-50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total de Colaboradores</p>
              <h3 className="text-2xl font-bold text-slate-900">128</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Colaboradores Ativos</p>
              <h3 className="text-2xl font-bold text-slate-900">124</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Contratações (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900">08</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Rotatividade (Turnover)</p>
              <h3 className="text-2xl font-bold text-slate-900">1.2%</h3>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-slate-900">Distribuição por Setor</h4>
              <MoreHorizontal className="text-slate-400 cursor-pointer" size={20} />
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Comercial</span>
                  <span>42 colaboradores</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Tecnologia</span>
                  <span>28 colaboradores</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Financeiro</span>
                  <span>18 colaboradores</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>RH & Administrativo</span>
                  <span>15 colaboradores</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Marketing</span>
                  <span>12 colaboradores</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-slate-900">Gênero e Diversidade</h4>
              <MoreHorizontal className="text-slate-400 cursor-pointer" size={20} />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="relative size-48">
                <svg className="size-full" viewBox="0 0 36 36">
                  <circle className="stroke-slate-100" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                  <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="55, 100" strokeDashoffset="25" strokeWidth="3"></circle>
                  <circle className="stroke-emerald-500" cx="18" cy="18" fill="none" r="16" strokeDasharray="35, 100" strokeDashoffset="70" strokeWidth="3"></circle>
                  <circle className="stroke-amber-400" cx="18" cy="18" fill="none" r="16" strokeDasharray="10, 100" strokeDashoffset="105" strokeWidth="3"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">128</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-8 w-full">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="size-2 rounded-full bg-primary"></span>
                    <span className="text-xs font-medium text-slate-500">Masculino</span>
                  </div>
                  <span className="font-bold text-slate-900">55%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="size-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-medium text-slate-500">Feminino</span>
                  </div>
                  <span className="font-bold text-slate-900">35%</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="size-2 rounded-full bg-amber-400"></span>
                    <span className="text-xs font-medium text-slate-500">Outros</span>
                  </div>
                  <span className="font-bold text-slate-900">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cake className="text-amber-500" size={20} />
                <h4 className="font-bold text-slate-900">Próximos Aniversariantes</h4>
              </div>
              <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Ver Calendário</button>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cover bg-center" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=sarah")'}}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Sarah Jenkins</p>
                    <p className="text-xs text-slate-500">15 de Outubro • Comercial</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">Amanhã</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cover bg-center" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=michael")'}}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Michael Chen</p>
                    <p className="text-xs text-slate-500">18 de Outubro • Tecnologia</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Em 4 dias</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs">FA</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Fernanda Alves</p>
                    <p className="text-xs text-slate-500">22 de Outubro • Produto</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">Em 8 dias</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-primary" size={20} />
                <h4 className="font-bold text-slate-900">Férias Agendadas</h4>
              </div>
              <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Ver Escala</button>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cover bg-center" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=david")'}}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">David Ross</p>
                    <p className="text-xs text-slate-500">10 Nov - 25 Nov (15 dias)</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">Aprovado</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cover bg-center grayscale" style={{backgroundImage: 'url("https://i.pravatar.cc/150?u=emily")'}}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Emily White</p>
                    <p className="text-xs text-slate-500">15 Dez - 30 Dez (15 dias)</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full">Pendente</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">JP</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Juliana Paes</p>
                    <p className="text-xs text-slate-500">20 Dez - 05 Jan (15 dias)</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">Aprovado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
