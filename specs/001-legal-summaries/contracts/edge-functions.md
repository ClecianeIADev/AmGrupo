# Edge Function Contracts: Legal Process Summaries

**Feature**: 001-legal-summaries
**Runtime**: Deno (Supabase Edge Functions)

---

## `analyze_legal_process`

**Path**: `POST /functions/v1/analyze_legal_process`
**Purpose**: Downloads a legal document from Supabase Storage, sends it to Gemini for extraction, and persists all results to `legal_processes`.

### Authorization
```
Authorization: Bearer <supabase_jwt>   (required — user JWT from session)
```
The function validates the JWT, resolves `auth.uid()`, and verifies the process belongs to the caller before processing.

### Request Body
```jsonc
{
  "process_id": "uuid"   // ID of the legal_processes row (status must be 'pending')
}
```

### Successful Response `200`
```jsonc
{
  "success": true,
  "process_id": "uuid",
  "status": "completed"    // or "needs_review" if confidence < 0.7
}
```

### Error Responses

| Status | Body | When |
|--------|------|------|
| `401` | `{"error": "Unauthorized"}` | Missing or invalid JWT |
| `403` | `{"error": "Forbidden"}` | Process belongs to another user |
| `404` | `{"error": "Process not found"}` | process_id does not exist |
| `409` | `{"error": "Process already processing or completed"}` | Status is not 'pending' |
| `422` | `{"error": "Unsupported file format: {mime}"}` | DOCX conversion failed or unknown MIME |
| `500` | `{"error": "Internal server error"}` | Gemini API failure, Storage download failure |

### Internal Flow
```
1. Validate JWT → get user_id
2. Fetch legal_processes row WHERE id = process_id AND user_id = caller
3. Set status = 'processing'
4. Download document bytes from Supabase Storage (admin client signed URL)
5. If DOCX → convert to PDF bytes (server-side)
6. Build Gemini 1.5 Flash request with inline_data parts + structured prompt
7. Parse JSON response from Gemini
8. UPSERT all extracted fields to legal_processes
9. Set status = 'completed' OR 'needs_review' (confidence < 0.7)
10. On any error → set status = 'error', status_message = error detail
```

---

## Frontend Invocation (client-side contract)

```typescript
// Called after successful file upload to Supabase Storage
const { data, error } = await supabase.functions.invoke('analyze_legal_process', {
  body: { process_id: newProcess.id }
});
```

The frontend does NOT poll — it subscribes via Supabase Realtime:

```typescript
const channel = supabase
  .channel(`process-${processId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'legal_processes',
    filter: `id=eq.${processId}`
  }, (payload) => {
    const updated = payload.new as LegalProcess;
    setProcess(updated);
    if (['completed', 'needs_review', 'error'].includes(updated.status)) {
      channel.unsubscribe();
    }
  })
  .subscribe();
```

---

## `get_user_provider_token` (existing RPC — no changes)

Already implemented in `supabase/migrations/20260317000000_add_get_user_provider_token.sql`. Not used by this feature but documented for completeness.

---

## Supabase Client Contracts (direct — no Edge Function)

These operations use the RLS-protected Supabase client directly (no Edge Function needed):

### List user's processes
```typescript
const { data } = await supabase
  .from('legal_processes')
  .select('id, process_name, process_number, professional_role, status, created_at, extraction_confidence')
  .order('created_at', { ascending: false });
```

### Get single process detail
```typescript
const { data } = await supabase
  .from('legal_processes')
  .select('*')
  .eq('id', processId)
  .single();
```

### Create process record (before upload)
```typescript
const { data: process } = await supabase
  .from('legal_processes')
  .insert({
    user_id: session.user.id,
    document_path: storagePath,
    document_name: file.name,
    document_mime_type: file.type,
    professional_role: selectedRole,
    status: 'pending'
  })
  .select()
  .single();
```

### Delete process (and cascade storage cleanup)
```typescript
// 1. Delete storage object
await supabase.storage.from('legal-documents').remove([process.document_path]);
// 2. Delete DB row (cascades via RLS)
await supabase.from('legal_processes').delete().eq('id', processId);
```
