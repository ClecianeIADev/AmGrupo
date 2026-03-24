// Types for the Legal Process Summaries feature (001-legal-summaries)

export type KanbanStage =
    | 'Pendentes'
    | 'Aceites'
    | 'Perícia Agendada'
    | 'Periciado Não Compareceu'
    | 'Revisando Laudo/Impugnação'
    | 'Aguardando Manifestações'
    | 'Aguardando Pagamento'
    | 'Finalizado'
    | 'Não Realizado';

export type ProcessStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'needs_review'
    | 'error';

export type ProcessRole =
    | 'Perito'
    | 'Assistente Técnico'
    | 'Advogado'
    | 'Outro';

export interface Party {
    name: string;
    role: string;
    representative: string | null;
}

export interface ProcessEvent {
    date: string;
    event: string;
    outcome: string | null;
}

export interface Quesito {
    id: string;
    party: string;
    text: string;
    source_page: number | null;
}

export interface RelevantDocument {
    name: string;
    type: string;
    category: string;
    date: string | null;
    parties: string[];
    summary: string;
    download_url?: string | null;
}

export interface ProcessDocument {
    id: string;
    name: string;
    storage_path: string;
    mime_type: string | null;
    source_url: string | null;
    file_size: number | null;
    created_at: string;
    source: 'ai_extracted' | 'manual';
}

export interface SuggestedExamination {
    name: string;
    justification: string;
    priority: 'critical' | 'recommended' | 'optional';
}

export interface CriticalDate {
    date: string;
    description: string;
    type: 'deadline' | 'hearing' | 'decision' | 'other';
    is_past: boolean;
}

export interface LegalProcess {
    id: string;
    user_id: string;
    document_path: string;
    document_name: string;
    document_mime_type: string;
    process_name: string | null;
    process_number: string | null;
    professional_role: ProcessRole;
    status: ProcessStatus;
    status_message: string | null;
    executive_summary: string | null;
    process_summary: string | null;
    parties: Party[];
    events_timeline: ProcessEvent[];
    quesitos: Quesito[];
    relevant_documents: RelevantDocument[];
    suggested_examinations: SuggestedExamination[];
    critical_dates: CriticalDate[];
    process_documents: ProcessDocument[];
    extraction_confidence: number | null;
    extraction_errors: string[];
    kanban_stage: KanbanStage;
    folder_id: string | null;
    created_at: string;
    updated_at: string;
}
