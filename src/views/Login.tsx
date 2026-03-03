import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertCircle, Loader2, User } from 'lucide-react';

export function Login() {
    const [isRegistering, setIsRegistering] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isRegistering) {
                // Validate passwords and name
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem.');
                }
                if (!name.trim()) {
                    throw new Error('O nome é obrigatório.');
                }

                // 1. Sign up the user with a timeout
                const signUpPromise = supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        }
                    }
                });

                const timeoutPromise = new Promise<{ data: any, error: Error }>((resolve) =>
                    setTimeout(() => resolve({ data: null, error: new Error('O tempo limite de conexão esgotou. Verifique sua internet.') }), 15000)
                );

                const { data: authData, error: authError } = await Promise.race([signUpPromise, timeoutPromise]) as any;

                if (authError) throw authError;

                if (!authData.user) {
                    throw new Error('Erro ao criar usuário.');
                }

                // The Supabase PostgreSQL Trigger `on_auth_user_created` will securely handle
                // inserting this user's profile metadata directly into `public.profiles`.

                setSuccessMessage('Conta criada com sucesso! Você já pode entrar.');
                // Switch back to login mode automatically
                setIsRegistering(false);
                setPassword('');
                setConfirmPassword('');

            } else {
                // Implement a safety timeout in case the connection is hanging
                const loginPromise = supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                const timeoutPromise = new Promise<{ error: Error }>((resolve) =>
                    setTimeout(() => resolve({ error: new Error('O tempo limite de conexão esgotou. Verifique sua internet.') }), 15000)
                );

                const response = await Promise.race([loginPromise, timeoutPromise]) as any;
                const signInError = response.error;

                if (signInError) throw signInError;
            }
        } catch (err: any) {
            let errorMsg = err.message || 'Ocorreu um erro inesperado.';
            if (errorMsg.includes('Invalid login credentials')) {
                errorMsg = 'E-mail ou senha incorretos.';
            } else if (errorMsg.includes('Email not confirmed')) {
                errorMsg = 'Por favor, confirme seu e-mail antes de entrar.';
            } else if (errorMsg.includes('User already registered')) {
                errorMsg = 'Este e-mail já está cadastrado.';
            } else if (errorMsg.includes('Password should be at least')) {
                errorMsg = 'A senha deve ter no mínimo 6 caracteres.';
            } else if (errorMsg === 'Failed to fetch') {
                errorMsg = 'Erro de conexão. Verifique sua internet ou tente novamente.';
            }

            setError(errorMsg);
        } finally {
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
                            {isRegistering ? 'Criar Nova Conta' : 'Acesso Restrito'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {isRegistering ? 'Preencha os dados para se cadastrar.' : 'Insira suas credenciais para continuar.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-4 bg-emerald-50 rounded-2xl flex items-start gap-3 border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-emerald-600 font-medium">{successMessage}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {isRegistering && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="name">Nome Completo</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="text-slate-400" size={18} />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            required={isRegistering}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Seu nome completo"
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400 font-medium"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="email">E-mail</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="text-slate-400" size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="voce@amgrupo.com.br"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Senha</label>
                                    {!isRegistering && (
                                        <a href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Esqueceu?</a>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-slate-400" size={18} />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400 font-medium font-sans"
                                    />
                                </div>
                            </div>

                            {isRegistering && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="confirmPassword">Confirmar Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="text-slate-400" size={18} />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            required={isRegistering}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/50 transition-shadow placeholder-slate-400 font-medium font-sans"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    {isRegistering ? 'Criar Minha Conta' : 'Entrar no Sistema'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Links */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
                        >
                            {isRegistering
                                ? 'Já possui uma conta? Faça login'
                                : 'Não possui acesso? Solicite uma conta'
                            }
                        </button>
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
