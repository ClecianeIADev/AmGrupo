# Implementation Tasks: Process Folders

**Feature**: 002-process-folders  
**Date**: 2026-03-24  
**Status**: Ready for Development

---

## Task Breakdown

**Note**: Telas de visualização de pastas e conteúdo já existem no layout. Focus está em integração com BD e modificações necessárias.

### TASK 1: Database Migration (Est. 3 hours)

**Objective**: Create process_folders table, add folder_id to legal_processes, set up RLS and indexes.

- [ ] Create migration file: `supabase/migrations/20260324000000_create_process_folders.sql`
- [ ] Include all SQL from data-model.md (table creation, indexes, RLS policies, triggers)
- [ ] Test migration locally: `supabase db push`
- [ ] Verify in Supabase console:
  - [ ] Table `process_folders` exists with correct columns
  - [ ] Column `folder_id` added to `legal_processes`
  - [ ] All indexes created
  - [ ] RLS policies active (toggle in Supabase console)
- [ ] Test RLS with SQL Editor:
  - [ ] Authenticated user can SELECT own folders
  - [ ] Unauthenticated user gets permission denied
- [ ] Document any issues in IMPLEMENTATION_NOTES.md

**Acceptance Criteria**:
- Migration runs without errors
- Tables visible in Supabase dashboard
- RLS policies confirmed active
- Manual SQL queries respect user_id filtering

**Owner**: Backend/Database Engineer

---

### TASK 2: Type Definitions (Est. 1-2 hours)

**Objective**: Create TypeScript types for folders and update database types.

- [ ] Create `src/types/folder.ts`:
  ```typescript
  export type ProcessFolder = { ... };
  export type FolderWithProcessCount = { ... };
  ```
- [ ] Run Supabase type generation: `supabase gen types typescript --local > src/lib/database.types.ts`
- [ ] Update `src/types/legalProcess.ts` to include optional `folder_id` field
- [ ] Export types in `src/types/index.ts` for easy imports
- [ ] Update existing type imports (useLegalProcesses hook)

**Acceptance Criteria**:
- TypeScript compilation passes (`npm run lint`)
- No `any` types introduced
- All types properly exported

**Owner**: Frontend Engineer

---

### TASK 3: useFolders Hook (Est. 4 hours)

**Objective**: Implement custom React hook for folder CRUD and querying.

- [ ] Create `src/hooks/useFolders.ts`
- [ ] Implement functions:
  - [ ] `fetchFolders()` - list user's folders with process counts
  - [ ] `createFolder(name, color)` - create new folder
  - [ ] `updateFolder(id, updates)` - edit folder name/color
  - [ ] `deleteFolder(id)` - delete folder
  - [ ] `searchFolders(query)` - search by name
- [ ] Use Supabase Realtime for live updates:
  - [ ] Subscribe to DELETE events on own folders
  - [ ] Subscribe to INSERT/UPDATE events on own folders
- [ ] Error handling: catch and return error state
- [ ] Loading state during async operations
- [ ] Return object: `{ folders, isLoading, error, createFolder, updateFolder, deleteFolder, searchFolders }`

**Acceptance Criteria**:
- All CRUD operations work without errors
- Realtime updates reflected in UI (test with two browser windows)
- Error messages are user-friendly
- Hook can be used in any component without side effects

**Owner**: Frontend Engineer

---

### TASK 4: useFolderContents Hook (Est. 4 hours)

**Objective**: Implement hook for fetching processes within a folder, grouped by stage.

- [ ] Create `src/hooks/useFolderContents.ts`
- [ ] Implement functions:
  - [ ] `fetchFolderContents(folderId, stageFilter?)` - get processes in folder, grouped by stage
  - [ ] `groupProcessesByStage(processes)` - client-side grouping utility
  - [ ] Subscribe to Realtime updates: when a process in this folder changes kanban_stage, re-fetch
- [ ] Handle pagination if folder > 100 processes (lazy-load on scroll)
- [ ] Return object: `{ groupedProcesses: { Pendente: [], EmAndamento: [], Finalizado: [] }, isLoading, error }`

