# Edge Functions Contracts: Process Folders

**Feature**: 002-process-folders  
**Date**: 2026-03-24

---

## Overview

The process folders feature primarily uses existing infrastructure (Supabase client-side queries). Most operations are direct database interactions via RLS. This document specifies any Edge Functions needed for server-side operations or integrations.

---

## Existing Edge Functions (No Changes Required)

### 1. `analyze_legal_process` (Feature 001-legal-summaries)

**Current Usage**: Triggered after process file upload → Creates legal_process record → AI analysis

**Modification for Feature 002**: 
- Accept optional `folder_id` in payload
- If `folder_id` provided, link newly created process to folder via UPDATE

**Updated Function Signature**:

```typescript
// supabase/functions/analyze_legal_process/index.ts

export interface AnalyzeLegalProcessRequest {
  userId: string;
  fileName: string;
  fileUrl: string;
  documentMimeType: string;
  professionalRole: 'Perito' | 'Assistente Técnico' | 'Advogado' | 'Outro';
  folderId?: string; // NEW: optional folder context
}

export interface AnalyzeLegalProcessResponse {
  processId: string;
  status: 'processing' | 'error';
  message: string;
  folderId?: string; // NEW: echo back folder assignment
}
```

**Implementation Changes**:

```typescript
// Inside analyze_legal_process function:

// 1. Create process record (existing logic)
const { data: process, error: processError } = await supabase
  .from('legal_processes')
  .insert({
    user_id: userId,
    document_path: storagePath,
    document_name: fileName,
    document_mime_type: documentMimeType,
    professional_role: professionalRole,
    status: 'pending',
    folder_id: folderId || null, // NEW: set folder_id if provided
  })
  .select()
  .single();

// 2. Trigger AI analysis (existing logic)
// ...

// 3. Return response with folder info
return new Response(
  JSON.stringify({
    processId: process.id,
    status: 'processing',
    message: 'Analysis started',
    folderId: folderId || null, // NEW: echo folder association
  }),
  { status: 200 }
);
```

**Backward Compatibility**: ✅ Yes - `folderId` is optional; existing calls without it work unchanged.

---

## New Edge Functions (If Needed in Future)

### Candidate 1: `bulk_link_processes_to_folder` (Future Feature)

**Use Case**: Link multiple processes to a folder in one operation (not in current scope, but documented for reference)

```typescript
export interface BulkLinkRequest {
  folderIds: string[];
  processIds: string[];
}

export interface BulkLinkResponse {
  successCount: number;
  failureCount: number;
  errors: Array<{ processId: string; error: string }>;
}

// Pseudo-implementation (DO NOT IMPLEMENT YET):
export async function bulkLinkProcessesToFolder(req: BulkLinkRequest) {
  // Validate user ownership of all folders
  // Validate user ownership of all processes
  // Bulk UPDATE legal_processes SET folder_id = ...
  // Return summary
}
```

**Status**: Out of scope for 002-process-folders. Include only if bulk operations added to requirements later.

---

## Client-Side Operations (No Edge Function Needed)

The following operations are handled directly by the frontend via Supabase client (RLS ensures security):

### Folder CRUD

```typescript
// Create folder
supabase
  .from('process_folders')
  .insert({ name: 'Client XYZ', color: '#3b82f6' })
  .select();

// List folders
supabase
  .from('process_folders')
  .select('*')
  .order('created_at', { ascending: false });

// Update folder
supabase
  .from('process_folders')
  .update({ name: 'New Name', color: '#8b5cf6' })
  .eq('id', folderId);

// Delete folder
supabase
  .from('process_folders')
  .delete()
  .eq('id', folderId);
```

### Process-Folder Linking

```typescript
// Link process to folder
supabase
  .from('legal_processes')
  .update({ folder_id: folderId })
  .eq('id', processId);

// Unlink process from folder
supabase
  .from('legal_processes')
  .update({ folder_id: null })
  .eq('id', processId);

// List processes in folder
supabase
  .from('legal_processes')
  .select('*')
  .eq('folder_id', folderId)
  .order('kanban_stage', { ascending: true })
  .order('created_at', { ascending: false });
```

### Search Operations

