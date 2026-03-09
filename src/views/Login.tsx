import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertCircle, Loader2, User } from 'lucide-react';

export function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/gmail.readonly',
                    redirectTo: window.location.origin,
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com Google.');
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-2xl tracking-tighter">AM</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">AM Group</h2>
                    <p className="text-slate-500 mt-2">Enterprise Resource Planning</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900">
                            Acesso Restrito
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Acesse a plataforma utilizando sua conta Google corporativa.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-primary/50 text-slate-700 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                    <span>Conectando...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-[15px]">Continuar com Google</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Branding Extra Info */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Apenas usuários autorizados têm acesso a este portal privado.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-8 font-medium">
                    &copy; {new Date().getFullYear()} AM Group. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
