// Edge Function: analyze_legal_process
// Feature: 001-legal-summaries
// Flow:
//   1. Validate JWT → get caller user_id
//   2. Fetch process row (must belong to caller, status must be 'pending')
//   3. Transition status to 'processing'
//   4. Download document bytes from Storage via signed URL
//   5. Send to Gemini 1.5 Flash with structured JSON extraction prompt
//   6. Persist extracted fields and set status to 'completed' or 'needs_review'
//   7. On any failure: set status to 'error' with message

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map((o: string) => o.trim()).filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
    const origin = req.headers.get('Origin') ?? '';
    const allowedOrigin = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowedOrigin || '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Vary': 'Origin',
    };
}

function json(body: unknown, status: number, req: Request): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
}

const EXTRACTION_PROMPT = `You are a Brazilian legal document analysis expert. Extract structured information from this legal document and return ONLY valid JSON matching this exact schema. Do not include any text outside the JSON object.

{
  "process_name": "descriptive name of the legal case (string)",
  "process_number": "official process number in format NNNNNNN-NN.NNNN.N.NN.NNNN if found (string or null)",
  "parties": [{"name": "string", "role": "string", "representative": "string or null"}],
  "executive_summary": "2-3 paragraph executive summary in Portuguese (string)",
  "process_summary": "detailed process summary in Portuguese covering timeline and key facts (string)",
  "events_timeline": [{"date": "YYYY-MM-DD or partial date string", "event": "string", "outcome": "string or null"}],
  "quesitos": [{"party": "string", "text": "full text of the quesito (string)", "source_page": "page number or null"}],
  "relevant_documents": [{"name": "string", "type": "string", "category": "string", "date": "date string or null", "parties": ["string"], "summary": "string"}],
  "suggested_examinations": [{"name": "string", "justification": "string", "priority": "high|medium|low"}],
  "critical_dates": [{"date": "YYYY-MM-DD or partial date string", "description": "string", "type": "deadline|hearing|filing|other"}],
  "extraction_confidence": 0.85,
  "extraction_errors": ["list any fields that could not be reliably extracted"]
}

Important: All text fields must be in Brazilian Portuguese. Dates should use ISO 8601 format when possible.`;

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: getCorsHeaders(req) });
    }

    // ── T017: JWT validation ──────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Missing or invalid Authorization header' }, 401, req);
    }
    const jwt = authHeader.slice(7);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

    // Caller client (respects RLS)
    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    // Admin client (bypasses RLS for status updates and storage)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await callerClient.auth.getUser(jwt);
    if (userError || !user) {
        return json({ error: 'Unauthorized' }, 401, req);
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let process_id: string;
    try {
        const body = await req.json();
        process_id = body.process_id;
        if (!process_id) throw new Error('Missing process_id');
    } catch {
        return json({ error: 'Invalid request body — process_id required' }, 400, req);
    }

    // ── T017: Ownership check ─────────────────────────────────────────────────
    const { data: process, error: fetchError } = await callerClient
        .from('legal_processes')
        .select('*')
        .eq('id', process_id)
        .single();

    if (fetchError || !process) {
        return json({ error: 'Process not found or access denied' }, 404, req);
    }

    // ── T018: Status guard ────────────────────────────────────────────────────
    if (process.status !== 'pending') {
        return json({ error: `Cannot analyze process in status '${process.status}'` }, 409, req);
    }

    // Transition to 'processing'
    const { error: processingError } = await adminClient
        .from('legal_processes')
        .update({ status: 'processing', status_message: null })
        .eq('id', process_id);

    if (processingError) {
        return json({ error: 'Failed to update process status' }, 500, req);
    }

    // Helper to mark as error and return
    async function failProcess(message: string, status: number): Promise<Response> {
        await adminClient
            .from('legal_processes')
            .update({ status: 'error', status_message: message })
            .eq('id', process_id);
        return json({ error: message }, status, req);
    }

    // ── T019: Document download ───────────────────────────────────────────────
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
        .from('legal-documents')
        .createSignedUrl(process.document_path, 120); // 2-minute expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
        return await failProcess('Failed to generate signed URL for document', 500);
    }

    let documentBytes: Uint8Array;
    try {
        const docResponse = await fetch(signedUrlData.signedUrl);
        if (!docResponse.ok) throw new Error(`HTTP ${docResponse.status}`);
        const buffer = await docResponse.arrayBuffer();
        documentBytes = new Uint8Array(buffer);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return await failProcess(`Failed to download document: ${message}`, 502);
    }

    // ── T020: Gemini extraction ───────────────────────────────────────────────
    // Convert bytes to base64
    let base64Document: string;
    try {
        // More efficient way to convert Uint8Array to base64 in Deno/Standard JS
        const binary = String.fromCharCode(...documentBytes);
        base64Document = btoa(binary);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return await failProcess(`Failed to encode document: ${message}`, 500);
    }

    let extracted: Record<string, unknown>;
    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1, // Low temperature for factual extraction
            },
        });

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: process.document_mime_type,
                    data: base64Document,
                },
            },
            { text: EXTRACTION_PROMPT },
        ]);

        const responseText = result.response.text();
        extracted = JSON.parse(responseText);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return await failProcess(`Gemini extraction failed: ${message}`, 502);
    }

    // ── T021–T025: Validate + persist results ─────────────────────────────────
    const confidence = typeof extracted.extraction_confidence === 'number'
        ? Math.max(0, Math.min(1, extracted.extraction_confidence))
        : null;

    // Determine final status: needs_review if confidence < 0.6 or extraction_errors is non-empty
    const extractionErrors = Array.isArray(extracted.extraction_errors) ? extracted.extraction_errors : [];
    const finalStatus = (confidence !== null && confidence < 0.6) || extractionErrors.length > 0
        ? 'needs_review'
        : 'completed';

    const updatePayload: Record<string, unknown> = {
        status: finalStatus,
        status_message: finalStatus === 'needs_review'
            ? `Confiança de extração: ${Math.round((confidence ?? 0) * 100)}%. Revise os dados extraídos.`
            : null,
        process_name: extracted.process_name ?? null,
        process_number: extracted.process_number ?? null,
        executive_summary: extracted.executive_summary ?? null,
        process_summary: extracted.process_summary ?? null,
        parties: Array.isArray(extracted.parties) ? extracted.parties : [],
        events_timeline: Array.isArray(extracted.events_timeline) ? extracted.events_timeline : [],
        quesitos: Array.isArray(extracted.quesitos) ? extracted.quesitos : [],
        relevant_documents: Array.isArray(extracted.relevant_documents) ? extracted.relevant_documents : [],
        suggested_examinations: Array.isArray(extracted.suggested_examinations) ? extracted.suggested_examinations : [],
        critical_dates: Array.isArray(extracted.critical_dates) ? extracted.critical_dates : [],
        extraction_confidence: confidence,
        extraction_errors: extractionErrors,
    };

    const { error: updateError } = await adminClient
        .from('legal_processes')
        .update(updatePayload)
        .eq('id', process_id);

    if (updateError) {
        return await failProcess(`Failed to persist extraction results: ${updateError.message}`, 500);
    }

    // ── T026: Success response ────────────────────────────────────────────────
    return json({
        success: true,
        process_id,
        status: finalStatus,
        confidence,
    }, 200, req);
});
