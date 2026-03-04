import {
    X,
    Scale,
    Settings2,
    Zap,
    FileText,
    HelpCircle,
    FolderSearch,
    Sparkles,
    Lock,
    MessageCircle,
    FileQuestion,
    Receipt,
    AlignLeft,
    ChevronDown
} from 'lucide-react';

interface ProcessDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    processNumber?: string;
}

export function ProcessDetailsModal({ isOpen, onClose, processNumber = '1029511-60.2023.8.26.0506' }: ProcessDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[1200px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header Section */}
                <div className="px-8 pt-8 pb-4 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {/* Process Icon */}
                            <div className="size-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center shrink-0">
                                <Scale className="text-[#6366F1]" size={28} strokeWidth={2} />
                            </div>

                            {/* Title and Tags */}
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-bold text-slate-800">Processo: {processNumber}</h2>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5]">
                                        <span className="size-1.5 rounded-full bg-[#4F46E5]"></span>
                                        Perito Judicial
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED]">
                                        <Sparkles size={12} className="fill-[#7C3AED]/20" />
                                        Análise finalizada
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                                        <span className="size-1.5 rounded-full bg-slate-400"></span>
                                        Pendente
                                        <ChevronDown size={14} className="ml-1 text-slate-400" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="px-8 border-b border-slate-200 shrink-0 overflow-x-auto">
                    <div className="flex items-center gap-8 min-w-max">
                        <button className="pb-4 px-1 text-sm font-bold text-primary border-b-2 border-primary transition-colors flex items-center gap-2">
                            <AlignLeft size={16} />
                            Resumo
                        </button>
                    </div>
                </div>

                {/* Tab Content - Resumo */}
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                    <div className="max-w-[1000px] mx-auto">

                        {/* Resumo Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                                    <AlignLeft size={20} className="text-[#3B82F6]" />
                                    Resumo
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Clique em uma seção para visualizar ou exporte PDF/DOCX para o resumo completo
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                                    <Lock size={16} className="text-slate-400" />
                                    PDF
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                                    <Lock size={16} className="text-slate-400" />
                                    DOCX
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Card 1: Resumo Executivo */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start group">
                                <div className="size-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Zap size={24} className="fill-emerald-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-bold text-slate-800">Resumo Executivo</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Visão rápida do processo para entendimento inicial em poucos minutos
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Resumo do Processo */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start group">
                                <div className="size-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <FileText size={24} className="fill-blue-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-bold text-slate-800">Resumo do Processo</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Visão geral consolidada do processo com os principais pontos identificados pela IA
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Quesitos Apresentados */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start group">
                                <div className="size-12 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <HelpCircle size={24} className="fill-cyan-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-bold text-slate-800">Quesitos Apresentados</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Quesitos apresentados pelas partes do processo para serem respondidos na perícia
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: Documentos Relevantes */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start group">
                                <div className="size-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <FolderSearch size={24} className="fill-amber-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-bold text-slate-800">Documentos Relevantes</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Documentos do processo classificados e organizados por tipo, com datas e informações extraídas pela IA
                                    </p>
                                </div>
                            </div>

                            {/* Card 5: Exames Sugeridos pela IA */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-start group">
                                <div className="size-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Sparkles size={24} className="fill-purple-500" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-bold text-slate-800">Exames Sugeridos pela IA</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Visualize os exames sugeridos pela IA. O preenchimento deverá ser feito na aba Perícia e Exame Físico
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
