import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
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

        const { providerToken, to, cc, cco, subject, body, inReplyTo, references } = await req.json();

        if (!providerToken) {
            throw new Error('Token do Google não encontrado. Faça login novamente.');
        }

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

    } catch (err: any) {
        console.error("Function error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
