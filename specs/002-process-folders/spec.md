# Feature Specification: Process Folders Organization

**Feature Branch**: `002-process-folders`  
**Created**: March 24, 2026  
**Status**: Active Development  
**Input**: User requirements: "Função de pastas para organizar os processos jurídicos por categoria/projeto customizado"

## Executive Summary

This feature introduces a folder-based organization system for legal processes in the Jurídico module. Users can create custom folders, assign colors for visual categorization, and organize their legal processes within these folders. Processes can be created directly within a folder or linked to existing processes. The UI displays processes grouped by kanban stages (Pendente, Em Andamento, Finalizado) with full search and filtering capabilities.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Folder Creation & Management (Priority: P1)

A user navigates to the Jurídico > Pipelines > Contencioso Cível > Pastas tab and creates a new folder with a custom name and color for organizing related processes.

**Why this priority**: P1 because folder creation is the foundational feature. Without the ability to create and manage folders, subsequent organization is impossible. This directly enables the core workflow.

**Independent Test**: Can be fully tested by creating a folder, assigning a name and color, verifying it appears in the folders list, and confirming the folder persists after page refresh. Delivers value by establishing organizational structure.

**Acceptance Scenarios**:

1. **Given** a user is in the Pastas tab, **When** they click "Nova Pasta" button, **Then** a form appears with fields for folder name and color picker
2. **Given** a user has entered a valid folder name and selected a color, **When** they confirm folder creation, **Then** the folder is created in the database and displayed in the folders grid with the selected color
3. **Given** a user creates multiple folders, **When** they view the Pastas tab, **Then** all folders are displayed as color-coded cards showing the folder name and process count
4. **Given** a folder has been created, **When** the user searches using the search box, **Then** they can find the folder by name
5. **Given** a user has created a folder, **When** they retry after closing and reopening the browser, **Then** the folder persists and is still visible

---

### User Story 2 - Create Process Within Folder (Priority: P1)

After opening a folder (viewing its contents), a user clicks "Novo Processo" button and the process creation dialog appears pre-linked to that folder. Upon successful process creation, the new process is automatically assigned to the folder.

**Why this priority**: P1 because this is the primary workflow for adding processes to folders. Without this, users cannot populate folders efficiently.

**Independent Test**: Can be tested by verifying that clicking "Novo Processo" within a folder pre-populates the folder ID, and the created process appears in that folder with the correct relationship in the database. Delivers value by enabling fast folder-based process creation.

**Acceptance Scenarios**:

1. **Given** a user views a folder's contents, **When** they click the "Novo Processo" button, **Then** the process creation dialog opens with the folder ID stored in a data attribute (for state management)
2. **Given** the process creation dialog is open with a folder ID pre-loaded, **When** the user follows the normal process creation flow (upload document, select role, confirm), **Then** the process is created and automatically linked to the folder
3. **Given** a user cancels the process creation dialog, **When** they cancel, **Then** the folder ID is cleared from the form and no orphaned state persists
4. **Given** multiple folders exist and a user clicks "Novo Processo" in Folder A, **When** they then navigate away and back to Folder B and click "Novo Processo", **Then** the process creation correctly binds to Folder B (no cross-folder confusion)

---

### User Story 3 - Link Unfoldered Process to Folder (Priority: P1)

A user views details of an existing process that was created without a folder. In the process details modal, a new "Pasta" field appears with a dropdown showing all available folders. The user can select a folder to link the process or change the linked folder.

**Why this priority**: P1 because it enables retroactive organization of existing processes. Many processes will be created outside folders initially.

**Independent Test**: Can be tested by creating a process outside any folder, opening its details, selecting a folder from the dropdown, saving, and verifying the process is now associated with that folder in the database. Delivers value by enabling flexible reorganization.

**Acceptance Scenarios**:

1. **Given** a user has a process created without a folder, **When** they click to view process details, **Then** a new "Pasta" field is visible with a dropdown showing all available folders and a "Sem Pasta" (None) option
2. **Given** a user sees the Pasta field empty, **When** they click the dropdown and select a folder, **Then** the process is updated in the database and the UI confirms the new folder assignment
3. **Given** a process is already linked to a folder, **When** the user changes the Pasta selection to a different folder, **Then** the process is moved (unlinked from old folder, linked to new)
4. **Given** a user linked a process to a folder, **When** they re-view the process details, **Then** the Pasta dropdown shows the currently linked folder selected
5. **Given** a user linked a process to a folder, **When** they navigate to the folder view, **Then** the process appears within that folder

---

### User Story 4 - Folder Contents Display with Stage Grouping (Priority: P1)

When a user clicks on a folder to view its contents, the UI displays all processes within that folder grouped by kanban stage filters: Pendente (1 stage), Em Andamento (6 stages), and Finalizado (1 stage).

**Why this priority**: P1 because it's the primary visualization and retrieval mechanism for organized processes. Without this, folders are just empty containers.

