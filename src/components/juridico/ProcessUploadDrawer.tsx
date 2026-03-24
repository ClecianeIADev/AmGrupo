// T014: ProcessUploadDrawer
// Slide-over panel for uploading a new legal process document.
// Handles file selection, role selection, format validation, and analysis invocation.

import { useState, useRef, useCallback, type DragEvent } from 'react';
import { X, CloudUpload, AlertCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import type { ProcessRole, LegalProcess } from '../../types/legalProcess';
import { ProcessAnalysisProgress } from './ProcessAnalysisProgress';

const ACCEPTED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp';
const ROLES: ProcessRole[] = ['Perito', 'Assistente Técnico', 'Advogado', 'Outro'];

interface ProcessUploadDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (file: File, role: ProcessRole) => Promise<LegalProcess | null>;
    onAnalyze: (processId: string) => Promise<void>;
    onSubscribe: (processId: string, onUpdate: (p: LegalProcess) => void) => () => void;
    contextFolderId?: string | null;
    onLinkToFolder?: (processId: string, folderId: string) => Promise<void>;
}

export function ProcessUploadDrawer({
    isOpen, onClose, onCreate, onAnalyze, onSubscribe, contextFolderId, onLinkToFolder,
}: ProcessUploadDrawerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [role, setRole] = useState<ProcessRole>('Perito');
    const [dragging, setDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [phase, setPhase] = useState<'form' | 'analyzing'>('form');
    const [analyzingProcess, setAnalyzingProcess] = useState<LegalProcess | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Keeps track of the active subscription so we can clean up on manual close
    const unsubscribeRef = useRef<(() => void) | null>(null);

    function reset() {
        setFile(null);
        setFileError(null);
        setAnalysisError(null);
        setPhase('form');
        setAnalyzingProcess(null);
        setUploading(false);
    }

    function handleClose() {
        // Cancel any active subscription/polling before closing
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
        reset();
        onClose();
    }

    function validateFile(f: File): boolean {
        if (!ACCEPTED_MIME_TYPES.includes(f.type)) {
            setFileError(`Formato não suportado: ${f.type || f.name.split('.').pop()?.toUpperCase()}. Use PDF, DOCX, JPG ou PNG.`);
            return false;
        }
        if (f.size > 52_428_800) {
            setFileError('Arquivo muito grande. Tamanho máximo: 50 MB.');
            return false;
        }
        setFileError(null);
        return true;
    }

    function handleFileSelected(f: File) {
        if (validateFile(f)) setFile(f);
        else setFile(null);
    }

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileSelected(dropped);
    }, []);

    async function handleConfirm() {
        if (!file) return;
        setUploading(true);
        setAnalysisError(null);

        const newProcess = await onCreate(file, role);
        if (!newProcess) {
            setUploading(false);
            return;
        }

        // If opened from a folder context, link the process to that folder
        if (contextFolderId && onLinkToFolder) {
            await onLinkToFolder(newProcess.id, contextFolderId).catch(() => {/* non-fatal */});
        }

        setAnalyzingProcess(newProcess);
        setPhase('analyzing');
        setUploading(false);

        // Subscribe FIRST — so the Realtime event is not missed while the edge function runs
        const unsubscribe = onSubscribe(newProcess.id, (updated) => {
            setAnalyzingProcess(updated);
            if (['completed', 'needs_review', 'error'].includes(updated.status)) {
                unsubscribeRef.current = null;
                unsubscribe();
                handleClose();
            }
        });
        unsubscribeRef.current = unsubscribe;

        // Fire-and-forget — Realtime/polling handles the completion signal.
        // If the edge function returns an immediate error (e.g. auth, 409), show it here.
        onAnalyze(newProcess.id).catch((err: unknown) => {
            const msg = err instanceof Error
                ? err.message
                : (err as any)?.message ?? 'Erro ao iniciar análise. Verifique os logs da Edge Function.';
            setAnalysisError(msg);
            // Cancel the subscription — no point polling for a process that never started
            unsubscribeRef.current?.();
            unsubscribeRef.current = null;
        });
    }

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <h2 className="text-base font-bold text-slate-800">Novo Processo Jurídico</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {phase === 'analyzing' && analyzingProcess ? (
                        analysisError ? (
                            /* Edge function returned an immediate error */
                            <div className="flex flex-col items-center gap-6 p-4 text-center">
                                <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
                                    <XCircle size={32} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-800">Falha ao iniciar análise</p>
                                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                        O documento foi salvo, mas a análise não pôde ser iniciada.
                                    </p>
                                </div>
                                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                                    <p className="text-xs font-semibold text-red-700 mb-1">Erro:</p>
                                    <p className="text-xs text-red-600 font-mono break-all">{analysisError}</p>
                                </div>
                                <p className="text-xs text-slate-400">
                                    O processo foi criado com status <span className="font-semibold">Pendente</span>. Use o botão "Tentar novamente" no card para reanalisar.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <RefreshCw size={15} />
                                    Fechar e ver processos
                                </button>
                            </div>
                        ) : (
                            <ProcessAnalysisProgress processName={analyzingProcess.document_name} />
                        )
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Time warning — FR-003 */}
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800">
                                    <span className="font-bold">Análise IA: aprox. 5 minutos.</span>{' '}
                                    A extração completa de um processo jurídico pode levar alguns minutos. Você será notificado ao concluir.
                                </p>
                            </div>

                            {/* Drop zone */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                                    dragging
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : file
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30'
                                }`}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <CloudUpload
                                    size={36}
                                    className={file ? 'text-green-500' : 'text-slate-400'}
                                />
                                {file ? (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {(file.size / 1_048_576).toFixed(1)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-slate-600">
                                            Arraste o arquivo ou <span className="text-indigo-600 underline">clique para selecionar</span>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — até 50 MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ACCEPTED_EXTENSIONS}
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileSelected(f);
                                    }}
                                />
                            </div>

                            {/* File error */}
                            {fileError && (
                                <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    {fileError}
                                </div>
                            )}

                            {/* Role selector */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Papel profissional no processo
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLES.map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                                role === r
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {phase === 'form' && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!file || !!fileError || uploading}
                            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {uploading ? 'Enviando...' : 'Iniciar Análise'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
