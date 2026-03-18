# Research: Legal Process Summaries

**Feature**: 001-legal-summaries
**Date**: 2026-03-17
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## R-001: AI Engine for Document Extraction

**Decision**: Google Gemini via Supabase Edge Function (Deno)
**Rationale**: `@google/genai` is already a project dependency. Gemini 1.5 Pro/Flash supports multimodal PDF+image input natively. Per constitution Principle V, all external API calls must live in Edge Functions — the frontend never calls Gemini directly. The Edge Function receives only the Supabase Storage path, fetches the file using the service role key, and sends the bytes to Gemini.
**Alternatives Considered**:
- OpenAI GPT-4o: Not in project dependencies; would require separate API key management.
- Server-side OCR (Tesseract): Too low-level; lacks semantic extraction for legal entities.

**Implementation**:
```
supabase/functions/analyze_legal_process/index.ts
  1. Validate user JWT (authHeader)
  2. Download document from Supabase Storage via adminClient (signed URL)
  3. Convert to base64 and send to Gemini 1.5 Flash with structured extraction prompt
  4. Parse JSON response and UPSERT to legal_processes
  5. Update status → 'completed' | 'needs_review' | 'error'
```

---

## R-002: File Storage Strategy

**Decision**: Supabase Storage bucket `legal-documents` (private, RLS-enforced)
**Rationale**: Supabase Storage integrates natively with Supabase Auth. Private bucket prevents direct public URL access. Signed URLs (expiry 1h) are generated server-side for reading. Path pattern: `{user_id}/{process_id}/{filename}` enforces ownership at path level, complementing RLS.
**Alternatives Considered**:
- Storing file as base64 in PostgreSQL: Exceeds DB column limits for large PDFs; performance degradation.
- External S3: Unnecessary complexity; Supabase Storage is already available.

**Storage Policy**:
```sql
-- Upload: users can only insert into their own prefix
CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'legal-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Read: users can only read their own files
CREATE POLICY "Users read own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'legal-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## R-003: JSON Schema for AI-Extracted Data

**Decision**: Store extracted arrays as JSONB columns in `legal_processes`; single table avoids premature normalization for MVP.
**Rationale**: The data is read-heavy and always loaded together (a process view shows all sections simultaneously). JSONB with GIN index supports future full-text search. Normalization into separate tables (parties, quesitos, events) adds join complexity with no current query benefit. This can be refactored post-MVP if filtering across processes by party/quesito is required.
**Alternatives Considered**:
- Separate tables per entity: Better for querying across processes (e.g., "find all processes with party X"), but overkill for MVP single-process view.
- Single TEXT JSON column: Loses Postgres JSONB indexing, operators, and schema validation.

---

## R-004: Extraction Processing Model

**Decision**: Asynchronous processing via Edge Function invoked client-side; status polling via Supabase Realtime.
**Rationale**: Gemini extraction for a 200-page PDF takes up to 5 minutes (SC-002). The frontend invokes `analyze_legal_process` and subscribes to the process row via `supabase.channel()` to receive status updates (`pending → processing → completed/error`). This avoids blocking the UI and aligns with the user-informed 5-minute expectation (FR-003).
**Alternatives Considered**:
- Supabase pg_cron / background worker: Not available in Supabase free/pro without Postgres extensions.
- Webhook callback: Requires a public endpoint; overcomplicated vs. Realtime subscription.

---

## R-005: Supported Formats & Gemini Input

**Decision**: PDF (primary), DOCX, JPG, PNG, scanned images — all converted to inline Gemini parts.
**Rationale**: Gemini 1.5 Flash accepts PDF and image MIME types directly as inline base64 parts. DOCX requires server-side conversion to PDF before sending (mammoth or Deno-compatible converter in the Edge Function).
**Format handling**:
- `application/pdf` → send directly as inline_data
- `image/jpeg`, `image/png` → send directly as inline_data
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` → convert to PDF via Edge Function before sending

---

## R-006: RLS & Multi-Tenancy

**Decision**: Row Level Security on `legal_processes` with `user_id = auth.uid()` predicate; storage policies mirroring the same.
**Rationale**: Constitution Principle III (NON-NEGOTIABLE). All four DML operations (SELECT, INSERT, UPDATE, DELETE) are restricted. The `user_id` column has a NOT NULL constraint and a FK to `auth.users`. No cross-user query is possible, even with a compromised anon key.

---

## R-007: Gemini Prompt Structure

**Decision**: Single structured extraction prompt requesting JSON output with all required fields.

```
Extract from this Brazilian legal document and return valid JSON matching this schema:
{
  "process_name": string,
  "process_number": string,
  "parties": [{name, role, representative}],
  "executive_summary": string,
  "process_summary": string,
  "events_timeline": [{date, event, outcome}],
  "quesitos": [{party, text, source_page}],
  "relevant_documents": [{name, type, category, date, parties, summary}],
  "suggested_examinations": [{name, justification, priority}],
  "critical_dates": [{date, description, type}],
  "extraction_confidence": float 0-1,
  "extraction_errors": [string]
}
```

**Rationale**: Single-pass extraction minimizes API calls and cost. JSON mode (response_mime_type: "application/json") ensures parseable output.
