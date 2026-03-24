# Quick Start: Process Folders Feature

**Feature**: 002-process-folders  
**Date**: 2026-03-24

---

## Prerequisites

- Feature 001-legal-summaries is implemented and working
- Supabase client is set up (`lib/supabase.ts`)
- React hooks for data fetching are in place
- Jurídico module components exist (JuridicoProcessos, ProcessDetailsModal)

---

## Implementation Checklist

### Phase 1: Database Schema & RLS (3-5 hours)

- [ ] Create migration file: `20260324000000_create_process_folders.sql`
- [ ] Run migration: `supabase db push`
- [ ] Verify table and indexes created in Supabase console
- [ ] Verify RLS policies are active (SELECT * should return empty if not authenticated)
- [ ] Test queries manually in SQL Editor to ensure data isolation

000### Phase 2: Custom Hooks Implementation (10-12 hours)

**UI Screens Already Exist** - No new components to create
- ✅ Folder grid (existing)
- ✅ Folder contents view (existing)
- ✅ Stage grouping (existing)
- ✅ Process search (existing)

- [ ] **ProcessUploadDrawer.tsx** → Support folder context
  - If opened from within a folder, pass additional prop: folderId
  - Store folderId in form state (data attribute or React context)
  - On successful process creation, link to folder
  - Reset folderId state after submit

**Focus on integration**:

#### Create Custom Hooks for Database Integration

- [ ] **useFolders** (in `hooks/`)
  - Fetch user's folders with process counts
  - Handle create, update, delete folder operations
  - Return: folders[], isLoading, error, methods

- [ ] **useFolderContents** (in `hooks/`)
  - Props: folderId
  - Fetch processes in folder, grouped by stage
  - Real-time subscription to folder changes
  - Return: groupedProcesses, isLoading, error

- [ ] **useFolderSearch** (in `hooks/`)
  - Props: folderId, searchTerm
  - Debounced search within folder
  - Return: filteredProcesses, isLoading

#### Modify Existing Hooks

- [ ] **useLegalProcesses** → Add folder_id to returned process objects
  - Minor update: include folder_id in SELECT queries
  - No breaking changes

### Phase 3: Integrate with Existing Components (7-10 hours)

#### Modify Existing Components

- [ ] **ProcessDetailsModal.tsx** → Add "Pasta" dropdown field
  - Options: "Sem Pasta" + list of user's folders (via useFolders)
  - onChange: updateprocess folder_id in database  
  - Show current folder selected

- [ ] **ProcessUploadDrawer.tsx** → Support folder context
  - Accept prop: `contextFolderId?: string` (passed when opened from folder view)
  - Store in form state
  - On success: link process to folder via Supabase update
  - Reset state after completion

### Phase 4: Types & Database Integration (3-5 hours)

- [ ] Create type definitions in `src/types/`
  ```typescript
  // types/folder.ts
  export type ProcessFolder = {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
  };

  export type FolderWithProcessCount = ProcessFolder & {
    process_count: number;
  };
  ```

- [ ] Create Supabase type definitions (auto-generated via CLI)
  ```bash
  supabase gen types --local > lib/database.types.ts
  ```

- [ ] Create API integration function in `lib/supabase.ts`
  ```typescript
  export const folderAPI = {
    listFolders: (userId) => { ... },
    createFolder: (name, color) => { ... },
    updateFolder: (id, updates) => { ... },
    deleteFolder: (id) => { ... },
    listFolderProcesses: (folderId, stage?) => { ... },
  };
  ```

### Phase 5: ProcessUploadDrawer Integration (2-3 hours)

- [ ] Pass folderId context through process creation flow
  - Store in React Context or prop drilling
  - Ensure folderId is sent to `analyze_legal_process` Edge Function

- [ ] Modify `analyze_legal_process` Edge Function (optional)
  - Accept folder_id in payload
  - Link newly created process to folder via UPDATE query

- [ ] Update ProcessUploadDrawer to reset folder context after creation

### Phase 6: Testing & Integration (5-8 hours)

- [ ] Manual testing of all user stories (Create folder, link process, search, etc.)
- [ ] Real-time testing: open two browsers, create folder in one, verify appears in other
- [ ] Error scenarios: invalid folder names, permissions errors, network failures
- [ ] RLS testing: verify User A cannot see User B's folders
- [ ] Integration testing: process creation within folder, stage transitions, search

