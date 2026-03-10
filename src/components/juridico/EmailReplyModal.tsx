import { X, Mail, Send, Paperclip } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface EmailReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalEmail?: any; // The email we are replying to
}

export function EmailReplyModal({ isOpen, onClose, originalEmail }: EmailReplyModalProps) {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [cco, setCco] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const [isSending, setIsSending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showCc, setShowCc] = useState(false);

    useEffect(() => {
        if (isOpen && originalEmail) {
            setTo(originalEmail.sender || '');
            setCc(originalEmail.cc || '');
            let sub = originalEmail.subject || '';
            if (!sub.toLowerCase().startsWith('re:')) {
                sub = `Re: ${sub}`;
            }
            setSubject(sub);
            setBody('');
            setErrorMsg('');
            setSuccessMsg('');
            setIsSending(false);
            if (originalEmail.cc || originalEmail.cco) {
                setShowCc(true);
            }
        }
    }, [isOpen, originalEmail]);

    if (!isOpen || !originalEmail) return null;

    const handleSend = async () => {
        setErrorMsg('');
        setSuccessMsg('');

        if (!to.trim() || !subject.trim() || !body.trim()) {
            setErrorMsg('Preencha os campos Para, Assunto e Mensagem.');
            return;
        }

        setIsSending(true);
        try {
            const providerToken = localStorage.getItem('google_provider_token');

            if (!providerToken) {
                setErrorMsg('Acesso ao Google expirado. Forçando re-autenticação...');
                setIsSending(false);
                setTimeout(async () => {
                    await supabase.auth.signOut();
                }, 2000);
                return;
            }

            // The edge function invocation
            const { data, error } = await supabase.functions.invoke('send_gmail_reply', {
                body: {
                    providerToken,
                    to,
                    cc,
                    cco,
                    subject,
                    body: body.replace(/\n/g, '<br/>'), // simple text to html conversion
                    inReplyTo: originalEmail.google_message_id,
                    references: originalEmail.google_message_id // Simple reference handling
                }
            });

            if (error) {
                console.error("Supabase edge function error:", error);
                throw new Error(error.message || 'Erro ao comunicar com a nuvem.');
            }

            if (data?.error) {
                if (
                    data.error.includes('401') ||
                    data.error.includes('UNAUTHENTICATED') ||
                    data.error.includes('Invalid Credentials')
                ) {
                    setErrorMsg('Acesso ao Google expirado. Redirecionando para o login...');
                    setTimeout(async () => {
                        await supabase.auth.signOut();
                    }, 2500);
                    return;
                }
                throw new Error(data.error);
            }

            setSuccessMsg('Resposta enviada com sucesso!');
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error("Error sending reply:", err);
            setErrorMsg(err.message || 'Erro inesperado ao enviar resposta.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={!isSending ? onClose : undefined}
            />

            {/* Slide-over Panel Container */}
            <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Mail size={16} />
                        </div>
                        <h2 className="text-base font-bold text-slate-800">Responder E-mail</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSending}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Error / Success Messages */}
                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-100 font-medium">
                            {successMsg}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="relative border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
                            <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-white">
                                <label className="text-sm font-medium text-slate-500 w-16 shrink-0">Para:</label>
                                <input
                                    type="text"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-300"
                                    placeholder="destinatario@email.com"
                                />
                                {!showCc && (
                                    <button
                                        onClick={() => setShowCc(true)}
                                        className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors ml-2"
                                    >
                                        Cc/Cco
                                    </button>
                                )}
                            </div>

                            {showCc && (
                                <>
                                    <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-white">
                                        <label className="text-sm font-medium text-slate-500 w-16 shrink-0">Cc:</label>
                                        <input
                                            type="text"
                                            value={cc}
                                            onChange={(e) => setCc(e.target.value)}
                                            className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-300"
                                            placeholder="Cópia para..."
                                        />
                                    </div>
                                    <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-white">
                                        <label className="text-sm font-medium text-slate-500 w-16 shrink-0">Cco:</label>
                                        <input
                                            type="text"
                                            value={cco}
                                            onChange={(e) => setCco(e.target.value)}
                                            className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-300"
                                            placeholder="Cópia oculta para..."
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-center px-4 py-2 bg-white">
                                <label className="text-sm font-medium text-slate-500 w-16 shrink-0">Assunto:</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="flex-1 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300"
                                    placeholder="Assunto da mensagem"
                                />
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex flex-col h-[350px] border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
                            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                                {/* Formatting Toolbar Placeholder */}
                                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors" title="Anexar arquivo (Não implementado nesta versão)">
                                    <Paperclip size={16} />
                                </button>
                            </div>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="flex-1 p-4 outline-none resize-none text-sm text-slate-700 leading-relaxed placeholder:text-slate-400"
                                placeholder="Escreva sua resposta aqui..."
                            />
                        </div>

                        {/* Previous Message Quote (Visual Only) */}
                        <div className="mt-6 border-l-4 border-slate-300 pl-4 py-1 pr-2">
                            <details className="text-sm text-slate-500 cursor-pointer group">
                                <summary className="font-medium hover:text-slate-700 w-fit select-none outline-none">
                                    Mostrar mensagem original
                                </summary>
                                <div className="mt-3 text-[13px] leading-relaxed opacity-80 max-h-[150px] overflow-y-auto bg-slate-50 p-3 rounded border border-slate-100 cursor-text">
                                    <div dangerouslySetInnerHTML={{
                                        __html: (originalEmail.content || '')
                                            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                                    }} />
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isSending}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isSending ? (
                            <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        {isSending ? 'Enviando...' : 'Enviar Resposta'}
                    </button>
                </div>
            </div>
        </>
    );
}