**Acceptance Criteria**:
- Processes correctly grouped by stage mapping (see spec)
- Processes update in real-time when stage changes
- No N+1 queries (fetch folder + all processes in one query)

**Owner**: Frontend Engineer

---

### TASK 5: useFolderSearch Hook (Est. 2 hours)

**Objective**: Implement debounced search within folder.

- [ ] Create `src/hooks/useFolderSearch.ts`
- [ ] Implement:
  - [ ] Debounced search (300ms delay)
  - [ ] Filter by process_name or process_number (case-insensitive)
  - [ ] Maintain stage grouping while filtering
- [ ] Return: `{ filteredProcesses: { ... }, isSearching }`

**Acceptance Criteria**:
- Search returns correct matches
- Performance: debounce prevents excessive queries
- Clearing search restores all processes

**Owner**: Frontend Engineer

---

### TASK 6: Update ProcessDetailsModal.tsx (Est. 3 hours)

**Objective**: Add Pasta (Folder) field to process details.

- [ ] Modify `src/components/juridico/ProcessDetailsModal.tsx`
- [ ] Features:
  - [ ] Add new "Pasta" field (dropdown/select)
  - [ ] Options: "Sem Pasta" + list of user's folders
  - [ ] Current folder shown as selected (if process has folder_id)
  - [ ] onChange: update process folder_id in database (via Supabase)
- [ ] Use useFolders hook to fetch available folders
- [ ] Handle errors gracefully

**Acceptance Criteria**:
- Dropdown renders with correct options
- Selection saves to database
- Change reflected immediately in UI
- Folder list updates if new folder created elsewhere

**Owner**: Frontend Engineer

---

### TASK 13: Update ProcessUploadDrawer.tsx (Est. 4 hours)

**Objective**: Support creating processes within folder context.

- [ ] Modify `src/components/juridico/ProcessUploadDrawer.tsx`
- [ ] Features:
  - [ ] Accept prop: `contextFolderId?: string` (passed when opened from FolderContentsView)
  - [ ] Store folderId in form state
  - [ ] On successful process creation, call Supabase update to link process to folder
  - [ ] After creation: reset form, clear folderId state
  - [ ] Handle errors (if folder linking fails, still show created process)
- [ ] If no contextFolderId, behave as before (process created without folder)

