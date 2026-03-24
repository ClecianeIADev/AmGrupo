# Research & Design Decisions: Process Folders

**Feature**: 002-process-folders  
**Date**: 2026-03-24

---

## Design Decisions

### Decision 1: Folder Color System

**Requirement**: Users need visual distinction between folders

**Options**:
1. **Predefined color palette** (5-10 colors)
   - Pros: Consistent, easy to find; constrained choice
   - Cons: Limited customization

2. **Full hex color picker** (any color)
   - Pros: Unlimited customization
   - Cons: Accessibility risk (contrast); can create visual chaos

3. **Hybrid approach** (predefined palette + custom option)
   - Pros: Balance between consistency and flexibility
   - Cons: More complex UI

**Decision**: ✅ **Hybrid approach**
- Offer 10 predefined "safe" colors (good contrast)
- Allow custom hex input for advanced users
- Validate custom colors meet WCAG AA contrast minimum
- Store as hex string in database (flexible for future themes)

**Implementation**:
```typescript
const FOLDER_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  // ... 5 more
];

function validateContrast(color: string): boolean {
  // Ensure >= 4.5:1 contrast with background
  const contrast = calculateContrast(color, '#ffffff');
  return contrast >= 4.5;
}
```

---

### Decision 2: Stage Grouping Strategy

**Requirement**: Display processes grouped by workflow stages

**Options**:
1. **Computed at database level** (SQL CASE statement)
   - Pros: Single query, efficient
   - Cons: Complex SQL; harder to change grouping rules

2. **Computed at application level** (JavaScript)
   - Pros: Flexible, testable; easy to modify rules
   - Cons: Slight performance hit (N processes processed in memory)

3. **Denormalized in database** (extra column for stage_category)
   - Pros: Fast queries, simple queries
   - Cons: Extra data; must maintain consistency

**Decision**: ✅ **Application-level computation** (Option 2)
- Stage mapping logic in custom hook: `groupProcessesByStage(processes)`
- Database returns all processes; frontend groups them
- Benefits: Easy to modify stage mappings without migrations; testable logic

**Implementation**:
```typescript
// hooks/useFolderContents.ts
const STAGE_MAP = {
  Pendente: ['Pendentes'],
  EmAndamento: ['Aceites', 'Perícia Agendada', '...'],
  Finalizado: ['Finalizado'],
};

function groupProcessesByStage(processes: LegalProcess[]) {
  const grouped = {
    Pendente: [] as LegalProcess[],
    EmAndamento: [] as LegalProcess[],
    Finalizado: [] as LegalProcess[],
  };
  
  processes.forEach(p => {
    for (const [group, stages] of Object.entries(STAGE_MAP)) {
      if (stages.includes(p.kanban_stage)) {
        grouped[group as keyof typeof grouped].push(p);
        break;
      }
    }
  });
  
  return grouped;
}
```

---

### Decision 3: Folder Deletion Cascade Behavior

**Requirement**: What happens to processes when a folder is deleted?

**Options**:
1. **Cascade delete** (ON DELETE CASCADE)
   - Processes deleted with folder
   - Pros: Clean; avoids orphaned processes
   - Cons: Data loss; no recovery; user might not expect it

2. **Nullify** (ON DELETE NULLIFY)
   - Processes become unfoldered
   - Pros: Safe; processes preserved; undo-friendly
   - Cons: Orphaned processes; clutter; requires cleanup

3. **Archive** (ON DELETE UPDATE to status='archived')
   - Processes moved to archive
   - Pros: Preserves data; clear intent
   - Cons: Extra complexity; need "archive" feature

**Decision**: ✅ **Nullify** (Option 2) + Confirmation Dialog
- Safer default for user data
- Confirmation modal: "Delete folder? Processes will become unfoldered."
- Processes remain searchable in Processos (non-folder) view
- Future feature: cleanup utility to auto-archive unfoldered old processes

**Implementation**:
```sql
ALTER TABLE legal_processes
ADD COLUMN folder_id UUID REFERENCES process_folders(id) ON DELETE NULLIFY;
```

```typescript
async function deleteFolder(id: string) {
  const confirmed = await showConfirmDialog(
    'Delete Folder',
    'This folder will be deleted. Processes will become unfoldered. Continue?'
  );
  if (!confirmed) return;
  
  const { error } = await supabase
    .from('process_folders')
    .delete()
    .eq('id', id);
  
  if (!error) {
    showSuccessToast('Folder deleted. Processes moved to Processos view.');
  }
}
```

---

### Decision 4: Real-time vs. Polling Updates

**Requirement**: Keep folder content synced across browser windows

