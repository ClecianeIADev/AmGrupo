# Feature Plan: Process Folders

**Feature**: 002-process-folders  
**Date**: 2026-03-24  
**Status**: Active  
**Priority**: P1

---

## Feature Overview

A folder-based organization system for legal processes. Users can create custom folders with colors, organize processes within them, and view processes grouped by workflow stages (Pendente, Em Andamento, Finalizado). This enables better organization for large process portfolios and team coordination.

---

## Business Value

1. **Improved Organization**: Users can group related processes by client, type, priority, or project
2. **Faster Navigation**: Search and filter within organized folders reduces cognitive load
3. **Better Visibility**: Stage-grouped view shows process status at a glance
4. **Scalability**: System can handle 1000+ processes without performance degradation
5. **User Retention**: Custom organization features improve user satisfaction and reduce churn

---

## User Personas

- **Senior Lawyer**: Manages 50+ active cases; needs to organize by client/type
- **Junior Associate**: Working on specific projects; needs to focus on relevant cases
- **Legal Manager**: Oversees team's processes; needs visibility into organization

---

## Market/Competitor Analysis

Similar features in:
- **Notion**: Folder + database organization with filtering
- **Asana**: Project folders with task grouping
- **Monday.com**: Board templates + folder structure

**Differentiation**: Integration with AI process summaries + automatic stage grouping (no manual categorization needed)

---

## Success Metrics

- **Adoption**: 60% of active users create ≥1 folder within 30 days
- **Engagement**: Average 3+ processes per folder, 2+ searches per folder per week
- **Satisfaction**: NPS ≥ +40 for this feature (survey question: "Folder organization")
- **Performance**: Folder listing < 500ms, process search < 1s (P95 latency)

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Users confused by stage grouping | Medium | Medium | Clear stage definitions + in-app help text + UI hints |
| Performance with 1000+ processes | Low | High | Pagination + indexes + query optimization |
| RLS policy bypasses | Low | Critical | Code review + security audit + penetration testing |
| Folder deletion data loss | Medium | Medium | Use ON DELETE NULLIFY (not CASCADE) + confirmation dialog |

---

## Release Strategy

### Phase 1: Closed Beta (1 week)
- Deploy to staging
- Internal QA testing by 2-3 team members
- Collect feedback on UX/performance

### Phase 2: Open Beta (2 weeks)
- Deploy to production with feature flag `ENABLE_PROCESS_FOLDERS`
- 10% of users get early access
- Monitor errors and performance
- Collect user feedback via survey

### Phase 3: General Availability (Week 4)
- Remove feature flag
- Announce feature to all users
- Provide documentation and tutorial

### Phase 4: Iteration (Ongoing)
- Monitor usage metrics
- Fix bugs
- Plan next iteration (nested folders, sharing, automation)

---

## Dependencies

**Upstream**:
- Feature 001-legal-summaries (legal_processes table)
- Supabase Auth (user isolation via RLS)

**Downstream**:
- None (standalone feature)

**External**:
- Supabase (database, auth, realtime)
- React 19+ (UI components)
- Motion (micro-animations, optional)

---

## Timeline

| Phase | Duration | Tasks | Dependencies |
|-------|----------|-------|--------------|
| Phase 1: Database & RLS | 3-5 hours | Migration, type definitions | None |
| Phase 2: Custom Hooks | 10-12 hours | useFolders, useFolderContents, useFolderSearch | Phase 1 complete |
| Phase 3: Component Integration | 7-10 hours | ProcessDetailsModal, ProcessUploadDrawer updates | Phase 2 complete |
| Phase 4: Testing & QA | 5-8 hours | Manual, RLS, real-time, accessibility testing | Phase 3 complete |
| Phase 5: Documentation | 2-3 hours | Finalization, CLAUDE.md update | Phase 4 complete |

**Total Estimate**: ~28-38 hours (~1 week for 1-2 developers)

**Significant Reduction**: From original 3-4 weeks to ~1 week due to reusing existing UI screens instead of building new components

---

## Earlier Timeline (Original, Pre-Scope Adjustment)

**Note**: Previous estimate of 3-4 weeks reflected building new UI components. Revised scope reuses existing UI infrastructure, reducing delivery time by 60%.

---

## Feature Flags (Config)

```typescript
// src/config/features.ts
export const FEATURES = {
  PROCESS_FOLDERS: {
    enabled: process.env.VITE_ENABLE_PROCESS_FOLDERS === 'true',
    rolloutPercentage: 10, // Phase 2: 10% of users
  },
};
```

Usage in component:
```typescript
{FEATURES.PROCESS_FOLDERS.enabled && <FolderGrid folders={folders} />}
```

---

## Marketing & Communication

### In-App Education
- Tooltip on "Pastas" tab: "Organize your processes by client, type, or project"
- Empty state message: "No folders yet. Create your first folder to get started."
- Help link: Opens dedicated help article

### User Documentation
- Blog post: "Better Organize Your Legal Processes with Folders"
- Video tutorial: 2-3 mins showing folder creation and process linking
- Help center article: Step-by-step guide for all folder operations

### Support Communications
- Email to all users: "New Feature: Process Folders"
- In-app banner (dismissible): "Try the new Folders feature to organize your processes"
- Slack/Discord announcement (if applicable)

---

## Post-Launch Support

- Monitor support tickets related to folders
- Answer common questions (FAQ)
- Collect user requests for future iterations
- Plan improvements based on usage patterns

---

## Future Roadmap (Out of Scope for 002)

1. **Nested Folders** (Q3 2026): Folders within folders for deeper organization
2. **Folder Sharing** (Q3 2026): Share folders with team members
3. **Automation Rules** (Q4 2026): Auto-organize processes based on rules (e.g., "archive finished cases in Arquivados")
4. **Bulk Operations** (Q4 2026): Move multiple processes to folder in one action
5. **Folder Templates** (2027): Predefined folder structures for common workflows

---

## Sign-Off

- **Product Manager**: __________ Date: __________
- **Engineering Lead**: __________ Date: __________
- **UX Lead**: __________ Date: __________

---

**Version**: 1.0  
**Last Updated**: 2026-03-24
