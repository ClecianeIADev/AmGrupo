# README: Process Folders Feature (002-process-folders)

**Status**: ✅ Specification Complete | Ready for Implementation  
**Feature Branch**: `002-process-folders`  
**Created**: 2026-03-24  
**Target Release**: Sprint N+2 (Q2 2026)

---

## Quick Summary

### What?
A folder-based organization system for legal processes in the Jurídico module. Users can create custom folders with colors, organize processes within them, and view processes grouped by workflow stages.

### Why?
Enable better organization of large process portfolios, reducing cognitive load and supporting team coordination.

### How?
- Create folders with name and color
- Create processes within folders (pre-linked)
- Link unfoldered processes to folders
- View processes grouped by stage: Pendente, Em Andamento, Finalizado
- Search and filter within folders
- Full RLS-based user isolation

### Where?
Located in: **Jurídico > Pipelines > Contencioso Cível > Pastas** (new tab)

---

## Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| **spec.md** | Feature specification with user stories | Product, Design, Dev |
| **data-model.md** | Database schema, RLS policies, queries | Backend, Database |
| **quickstart.md** | Implementation guide with code snippets | Frontend, Backend |
| **tasks.md** | Detailed task breakdown with estimates | Project Manager, Dev Lead |
| **plan.md** | Feature plan, timelines, business value | Product, Leadership |
| **research.md** | Design decisions, technical research | Architects, Lead Dev |
| **checklists/requirements.md** | Requirements checklist | QA, PM |
| **contracts/edge-functions.md** | API contracts for Edge Functions | Backend, Integrations |

---

## Key Files to Read in Order

1. **spec.md** — Start here for feature overview (UPDATED: No UI creation needed)
2. **data-model.md** — Understand the database schema
3. **tasks.md** — See implementation breakdown (REDUCED from 16 to 9 tasks)
4. **quickstart.md** — Get started with code
5. **research.md** — Deep dive into design decisions

---

## Feature Highlights

✅ **User data privacy**: RLS enforces user isolation  
✅ **Real-time updates**: Supabase Realtime for live sync  
✅ **Stage grouping**: Automatic grouping by kanban_stage  
✅ **Search & filter**: Debounced search within folders  
✅ **Accessibility**: WCAG 2.1 AA compliant  
✅ **Responsive design**: Mobile, tablet, desktop  
✅ **Performance**: Optimized queries with indexes  
✅ **Backward compatible**: Works with existing processes  

---

## Database Changes Summary

### New Table: `process_folders`
```sql
id (UUID, PK)
user_id (UUID, FK to auth.users)
name (TEXT, not empty)
color (TEXT, CSS color)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### Modified Table: `legal_processes`
```sql
+ folder_id (UUID, FK to process_folders, nullable, ON DELETE NULLIFY)
+ Index: idx_legal_processes_folder_id
+ Index: idx_legal_processes_folder_stage
```

### RLS Policies
- Users can only see/modify their own folders
- Users can only link/unlink processes to their own folders

*(See data-model.md for full SQL)*

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 3-5 days | Database migration, type definitions |
| Phase 2 | 5-8 days | Custom hooks (useFolders, useFolderContents, useFolderSearch) |
| Phase 3 | 3-5 days | Integration: ProcessDetailsModal + ProcessUploadDrawer updates |
| Phase 4 | 2-3 days | Testing & QA |
| Phase 5 | 1-2 days | Documentation & finalization |

**Total Estimate**: ~28-38 hours (~1 week for 1-2 developers)

*Significantly reduced from original 53-66 hours due to reusing existing UI screens*

---

## User Stories

1. ✅ **Folder Creation** - Create/edit/delete folders with name and color
2. ✅ **Process Creation in Folder** - Create processes within folder context
3. ✅ **Process Linking** - Link unfoldered processes to folders
4. ✅ **Folder Contents** - View processes grouped by stage
5. ✅ **Search Within Folder** - Search processes by name or number
6. ✅ **Search Folders** - Search folder list by name
7. ✅ **User Isolation** - Privacy via RLS (no cross-user data leakage)
8. ✅ **Auto Stage Transitions** - Processes move between stage groups automatically

---

## Success Criteria

- [ ] All tasks in tasks.md completed
- [ ] All acceptance scenarios in spec.md passing
- [ ] RLS policies verified (no data leakage between users)
- [ ] Real-time updates working (tested with 2+ browser windows)
- [ ] Performance benchmarks met (folder list < 500ms, search < 1s)
- [ ] No TypeScript errors
- [ ] Accessibility audit passing (WCAG 2.1 AA)
- [ ] Code review approved
- [ ] Documentation complete

---

## Getting Started

### For Developers

1. Read **spec.md** for feature overview
2. Read **data-model.md** for database design
3. Start with **tasks.md** Phase 1: Database Migration
4. Use **quickstart.md** for code templates and patterns

### For QA/Testing

1. Review **spec.md** Acceptance Scenarios section
2. Check **checklists/requirements.md** for testing checklist
3. Run through all manual test scenarios

### For Product/Leadership

1. Read **plan.md** for business context
2. Check **tasks.md** for timeline and estimates
3. Review **research.md** for design rationale

---

## Questions & Support

- **Feature Questions**: See spec.md User Stories section
- **Database Questions**: See data-model.md (SQL patterns, RLS)
- **Implementation Questions**: See quickstart.md (code templates)
- **Design Rationale**: See research.md (decision documentation)

---

## Related Features

- **Upstream**: 001-legal-summaries (legal_processes table)
- **Downstream**: None (standalone feature)
- **Future Enhancements**: 
  - Nested folders
  - Folder sharing with teams
  - Auto-organization rules
  - Bulk operations

---

## Key Contacts

- **Product Owner**: [Name] — Strategic decisions, priority
- **Tech Lead**: [Name] — Architecture, technical decisions
- **Frontend Lead**: [Name] — UI/UX, component implementation
- **Backend Lead**: [Name] — Database, API design
- **QA Lead**: [Name] — Testing strategy, quality gates

---

**Version**: 1.0  
**Created**: 2026-03-24  
**Last Updated**: 2026-03-24

---

## Changelog

### v1.0 (2026-03-24)
- Initial specification complete
- All documentation files created
- Ready for Phase 1 (database migration)

---

*For feature updates or changes, create a Pull Request and update this README accordingly.*
