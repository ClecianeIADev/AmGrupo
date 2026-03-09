import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Gavel,
  HardHat,
  MessageSquare,
  FileText,
  Landmark,
  Copyright,
  Building2,
  ArrowRight,
  Plus,
  ChevronRight,
  RefreshCw,
  Mail,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { EmailDetailsModal } from '../components/juridico/EmailDetailsModal';

export function JuridicoPipelines({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [activeMainTab, setActiveMainTab] = useState<'pipelines' | 'monitoramento'>('pipelines');
  const [activeSubTab, setActiveSubTab] = useState<'todos' | 'nomeacoes' | 'intimacoes' | 'prazos' | 'atualizacoes'>('todos');
  const [isEmailDetailsModalOpen, setIsEmailDetailsModalOpen] = useState(false);

  const [emails, setEmails] = useState<any[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  useEffect(() => {
    if (activeMainTab === 'monitoramento') {
      fetchEmails();
    }
  }, [activeMainTab]);

  const handleSyncEmails = async () => {
    setLoadingEmails(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.provider_token) {
        alert('Para buscar novos e-mails, você precisa estar logado com sua conta do Google.\n\nPor favor, vá em "Sair" no menu esquerdo e faça o login usando o botão "Continuar com o Google" na tela inicial.');
        await fetchEmails();
        return;
      }

      const { data, error } = await supabase.functions.invoke('fetch_gmail_inbox', {
        body: { providerToken: session.provider_token }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        alert(`Erro ao sincronizar com o Gmail: ${error.message || 'Falha na requisição'}`);
      } else if (data && data.error) {
        alert(`Erro do Google: ${data.error}`);
      }

      // After syncing from Gmail, re-fetch from database
      await fetchEmails();

    } catch (err: any) {
      console.error('Error syncing emails from Gmail:', err);
      alert(`Ocorreu um erro ao tentar buscar e-mails: ${err.message}`);
      await fetchEmails(); // Fallback to DB fetch
    }
  };

  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('Usuário não autenticado.');
      }

      const { data, error } = await supabase
        .from('user_emails')
        .select('*')
        .eq('user_id', session.user.id)
        .order('received_at', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoadingEmails(false);
    }
  };

  const formatEmailDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return `Hoje • ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem • ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')} • ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-slate-50/50">
      <div className="max-w-[1600px] mx-auto flex flex-col">
        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveMainTab('pipelines')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors !outline-none !ring-0 ${activeMainTab === 'pipelines' ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
          >
            Pipelines
          </button>
          <button
            onClick={() => setActiveMainTab('monitoramento')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors !outline-none !ring-0 ${activeMainTab === 'monitoramento' ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
          >
            Monitoramento
          </button>
        </div>

        {activeMainTab === 'pipelines' ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <nav className="flex items-center text-sm font-medium text-slate-500">
                  <span className="hover:text-primary transition-colors cursor-pointer">Jurídico</span>
                  <ChevronRight size={16} className="mx-2" />
                  <span className="text-slate-900 font-semibold">Pipelines</span>
                </nav>
                <h1 className="text-2xl font-bold text-slate-900">Pipelines de Processos</h1>
              </div>
              <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm shadow-primary/30 transition-all active:scale-95 font-medium text-sm">
                <Plus size={20} />
                Criar Pipeline
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Contencioso Cível */}
              <div
                onClick={() => onNavigate('juridico-processos')}
                className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      <Gavel size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      124 Processos
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Contencioso Cível</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Gestão de processos cíveis e relações de consumo em todas as instâncias judiciais.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
                  Acessar Pipeline
                  <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Trabalhista */}
              <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                      <HardHat size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      85 Processos
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Trabalhista</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Acompanhamento de reclamações trabalhistas, acordos sindicais e preventivo.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
                  Acessar Pipeline
                  <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Consultivo */}
              <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <MessageSquare size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      42 Solicitações
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Consultivo</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Pareceres, consultas jurídicas internas e análises de risco prévias.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
                  Acessar Pipeline
                  <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Gestão de Contratos */}
              <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <FileText size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      67 Ativos
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Gestão de Contratos</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Fluxo de elaboração, revisão e assinatura de contratos com fornecedores e parceiros.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
                  Acessar Pipeline
                  <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tributário */}
              <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100">
                      <Landmark size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      15 Processos
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Tributário</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Gestão de passivos tributários, execuções fiscais e recuperações de crédito.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
                  Acessar Pipeline
                  <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Propriedade Intelectual */}
              <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                      <Copyright size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      8 Ativos
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Propriedade Intelectual</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Registro e acompanhamento de marcas, patentes e direitos autorais.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
                  Acessar Pipeline
                  <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Societário */}
              <div className="group relative flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all h-[260px] cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                      <Building2 size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      12 Atos
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Societário</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    Atas, alterações contratuais, governança corporativa e livros societários.
                  </p>
                </div>
                <div className="flex items-center text-primary text-sm font-medium mt-4 group/link">
                  Acessar Pipeline
                  <ArrowRight size={18} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </>
        ) : (
          <>
            {/* Monitoramento View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900">Monitoramento Jurídico</h1>
                <p className="text-sm text-slate-500">Gerencie suas notificações processuais e prazos fatais.</p>
              </div>
              <button onClick={handleSyncEmails} className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm shadow-primary/30 transition-all active:scale-95 font-medium text-sm">
                <RefreshCw size={18} className={loadingEmails ? "animate-spin" : ""} />
                Atualizar Base
              </button>
            </div>

            {/* Monitoramento Tabs */}
            <div className="flex items-center gap-8 mb-6 border-b border-slate-200">
              {['Todos', 'Nomeações', 'Intimações', 'Prazos', 'Atualizações'].map((tabLabel) => {
                const tabKey = tabLabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") as any;
                return (
                  <button
                    key={tabKey}
                    onClick={() => setActiveSubTab(tabKey)}
                    className={`pb-4 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors !outline-none !ring-0 ${activeSubTab === tabKey ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
                  >
                    {tabLabel}
                  </button>
                );
              })}
            </div>

            {/* Monitoramento List */}
            <div className="flex flex-col gap-4">

              {loadingEmails ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
                </div>
              ) : emails.length > 0 ? (
                emails
                  .filter(email => {
                    if (activeSubTab === 'todos') return true;
                    if (!email.category) return activeSubTab === 'atualizacoes'; // fallback
                    const catKey = email.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    return catKey === activeSubTab;
                  })
                  .map((email) => {
                    const plainTextSnippet = (email.content || '')
                      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]+>/g, '')
                      .replace(/&nbsp;/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim();

                    return (
                      <div key={email.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm hover:shadow-md transition-shadow">
                        <div className="size-[52px] rounded-xl bg-[#F0F7FF] text-[#1E88E5] flex items-center justify-center shrink-0">
                          <Landmark size={26} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                          <div className="flex items-center gap-3">
                            {email.category && (
                              <span className="px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full uppercase tracking-wider shrink-0">
                                {email.category}
                              </span>
                            )}
                            <h3 className="text-[17px] md:text-[18px] font-bold text-slate-900 truncate">{email.subject || '(Sem assunto)'}</h3>
                            {email.subject?.toLowerCase().includes('urgente') && (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-full uppercase tracking-wider shrink-0">Urgente</span>
                            )}
                          </div>
                          <p className="text-[14.5px] font-medium text-slate-700 truncate">{email.sender}</p>
                          {plainTextSnippet && (
                            <div className="text-[13.5px] text-slate-500 line-clamp-1 mt-0.5">
                              {plainTextSnippet}
                            </div>
                          )}
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-[13.5px] text-slate-500 mt-1.5">
                            <div className="flex items-center gap-1.5 shrink-0 font-medium text-slate-400">
                              <Clock size={14} />
                              <span>{formatEmailDate(email.received_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full md:w-auto mt-4 md:mt-0 shrink-0 md:ml-4 flex items-center justify-between md:justify-end gap-3">
                          {email.attachments && (email.attachments as any[]).length > 0 && (
                            <span className="md:hidden px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded uppercase">{(email.attachments as any[]).length} Anexo(s)</span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedEmail(email);
                              setIsEmailDetailsModalOpen(true);
                            }}
                            className="w-full md:w-auto px-6 py-2.5 bg-[#1E88E5] hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm text-center"
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Nenhum e-mail registrado. Clique em Atualizar Base para buscar novos e-mails.
                </div>
              )}

            </div>
          </>
        )}
      </div>

      <EmailDetailsModal
        isOpen={isEmailDetailsModalOpen}
        onClose={() => {
          setIsEmailDetailsModalOpen(false);
          setSelectedEmail(null);
        }}
        email={selectedEmail}
      />
    </main>
  );
}
