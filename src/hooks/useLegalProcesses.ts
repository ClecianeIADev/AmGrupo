// T010: useLegalProcesses hook
// Encapsulates all Supabase interactions for the Legal Process Summaries feature.
// Components use this hook for data fetching, mutations, and Realtime subscriptions.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { LegalProcess, ProcessRole } from '../types/legalProcess';

interface UseLegalProcessesReturn {
    processes: LegalProcess[];
    loading: boolean;
    error: string | null;
    fetchProcesses: () => Promise<void>;
    createProcess: (file: File, role: ProcessRole) => Promise<LegalProcess | null>;
    deleteProcess: (process: LegalProcess) => Promise<void>;
    invokeAnalysis: (processId: string) => Promise<void>;
    retryAnalysis: (processId: string) => Promise<void>;
    getDocumentUrl: (documentPath: string) => Promise<string | null>;
    subscribeToProcess: (
        processId: string,
        onUpdate: (updated: LegalProcess) => void
    ) => () => void;
}

export function useLegalProcesses(): UseLegalProcessesReturn {
    const [processes, setProcesses] = useState<LegalProcess[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProcesses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('legal_processes')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setProcesses((data as LegalProcess[]) ?? []);
        } catch (err: any) {
            setError(err.message ?? 'Erro ao carregar processos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProcesses();
    }, [fetchProcesses]);

    const createProcess = useCallback(
        async (file: File, role: ProcessRole): Promise<LegalProcess | null> => {
            setError(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Usuário não autenticado.');

                // Generate a temporary ID for the storage path before DB insert
                const tempId = crypto.randomUUID();
                const storagePath = `${user.id}/${tempId}/${file.name}`;

                // 1. Upload file to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('legal-documents')
                    .upload(storagePath, file, { upsert: false });

                if (uploadError) throw uploadError;

                // 2. Insert process record in DB
                const { data: process, error: insertError } = await supabase
                    .from('legal_processes')
                    .insert({
                        user_id: user.id,
                        document_path: storagePath,
                        document_name: file.name,
                        document_mime_type: file.type,
                        professional_role: role,
                        status: 'pending',
                    })
                    .select()
                    .single();

                if (insertError) {
                    // Clean up orphaned storage file on DB failure
                    await supabase.storage.from('legal-documents').remove([storagePath]);
                    throw insertError;
                }

                const newProcess = process as LegalProcess;
                setProcesses(prev => [newProcess, ...prev]);
                return newProcess;
            } catch (err: any) {
                setError(err.message ?? 'Erro ao criar processo.');
                return null;
            }
        },
        []
    );

    const deleteProcess = useCallback(async (process: LegalProcess): Promise<void> => {
        setError(null);
        try {
            // 1. Remove storage file
            await supabase.storage
                .from('legal-documents')
                .remove([process.document_path]);

            // 2. Delete DB row (RLS enforces ownership)
            const { error: deleteError } = await supabase
                .from('legal_processes')
                .delete()
                .eq('id', process.id);

            if (deleteError) throw deleteError;
            setProcesses(prev => prev.filter(p => p.id !== process.id));
        } catch (err: any) {
            setError(err.message ?? 'Erro ao excluir processo.');
        }
    }, []);

    const invokeAnalysis = useCallback(async (processId: string): Promise<void> => {
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sessão expirada. Faça login novamente.');
        const { error: fnError } = await supabase.functions.invoke(
            'analyze_legal_process',
            {
                body: { process_id: processId },
                headers: { Authorization: `Bearer ${session.access_token}` },
            }
        );
        if (fnError) {
            // Try to extract the actual error body from the function response
            let msg = fnError.message ?? 'Erro ao iniciar análise.';
            try {
                const body = await (fnError as any).context?.json?.();
                if (body?.error) msg = body.error;
            } catch { /* ignore parse errors */ }
            setError(msg);
            throw new Error(msg);
        }
    }, []);

    const retryAnalysis = useCallback(async (processId: string): Promise<void> => {
        setError(null);
        try {
            // Reset status to 'pending' so the edge function accepts the request
            const { error: resetError } = await supabase
                .from('legal_processes')
                .update({ status: 'pending', status_message: null })
                .eq('id', processId);
            if (resetError) throw resetError;
            setProcesses(prev =>
                prev.map(p => p.id === processId ? { ...p, status: 'pending', status_message: null } : p)
            );

            // Subscribe BEFORE invoking (Realtime + polling fallback)
            const TERMINAL: LegalProcess['status'][] = ['completed', 'needs_review', 'error'];
            let done = false;

            const channel = supabase
                .channel(`retry-process-${processId}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'legal_processes', filter: `id=eq.${processId}` },
                    (payload) => {
                        const updated = payload.new as LegalProcess;
                        setProcesses((prev: LegalProcess[]) => prev.map((p: LegalProcess) => p.id === processId ? updated : p));
                        if (TERMINAL.includes(updated.status)) { done = true; cleanup(); }
                    }
                )
                .subscribe();

            const pollTimer = setInterval(async () => {
                if (done) return;
                const { data } = await supabase
                    .from('legal_processes').select('*').eq('id', processId).single();
                if (data) {
                    const updated = data as LegalProcess;
                    setProcesses((prev: LegalProcess[]) => prev.map((p: LegalProcess) => p.id === processId ? updated : p));
                    if (TERMINAL.includes(updated.status)) { done = true; cleanup(); }
                }
            }, 8000);

            function cleanup() { clearInterval(pollTimer); supabase.removeChannel(channel); }

            // Fire-and-forget — Realtime + polling handle the result
            const { data: { session } } = await supabase.auth.getSession();
            supabase.functions
                .invoke('analyze_legal_process', {
                    body: { process_id: processId },
                    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
                })
                .catch(() => cleanup());
        } catch (err: any) {
            setError(err.message ?? 'Erro ao tentar novamente.');
            setProcesses(prev =>
                prev.map(p => p.id === processId ? { ...p, status: 'error', status_message: err.message } : p)
            );
        }
    }, []);

    const getDocumentUrl = useCallback(async (documentPath: string): Promise<string | null> => {
        const { data, error } = await supabase.storage
            .from('legal-documents')
            .createSignedUrl(documentPath, 300); // 5-minute signed URL
        if (error || !data?.signedUrl) return null;
        return data.signedUrl;
    }, []);

    const subscribeToProcess = useCallback(
        (processId: string, onUpdate: (updated: LegalProcess) => void): (() => void) => {
            const TERMINAL: LegalProcess['status'][] = ['completed', 'needs_review', 'error'];
            let done = false;

            function handleUpdate(updated: LegalProcess) {
                if (done) return;
                setProcesses(prev => prev.map(p => (p.id === processId ? updated : p)));
                onUpdate(updated);
                if (TERMINAL.includes(updated.status)) {
                    done = true;
                    cleanup();
                }
            }

            // Primary: Supabase Realtime postgres_changes
            const channel = supabase
                .channel(`legal-process-${processId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'legal_processes',
                        filter: `id=eq.${processId}`,
                    },
                    (payload) => handleUpdate(payload.new as LegalProcess)
                )
                .subscribe();

            // Fallback: poll every 8 s in case Realtime is not enabled on the table
            // or a network hiccup drops the event.
            const pollTimer = setInterval(async () => {
                if (done) return;
                const { data } = await supabase
                    .from('legal_processes')
                    .select('*')
                    .eq('id', processId)
                    .single();
                if (data) handleUpdate(data as LegalProcess);
            }, 8000);

            function cleanup() {
                clearInterval(pollTimer);
                supabase.removeChannel(channel);
            }

            return cleanup;
        },
        []
    );

    return {
        processes,
        loading,
        error,
        fetchProcesses,
        createProcess,
        deleteProcess,
        invokeAnalysis,
        retryAnalysis,
        getDocumentUrl,
        subscribeToProcess,
    };
}
