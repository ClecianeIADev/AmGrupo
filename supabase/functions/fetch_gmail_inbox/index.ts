import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Nenhuma credencial de autorização enviada.' }), {
                status: 200,
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
            return new Response(JSON.stringify({ error: 'Sessão inválida ou expirada. Pressione Sair e faça login novamente com o Google.', details: userError }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { providerToken } = await req.json();
        if (!providerToken) {
            return new Response(JSON.stringify({ error: 'Permissão do Google não encontrada, faça relogin com a aba de Continuar com Google.' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { data: latestEmails } = await adminClient
            .from('user_emails')
            .select('received_at')
            .eq('user_id', user.id)
            .order('received_at', { ascending: false })
            .limit(1);

        let queryOptions = ['in:inbox'];
        if (latestEmails && latestEmails.length > 0 && latestEmails[0].received_at) {
            const timestamp = Math.floor(new Date(latestEmails[0].received_at).getTime() / 1000);
            queryOptions.push(`after:${timestamp}`);
        }

        const query = `q=${encodeURIComponent(queryOptions.join(' '))}`;

        const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&${query}`, {
            headers: { Authorization: `Bearer ${providerToken}` }
        });

        if (!listRes.ok) {
            const gErr = await listRes.text();
            return new Response(JSON.stringify({ error: 'Falha ao buscar e-mails do Gmail. Talvez a API do Gmail não esteja ativada no Cloud.', details: gErr }), {
                status: 200,
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

                const getBody = (partsList: any[]) => {
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

                const attachments = [];
                const extractAttachments = (partsList: any[]) => {
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
                return new Response(JSON.stringify({ error: 'Erro ao gravar no banco de dados.', details: upsertError }), {
                    status: 200,
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
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
