# Data Model: Process Folders

**Feature**: 002-process-folders  
**Date**: 2026-03-24  
**DB**: Supabase (PostgreSQL)

---

## Entities

### 1. `process_folders` (new table)

Stores user-created folders for organizing legal processes.

```sql
CREATE TABLE public.process_folders (
  -- Identity
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Folder metadata
  name                  TEXT NOT NULL,
  color                 TEXT NOT NULL DEFAULT '#3b82f6',  -- CSS color (hex or color name)

  -- Pagination & sorting helpers
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT folder_color_not_empty CHECK (length(color) > 0),
  CONSTRAINT folder_name_not_empty CHECK (length(trim(name)) > 0)
);
```

**Notes:**
- `color` is stored as hex or CSS color name (e.g., '#F87171', 'red', 'slate-500')
- Process count is computed via COUNT query on `legal_processes.folder_id`, not stored
- No explicit processes JSONB array; relationship is maintained via FK in `legal_processes` table

---

### 2. `legal_processes` (modified table - ADD COLUMN)

Add folder relationship to existing legal_processes table.

```sql
ALTER TABLE public.legal_processes
ADD COLUMN folder_id UUID REFERENCES public.process_folders(id) ON DELETE NULLIFY;

-- Index for folder queries
CREATE INDEX idx_legal_processes_folder_id ON public.legal_processes(folder_id);

-- Index for listing processes by folder (used in folder contents view)
CREATE INDEX idx_legal_processes_folder_stage ON public.legal_processes(folder_id, kanban_stage);
```

**Notes:**
- `ON DELETE NULLIFY` ensures that if a folder is deleted, its processes are not deleted; they become unfoldered (folder_id = NULL)
- If you prefer to cascade-delete processes with their folder, use `ON DELETE CASCADE` instead (choose based on business requirements)
- The existing `kanban_stage` column remains unchanged and is used for stage grouping

---

## Relationships

```
process_folders (1) ──────────── (M) legal_processes
   (PK: id)            FK: folder_id
```

**Cardinality**:
- One folder can contain many processes
- One process can be in zero or one folder (0..1 cardinality)

---

## Indexes

```sql
-- Fast lookup: user's folders
CREATE INDEX idx_process_folders_user_id ON public.process_folders(user_id);

-- Fast filtering: list processes by specific folder
CREATE INDEX idx_legal_processes_folder_id ON public.legal_processes(folder_id);

-- Fast filtering: processes in a folder by stage (for stage grouping UI)
CREATE INDEX idx_legal_processes_folder_stage ON public.legal_processes(folder_id, kanban_stage);

-- Performance: search folders by name (future full-text search)
CREATE INDEX idx_process_folders_name ON public.process_folders(user_id, name);
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS on process_folders table
ALTER TABLE public.process_folders ENABLE ROW LEVEL SECURITY;

-- SELECT: users see only their own folders
CREATE POLICY "Users select own folders"
  ON public.process_folders FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: users can only create folders linked to themselves
CREATE POLICY "Users insert own folders"
  ON public.process_folders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: users can only update their own folders
CREATE POLICY "Users update own folders"
  ON public.process_folders FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: users can only delete their own folders
CREATE POLICY "Users delete own folders"
  ON public.process_folders FOR DELETE
  USING (user_id = auth.uid());
```

---

## Audit & Triggers

### Updated Timestamp Trigger

```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to process_folders
CREATE TRIGGER update_process_folders_updated_at
  BEFORE UPDATE ON public.process_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Attach trigger to legal_processes (if not already present)
-- If the trigger already exists from 001-legal-summaries, no action needed
CREATE TRIGGER update_legal_processes_updated_at
  BEFORE UPDATE ON public.legal_processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Query Patterns

### List user's folders with process counts

```sql
SELECT
  f.id,
  f.name,
  f.color,
  f.created_at,
  COUNT(lp.id) AS process_count
FROM public.process_folders f
LEFT JOIN public.legal_processes lp ON lp.folder_id = f.id
WHERE f.user_id = auth.uid()
GROUP BY f.id, f.name, f.color, f.created_at
ORDER BY f.created_at DESC;
```

### List processes in a folder, grouped by stage

```sql
SELECT
  lp.id,
  lp.process_number,
  lp.process_name,
  lp.professional_role,
  lp.kanban_stage,
  lp.status,
  lp.created_at
FROM public.legal_processes lp
WHERE lp.folder_id = $1 AND lp.user_id = auth.uid()
ORDER BY
  CASE
    WHEN lp.kanban_stage = 'Pendentes' THEN 0
    WHEN lp.kanban_stage IN ('Aceites', 'Perícia Agendada', 'Periciado Não Compareceu', 
                             'Revisando Laudo/Impugnação', 'Aguardando Manifestações', 
                             'Aguardando Pagamento') THEN 1
    WHEN lp.kanban_stage = 'Finalizado' THEN 2
    ELSE 3
  END ASC,
  lp.created_at DESC;