**Acceptance Criteria**:
- Processes created in folder context are linked correctly
- Form resets properly
- No folder context confusion (Folder A process doesn't get linked to Folder B)

**Owner**: Frontend Engineer

---

### TASK 14: Styling & Polish (Est. 4 hours)

**Objective**: Ensure UI matches design system and is visually polished.

- [ ] Review all new components for CSS variable usage (no hardcoded colors)
- [ ] Add micro-animations (Motion library):
  - [ ] Folder card hover effect
  - [ ] Stage group expand/collapse
  - [ ] Process list item entrance animation
- [ ] Test responsive design:
  - [ ] Desktop (1920px)
  - [ ] Tablet (768px)
  - [ ] Mobile (375px)
- [ ] Add loading skeletons (use existing skeleton component if available)
- [ ] Add error boundary around folder-related components
- [ ] Test accessibility:
  - [ ] Keyboard navigation (Tab, Enter, Esc)
  - [ ] Screen reader compatibility (ARIA labels)
  - [ ] Color contrast (Contrast Checker tool)

**Acceptance Criteria**:
- Design matches existing system UI
- Animations smooth and performant
- Responsive on all breakpoints
- Accessible per WCAG 2.1 AA

**Owner**: Frontend Engineer (UI specialist)

---

### TASK 15: Testing & QA (Est. 5-8 hours)

**Objective**: Comprehensive testing of all features.

**Manual Testing** (Browser):
- [ ] Create folder with name and color → verify appears in list
- [ ] Create 5 processes: 2 in Folder A, 1 in Folder B, 2 unfoldered
- [ ] Open Folder A → verify shows only 2 processes grouped by stage
- [ ] Search within Folder A for a process → verify filtering works
- [ ] Update a process stage → verify it moves in the stage group
- [ ] Open process details → change folder → verify folder_id updated in database
- [ ] Delete a folder → verify processes become unfoldered (folder_id = NULL)
- [ ] Refresh page → verify all state persists
- [ ] Open process creation from folder → verify new process is linked

**Permission Testing** (RLS):
- [ ] Open two browser windows with different users
- [ ] User A creates folder + process
- [ ] User B logs in → cannot see User A's folder or processes
- [ ] Inspect network requests → verify RLS filter applied

**Real-time Testing**:
- [ ] Open two browser windows (same user, two folders open)
- [ ] In one window, change a process stage
- [ ] In other window, verify stage group updates automatically

**Edge Cases**:
- [ ] Create folder with special characters (é, ç, etc.)
- [ ] Create process > 100 processes in folder (pagination?)
- [ ] Delete folder while viewing it (graceful redirect)
- [ ] Network error during process creation (retry? error message?)

**Unit Tests** (Vitest):
- [ ] useFolders hook: test all CRUD operations
- [ ] useFolderContents: test stage grouping logic
- [ ] useFolderSearch: test debounce and filtering

**Acceptance Criteria**:
- All manual test scenarios pass
- No permission leaks (RLS verified)
- Real-time updates work
- Edge cases handled gracefully
- Unit tests pass

**Owner**: QA Engineer + Frontend Engineer

---

### TASK 16: Documentation & Finalization (Est. 2-3 hours)

**Objective**: Document implementation and prepare for deployment.

- [ ] Update `CLAUDE.md`:
  - [ ] Add feature 002-process-folders to Active Features section
  - [ ] Add Database changes section (process_folders table, legal_processes.folder_id)
  - [ ] Add new components and hooks to code organization
- [ ] Create `IMPLEMENTATION_NOTES.md` (if deviations from spec):
  - [ ] Document any design/implementation decisions
  - [ ] Known issues or limitations
  - [ ] Future improvements
- [ ] Add JSDoc comments to all new public functions/components
- [ ] Clean up console.logs, debug code
- [ ] Verify no TypeScript errors: `npm run lint`
- [ ] Review code for Constitution compliance

**Acceptance Criteria**:
- Documentation complete
- No console.logs in production code
- TypeScript passes
- Code follows Constitution rules

**Owner**: Frontend Engineer + Tech Lead

---

## Priority & Sequencing

```
Phase 1 (Blocking - must complete first):
  TASK 1: Database Migration
  TASK 2: Type Definitions

Phase 2 (Core hooks & logic):
  TASK 3: useFolders Hook
  TASK 4: useFolderContents Hook
  TASK 5: useFolderSearch Hook

Phase 3 (Integration with existing UI):
  TASK 6: Update ProcessDetailsModal.tsx
  TASK 7: Update ProcessUploadDrawer.tsx

Phase 5 (Polish & Testing):
  TASK 14: Styling & Polish
  TASK 15: Testing & QA
  TASK 16: Documentation & Finalization
```

---

## Effort Estimates

- **Phase 1**: 4-5 hours (1 Dev)
- **Phase 2**: 10-12 hours (1 Dev)
- **Phase 3**: 7-10 hours (1 Dev)
- **Phase 4**: 7-11 hours (1-2 Devs)

**Total**: ~28-38 hours (~1 week at 40 hours/week per developer)

**REDUCED from original**: Originally estimated 53-66 hours; now ~28-38 hours due to reusing existing UI screens.

---

## Success Criteria (Definition of Done)

- [ ] All tasks completed and tested
- [ ] All user stories pass acceptance scenarios
- [ ] RLS permissions enforced (verified)
- [ ] Real-time updates working (Realtime subscriptions tested)
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible per WCAG 2.1 AA
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Ready for deployment

---

**Version**: 1.0  
**Last Updated**: 2026-03-24
