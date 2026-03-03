import { useState } from 'react';
import { Plus, CreditCard, Receipt, QrCode, Landmark, Trash2, MoreVertical, RefreshCw, TrendingUp, TrendingDown, Building, DollarSign, FolderOpen } from 'lucide-react';

export function FinanceiroSettings() {
  const [activeTab, setActiveTab] = useState('formas-pagamento');

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
          <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-8 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('bancos')}
              className={`whitespace-nowrap pb-3 border-b-2 transition-colors text-sm ${activeTab === 'bancos' ? 'border-primary text-primary font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'}`}
            >
              Bancos
            </button>
            <button 
              onClick={() => setActiveTab('grupo-contabil')}
              className={`whitespace-nowrap pb-3 border-b-2 transition-colors text-sm ${activeTab === 'grupo-contabil' ? 'border-primary text-primary font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'}`}
            >
              Grupo Contábil
            </button>
            <button 
              onClick={() => setActiveTab('contas')}
              className={`whitespace-nowrap pb-3 border-b-2 transition-colors text-sm ${activeTab === 'contas' ? 'border-primary text-primary font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'}`}
            >
              Contas
            </button>
            <button 
              onClick={() => setActiveTab('formas-pagamento')}
              className={`whitespace-nowrap pb-3 border-b-2 transition-colors text-sm ${activeTab === 'formas-pagamento' ? 'border-primary text-primary font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 font-medium'}`}
            >
              Formas de Pagamento
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
              <Plus size={18} />
              {activeTab === 'bancos' ? 'Adicionar Banco' : activeTab === 'grupo-contabil' ? 'Adicionar Grupo' : 'Adicionar Método'}
            </button>
          </div>
        </div>

        {activeTab === 'bancos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Banco Inter */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-orange-50 flex items-center justify-center p-2">
                    <Landmark className="text-orange-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Banco Inter</h3>
                    <p className="text-slate-500 text-xs">Principal Account</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Agency / Account</p>
                  <p className="text-sm font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-100 inline-block">0001 / 987654-3</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-slate-900">R$ 145.280,00</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><RefreshCw size={16} /> Updated 10m ago</span>
                <button className="text-primary hover:text-blue-700 font-medium transition-colors">View Transactions</button>
              </div>
            </div>

            {/* Santander */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-red-50 flex items-center justify-center p-2">
                    <Landmark className="text-red-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Santander</h3>
                    <p className="text-slate-500 text-xs">Payroll Account</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Agency / Account</p>
                  <p className="text-sm font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-100 inline-block">3421 / 12345-6</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-slate-900">R$ 52.450,00</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><RefreshCw size={16} /> Updated 2h ago</span>
                <button className="text-primary hover:text-blue-700 font-medium transition-colors">View Transactions</button>
              </div>
            </div>

            {/* Itaú Empresas */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center p-2">
                    <Landmark className="text-blue-800" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Itaú Empresas</h3>
                    <p className="text-slate-500 text-xs">Investment Fund</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Agency / Account</p>
                  <p className="text-sm font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-100 inline-block">8890 / 45678-9</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-slate-900">R$ 890.120,50</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><RefreshCw size={16} /> Updated 5m ago</span>
                <button className="text-primary hover:text-blue-700 font-medium transition-colors">View Transactions</button>
              </div>
            </div>

            {/* Bradesco */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative opacity-75 hover:opacity-100">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center p-2">
                    <Landmark className="text-slate-500" size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Bradesco</h3>
                    <p className="text-slate-500 text-xs">Old Operations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Inactive</span>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Agency / Account</p>
                  <p className="text-sm font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-100 inline-block">1020 / 33445-0</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-slate-500">R$ 0,00</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><RefreshCw size={16} /> Archived</span>
                <button className="text-slate-500 hover:text-slate-700 font-medium transition-colors">Details</button>
              </div>
            </div>

            {/* Add New Bank */}
            <button className="bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-slate-100 transition-all group flex flex-col items-center justify-center gap-4 min-h-[280px]">
              <div className="size-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="text-primary" size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">Connect New Bank</h3>
                <p className="text-slate-500 text-sm mt-1">Add another bank account or integration</p>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'grupo-contabil' && (
          <div className="flex flex-col gap-4">
            {/* Ativo */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-emerald-600" size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ativo</h3>
                  <p className="text-slate-500 text-sm">Bens e direitos da organização</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 md:gap-16">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Contas</p>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="text-slate-400" size={18} />
                    <span className="text-base font-bold text-slate-900">45</span>
                  </div>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Saldo Total</p>
                  <p className="text-base font-bold text-emerald-600">R$ 1.250.000,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:ml-4 justify-end md:justify-start">
                <button className="text-sm font-medium text-slate-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Editar</button>
                <button className="text-sm font-medium text-primary border border-slate-200 bg-slate-50 hover:bg-white px-4 py-1.5 rounded-lg transition-all shadow-sm">Ver Detalhes</button>
              </div>
            </div>

            {/* Passivo */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="text-orange-600" size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Passivo</h3>
                  <p className="text-slate-500 text-sm">Obrigações e deveres com terceiros</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 md:gap-16">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Contas</p>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="text-slate-400" size={18} />
                    <span className="text-base font-bold text-slate-900">32</span>
                  </div>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Saldo Total</p>
                  <p className="text-base font-bold text-slate-900">R$ 450.000,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:ml-4 justify-end md:justify-start">
                <button className="text-sm font-medium text-slate-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Editar</button>
                <button className="text-sm font-medium text-primary border border-slate-200 bg-slate-50 hover:bg-white px-4 py-1.5 rounded-lg transition-all shadow-sm">Ver Detalhes</button>
              </div>
            </div>

            {/* Patrimônio Líquido */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Building className="text-indigo-600" size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Patrimônio Líquido</h3>
                  <p className="text-slate-500 text-sm">Capital social e reservas</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 md:gap-16">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Contas</p>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="text-slate-400" size={18} />
                    <span className="text-base font-bold text-slate-900">8</span>
                  </div>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Saldo Total</p>
                  <p className="text-base font-bold text-slate-900">R$ 2.450.000,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:ml-4 justify-end md:justify-start">
                <button className="text-sm font-medium text-slate-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Editar</button>
                <button className="text-sm font-medium text-primary border border-slate-200 bg-slate-50 hover:bg-white px-4 py-1.5 rounded-lg transition-all shadow-sm">Ver Detalhes</button>
              </div>
            </div>

            {/* Receitas */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="text-blue-600" size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Receitas</h3>
                  <p className="text-slate-500 text-sm">Entradas operacionais e não operacionais</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 md:gap-16">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Contas</p>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="text-slate-400" size={18} />
                    <span className="text-base font-bold text-slate-900">15</span>
                  </div>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Saldo Total</p>
                  <p className="text-base font-bold text-emerald-600">R$ 890.000,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:ml-4 justify-end md:justify-start">
                <button className="text-sm font-medium text-slate-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Editar</button>
                <button className="text-sm font-medium text-primary border border-slate-200 bg-slate-50 hover:bg-white px-4 py-1.5 rounded-lg transition-all shadow-sm">Ver Detalhes</button>
              </div>
            </div>

            {/* Despesas */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Receipt className="text-red-600" size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Despesas</h3>
                  <p className="text-slate-500 text-sm">Gastos para manutenção das atividades</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 md:gap-16">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Contas</p>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="text-slate-400" size={18} />
                    <span className="text-base font-bold text-slate-900">28</span>
                  </div>
                </div>
                <div className="min-w-[140px]">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Saldo Total</p>
                  <p className="text-base font-bold text-slate-900">R$ 320.000,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 md:ml-4 justify-end md:justify-start">
                <button className="text-sm font-medium text-slate-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Editar</button>
                <button className="text-sm font-medium text-primary border border-slate-200 bg-slate-50 hover:bg-white px-4 py-1.5 rounded-lg transition-all shadow-sm">Ver Detalhes</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'formas-pagamento' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5 pl-2">Método de Pagamento</div>
              <div className="col-span-3">Taxa de Processamento</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right pr-2">Ações</div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center border-b border-slate-100 hover:bg-slate-50 transition-colors group">
              <div className="col-span-5 flex items-center gap-4 pl-2">
                <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <CreditCard size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Cartão de Crédito</span>
                  <span className="text-xs text-slate-500">Visa, Mastercard, Elo</span>
                </div>
              </div>
              <div className="col-span-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                  2.99% + R$ 0,50
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"></span>
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                <button className="text-xs font-medium text-primary hover:text-blue-700 hover:underline px-2 py-1 transition-colors">Configurar</button>
                <button className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center border-b border-slate-100 hover:bg-slate-50 transition-colors group">
              <div className="col-span-5 flex items-center gap-4 pl-2">
                <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                  <Receipt size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Boleto Bancário</span>
                  <span className="text-xs text-slate-500">Emissão registrada</span>
                </div>
              </div>
              <div className="col-span-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                  R$ 1,50 <span className="text-xs text-slate-400 font-normal">/ un.</span>
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"></span>
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                <button className="text-xs font-medium text-primary hover:text-blue-700 hover:underline px-2 py-1 transition-colors">Configurar</button>
                <button className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center border-b border-slate-100 hover:bg-slate-50 transition-colors group">
              <div className="col-span-5 flex items-center gap-4 pl-2">
                <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <QrCode size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">PIX</span>
                  <span className="text-xs text-slate-500">Pagamento Instantâneo</span>
                </div>
              </div>
              <div className="col-span-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                  0.99%
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"></span>
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                <button className="text-xs font-medium text-primary hover:text-blue-700 hover:underline px-2 py-1 transition-colors">Configurar</button>
                <button className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors group">
              <div className="col-span-5 flex items-center gap-4 pl-2 opacity-60">
                <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Landmark size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Transferência Bancária</span>
                  <span className="text-xs text-slate-500">TED / DOC</span>
                </div>
              </div>
              <div className="col-span-3 opacity-60">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                  Gratuito
                </span>
              </div>
              <div className="col-span-2 flex justify-center">
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"></span>
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                <button className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline px-2 py-1 transition-colors">Configurar</button>
                <button className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