### Phase 7: Documentation & Cleanup (2-3 hours)

- [ ] Document any deviations from spec in `IMPLEMENTATION_NOTES.md`
- [ ] Update CLAUDE.md with feature overview
- [ ] Clean up unused code, console logs
- [ ] Create PR with clear description linking to spec

---

## Code Snippets

### useFolders Hook Template

```typescript
// hooks/useFolders.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useFolders() {
  const [folders, setFolders] = useState<FolderWithProcessCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  async function fetchFolders() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_folders_with_counts'); // SQL function or direct query
      if (error) throw error;
      setFolders(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createFolder(name: string, color: string) {
    const { data, error } = await supabase
      .from('process_folders')
      .insert([{ name, color }])
      .select()
      .single();
    if (error) throw error;
    setFolders([...folders, { ...data, process_count: 0 }]);
    return data;
  }

  async function deleteFolder(id: string) {
    const { error } = await supabase
      .from('process_folders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setFolders(folders.filter(f => f.id !== id));
  }

  return { folders, isLoading, error, createFolder, deleteFolder };
}
```

### ProcessDetailsModal Folder Field Template

```typescript
// Inside ProcessDetailsModal.tsx
const [selectedFolder, setSelectedFolder] = useState<string | null>(process.folder_id);
const { folders } = useFolders();

const handleFolderChange = async (folderId: string | null) => {
  setSelectedFolder(folderId);
  // Save to database
  await supabase
    .from('legal_processes')
    .update({ folder_id: folderId })
    .eq('id', process.id);
};

// In render:
<div className="folder-field">
  <label>Pasta</label>
  <select
    value={selectedFolder || 'none'}
    onChange={(e) => handleFolderChange(e.target.value === 'none' ? null : e.target.value)}
  >
    <option value="none">Sem Pasta</option>
    {folders.map(f => (
      <option key={f.id} value={f.id}>{f.name}</option>
    ))}
  </select>
</div>
```

---

## Testing Strategy

### Unit Tests (via Vitest)

- Test useFolders hook: create, fetch, delete
- Test folder name validation (non-empty, max length)
- Test color validation (valid hex or CSS color name)

### Integration Tests

- Create folder → Verify appears in list
- Create process in folder → Verify folder_id is set
- Search folder processes → Verify filtering works
- Update process stage → Verify it moves in stage groups
- Delete folder → Verify processes become unfoldered

### Manual Testing (Browser)

- Create 3 folders with different colors
- Create 5 processes: 2 in Folder A, 1 in Folder B, 2 unfoldered
- Search within Folder A and verify correct processes appear
- Update a process from Pendentes to Aceito (move to Em Andamento)
- Link an unfoldered process to Folder A
- Delete Folder B and verify processes remain unfoldered
- Refresh page and verify all state persists

### Permission Testing (RLS)

- Open two browser windows: User A and User B
- User A creates Folder 1 and process in it
- User B logs in: should NOT see Folder 1 or its processes
- Inspect network requests in DevTools: verify RLS filter on queries

---

## Deployment Checklist

- [ ] All tests passing
- [ ] No console errors or warnings in dev tools
- [ ] Accessibility audit: axe DevTools, WCAG 2.1 AA
- [ ] Mobile responsive: test on Chrome mobile emulator + real phone
- [ ] PR reviewed and approved
- [ ] Migration tested on staging environment
- [ ] Read CLAUDE.md and Constitution to ensure compliance
- [ ] Feature flag ready (if needed)
- [ ] Update CLAUDE.md with feature addition
- [ ] Notify QA and product team

---

## Rollback Plan

If critical issues discovered post-deployment:

1. Revert codebase to previous commit
2. Run migration rollback: `supabase db reset` (if data loss is acceptable) or manually drop `process_folders` table
3. Restore from backup if process data was corrupted

---

## Known Limitations & Future Work

- **No nested folders** (future: implement recursive folder structure)
- **No folder sharing** (future: implement team/group access control)
- **No bulk operations** (future: move multiple processes at once)
- **Manual process count** (future: denormalize count column for performance at scale)

---

**Version**: 1.0  
**Last Updated**: 2026-03-24
