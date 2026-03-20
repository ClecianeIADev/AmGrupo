// Edge Function: analyze_legal_process
// Feature: 001-legal-summaries
// Flow:
//   1. Validate JWT → get caller user_id
//   2. Fetch process row (must belong to caller, status must be 'pending')
//   3. Transition status to 'processing'
//   4. Download document bytes from Storage via signed URL
//   5. Upload document to OpenAI Files API, call Chat Completions for extraction
//   6. Persist extracted fields and set status to 'completed' or 'needs_review'
//   7. On any failure: set status to 'error' with message

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

const EXAM_MODULE_NAMES = [
    'Observações Iniciais e Contexto Pericial',
    'Sinais Vitais e Medidas Antropométricas',
    'Inspeção Geral e Postural',
    'Inspeção e Exame do Aparelho Locomotor (Triagem Ortopédica)',
    'Palpação de Estruturas Relevantes',
    'Amplitude de Movimento (ADM) Articular',
    'Força Muscular (Escala MRC 0-5)',
    'Exame Neurológico',
    'Testes Provocativos e Manobras Especiais de Coluna/Quadril',
    'Testes de Joelho (se queixa em MMII)',
    'Avaliação Funcional e Capacidade Laboral',
    'Exame Cardiovascular (Triagem Pericial)',
    'Exame Respiratório (Triagem Pericial)',
];

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

IMPORTANT INSTRUCTIONS:

1. PARTIES: Always include the adjudicating court or tribunal as a party with role exactly "Órgão Julgador". For the plaintiff always use role "Autor" (or "Autora" for women). For the defendant always use role "Réu" (or "Ré" for women). Include representatives (lawyers) in the "representative" field.

2. SUGGESTED EXAMINATIONS: Analyze the nature of the legal dispute and suggest physical/medical examination modules whenever the process context could benefit from a medical expert assessment — even if no perícia has been performed yet. Suggest exams for processes involving ANY of the following:
   - Physical or psychological violence (domestic violence, assault, moral harassment, torture)
   - Personal injury or bodily harm (accidents, work accidents, occupational diseases)
   - Disability, sickness benefits (auxílio-doença, aposentadoria por invalidez, BPC/LOAS)
   - Pain and suffering / indemnification for physical or mental harm
   - Medical malpractice or healthcare disputes
   - Sexual abuse or exploitation
   - Child custody involving allegations of abuse or neglect
   - Conditions affecting physical or mental health capacity to work
   - Any claim where the physical or psychological condition of a person is relevant to the outcome

   Do NOT suggest exams for purely procedural or unrelated disputes (e.g., habeas corpus for illegal detention without physical harm allegations, property disputes, contract disputes, tax matters, pure administrative appeals).

   When suggesting, choose ONLY from this exact list of module names (use the exact name as written):
${EXAM_MODULE_NAMES.map(n => `   - "${n}"`).join('\n')}
   Choose the modules most relevant to the specific medical claims and injuries described in the process. Provide a specific justification based on the case facts for each module. If the process type genuinely does not involve any health/physical assessment, return an empty array.

3. All text fields must be in Brazilian Portuguese. Dates should use ISO 8601 format when possible.`;

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: getCorsHeaders(req) });
    }

    console.log(`[Debug] analyze_legal_process: Request received. Method: ${req.method}`);

    // ── T017: JWT validation ──────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Missing or invalid Authorization header' }, 401, req);
    }
    const jwt = authHeader.slice(7);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('CHAT-API-KEY')!;

    // Caller client (respects RLS — ownership enforced by user_id = auth.uid())
    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    // Admin client (bypasses RLS for status updates and storage)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

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
        console.log(`[Debug] Downloading document from: ${signedUrlData.signedUrl.substring(0, 50)}...`);
        const docResponse = await fetch(signedUrlData.signedUrl);
        if (!docResponse.ok) throw new Error(`HTTP ${docResponse.status}`);
        const buffer = await docResponse.arrayBuffer();
        documentBytes = new Uint8Array(buffer);
        console.log(`[Debug] Download successful. Bytes: ${documentBytes.length}`);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return await failProcess(`Failed to download document: ${message}`, 502);
    }

    // ── T020: OpenAI extraction (via raw fetch — no SDK dependency) ───────────
    // Upload document to OpenAI Files API
    let fileId = '';
    try {
        console.log(`[Debug] Uploading document to OpenAI Files API...`);
        const formData = new FormData();
        const fileBlob = new Blob([documentBytes.buffer as ArrayBuffer], { type: process.document_mime_type });
        formData.append('file', fileBlob, process.document_name);
        formData.append('purpose', 'user_data');

        const uploadRes = await fetch('https://api.openai.com/v1/files', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiApiKey}` },
            body: formData,
        });
        if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => ({}));
            throw new Error(err?.error?.message ?? `HTTP ${uploadRes.status}`);
        }
        const uploadData = await uploadRes.json();
        fileId = uploadData.id;
        console.log(`[Debug] File uploaded. ID: ${fileId}`);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return await failProcess(`Failed to upload document to OpenAI: ${message}`, 500);
    }

    let extracted: Record<string, unknown>;
    try {
        console.log(`[Debug] Sending to OpenAI Chat Completions (gpt-4o-mini)...`);
        const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'file', file: { file_id: fileId } },
                        { type: 'text', text: EXTRACTION_PROMPT },
                    ],
                }],
                response_format: { type: 'json_object' },
                temperature: 0.1,
            }),
        });
        if (!chatRes.ok) {
            const err = await chatRes.json().catch(() => ({}));
            throw new Error(err?.error?.message ?? `HTTP ${chatRes.status}`);
        }
        const chatData = await chatRes.json();
        const responseText = chatData.choices?.[0]?.message?.content ?? '';
        console.log(`[Debug] OpenAI response received. Length: ${responseText.length}`);
        extracted = JSON.parse(responseText);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return await failProcess(`OpenAI extraction failed: ${message}`, 502);
    } finally {
        // Always clean up the uploaded file
        if (fileId) {
            await fetch(`https://api.openai.com/v1/files/${fileId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${openaiApiKey}` },
            }).catch(() => {});
        }
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
