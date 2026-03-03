import { useState } from 'react';
import { 
  Wallet, CreditCard, Search, Calendar as CalendarIcon, ChevronDown, Plus, 
  FileText, Briefcase, Code, Wrench, Shield, Headphones, 
  CalendarX, CalendarCheck, Eye, CheckCircle2
} from 'lucide-react';

export function FinanceiroGerenciar() {
  const [activeTab, setActiveTab] = useState('a-receber');

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('a-receber')}
            className={`pb-4 px-2 font-bold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'a-receber' ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
          >
            <Wallet size={24} className={activeTab === 'a-receber' ? 'fill-primary/20' : ''} />
            A Receber
          </button>
          <button 
            onClick={() => setActiveTab('a-pagar')}
            className={`pb-4 px-2 font-bold text-lg flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'a-pagar' ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
          >
            <CreditCard size={24} className={activeTab === 'a-pagar' ? 'fill-primary/20' : ''} />
            A Pagar
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative flex-1 w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm text-slate-900 placeholder-slate-500 transition-all" 
              placeholder="Buscar por cliente, banco ou categoria..." 
              type="text"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative">
              <button className="flex w-full md:w-auto items-center justify-between gap-3 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 bg-white text-sm font-medium transition-colors">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} />
                  <span>Outubro 2023</span>
                </div>
                <ChevronDown size={18} />
              </button>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold shadow-sm shadow-blue-500/30">
              <Plus size={18} />
              Novo Lançamento
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          
          {/* Item 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-3/12">
              <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 flex-shrink-0">
                <span className="font-bold text-orange-600 text-xs">ITAÚ</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-base truncate">TechSolutions Ltd</h4>
                <p className="text-xs text-slate-500 truncate">Banco Itaú</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Categoria</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <FileText size={16} className="text-slate-400" />
                Contrato Mensal
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Vencimento</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <CalendarIcon size={16} className="text-slate-400" />
                15 Out 2023
              </div>
            </div>
            <div className="w-full md:w-2/12 flex md:justify-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                <span className="size-1.5 rounded-full bg-amber-500"></span>
                Pendente
              </span>
            </div>
            <div className="w-full md:w-2/12 text-left md:text-right">
              <span className="text-[10px] uppercase text-slate-400 font-bold md:hidden">Valor a Receber</span>
              <div className="font-bold text-slate-900 text-lg tracking-tight">R$ 15.000,00</div>
            </div>
            <div className="w-full md:w-1/12 flex items-center justify-end gap-2">
              <button className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="Visualizar">
                <Eye size={20} />
              </button>
              <button className="size-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-colors" title="Dar Baixa">
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-3/12">
              <div className="size-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 flex-shrink-0">
                <span className="font-bold text-red-600 text-xs">BRAD</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-base truncate">Global Markets</h4>
                <p className="text-xs text-slate-500 truncate">Bradesco</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Categoria</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Briefcase size={16} className="text-slate-400" />
                Consultoria
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Vencimento</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                <CalendarX size={16} />
                01 Out 2023
              </div>
            </div>
            <div className="w-full md:w-2/12 flex md:justify-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-fit">
                <span className="size-1.5 rounded-full bg-red-500"></span>
                Atrasado
              </span>
            </div>
            <div className="w-full md:w-2/12 text-left md:text-right">
              <span className="text-[10px] uppercase text-slate-400 font-bold md:hidden">Valor a Receber</span>
              <div className="font-bold text-slate-900 text-lg tracking-tight">R$ 4.250,00</div>
            </div>
            <div className="w-full md:w-1/12 flex items-center justify-end gap-2">
              <button className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="Visualizar">
                <Eye size={20} />
              </button>
              <button className="size-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-colors" title="Dar Baixa">
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4 opacity-80 hover:opacity-100">
            <div className="flex items-center gap-4 w-full md:w-3/12">
              <div className="size-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
                <span className="font-bold text-slate-600 text-xs">SANT</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-base truncate">SoftHouse Inc</h4>
                <p className="text-xs text-slate-500 truncate">Santander</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Categoria</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Code size={16} className="text-slate-400" />
                Desenvolvimento
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Data Pagamento</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <CalendarCheck size={16} className="text-emerald-500" />
                28 Set 2023
              </div>
            </div>
            <div className="w-full md:w-2/12 flex md:justify-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                <CheckCircle2 size={14} />
                Pago
              </span>
            </div>
            <div className="w-full md:w-2/12 text-left md:text-right">
              <span className="text-[10px] uppercase text-slate-400 font-bold md:hidden">Valor Recebido</span>
              <div className="font-bold text-slate-900 text-lg tracking-tight">R$ 8.900,00</div>
            </div>
            <div className="w-full md:w-1/12 flex items-center justify-end gap-2">
              <button className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="Ver Detalhes">
                <Eye size={20} />
              </button>
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-3/12">
              <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100 flex-shrink-0">
                <span className="font-bold text-purple-600 text-xs">NU</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-base truncate">Alpha Co</h4>
                <p className="text-xs text-slate-500 truncate">Nubank</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Categoria</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Wrench size={16} className="text-slate-400" />
                Serviços Pontuais
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Vencimento</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <CalendarIcon size={16} className="text-slate-400" />
                20 Out 2023
              </div>
            </div>
            <div className="w-full md:w-2/12 flex md:justify-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                <span className="size-1.5 rounded-full bg-amber-500"></span>
                Pendente
              </span>
            </div>
            <div className="w-full md:w-2/12 text-left md:text-right">
              <span className="text-[10px] uppercase text-slate-400 font-bold md:hidden">Valor a Receber</span>
              <div className="font-bold text-slate-900 text-lg tracking-tight">R$ 2.100,00</div>
            </div>
            <div className="w-full md:w-1/12 flex items-center justify-end gap-2">
              <button className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="Visualizar">
                <Eye size={20} />
              </button>
              <button className="size-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-colors" title="Dar Baixa">
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>

          {/* Item 5 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-3/12">
              <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 flex-shrink-0">
                <span className="font-bold text-orange-600 text-xs">INTER</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-base truncate">Beta LLC</h4>
                <p className="text-xs text-slate-500 truncate">Banco Inter</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Categoria</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Shield size={16} className="text-slate-400" />
                Licenciamento
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Vencimento</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <CalendarIcon size={16} className="text-slate-400" />
                22 Out 2023
              </div>
            </div>
            <div className="w-full md:w-2/12 flex md:justify-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                <span className="size-1.5 rounded-full bg-amber-500"></span>
                Pendente
              </span>
            </div>
            <div className="w-full md:w-2/12 text-left md:text-right">
              <span className="text-[10px] uppercase text-slate-400 font-bold md:hidden">Valor a Receber</span>
              <div className="font-bold text-slate-900 text-lg tracking-tight">R$ 12.500,00</div>
            </div>
            <div className="w-full md:w-1/12 flex items-center justify-end gap-2">
              <button className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="Visualizar">
                <Eye size={20} />
              </button>
              <button className="size-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-colors" title="Dar Baixa">
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>

          {/* Item 6 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-4 opacity-80 hover:opacity-100">
            <div className="flex items-center gap-4 w-full md:w-3/12">
              <div className="size-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
                <span className="font-bold text-slate-600 text-xs">ITAÚ</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-base truncate">Gamma Corp</h4>
                <p className="text-xs text-slate-500 truncate">Banco Itaú</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Categoria</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Headphones size={16} className="text-slate-400" />
                Suporte
              </div>
            </div>
            <div className="flex flex-col w-full md:w-2/12">
              <span className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Data Pagamento</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <CalendarCheck size={16} className="text-emerald-500" />
                25 Set 2023
              </div>
            </div>
            <div className="w-full md:w-2/12 flex md:justify-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                <CheckCircle2 size={14} />
                Pago
              </span>
            </div>
            <div className="w-full md:w-2/12 text-left md:text-right">
              <span className="text-[10px] uppercase text-slate-400 font-bold md:hidden">Valor Recebido</span>
              <div className="font-bold text-slate-900 text-lg tracking-tight">R$ 500,00</div>
            </div>
            <div className="w-full md:w-1/12 flex items-center justify-end gap-2">
              <button className="size-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="Ver Detalhes">
                <Eye size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
