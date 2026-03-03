import { Gavel, HardHat, MessageSquare, FileText, Landmark, Copyright, Building2, ArrowRight, Plus, ChevronRight } from 'lucide-react';

export function JuridicoPipelines({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center text-sm font-medium text-slate-500">
              <span className="hover:text-primary transition-colors cursor-pointer">Jurídico</span>
              <ChevronRight size={16} className="mx-2" />
              <span className="text-slate-900 font-semibold">Pipelines</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-900">Pipelines de Processos</h1>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm shadow-primary/30 transition-all active:scale-95 font-medium text-sm">
            <Plus size={20} />
            Criar Pipeline
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Contencioso Cível */}
          <div 
            onClick={() => onNavigate('juridico-processos')}
            className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Gavel size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  124 Processos
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Contencioso Cível</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                Gestão de processos cíveis e relações de consumo em todas as instâncias judiciais.
              </p>
            </div>
            <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
              Acessar Pipeline
              <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Trabalhista */}
          <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                  <HardHat size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  85 Processos
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Trabalhista</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                Acompanhamento de reclamações trabalhistas, acordos sindicais e preventivo.
              </p>
            </div>
            <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
              Acessar Pipeline
              <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Consultivo */}
          <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <MessageSquare size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  42 Solicitações
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Consultivo</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                Pareceres, consultas jurídicas internas e análises de risco prévias.
              </p>
            </div>
            <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
              Acessar Pipeline
              <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Gestão de Contratos */}
          <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  67 Ativos
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Gestão de Contratos</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                Fluxo de elaboração, revisão e assinatura de contratos com fornecedores e parceiros.
              </p>
            </div>
            <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
              Acessar Pipeline
              <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tributário */}
          <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100">
                  <Landmark size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  15 Processos
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Tributário</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                Gestão de passivos tributários, execuções fiscais e recuperações de crédito.
              </p>
            </div>
            <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
              Acessar Pipeline
              <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Propriedade Intelectual */}
          <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                  <Copyright size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  8 Ativos
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Propriedade Intelectual</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                Registro e acompanhamento de marcas, patentes e direitos autorais.
              </p>
            </div>
            <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
              Acessar Pipeline
              <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Societário */}
          <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="p-3 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                  <Building2 size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  12 Atos
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Societário</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                Atas, alterações contratuais, governança corporativa e livros societários.
              </p>
            </div>
            <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
              Acessar Pipeline
              <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