**Independent Test**: Can be fully tested by verifying that processes appear in the correct stage group based on their kanban_stage database value. Delivers value by providing organized process visibility.

**Acceptance Scenarios**:

1. **Given** a folder contains processes in various kanban stages, **When** the user clicks the folder to view contents, **Then** processes are displayed grouped under three collapsible sections: "Pendente", "Em Andamento", and "Finalizado"
2. **Given** the folder view shows stage groups, **When** the user reviews the stage groupings, **Then** each stage contains processes that match its criteria (see Data Model section for stage mapping)
3. **Given** a folder view is open, **When** an existing process within the folder changes its kanban_stage, **Then** the UI automatically re-renders the process in the correct stage group (real-time update via Supabase Realtime)
4. **Given** a folder contains only Pendente processes, **When** the user views the folder, **Then** the "Em Andamento" and "Finalizado" sections are empty but still visible (or display "Sem processos")
5. **Given** a folder view is open, **When** the user clicks a process within any stage group, **Then** the process details modal opens showing full information

---

### User Story 5 - Search Processes Within Folder (Priority: P1)

In the folder contents view, a search box allows users to filter processes by name or process number. As input is entered, processes are filtered client-side or server-side, and the stage groups update dynamically.

**Why this priority**: P1 because search enables rapid organization in large folders and reduces cognitive load.

**Independent Test**: Can be tested by entering a process name or number in the search box and verifying that only matching processes remain visible, grouped correctly by stage. Deleting search text must restore all processes.

**Acceptance Scenarios**:

1. **Given** a folder view is open, **When** the user sees the search box (labeled "Buscar processos..."), **Then** the search field is visible and functional
2. **Given** a folder contains multiple processes, **When** the user types a portion of a process name or number in the search, **Then** only processes matching that text appear (filtered across all stage groups)
3. **Given** a user searches for "João" and the results appear, **When** the user clears the search box, **Then** all processes reappear grouped by stage
4. **Given** a search returns no results, **When** the user views the folder, **Then** all stage groups display "Sem processos" or are hidden
5. **Given** a user performs a search, **When** they click a process from the filtered results, **Then** the process details modal opens correctly

---

### User Story 6 - Search & Filter Folders (Priority: P2)

In the Pastas tab (main folders list), a search box allows users to find folders by name. The search is real-time and filters the folder grid.

**Why this priority**: P2 because while useful for scaling, folder search is secondary to folder creation and process organization (P1). This becomes critical only with many folders.

**Independent Test**: Can be tested by creating multiple folders and verifying that typing a folder name filters the list correctly, and clearing the search restores all folders.

**Acceptance Scenarios**:

1. **Given** multiple folders exist in the Pastas tab, **When** the user sees the search box (labeled "Buscar nesta pasta..."), **Then** typing folder names filters the visible folders
2. **Given** a user searches for "Cliente XYZ" and folders matching that name appear, **When** the user clears the search, **Then** all folders reappear
3. **Given** a user searches for a term with no matches, **When** the search returns empty, **Then** the folders grid displays "Sem pastas encontradas"

---

### User Story 7 - User Data Privacy & Folder Isolation (Priority: P1)

Each user can only view and manage folders they created. The system enforces strict folder ownership via RLS to ensure data isolation and privacy across users.

**Why this priority**: P1 because data security and privacy are foundational (per Constitution). Without proper isolation, users could see or modify other users' folders.

**Independent Test**: Can be tested by verifying that User A cannot see folders created by User B in the Pastas tab, and that attempting direct API access to another user's folder returns a permission error.

**Acceptance Scenarios**:

1. **Given** User A creates a folder and User B logs in, **When** User B navigates to the Pastas tab, **Then** User B only sees their own folders, not User A's
2. **Given** User A and User B each have processes in their folders, **When** each user views their folder contents, **Then** each user sees only their own processes
3. **Given** a user attempts to access another user's folder directly via URL/API, **When** the request is processed, **Then** the database RLS policy blocks access and returns a permission error
4. **Given** a user deletes a folder, **When** the deletion occurs, **Then** all processes linked to that folder are either orphaned (folder_id set to NULL) or also deleted per cascade rules defined in the data model

---

### User Story 8 - Process Stage Auto-Transitions (Priority: P2)

When a process within a folder is updated by the user (or external system) to change its kanban_stage, the process automatically moves to the correct stage group without manual user intervention.

**Why this priority**: P2 because stage transitions are typically driven by external workflow changes or user edits. This is tested implicitly through process updates but listed explicitly for clarity.

**Independent Test**: Can be tested by modifying a process's kanban_stage in the database or via the process detail modal, and verifying the stage group reflects the change immediately.

**Acceptance Scenarios**:

1. **Given** a process is in the "Pendente" stage and a user (or system) updates it to "Aceito", **When** the update is confirmed, **Then** the process immediately moves to the "Em Andamento" group in the folder view
2. **Given** a process is in "Em Andamento" and its kanban_stage is changed to "Finalizado", **When** the change occurs, **Then** the process moves to the "Finalizado" group
3. **Given** multiple processes are visible across stage groups, **When** one process stage transitionally meets the stage group criteria, **Then** only that process moves (others remain unaffected)

