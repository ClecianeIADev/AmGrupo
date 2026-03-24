// useFolders hook — CRUD + folder contents + search (002-process-folders)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FolderWithProcessCount } from '../types/folder';
import type { LegalProcess } from '../types/legalProcess';

export type FolderStageGroup = {
    Pendente: LegalProcess[];
    EmAndamento: LegalProcess[];
    Finalizado: LegalProcess[];
};

const EM_ANDAMENTO_STAGES = new Set([
    'Aceites',
    'Perícia Agendada',
    'Periciado Não Compareceu',
    'Revisando Laudo/Impugnação',
    'Aguardando Manifestações',
    'Aguardando Pagamento',
]);

function groupByStage(processes: LegalProcess[]): FolderStageGroup {
    const result: FolderStageGroup = { Pendente: [], EmAndamento: [], Finalizado: [] };
    for (const p of processes) {
        const stage = p.kanban_stage ?? 'Pendentes';
        if (stage === 'Pendentes') result.Pendente.push(p);
        else if (stage === 'Finalizado') result.Finalizado.push(p);
        else if (EM_ANDAMENTO_STAGES.has(stage)) result.EmAndamento.push(p);
        else result.Pendente.push(p);
    }
    return result;
}

interface UseFoldersReturn {
    folders: FolderWithProcessCount[];
    loadingFolders: boolean;
    folderError: string | null;
    createFolder: (name: string, color: string) => Promise<FolderWithProcessCount | null>;
    updateFolder: (id: string, updates: { name?: string; color?: string }) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    // Folder contents
    folderProcesses: LegalProcess[];
    groupedProcesses: FolderStageGroup;
    loadingContents: boolean;
    fetchFolderContents: (folderId: string) => Promise<void>;
    // Search
    folderSearch: string;
    setFolderSearch: (q: string) => void;
    filteredGrouped: FolderStageGroup;
    // Link process to folder
    linkProcessToFolder: (processId: string, folderId: string | null) => Promise<void>;
}

export function useFolders(): UseFoldersReturn {
    const [folders, setFolders] = useState<FolderWithProcessCount[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [folderError, setFolderError] = useState<string | null>(null);

    const [folderProcesses, setFolderProcesses] = useState<LegalProcess[]>([]);
    const [groupedProcesses, setGroupedProcesses] = useState<FolderStageGroup>({ Pendente: [], EmAndamento: [], Finalizado: [] });
    const [loadingContents, setLoadingContents] = useState(false);

    const [folderSearch, setFolderSearch] = useState('');

    // ── Fetch folders with process counts ──────────────────────────────────────
    const fetchFolders = useCallback(async () => {
        setLoadingFolders(true);
        setFolderError(null);
        try {
            const { data, error } = await supabase
                .from('process_folders')
                .select('*, legal_processes(count)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: FolderWithProcessCount[] = (data ?? []).map((row: any) => ({
                id: row.id,
                user_id: row.user_id,
                name: row.name,
                color: row.color,
                created_at: row.created_at,
                updated_at: row.updated_at,
                process_count: Array.isArray(row.legal_processes)
                    ? row.legal_processes[0]?.count ?? 0
                    : 0,
            }));
            setFolders(mapped);
        } catch (err: any) {
            setFolderError(err.message ?? 'Erro ao carregar pastas.');
        } finally {
            setLoadingFolders(false);
        }
    }, []);

    useEffect(() => {
        fetchFolders();

        // Realtime: refresh folder list on any folder CRUD
        const channel = supabase
            .channel('process_folders_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'process_folders' }, () => {
                fetchFolders();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchFolders]);

    // ── Create folder ──────────────────────────────────────────────────────────
    const createFolder = useCallback(async (name: string, color: string): Promise<FolderWithProcessCount | null> => {
        setFolderError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado.');

            const { data, error } = await supabase
                .from('process_folders')
                .insert({ user_id: user.id, name: name.trim(), color })
                .select()
                .single();

            if (error) throw error;
            const newFolder: FolderWithProcessCount = { ...(data as any), process_count: 0 };
            setFolders(prev => [newFolder, ...prev]);
            return newFolder;
        } catch (err: any) {
            setFolderError(err.message ?? 'Erro ao criar pasta.');
            return null;
        }
    }, []);

    // ── Update folder ──────────────────────────────────────────────────────────
    const updateFolder = useCallback(async (id: string, updates: { name?: string; color?: string }) => {
        setFolderError(null);
        try {
            const { error } = await supabase
                .from('process_folders')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
        } catch (err: any) {
            setFolderError(err.message ?? 'Erro ao atualizar pasta.');
        }
    }, []);

    // ── Delete folder ──────────────────────────────────────────────────────────
    const deleteFolder = useCallback(async (id: string) => {
        setFolderError(null);
        try {
            const { error } = await supabase
                .from('process_folders')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setFolders(prev => prev.filter(f => f.id !== id));
        } catch (err: any) {
            setFolderError(err.message ?? 'Erro ao excluir pasta.');
        }
    }, []);

    // ── Fetch folder contents ──────────────────────────────────────────────────
    const fetchFolderContents = useCallback(async (folderId: string) => {
        setLoadingContents(true);
        try {
            const { data, error } = await supabase
                .from('legal_processes')
                .select('*')
                .eq('folder_id', folderId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const procs = (data as LegalProcess[]) ?? [];
            setFolderProcesses(procs);
            setGroupedProcesses(groupByStage(procs));
        } catch (err: any) {
            setFolderError(err.message ?? 'Erro ao carregar processos da pasta.');
        } finally {
            setLoadingContents(false);
        }
    }, []);

    // ── Link process to folder ─────────────────────────────────────────────────
    const linkProcessToFolder = useCallback(async (processId: string, folderId: string | null) => {
        const { error } = await supabase
            .from('legal_processes')
            .update({ folder_id: folderId })
            .eq('id', processId);
        if (error) throw error;
        // Refresh process count
        fetchFolders();
    }, [fetchFolders]);

    // ── Client-side search ─────────────────────────────────────────────────────
    const filteredProcesses = folderSearch.trim()
        ? folderProcesses.filter(p => {
            const q = folderSearch.toLowerCase();
            return (
                (p.process_name ?? '').toLowerCase().includes(q) ||
                (p.process_number ?? '').toLowerCase().includes(q)
            );
        })
        : folderProcesses;

    const filteredGrouped = groupByStage(filteredProcesses);

    return {
        folders,
        loadingFolders,
        folderError,
        createFolder,
        updateFolder,
        deleteFolder,
        folderProcesses,
        groupedProcesses,
        loadingContents,
        fetchFolderContents,
        folderSearch,
        setFolderSearch,
        filteredGrouped,
        linkProcessToFolder,
    };
}
