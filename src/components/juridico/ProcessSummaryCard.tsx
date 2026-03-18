// T015: ProcessSummaryCard
// Card component used in list/grid mode to display a legal process summary.

import { FileText, Trash2, AlertTriangle, CheckCircle, Clock, Loader, XCircle, RefreshCw } from 'lucide-react';
import type { LegalProcess } from '../../types/legalProcess';

interface ProcessSummaryCardProps {
    process: LegalProcess;
    onClick: (process: LegalProcess) => void;
    onDelete: (process: LegalProcess) => void;
    onRetry?: (process: LegalProcess) => void;
}

const STATUS_CONFIG = {
    pending: { label: 'Pendente', icon: Clock, color: 'var(--color-slate-400, #94a3b8)', bg: '#f1f5f9' },
    processing: { label: 'Analisando...', icon: Loader, color: '#3b82f6', bg: '#eff6ff' },
    completed: { label: 'Concluído', icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4' },
    needs_review: { label: 'Revisão Necessária', icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
    error: { label: 'Erro na Análise', icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
} as const;

const ROLE_COLORS: Record<string, string> = {
    'Perito': '#6366f1',
    'Assistente Técnico': '#8b5cf6',
    'Advogado': '#0ea5e9',
    'Outro': '#64748b',
};

export function ProcessSummaryCard({ process, onClick, onDelete, onRetry }: ProcessSummaryCardProps) {
    const statusConfig = STATUS_CONFIG[process.status];
    const StatusIcon = statusConfig.icon;
    const roleColor = ROLE_COLORS[process.professional_role] ?? '#64748b';

    const formattedDate = new Date(process.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    const displayName = process.process_name ?? process.document_name;

    function handleDelete(e: { stopPropagation: () => void }) {
        e.stopPropagation();
        onDelete(process);
    }

    function handleRetry(e: { stopPropagation: () => void }) {
        e.stopPropagation();
        onRetry?.(process);
    }

    return (
        <div
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
            onClick={() => onClick(process)}
        >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="size-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                    <FileText size={20} className="text-indigo-500" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {displayName}
                    </h3>
                    {process.process_number && (
                        <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                            {process.process_number}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleDelete}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir processo"
                >
                    <Trash2 size={15} />
                </button>
            </div>

            {/* Status badge */}
            <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                style={{ color: statusConfig.color, background: statusConfig.bg }}
            >
                <StatusIcon
                    size={12}
                    className={process.status === 'processing' ? 'animate-spin' : ''}
                />
                {statusConfig.label}
            </div>

            {/* Confidence bar (only when completed or needs_review) */}
            {process.extraction_confidence !== null &&
             (process.status === 'completed' || process.status === 'needs_review') && (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${Math.round(process.extraction_confidence * 100)}%`,
                                background: process.extraction_confidence >= 0.7 ? '#22c55e' : '#f59e0b',
                            }}
                        />
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                        {Math.round(process.extraction_confidence * 100)}% precisão
                    </span>
                </div>
            )}

            {/* Retry button for error state */}
            {process.status === 'error' && onRetry && (
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
                >
                    <RefreshCw size={12} />
                    Tentar novamente
                </button>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                <span
                    className="px-2 py-0.5 rounded-full font-medium text-white text-[11px]"
                    style={{ background: roleColor }}
                >
                    {process.professional_role}
                </span>
                <span>{formattedDate}</span>
            </div>
        </div>
    );
}