---

## Feature Scope

### Included
- Database integration: `process_folders` table with RLS policies
- Column addition: `folder_id` in `legal_processes` table
- Process creation within a folder (pre-linked via `folder_id`)
- Linking existing processes to folders (retroactive)
- Stage-based grouping in existing folder contents view
- Process search within folder (works with existing search UI)
- Real-time stage transitions (automatic based on kanban_stage changes)
- Full RLS-based user isolation via database policies
- Deletion of folders (with ON DELETE NULLIFY behavior)
- Process Details Modal modification: add "Pasta" dropdown field
- Folder creation with custom name and color

### Excluded (Out of Scope)
- NEW UI screens (folder grid, folder contents view already exist)
- NEW components for folder visualization (reuse existing UI)
- Folder sharing between users (future feature)
- Nested folders (folders within folders)
- Folder-level permissions or role-based access
- Bulk operations (move multiple processes to a folder)
- Process drag-and-drop between folders (use process details modal instead)
- Folder-level automation rules (e.g., "auto-archive finished processes")

---

## Design & UI Location

**Module Path**: Jurídico > Pipelines > Contencioso Cível > **Pastas** 

**Current Tabs**: Processos | **Pastas** 

**Design System Compliance** (per Constitution):
- Colors: CSS variables from `index.css` (`--color-primary`, `--color-accent`, etc.)
- Fonts: Google Fonts (Inter/Outfit) as established
- Components: Reusable cards, buttons, inputs from existing pattern library
- No hardcoded hex values; all colors via CSS variables
- Micro-animations via Motion where appropriate
- Consistent spacing and typography with Jurídico module

**Key UI Elements**:
1. **Folders Tab Main View**: Grid of folder cards (like the existing folder view in Image 1)
   - Each card shows: colored folder icon, folder name, process count
   - Card is clickable to enter folder view
   - Button to create new folder

2. **Folder Contents View**: (like Image 2)
   - Breadcrumb: Home > Pastas > [Folder Name]
   - Button: "+ Novo Processo"
   - Search box: "Buscar processos..."
   - Three collapsible sections: Pendente, Em Andamento, Finalizado
   - Each process listed under its stage with metadata

3. **Process Details Modal**: (like Image 4)
   - New "Pasta" field with dropdown for folder selection/change
   - Existing tabs: Resumo Executivo, Resumo do Processo, Quesitos, Documentos, Exames Sugeridos

---

## Data Model Overview

*(See data-model.md for full SQL schema)*

### New Table: `process_folders`
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `name` (TEXT)
- `color` (TEXT, hex or CSS color name)
- `process_ids` (JSONB array or FK relationship via M2M table)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Modified Table: `legal_processes`
- Add `folder_id` (UUID, FK to process_folders, nullable)
- Add trigger to auto-update `updated_at` on any change

### RLS Policies
- Users can only CRUD folders they own (user_id)
- Users can only see processes in their own folders

---

## Stage Mapping

**Pendente Stage Group**: kanban_stage = "Pendentes"

**Em Andamento Stage Group**: kanban_stage IN ("Aceites", "Perícia Agendada", "Periciado Não Compareceu", "Revisando Laudo/Impugnação", "Aguardando Manifestações", "Aguardando Pagamento")

**Finalizado Stage Group**: kanban_stage = "Finalizado"

---

## Data Persistence Requirements

All operations must be persisted to Supabase:
- Folder create/edit/delete
- Process-folder linking/unlinking
- Process removal from folders (via update or cascade)

---

## Related Features

- **001-legal-summaries**: Legal process creation and AI analysis (upstream dependency)
- **Jurídico Kanban**: Process stage transitions (integration point)
- **Process Details Modal**: Now includes folder selection field (modified)

---

## Non-Functional Requirements

- **Performance**: Folder queries must filter by user_id and use indexes. Lazy-load process counts if > 100 processes per folder.
- **Accessibility**: All interactive elements must be keyboard-accessible. Color selection should not be the only way to distinguish folders.
- **Mobile Responsiveness**: Folder cards and process list must adapt to small screens. Search must remain functional on mobile.
- **Error Handling**: Display user-friendly error messages for folder operations (e.g., "Erro ao criar pasta. Tente novamente.").
- **Internationalization**: All text labels follow the Constitution's i18n requirements. Folder names are user-provided and should support accented characters (João, Ação, etc.).

---

## Status & Milestones

- **Phase 1** (Sprint N): Database schema, RLS policies, basic CRUD operations
- **Phase 2** (Sprint N+1): Frontend components, folder listing, process linking
- **Phase 3** (Sprint N+2): Real-time updates, search, stage grouping
- **Phase 4** (Sprint N+3): Integration with process details modal, testing, bugfixes

---

**Ratified By**: Product Team  
**Last Updated**: 2026-03-24
