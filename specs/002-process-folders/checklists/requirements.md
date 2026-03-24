# Requirements Checklist: Process Folders

**Feature**: 002-process-folders  
**Date**: 2026-03-24

---

## Functional Requirements

### FR-1: Folder Management
- [x] Users can create folders with name and color
- [x] Users can edit folder name and color
- [x] Users can delete folders
- [x] Users can view list of their folders with process counts
- [x] Users can search/filter folders by name

### FR-2: Process-Folder Association
- [x] Processes can be created within a folder (pre-linked)
- [x] Existing processes can be linked to a folder
- [x] Existing processes can be moved between folders
- [x] Processes can be unlinked from folders (folder_id = NULL)
- [x] Unfoldered processes remain visible in regular Processos view

### FR-3: Folder Contents Viewing
- [x] Folder contents are grouped by kanban stage (3 groups: Pendente, Em Andamento, Finalizado)
- [x] Processes are sorted/grouped according to stage mapping (see spec)
- [x] Processes auto-move between stage groups when kanban_stage changes
- [x] Processes can be clicked to open details modal

### FR-4: Search & Filtering
- [x] Search within folder by process name or number
- [x] Search results maintain stage grouping
- [x] Clearing search restores all processes
- [x] Search folders by name

### FR-5: User Data Privacy
- [x] Users can only see their own folders
- [x] Users can only see processes in their own folders
- [x] RLS policies enforce user isolation at database level
- [x] Unauthorized access attempts return permission errors

### FR-6: Real-time Updates
- [x] Folder list updates when folder is created, edited, or deleted
- [x] Process moves between stage groups automatically when stage changes
- [x] Changes made in one browser window appear in other windows

---

## Non-Functional Requirements

### NFR-1: Performance
- [x] Folder listing query must be < 500ms
- [x] Process listing per folder must be < 1s (even with 500+ processes)
- [x] Search must be debounced (300ms) to prevent excessive queries
- [x] Pagination recommended if folder > 100 processes
- [x] Real-time subscriptions must handle 50+ concurrent updates/sec

### NFR-2: Security
- [x] All folder operations respect RLS policies
- [x] User cannot access other users' folders via direct URL or API
- [x] No SQL injection vulnerabilities (use parametrized queries)
- [x] No XSS vulnerabilities (sanitize user input)
- [x] Secrets/tokens never exposed in frontend code

### NFR-3: Accessibility
- [x] All interactive elements keyboard-accessible (Tab, Enter, Esc)
- [x] Color not the only distinguishing feature (add icons/labels)
- [x] ARIA labels on buttons and form fields
- [x] Focus visible on all interactive elements
- [x] Screen reader compatible (semantic HTML, landmarks)

### NFR-4: Responsive Design
- [x] Desktop (1920px+): grid layout for folders, multi-column list
- [x] Tablet (768-1024px): 2-column grid, single-column process list
- [x] Mobile (320-480px): single-column layout, touch-friendly spacing

### NFR-5: UI/UX Consistency
- [x] All colors use CSS variables (no hardcoded hex)
- [x] Typography matches existing system (Inter/Outfit fonts)
- [x] Component styling matches design system (cards, buttons, inputs)
- [x] Loading states shown consistently (skeletons, spinners)
- [x] Error messages are user-friendly and actionable

### NFR-6: Data Integrity
- [x] Deleting a folder doesn't delete processes (cascade: NULLIFY)
- [x] Folder_id is validated before linking to process
- [x] Invalid stage values cannot be stored
- [x] Timestamps (created_at, updated_at) maintained automatically

---

## Browser Compatibility

- [x] Chrome 90+
- [x] Firefox 88+
- [x] Safari 14+
- [x] Edge 90+
- [x] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Code Quality Standards

### Per Constitution:

- [x] Components ≤ 150-200 lines; logic in hooks
- [x] No component code duplication (extract to reusable components)
- [x] Meaningful variable/function names (no obscure abbreviations)
- [x] Error handling in all async operations
- [x] TypeScript strict mode compliance (no `any` types)
- [x] No hardcoded values (use constants or environment variables)

---

## Testing Requirements

### Unit Tests (Vitest)
- [x] useFolders: create, read, update, delete operations
- [x] useFolderContents: stage grouping logic
- [x] useFolderSearch: debounce, filtering
- [x] Component rendering with various props
- [x] Error handling (network failures, invalid input)

### Integration Tests
- [x] E2E folder creation workflow (create → view → search → delete)
- [x] Process linking workflow
- [x] Stage transition workflow
- [x] Multi-user isolation (RLS verification)

### Manual Testing
- [x] All user stories from spec.md
- [x] Real-time update verification (two browser windows)
- [x] Edge cases (special characters, large datasets, network failures)
- [x] Accessibility testing (keyboard navigation, screen reader)
- [x] Responsive design testing (mobile, tablet, desktop)

### Performance Testing
- [x] Folder listing with 10, 50, 100+ folders
- [x] Process listing with 10, 50, 500+ processes
- [x] Search performance (time to results)
- [x] Real-time update latency

---

## Documentation Requirements

- [x] spec.md: Feature overview, user stories, design
- [x] data-model.md: SQL schema, RLS, queries
- [x] quickstart.md: Implementation guide
- [x] tasks.md: Task breakdown with estimates
- [x] requirements.md: This checklist
- [x] edge-functions.md: API contracts (if applicable)
- [x] IMPLEMENTATION_NOTES.md: Deviations and decisions
- [x] JSDoc comments in all public functions/components
- [x] CLAUDE.md updated with feature overview

---

## Deployment Requirements

- [ ] Migration tested on staging environment
- [ ] All tests passing (unit, integration, manual)
- [ ] Code review approved
- [ ] TypeScript compilation successful
- [ ] No console errors in production build
- [ ] Performance benchmarks met
- [ ] RLS policies verified in production
- [ ] Rollback plan documented
- [ ] Team trained on new feature
- [ ] Feature ready for release

---

## Sign-Off

- **Product Owner**: __________ Date: __________
- **Tech Lead**: __________ Date: __________
- **QA Lead**: __________ Date: __________

---

**Version**: 1.0  
**Last Updated**: 2026-03-24
