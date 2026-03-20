-- Add process_documents column to store actual file attachments linked to a process
ALTER TABLE legal_processes
ADD COLUMN IF NOT EXISTS process_documents JSONB NOT NULL DEFAULT '[]'::JSONB;
