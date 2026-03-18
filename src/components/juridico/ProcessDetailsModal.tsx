// T027–T034: ProcessDetailsModal
// Displays full AI-extracted legal process data in a 5-tab modal.

import { useState, type ReactNode } from 'react';
import {
    X,
    Scale,
    AlignLeft,
    FileText,
    HelpCircle,
    FolderSearch,
    Sparkles,
    AlertTriangle,
    XCircle,
    Calendar,
    Clock,
    ChevronDown,
    Lock,
} from 'lucide-react';
import type { LegalProcess } from '../../types/legalProcess';

interface ProcessDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    process: LegalProcess | null;
}

type Tab = 'executive' | 'summary' | 'quesitos' | 'documents' | 'examinations';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'executive', label: 'Resumo Executivo', icon: <Sparkles size={15} /> },
    { id: 'summary', label: 'Resumo do Processo', icon: <AlignLeft size={15} /> },
    { id: 'quesitos', label: 'Quesitos', icon: <HelpCircle size={15} /> },
    { id: 'documents', label: 'Documentos', icon: <FolderSearch size={15} /> },
    { id: 'examinations', label: 'Exames Sugeridos', icon: <FileText size={15} /> },
];

const PRIORITY_STYLES: Record<string, { label: string; cls: string }> = {
    high: { label: 'Alta Prioridade', cls: 'bg-red-50 text-red-700 border-red-200' },
    medium: { label: 'Média Prioridade', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { label: 'Baixa Prioridade', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const DATE_TYPE_STYLES: Record<string, string> = {
    deadline: 'bg-red-50 text-red-700',
    hearing: 'bg-amber-50 text-amber-700',
    filing: 'bg-blue-50 text-blue-700',
    other: 'bg-slate-100 text-slate-600',
};

const CATEGORY_STYLES: Record<string, string> = {
    'Relatório': 'bg-blue-50 text-blue-700',
    'Laudo': 'bg-purple-50 text-purple-700',
    'Correspondência': 'bg-slate-100 text-slate-600',
    'Petição': 'bg-indigo-50 text-indigo-700',
    'Decisão': 'bg-emerald-50 text-emerald-700',
    'Contrato': 'bg-orange-50 text-orange-700',
};

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Scale size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    );
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isDatePast(dateStr: string): boolean {
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d < new Date();
}

// ── Tab: Executive Summary ───────────────────────────────────────────────────
function ExecutiveSummaryTab({ process }: { process: LegalProcess }) {
    return (
        <div className="flex flex-col gap-6">
            {process.executive_summary ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Resumo Executivo</h4>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{process.executive_summary}</p>
                </div>
            ) : (
                <EmptyState message="Resumo executivo não disponível." />
            )}

            {/* Critical Dates */}
            {process.critical_dates?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Calendar size={15} />
                        Datas Críticas
                    </h4>
                    <div className="flex flex-col gap-3">
                        {process.critical_dates.map((cd, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${isDatePast(cd.date) ? 'opacity-60' : ''}`}>
                                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${DATE_TYPE_STYLES[cd.type] ?? DATE_TYPE_STYLES.other}`}>
                                    {formatDate(cd.date)}
                                </span>
                                <span className="text-sm text-slate-700">{cd.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Confidence bar */}
            {process.extraction_confidence !== null && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500">Precisão da Extração por IA</span>
                        <span className="text-xs font-bold text-slate-700">
                            {Math.round(process.extraction_confidence * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${Math.round(process.extraction_confidence * 100)}%`,
                                background: process.extraction_confidence >= 0.7 ? '#22c55e' : '#f59e0b',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Tab: Process Summary + Timeline ─────────────────────────────────────────
function ProcessSummaryTab({ process }: { process: LegalProcess }) {
    const sortedEvents = [...(process.events_timeline ?? [])].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div className="flex flex-col gap-6">
            {process.process_summary ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Resumo do Processo</h4>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{process.process_summary}</p>
                </div>
            ) : (
                <EmptyState message="Resumo do processo não disponível." />
            )}

            {sortedEvents.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Clock size={15} />
                        Linha do Tempo
                    </h4>
                    <div className="relative pl-5 flex flex-col gap-5">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
                        {sortedEvents.map((ev, i) => {
                            const past = isDatePast(ev.date);
                            return (
                                <div key={i} className="relative flex flex-col gap-1">
                                    <div className={`absolute -left-5 top-1 size-3 rounded-full border-2 ${past ? 'bg-slate-300 border-slate-300' : 'bg-indigo-500 border-indigo-500'}`} />
                                    <span className={`text-xs font-bold ${past ? 'text-slate-400' : 'text-indigo-600'}`}>
                                        {formatDate(ev.date)}
                                    </span>
                                    <p className={`text-sm ${past ? 'text-slate-500' : 'text-slate-800'}`}>{ev.event}</p>
                                    {ev.outcome && (
                                        <p className="text-xs text-slate-400 italic">{ev.outcome}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Tab: Quesitos ─────────────────────────────────────────────────────────────
function QuesitosTab({ process }: { process: LegalProcess }) {
    const quesitos = process.quesitos ?? [];
    if (quesitos.length === 0) {
        return <EmptyState message="Nenhum quesito encontrado no processo." />;
    }

    // Group by party
    const grouped: Record<string, typeof quesitos> = {};
    for (const q of quesitos) {
        const party = q.party || 'Sem parte identificada';
        if (!grouped[party]) grouped[party] = [];
        grouped[party].push(q);
    }

    return (
        <div className="flex flex-col gap-5">
            {Object.entries(grouped).map(([party, items]) => (
                <div key={party} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-sm font-bold text-slate-700">{party}</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {items.map((q, i) => (
                            <div key={i} className="px-5 py-4 flex items-start gap-3">
                                <span className="shrink-0 size-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>
                                    {q.source_page && (
                                        <span className="inline-block mt-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                            Pág. {q.source_page}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Tab: Relevant Documents ───────────────────────────────────────────────────
function DocumentsTab({ process }: { process: LegalProcess }) {
    const docs = [...(process.relevant_documents ?? [])].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    if (docs.length === 0) {
        return <EmptyState message="Nenhum documento relevante identificado." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc, i) => {
                const categoryCls = CATEGORY_STYLES[doc.category] ?? 'bg-slate-100 text-slate-600';
                return (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{doc.name}</p>
                            {doc.category && (
                                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${categoryCls}`}>
                                    {doc.category}
                                </span>
                            )}
                        </div>
                        {doc.summary && (
                            <p className="text-xs text-slate-500 leading-relaxed">{doc.summary}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                            <span>{doc.type}</span>
                            {doc.date && <span>{formatDate(doc.date)}</span>}
                        </div>
                        {doc.parties?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {doc.parties.map((p, j) => (
                                    <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Tab: Suggested Examinations ───────────────────────────────────────────────
function ExaminationsTab({ process }: { process: LegalProcess }) {
    const exams = [...(process.suggested_examinations ?? [])].sort((a, b) => {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
    });

    if (exams.length === 0) {
        return <EmptyState message="Nenhum exame sugerido pela IA." />;
    }

    return (
        <div className="flex flex-col gap-4">
            {exams.map((exam, i) => {
                const ps = PRIORITY_STYLES[exam.priority] ?? PRIORITY_STYLES.low;
                return (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
                        <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                            <Sparkles size={20} className="text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-800">{exam.name}</h4>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ps.cls}`}>
                                    {ps.label}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">{exam.justification}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function ProcessDetailsModal({ isOpen, onClose, process }: ProcessDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('executive');

    if (!isOpen || !process) return null;

    const displayName = process.process_name ?? process.document_name;
    const isError = process.status === 'error';
    const needsReview = process.status === 'needs_review';
    const isProcessing = process.status === 'processing';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[1200px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-14 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                <Scale className="text-indigo-500" size={28} strokeWidth={2} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-bold text-slate-800">{displayName}</h2>
                                <div className="flex flex-wrap items-center gap-2">
                                    {process.process_number && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 font-mono">
                                            {process.process_number}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                                        <span className="size-1.5 rounded-full bg-indigo-500" />
                                        {process.professional_role}
                                    </span>
                                    {process.parties?.length > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                            {process.parties.length} partes
                                            <ChevronDown size={12} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* needs_review banner */}
                    {needsReview && (
                        <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                <span className="font-bold">Revisão necessária: </span>
                                {process.status_message ?? 'A extração por IA pode conter imprecisões. Revise os dados antes de usar.'}
                            </p>
                        </div>
                    )}

                    {/* error banner */}
                    {isError && (
                        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                            <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">
                                <span className="font-bold">Erro na análise: </span>
                                {process.status_message ?? 'A extração por IA falhou.'}
                            </p>
                        </div>
                    )}

                    {/* processing banner */}
                    {isProcessing && (
                        <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                            <p className="text-sm text-blue-800">
                                <span className="font-bold">Análise em andamento — </span>
                                aguarde enquanto a IA processa o documento.
                            </p>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="px-8 border-b border-slate-200 shrink-0 overflow-x-auto">
                    <div className="flex items-center gap-6 min-w-max">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                    activeTab === tab.id
                                        ? 'text-indigo-600 border-indigo-600'
                                        : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                    <div className="max-w-[1000px] mx-auto">

                        {/* Export header (shown on all tabs) */}
                        {!isProcessing && !isError && (
                            <div className="flex justify-end gap-3 mb-6">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                                    <Lock size={16} className="text-slate-400" />
                                    PDF
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                                    <Lock size={16} className="text-slate-400" />
                                    DOCX
                                </button>
                            </div>
                        )}

                        {activeTab === 'executive' && <ExecutiveSummaryTab process={process} />}
                        {activeTab === 'summary' && <ProcessSummaryTab process={process} />}
                        {activeTab === 'quesitos' && <QuesitosTab process={process} />}
                        {activeTab === 'documents' && <DocumentsTab process={process} />}
                        {activeTab === 'examinations' && <ExaminationsTab process={process} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