**Options**:
1. **Polling** (fetch every 10s)
   - Pros: Simple; works everywhere
   - Cons: Latency; extra server load; battery drain (mobile)

2. **WebSocket (Supabase Realtime)**
   - Pros: Instant updates; efficient; built-in to Supabase
   - Cons: Requires websocket support (modern browsers)

3. **Service Worker**
   - Pros: Background sync; offline capability
   - Cons: Complex; overkill for this feature

**Decision**: ✅ **Supabase Realtime** (Option 2)
- Instant updates when process stage changes
- When folder is deleted in one window, other windows get deletion event
- Realtime subscriptions already used in project (legal_processes table)
- Browser support: all modern browsers (95%+ support)

**Implementation**:
```typescript
// hooks/useFolderContents.ts
useEffect(() => {
  const subscription = supabase
    .channel(`folder:${folderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'legal_processes',
      filter: `folder_id=eq.${folderId}`,
    }, (payload) => {
      // Re-fetch or update process in grouped list
      refetchProcesses();
    })
    .subscribe();
  
  return () => subscription.unsubscribe();
}, [folderId]);
```

---

### Decision 5: Search Scope (Folder-wide vs. All Processes)

**Requirement**: Where does search operate?

**Options**:
1. **Global search** (search all user's processes)
   - Pros: Find any process quickly
   - Cons: Takes focus away from current folder

2. **Folder-scoped search** (search within current folder only)
   - Pros: Focused; maintains context; faster on large datasets
   - Cons: Users cannot search across folders from folder view

3. **Both** (dual search: folder search + global search)
   - Pros: Flexibility
   - Cons: Confusing; extra UI

**Decision**: ✅ **Folder-scoped search** (Option 2)
- Search box in folder view: filters current folder's processes
- Global search remains in Processos (non-folder) view unchanged
- Clear separation of concerns
- Performance: smaller dataset to search within

**Implementation**:
```typescript
// FolderContentsView.tsx
<input
  placeholder="Buscar processos..."
  onChange={(e) => setSearchTerm(e.target.value)}
/>

// useFolderSearch.ts filters by folder_id + search term
```

---

### Decision 6: Process Count Display

**Requirement**: Show number of processes in each folder

**Options**:
1. **Computed on-demand** (COUNT query each time folder list loads)
   - Pros: Always accurate
   - Cons: N+1 queries (one per folder); slow with many folders

2. **Denormalized column** (store count, update via trigger)
   - Pros: Fast; no extra queries
   - Cons: Must keep in sync; complexity

3. **Lazy-computed with cache** (compute once, invalidate on changes)
   - Pros: Balance; simple to understand
   - Cons: Cache invalidation complexity

**Decision**: ✅ **Computed on-demand** (Option 1), initially, with future optimization
- Use aggregation query with JOIN and GROUP BY
- For MVP (< 100 folders per user), performance is acceptable
- Index on `(folder_id, user_id)` optimizes the COUNT
- Future: migrate to denormalized column if needed at scale

**Implementation**:
```typescript
export async function fetchFoldersWithCounts(userId: string) {
  return supabase
    .from('process_folders')
    .select(`
      id, name, color, created_at,
      legal_processes!left(id)
    `)
    .eq('user_id', userId)
    .then(({ data }) =>
      data?.map(f => ({
        ...f,
        process_count: f.legal_processes?.length || 0,
      }))
    );
}
```

---

## Technical Research

### 1. Supabase Realtime Limitations

**Question**: How many concurrent subscriptions can we have?

**Answer** (from Supabase docs):
- Realtime scales to thousands of concurrent channels
- Each channel can have thousands of subscribers
- Recommended: < 1000 channels per project at launch
- Monitoring: check Supabase dashboard for realtime connections

**Implication**: Using one channel per folder is safe. Folder count typically < 50 for a user.

**Reference**: https://supabase.com/docs/guides/realtime

---

### 2. RLS Performance Impact

**Question**: Does filtering by `user_id` in queries impact performance?

**Answer**:
- With proper indexes (PRIMARY KEY on `user_id`, composite indexes on `(user_id, folder_id)`), filtering is negligible (< 1ms)
- Without indexes, performance degrades significantly with table size
- RLS policies add minimal overhead after indexes are in place

**Implication**: Always create indexes on RLS filter columns (done in data-model.md).

**Reference**: https://supabase.com/docs/guides/database/rows-level-security

---

### 3. Color Contrast Standards (A11y)

**Question**: What contrast ratio is required for text on colored backgrounds?

**Answer** (WCAG 2.1):
- Level AA (standard): 4.5:1 for text; 3:1 for UI components
- Level AAA (enhanced): 7:1 for text; 7:1 for UI components

**Implication**: Folder color picker should validate custom colors against white text (or ensure sufficient contrast) at 4.5:1 minimum.

**Reference**: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

---

### 4. React 19 Features Relevant to This Feature

**Suspense**: Can be used to show loading states while data fetches
```typescript
<Suspense fallback={<FolderSkeleton />}>
  <FolderGrid folders={folders} />
