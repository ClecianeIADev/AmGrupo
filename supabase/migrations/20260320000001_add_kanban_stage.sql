-- Add kanban_stage column to legal_processes table
ALTER TABLE legal_processes
ADD COLUMN IF NOT EXISTS kanban_stage TEXT NOT NULL DEFAULT 'Pendentes';
