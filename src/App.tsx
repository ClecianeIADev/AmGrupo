/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Login } from './views/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './views/Dashboard';
import { CadastroClientes } from './views/CadastroClientes';
import { Kanban } from './views/Kanban';
import { NegotiationDetail } from './views/NegotiationDetail';
import { FinanceiroSettings } from './views/FinanceiroSettings';
import { FinanceiroGerenciar } from './views/FinanceiroGerenciar';
import { JuridicoPipelines } from './views/JuridicoPipelines';
import { JuridicoProcessos } from './views/JuridicoProcessos';
import { RHDashboard } from './views/RHDashboard';
import { RHProfissionais } from './views/RHProfissionais';
import { RHPerfil } from './views/RHPerfil';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'kanban', 'detail', 'financeiro-gerenciar', 'financeiro-settings', 'juridico-pipelines', 'juridico-processos'
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  useEffect(() => {
    const saveProviderToken = async (userId: string, providerToken: string, providerRefreshToken: string | null) => {
      console.log('[Auth] Salvando provider_token para user:', userId);
      const { error } = await supabase
        .from('user_provider_tokens')
        .upsert(
          {
            user_id: userId,
            provider: 'google',
            provider_token: providerToken,
            provider_refresh_token: providerRefreshToken ?? null,
          },
          { onConflict: 'user_id' }
        );
      if (error) {
        console.error('[Auth] ERRO ao salvar provider_token:', error.code, error.message, error.details);
      } else {
        console.log('[Auth] provider_token salvo com sucesso.');
      }
    };

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao recuperar sessão:', error);
        }
        const s = data?.session || null;
        setSession(s);
        // Capture token available right after OAuth redirect (same page load)
        if (s?.provider_token) {
          console.log('[Auth] getSession: provider_token encontrado, salvando...');
          saveProviderToken(s.user.id, s.provider_token, s.provider_refresh_token ?? null);
        } else {
          console.log('[Auth] getSession: sem provider_token (normal em sessões restauradas do storage).');
        }
        setIsInitializing(false);
      })
      .catch((err) => {
        console.error('Erro crítico na inicialização:', err);
        setIsInitializing(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange:', event, '| provider_token:', session?.provider_token ? 'PRESENTE' : 'AUSENTE');
      setSession(session);

      if (
        session?.provider_token &&
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')
      ) {
        saveProviderToken(session.user.id, session.provider_token, session.provider_refresh_token ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="font-display bg-background-light text-slate-900 overflow-hidden h-screen flex">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header currentView={currentView} user={session.user} />
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'cadastro-clientes' && <CadastroClientes />}
        {currentView === 'kanban' && <Kanban onNavigate={setCurrentView} onSelectOpportunity={setSelectedOpportunityId} />}
        {currentView === 'detail' && selectedOpportunityId && <NegotiationDetail opportunityId={selectedOpportunityId} onBack={() => setCurrentView('kanban')} />}
        {currentView === 'financeiro-gerenciar' && <FinanceiroGerenciar />}
        {currentView === 'financeiro-settings' && <FinanceiroSettings />}
        {currentView === 'juridico-pipelines' && <JuridicoPipelines onNavigate={setCurrentView} />}
        {currentView === 'juridico-processos' && <JuridicoProcessos onNavigate={setCurrentView} />}
        {currentView === 'rh-dashboard' && <RHDashboard />}
        {currentView === 'rh-profissionais' && <RHProfissionais onNavigate={setCurrentView} />}
        {currentView === 'rh-perfil' && <RHPerfil />}
      </div>
    </div>
  );
}