```typescript
// Search folders by name
supabase
  .from('process_folders')
  .select('*')
  .ilike('name', `%${query}%`)
  .order('created_at', { ascending: false });

// Search processes in folder by name or number
supabase
  .from('legal_processes')
  .select('*')
  .eq('folder_id', folderId)
  .or(`process_name.ilike.%${query}%,process_number.ilike.%${query}%`)
  .order('created_at', { ascending: false });
```

All queries automatically respect RLS policies (filter by user_id).

---

## Data Flow Diagram

```
Frontend (ProcessUploadDrawer)
  ↓
  | folderId?: string
  ↓
POST /functions/v1/analyze_legal_process
  └─ Payload includes folderId
  ↓
Edge Function (analyze_legal_process)
  ├─ Validate user owns process
  ├─ Create legal_processes record with folder_id
  ├─ Trigger AI analysis via Gemini
  └─ Return { processId, folderId }
  ↓
Frontend receives response
  ├─ Update UI: process now linked to folder
  └─ Realtime subscription notifies other clients
```

---

## Testing Edge Functions

### Local Testing (Supabase CLI)

```bash
# Start local Supabase
supabase start

# Deploy Edge Function locally
supabase functions deploy analyze_legal_process --no-verify-jwt

# Test with curl (using service role key from supabase/config.toml)
curl -X POST http://localhost:54321/functions/v1/analyze_legal_process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -d '{
    "userId": "test-user-id",
    "fileName": "test.pdf",
    "fileUrl": "storage/path/...",
    "documentMimeType": "application/pdf",
    "professionalRole": "Perito",
    "folderId": "optional-folder-id"
  }'
```

### Staging Testing

```bash
# Deploy to staging environment
supabase functions deploy analyze_legal_process --project-ref=staging

# Test in browser against staging Supabase
# Create process upload, provide folderId, verify folder association
```

---

## Error Handling

### Edge Function Error Cases

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Missing userId | 400 | `{ error: "userId required" }` |
| Invalid folderId | 400 | `{ error: "folder not found or unauthorized" }` |
| File upload fails | 500 | `{ error: "file upload failed", details: "..." }` |
| AI analysis fails | 202 | `{ status: "processing_error", message: "..." }` |
| RLS policy blocks update | 403 | `{ error: "unauthorized" }` |

### Client-Side Handling (Frontend)

```typescript
try {
  const response = await supabase.functions.invoke('analyze_legal_process', {
    body: { userId, fileName, fileUrl, folderId, ... },
  });
  if (response.error) {
    // Handle error: show user-friendly message
    showErrorToast(`Failed to create process: ${response.error.message}`);
  } else {
    // Success: process created and linked
    showSuccessToast('Process created and linked to folder');
  }
} catch (err) {
  // Network error or function unavailable
  showErrorToast('Unable to reach server, please try again');
}
```

---

## Security Considerations

### RLS Enforcement
- All folder queries must include `user_id = auth.uid()` filter
- Edge Function must validate `user_id` from JWT and not trust client input
- Processes can only be linked to folders owned by the authenticated user

### Input Validation
- Folder name: max 100 chars, no null bytes
- Folder color: validate hex format (#RRGGBB) or CSS color names
- Process ID & Folder ID: validate UUID format
- Search query: limit to 100 chars, escape special characters

### Rate Limiting
- Consider rate limiting folder creation (e.g., 10 per minute per user)
- Consider rate limiting search (e.g., 30 query per minute per user)
- Implemented via supabase-js middleware or API gateway

---

## Monitoring & Observability

### Key Metrics (if Edge Function added)

```typescript
// Log process-folder linkage
console.log({
  event: 'process_folder_linked',
  userId,
  processId,
  folderId,
  timestamp: new Date().toISOString(),
});

// Monitor errors
console.error({
  error: 'folder_linkage_failed',
  userId,
  processId,
  folderId,
  reason: err.message,
});
```

### Deno Logs

Accessible in Supabase Dashboard → Functions → Logs

---

## Versioning & Backward Compatibility

**Version**: 1.0 (2026-03-24)

**Compatibility Statement**:
- Feature 002-process-folders is compatible with existing Edge Functions
- `folderId` parameter in `analyze_legal_process` is optional and backward-compatible
- No breaking changes to existing APIs
- No version bump required for analyze_legal_process function

---

**Document Status**: Ready for Implementation  
**Last Updated**: 2026-03-24
