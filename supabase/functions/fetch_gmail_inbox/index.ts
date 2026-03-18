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

// Helper function to properly decode base64url encoded UTF-8 strings
function decodeBase64Utf8(base64UrlStr: string): string {
    try {
        let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    } catch (err) {
        console.error("Error decoding base64:", err);
        return "";
    }
}

// Helper to classify an email based on regex rules
function classifyEmail(subject: string, contentBody: string): string {
    if (!subject) subject = '';
    if (!contentBody) contentBody = '';

    const fullText = `${subject} ${contentBody}`.toLowerCase();

    // 1. "Prazos" - Highest Priority
    const prazoKeywords = [
        "prazo", "prazo de", "no prazo de", "vencimento", "data limite",
        "dias úteis", "prazo processual", "prazo para manifestação",
        "prazo para cumprimento", "tempestivo"
    ];
    if (prazoKeywords.some(kw => fullText.includes(kw))) {
        return 'Prazos';
    }

    // 2. "Intimações"
    const intimacaoKeywords = [
        "intimação", "intimado", "fica intimado", "fica a parte intimada",
        "citação", "notificação", "tomar ciência", "ciência",
        "teor do ato", "publicação", "ato ordinatório"
    ];
    if (intimacaoKeywords.some(kw => fullText.includes(kw))) {
        return 'Intimações';
    }

    // 3. "Nomeações"
    const nomeacaoKeywords = [
        "nomeação", "nomeado", "nomeia-se", "fica nomeado",
        "nomeação de perito", "perito nomeado",
        "designação de perito", "defensor dativo",
        "advogado dativo", "para atuar"
    ];
    if (nomeacaoKeywords.some(kw => fullText.includes(kw))) {
        return 'Nomeações';
    }

// Default fallback
    return 'Atualizações';
}

interface GmailPart {
    mimeType: string;
    body?: {
        data?: string;
        size?: number;
        attachmentId?: string;
    };
    parts?: GmailPart[];
    filename?: string;
}

interface GmailHeader {
    name: string;
    value: string;
}

serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Nenhuma credencial de autorização enviada.' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const jwt = authHeader.replace('Bearer ', '');
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Sessão inválida ou expirada. Pressione Sair e faça login novamente com o Google.' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Retrieve the Google provider_token server-side from auth.sessions.
        // The token is never stored or transmitted by the frontend.
        // Fetch provider_token via adminClient using the verified user.id
        // (avoids auth.uid() resolution issues in SECURITY DEFINER context)
        const { data: tokenRow, error: tokenError } = await adminClient
            .from('user_provider_tokens')
            .select('provider_token')
            .eq('user_id', user.id)
            .single();

        const providerToken = tokenRow?.provider_token ?? null;
        
        if (tokenError || !providerToken) {
            const detail = tokenError ? `${tokenError.code}: ${tokenError.message}` : 'sem token salvo para este usuário';
            console.error('[fetch_gmail_inbox] provider_token não encontrado:', detail);
            return new Response(JSON.stringify({ error: 'Permissão do Google não encontrada, faça relogin com a aba de Continuar com Google.' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Body no longer needed; consume to avoid resource leaks on POST requests
        await req.json().catch(() => {});

        const { data: latestEmails } = await adminClient
            .from('user_emails')
            .select('received_at')
            .eq('user_id', user.id)
            .order('received_at', { ascending: false })
            .limit(1);

        let queryOptions = ['in:inbox'];
        if (latestEmails && latestEmails.length > 0 && latestEmails[0].received_at) {
            const lastDate = new Date(latestEmails[0].received_at);
            if (!isNaN(lastDate.getTime())) {
                const timestamp = Math.floor(lastDate.getTime() / 1000);
                queryOptions.push(`after:${timestamp}`);
            }
        }

        const query = `q=${encodeURIComponent(queryOptions.join(' '))}`;

        const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&${query}`, {
            headers: { Authorization: `Bearer ${providerToken}` }
        });

        if (!listRes.ok) {
            console.error('Gmail list error:', listRes.status, await listRes.text());
            return new Response(JSON.stringify({ error: 'Falha ao buscar e-mails do Gmail. Verifique se a API do Gmail está ativada no Cloud.' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const listData = await listRes.json();
        const messages = listData.messages || [];
        const newEmails = [];

        for (const msg of messages) {
            const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: { Authorization: `Bearer ${providerToken}` }
            });
            if (msgRes.ok) {
                const emailData = await msgRes.json();

                let subject = '', sender = '', recipient = '', cc = '', cco = '', date = '';
                const headers = emailData.payload.headers;

                for (const header of headers) {
                    if (header.name.toLowerCase() === 'subject') subject = header.value;
                    else if (header.name.toLowerCase() === 'from') sender = header.value;
                    else if (header.name.toLowerCase() === 'to') recipient = header.value;
                    else if (header.name.toLowerCase() === 'cc') cc = header.value;
                    else if (header.name.toLowerCase() === 'bcc') cco = header.value;
                    else if (header.name.toLowerCase() === 'date') date = header.value;
                }

                let content = '';
                const parts = emailData.payload?.parts || [emailData.payload];

                const getBody = (partsList: GmailPart[]): { html: string; text: string } => {
                    let htmlBody = '';
                    let textBody = '';
                    for (const p of partsList) {
                        if (!p) continue;
                        if (p.mimeType === 'text/html' && p.body?.data) {
                            htmlBody = decodeBase64Utf8(p.body.data);
                        } else if (p.mimeType === 'text/plain' && p.body?.data) {
                            textBody = decodeBase64Utf8(p.body.data);
                        } else if (p.parts) {
                            const nested = getBody(p.parts);
                            if (nested.html) htmlBody = nested.html;
                            if (nested.text) textBody = nested.text;
                        }
                    }
                    return { html: htmlBody, text: textBody };
                };

                const bodyData = getBody(parts);
                content = bodyData.html || bodyData.text || '';

                interface AttachmentInfo {
                    name: string;
                    size: string;
                    attachmentId: string;
                }
                const attachments: AttachmentInfo[] = [];
                const extractAttachments = (partsList: GmailPart[]) => {
                    for (const p of partsList) {
                        if (!p) continue;
                        if (p.filename && p.filename.length > 0 && p.body?.attachmentId) {
                            attachments.push({
                                name: p.filename,
                                size: `${Math.round((p.body.size || 0) / 1024)} KB`,
                                attachmentId: p.body.attachmentId
                            });
                        } else if (p.parts) {
                            extractAttachments(p.parts);
                        }
                    }
                };
                extractAttachments(parts);

                const invalidDate = isNaN(new Date(date).getTime());

                // --- NEW CATEGORIZATION LOGIC ---
                const computedCategory = classifyEmail(subject, content);

                newEmails.push({
                    user_id: user.id,
                    google_message_id: msg.id,
                    subject,
                    sender,
                    recipient,
                    cc,
                    cco,
                    received_at: invalidDate ? new Date().toISOString() : new Date(date).toISOString(),
                    content,
                    attachments,
                    category: computedCategory // <--- Storing category
                });
            }
        }

        if (newEmails.length > 0) {
            const { error: upsertError } = await adminClient
                .from('user_emails')
                .upsert(newEmails, { onConflict: 'user_id,google_message_id' });

            if (upsertError) {
                return new Response(JSON.stringify({ error: 'Erro ao gravar no banco de dados.' }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            fetchedCount: messages.length,
            processedCount: newEmails.length
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('fetch_gmail_inbox error:', message);
        return new Response(JSON.stringify({ error: 'Erro interno no servidor.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