```

### Search processes within folder

```sql
SELECT
  lp.id,
  lp.process_number,
  lp.process_name,
  lp.professional_role,
  lp.kanban_stage
FROM public.legal_processes lp
WHERE
  lp.folder_id = $1
  AND lp.user_id = auth.uid()
  AND (
    lp.process_name ILIKE '%' || $2 || '%'
    OR lp.process_number ILIKE '%' || $2 || '%'
  )
ORDER BY lp.created_at DESC;
```

### Search folders by name

```sql
SELECT
  f.id,
  f.name,
  f.color,
  COUNT(lp.id) AS process_count
FROM public.process_folders f
LEFT JOIN public.legal_processes lp ON lp.folder_id = f.id
WHERE
  f.user_id = auth.uid()
  AND f.name ILIKE '%' || $1 || '%'
GROUP BY f.id, f.name, f.color
ORDER BY f.created_at DESC;
```

### Link process to folder (update)

```sql
UPDATE public.legal_processes
SET folder_id = $1, updated_at = now()
WHERE id = $2 AND user_id = auth.uid();
```

### Unlink process from folder (set to NULL)

```sql
UPDATE public.legal_processes
SET folder_id = NULL, updated_at = now()
WHERE id = $1 AND user_id = auth.uid();
```

### Delete folder (processes become unfoldered)

```sql
DELETE FROM public.process_folders
WHERE id = $1 AND user_id = auth.uid();
-- ON DELETE NULLIFY ensures related processes remain with folder_id = NULL
```

---

## Migration Script

**File**: `20260324000000_create_process_folders.sql`

```sql
-- Create process_folders table
CREATE TABLE public.process_folders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  color                 TEXT NOT NULL DEFAULT '#3b82f6',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT folder_color_not_empty CHECK (length(color) > 0),
  CONSTRAINT folder_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Add folder_id column to legal_processes
ALTER TABLE public.legal_processes
ADD COLUMN folder_id UUID REFERENCES public.process_folders(id) ON DELETE NULLIFY;

-- Create indexes
CREATE INDEX idx_process_folders_user_id ON public.process_folders(user_id);
CREATE INDEX idx_legal_processes_folder_id ON public.legal_processes(folder_id);
CREATE INDEX idx_legal_processes_folder_stage ON public.legal_processes(folder_id, kanban_stage);
CREATE INDEX idx_process_folders_name ON public.process_folders(user_id, name);

-- Enable RLS
ALTER TABLE public.process_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users select own folders"
  ON public.process_folders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own folders"
  ON public.process_folders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own folders"
  ON public.process_folders FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own folders"
  ON public.process_folders FOR DELETE
  USING (user_id = auth.uid());

-- Trigger for updated_at (if not already present)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_process_folders_updated_at
  BEFORE UPDATE ON public.process_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Realtime Subscriptions

For real-time folder and process updates in the frontend:

```typescript
// Subscribe to folder changes
supabase
  .channel('public:process_folders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'process_folders',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle folder CRUD
  })
  .subscribe();

// Subscribe to process folder assignments
supabase
  .channel('public:legal_processes:folder_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'legal_processes',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle process folder assignment changes
  })
  .subscribe();
```

---

## Cascade & Deletion Behavior

### Scenario 1: Delete Folder (Current Policy)

```
user_id → [DELETE] → process_folders (id=folder-123)
          ↓
          legal_processes.folder_id = NULL (orphaned processes)
          → Processes remain in system, unfoldered
          → User can see them in Processos (non-folder) view
```

### Scenario 2: Delete Process

```
user_id → [DELETE] → legal_processes (id=process-456)
          ↓
          process_folders still exist (no automatic cleanup of empty folders)
          → Empty folders remain visible in UI (shows 0 processes)
```

**Alternative Cascade Options** (choose one during implementation):

**Option A (Current)**: `ON DELETE NULLIFY`
- Pros: Preserves processes; user can reassign later
- Cons: Orphaned processes cluttering the system; empty folders remain

**Option B**: `ON DELETE CASCADE`
- Pros: Clean; deleting folder also deletes linked processes
- Cons: Data loss; no recovery possible

**Recommendation**: Use **Option A (NULLIFY)** for user safety, with optional UI "cleanup" features (e.g., "Move unfoldered processes to default folder").

---

## Performance Considerations

- **Large Folders**: If a folder contains 1000+ processes, consider pagination or virtualization in the UI
- **Folder Listing**: The COUNT(lp.id) aggregation may be slow; consider caching process_count as a denormalized column (updated via trigger) for scale
- **Search**: Use ILIKE with indexed columns; avoid full-text search until required
- **Real-time**: Supabase Realtime subscriptions are suitable for <100 concurrent users per feature; scale filtering at the database level

---

**Version**: 1.0  
**Last Updated**: 2026-03-24
