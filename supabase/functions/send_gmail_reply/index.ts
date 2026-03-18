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

// Helper function to encode string to Base64Url (RFC 4648)
function encodeBase64Url(str: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Nenhuma credencial de autorização enviada.');
        }

        const jwt = authHeader.replace('Bearer ', '');
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
        if (userError || !user) {
            throw new Error('Sessão inválida ou expirada.');
        }

        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Fetch provider_token via adminClient using the verified user.id
        const { data: tokenRow, error: tokenError } = await adminClient
            .from('user_provider_tokens')
            .select('provider_token')
            .eq('user_id', user.id)
            .single();

        const providerToken = tokenRow?.provider_token ?? null;
        if (tokenError || !providerToken) {
            throw new Error('Token do Google não encontrado. Faça login novamente.');
        }

        const { to, cc, cco, subject, body, inReplyTo, references } = await req.json();

        if (!to || !subject || !body) {
            throw new Error('Campos obrigatórios ausentes: destinatário, assunto ou corpo do email.');
        }

        let realMessageId = '';
        let threadId = '';

        if (inReplyTo) {
            try {
                // Fetch the original message's headers to get the actual RFC 2822 Message-ID
                const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${inReplyTo}?format=metadata&metadataHeaders=Message-ID`, {
                    headers: { 'Authorization': `Bearer ${providerToken}` }
                });

                if (msgRes.ok) {
                    const msgData = await msgRes.json();
                    threadId = msgData.threadId;

                    const headers = msgData.payload?.headers || [];
                    for (const header of headers) {
                        if (header.name.toLowerCase() === 'message-id') {
                            realMessageId = header.value;
                            break;
                        }
                    }
                }
            } catch (e) {
                console.warn("Falha ao recuperar o Message-ID original via API.", e);
            }
        }

        // Construindo o email RFC 2822
        const messageLines = [
            `To: ${to}`,
            `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset="UTF-8"',
        ];

        if (cc) messageLines.push(`Cc: ${cc}`);
        if (cco) messageLines.push(`Bcc: ${cco}`);

        if (realMessageId) {
            messageLines.push(`In-Reply-To: ${realMessageId}`);
            messageLines.push(`References: ${realMessageId}`);
        }

        messageLines.push('', body); // Linha em branco separa cabeçalho do corpo

        const emailRaw = messageLines.join('\r\n');
        const encodedEmail = encodeBase64Url(emailRaw);

        const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${providerToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                raw: encodedEmail,
                ...(threadId ? { threadId } : {})
            })
        });

        if (!sendRes.ok) {
            const errorText = await sendRes.text();
            console.error(`Gmail API Error: ${errorText}`);
            throw new Error(`Erro ao enviar email via Gmail API: ${errorText}`);
        }

        const result = await sendRes.json();

        return new Response(JSON.stringify({ success: true, ...result }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('send_gmail_reply error:', message);
        const isClientError = message.includes('obrigatórios') || message.includes('inválida') || message.includes('autorização') || message.includes('Token');
        return new Response(JSON.stringify({ error: message }), {
            status: isClientError ? 400 : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
