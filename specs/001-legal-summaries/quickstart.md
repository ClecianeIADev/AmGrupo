# Quickstart: Legal Process Summaries

**Feature**: 001-legal-summaries

## Prerequisites

- Supabase project running (credentials in `.env`)
- `GEMINI_API_KEY` set as Supabase Edge Function secret (not in frontend)
- Node.js + npm for frontend dev
- Supabase CLI for migrations and function deployment

---

## 1. Apply the Database Migration

```bash
# From project root — apply the legal_processes table + RLS + storage policies
supabase db push

# Or manually run in Supabase SQL Editor:
# specs/001-legal-summaries/migration-reference.sql
```

## 2. Create the Supabase Storage Bucket

In the Supabase Dashboard → Storage → New Bucket:
- **Name**: `legal-documents`
- **Public**: OFF (private)
- **Max upload size**: 50MB
- **Allowed MIME types**: application/pdf, image/jpeg, image/png, image/webp, application/vnd.openxmlformats-officedocument.wordprocessingml.document

Then apply storage RLS policies from `data-model.md`.

## 3. Set Edge Function Secret

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
# Optional: restrict CORS to your production domain
supabase secrets set ALLOWED_ORIGINS=https://your-app.com
```

## 4. Deploy the Edge Function

```bash
supabase functions deploy analyze_legal_process
```

## 5. Run the Frontend

```bash
npm run dev
# Navigate to Juridico → Processos
```

---

## Development Flow

```
Upload PDF → Insert legal_processes (status: pending)
          → Invoke analyze_legal_process Edge Function
          → Subscribe to Realtime updates on the process row
          → UI polls status until 'completed' | 'needs_review' | 'error'
          → Open ProcessDetailsModal to see extracted summaries
```

## Testing the Edge Function Locally

```bash
supabase functions serve analyze_legal_process --env-file .env.local

curl -X POST http://localhost:54321/functions/v1/analyze_legal_process \
  -H "Authorization: Bearer <your_user_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"process_id": "<uuid-of-pending-process>"}'
```