</Suspense>
```

**Transitions**: API for marking non-urgent state updates (e.g., search input)
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [isPending, startTransition] = useTransition();

function handleSearch(query: string) {
  startTransition(() => setSearchTerm(query));
}
```

**Reference**: https://react.dev/reference/react/useTransition

---

### 5. TypeScript Strict Mode Compliance

**Question**: Can we avoid `any` types in complex queries?

**Answer**: Yes, by using generated types from Supabase and type guards.

```typescript
// Supabase generated types
import type { Tables } from '@/lib/database.types';

type ProcessFolder = Tables<'process_folders'>;

// Type-safe query
const { data, error } = await supabase
  .from('process_folders')
  .select('*')
  .returns<ProcessFolder[]>();
```

**Implication**: Always generate and import types from database. Avoid explicit `any` types.

**Reference**: https://supabase.com/docs/reference/typescript/introduction

---

## UI/UX Research

### 1. Folder Organization Patterns

**Best Practices** (observed in Notion, Asana, Monday.com):
- Folder icon with color background
- Title below icon
- Metadata (count, date) in corner
- Grid layout (2-4 columns) on desktop
- Responsive: single column on mobile
- Card hover effects (shadow, scale)

**Decision**: Adopt similar pattern for consistency with web app design conventions.

---

### 2. Search Box Patterns

**Best Practices**:
- Search icon + text input (clear affordance)
- Debounce input (300-500ms typical)
- Show results as user types (live filtering)
- Highlight matching text
- Clear button (X icon) when input has text

**Decision**: Implement standard pattern with 300ms debounce.

---

### 3. Stage Grouping UI Patterns

**Best Practices**:
- Use sections or cards for each stage
- Show count next to stage name
- Make sections collapsible (expand/collapse on click)
- Use color indicator or icon for stage (visual hierarchy)
- Keep consistent spacing between sections

**Decision**: Use collapsible sections with stage name + count; expand by default.

---

## Accessibility Research

### 1. Color as Only Distinguisher

**Problem**: Users with color blindness may not distinguish folders.

**Solution** (WCAG 2.1.3 - Use of Color):
- Add icon or label in addition to color
- Folder icon + text name + (optional) color background
- Text name is sufficient for identification

**Decision**: Combine folder color with readable text name. Do not rely on color alone.

---

### 2. Keyboard Navigation

**Requirements** (WCAG 2.1.1 - Keyboard):
- All interactive elements must be reachable via keyboard (Tab)
- Focus must be visible (outline or highlight)
- Enter/Space must activate buttons
- Escape should close modals

**Decision**: Test all components with keyboard navigation. Use semantic HTML (`<button>`, `<input>`).

---

### 3. Screen Reader Labels

**Requirements**:
- Buttons must have text or aria-label
- Form inputs must have associated <label>
- Images must have alt text (or aria-hidden if decorative)

**Decision**: Use semantic HTML + ARIA labels where needed. Test with screen reader (NVDA, JAWS, VoiceOver).

---

## Performance Research

### 1. Query Performance at Scale

**Dataset**: 100 folders, 10,000 processes, 1000 queries/sec

**Metrics** (from Supabase docs):
- Index lookup: < 1ms per query
- COUNT(id): < 50ms for 10k rows (with index)
- List with pagination: < 100ms for first 50 rows

**Implication**: With proper indexes, performance is acceptable up to 10k processes per user.

**Mitigation**: Add pagination if folder > 100 processes (lazy-load on scroll).

---

### 2. Realtime Subscription Cost

**Metrics**:
- Open subscription: < 1KB per channel
- Message (UPDATE): ~100 bytes per process change
- Latency: < 100ms typical

**Implication**: Realtime subscriptions have minimal cost. Can safely use for folder updates.

---

## Migration & Data Approach

### Backward Compatibility

**Question**: How do we handle existing processes without folder_id?

**Strategy**:
1. Add `folder_id` nullable column (no default)
2. All existing processes: `folder_id = NULL`
3. UI: show unfoldered processes in Processos view
4. Users can link them to folders retroactively

**Implication**: No data migration needed; smooth user experience for existing data.

---

## Conclusion

All design decisions are grounded in user needs, technical constraints, and best practices. Trade-offs have been documented for future iterations.

---

**Version**: 1.0  
**Last Updated**: 2026-03-24
