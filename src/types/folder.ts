// Types for the Process Folders feature (002-process-folders)

export interface ProcessFolder {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface FolderWithProcessCount extends ProcessFolder {
    process_count: number;
}
