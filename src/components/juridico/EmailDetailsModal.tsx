import { X, Mail, AlertTriangle, Paperclip, Download, Link, CornerUpLeft, Archive } from 'lucide-react';
import React from 'react';

interface EmailDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    email?: any;
}

export function EmailDetailsModal({ isOpen, onClose, email }: EmailDetailsModalProps) {
    if (!isOpen || !email) return null;

    const formattedDate = new Date(email.received_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const attachments = (email.attachments as any[]) || [];

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel Container */}
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Mail size={20} className="text-[#3B82F6]" />
                        <h2 className="text-base font-bold text-slate-800">Detalhes do E-mail</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto flex-1">
                    {/* Main Title and Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                            {email.subject}
                        </h1>
                        <div className="shrink-0 pt-1">
                            {/* Static badge for now, could be dynamic based on email importance */}
                        </div>
                    </div>

                    {/* Email Metadata Grid */}
                    <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 mb-10 text-sm">
                        <span className="text-slate-500 text-right w-16">De:</span>
                        <span className="text-slate-700 font-medium">{email.sender}</span>

                        <span className="text-slate-500 text-right w-16">Para:</span>
                        <span className="text-slate-700 font-medium">{email.recipient}</span>

                        {(email.cc || email.cco) && (
                            <>
                                {email.cc && (
                                    <>
                                        <span className="text-slate-500 text-right w-16">CC:</span>
                                        <span className="text-slate-700 font-medium">{email.cc}</span>
                                    </>
                                )}
                                {email.cco && (
                                    <>
                                        <span className="text-slate-500 text-right w-16">CCO:</span>
                                        <span className="text-slate-700 font-medium">{email.cco}</span>
                                    </>
                                )}
                            </>
                        )}

                        <span className="text-slate-500 text-right w-16">Data:</span>
                        <span className="text-slate-700 font-medium">{formattedDate}</span>
                    </div>

                    {/* Email Body - Extracted as Plain Text to avoid images/screenshot styling */}
                    <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 text-slate-700 text-[14.5px] leading-relaxed space-y-5 mb-12 whitespace-pre-wrap font-sans break-words shadow-inner">
                        <div dangerouslySetInnerHTML={{
                            __html: (email.content || '')
                                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                .replace(/<br\s*\/?>/gi, '\n')
                                .replace(/<p[^>]*>/gi, '\n\n')
                                .replace(/<div(?:(?!\s+class="gmail_quote").)*?>/gi, '\n')
                                .replace(/<td[^>]*>/gi, ' ')
                                .replace(/<tr[^>]*>/gi, '\n')
                                .replace(/<[^>]+>/g, '') // Remove remaining tags including images
                                .replace(/&nbsp;/g, ' ')
                                .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize multiple newlines
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/&amp;/g, '&')
                                .trim()
                                .replace(/\n/g, '<br/>') // Restore standard line breaks for innerHTML rendering
                        }} />
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Paperclip size={18} className="text-slate-700" />
                                <h3 className="text-sm font-bold text-slate-800">Anexos ({attachments.length} arquivos)</h3>
                            </div>

                            <div className="flex flex-col gap-3">
                                {attachments.map((att: any, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0 border border-blue-100">
                                                <span className="font-bold text-xs">{att.name?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{att.name}</span>
                                                <span className="text-xs text-slate-400">{att.size}</span>
                                            </div>
                                        </div>
                                        <button className="p-2 text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 w-full max-w-[500px]">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-[#1E88E5] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95">
                            <Link size={18} />
                            Vincular ao Processo
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95">
                            <CornerUpLeft size={18} />
                            Responder
                        </button>
                    </div>
                    <button className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 rounded-lg shadow-sm transition-all active:scale-95">
                        <Archive size={18} />
                    </button>
                </div>

            </div>
        </>
    );
}
