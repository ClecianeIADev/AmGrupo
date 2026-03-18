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
        try {
            const { error: fnError } = await supabase.functions.invoke(
                'analyze_legal_process',
                { body: { process_id: processId } }
            );
            if (fnError) throw fnError;
        } catch (err: any) {
            setError(err.message ?? 'Erro ao iniciar análise.');
            // Mark process as error in local state
            setProcesses(prev =>
                prev.map(p =>
                    p.id === processId
                        ? { ...p, status: 'error', status_message: err.message }
                        : p
                )
            );
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
            // Then invoke analysis
            const { error: fnError } = await supabase.functions.invoke(
                'analyze_legal_process',
                { body: { process_id: processId } }
            );
            if (fnError) throw fnError;
        } catch (err: any) {
            setError(err.message ?? 'Erro ao tentar novamente.');
            setProcesses(prev =>
                prev.map(p => p.id === processId ? { ...p, status: 'error', status_message: err.message } : p)
            );
        }
    }, []);

    const subscribeToProcess = useCallback(
        (processId: string, onUpdate: (updated: LegalProcess) => void): (() => void) => {
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
                    (payload) => {
                        const updated = payload.new as LegalProcess;
                        // Update processes list in state
                        setProcesses(prev =>
                            prev.map(p => (p.id === processId ? updated : p))
                        );
                        onUpdate(updated);
                        // Unsubscribe when process reaches a terminal state
                        const terminalStates: LegalProcess['status'][] = [
                            'completed', 'needs_review', 'error',
                        ];
                        if (terminalStates.includes(updated.status)) {
                            supabase.removeChannel(channel);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
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
        subscribeToProcess,
    };
}
