// T027–T034: ProcessDetailsModal
// Displays full AI-extracted legal process data in a 5-tab modal.

import { useState, type ReactNode } from 'react';
import {
    X,
    Scale,
    AlignLeft,
    FileText,
    HelpCircle,
    FolderSearch,
    Sparkles,
    AlertTriangle,
    XCircle,
    Calendar,
    Clock,
    ChevronDown,
    ChevronRight,
    Lock,
    Download,
    Loader,
    Building2,
    Users,
} from 'lucide-react';
import type { LegalProcess } from '../../types/legalProcess';
import { supabase } from '../../lib/supabase';

interface ProcessDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    process: LegalProcess | null;
}

type Tab = 'executive' | 'summary' | 'quesitos' | 'documents' | 'examinations';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'executive', label: 'Resumo Executivo', icon: <Sparkles size={15} /> },
    { id: 'summary', label: 'Resumo do Processo', icon: <AlignLeft size={15} /> },
    { id: 'quesitos', label: 'Quesitos', icon: <HelpCircle size={15} /> },
    { id: 'documents', label: 'Documentos', icon: <FolderSearch size={15} /> },
    { id: 'examinations', label: 'Exames Sugeridos', icon: <FileText size={15} /> },
];

const PRIORITY_STYLES: Record<string, { label: string; cls: string }> = {
    high: { label: 'Alta Prioridade', cls: 'bg-red-50 text-red-700 border-red-200' },
    medium: { label: 'Média Prioridade', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { label: 'Baixa Prioridade', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const DATE_TYPE_STYLES: Record<string, string> = {
    deadline: 'bg-red-50 text-red-700',
    hearing: 'bg-amber-50 text-amber-700',
    filing: 'bg-blue-50 text-blue-700',
    other: 'bg-slate-100 text-slate-600',
};

const CATEGORY_STYLES: Record<string, string> = {
    'Relatório': 'bg-blue-50 text-blue-700',
    'Laudo': 'bg-purple-50 text-purple-700',
    'Correspondência': 'bg-slate-100 text-slate-600',
    'Petição': 'bg-indigo-50 text-indigo-700',
    'Decisão': 'bg-emerald-50 text-emerald-700',
    'Contrato': 'bg-orange-50 text-orange-700',
};

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Scale size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">{message}</p>
        </div>
    );
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isDatePast(dateStr: string): boolean {
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d < new Date();
}

// ── Helpers for party extraction ─────────────────────────────────────────────
const AUTHOR_ROLES = ['autor', 'requerente', 'reclamante', 'apelante', 'impetrante', 'exequente', 'autora', 'requerente'];
const DEFENDANT_ROLES = ['réu', 'reu', 'requerido', 'reclamado', 'apelado', 'impetrado', 'executado', 'ré', 're'];
const COURT_ROLES = ['órgão julgador', 'orgao julgador', 'tribunal', 'juízo', 'juizo', 'vara', 'turma'];

function extractPartyByRole(parties: LegalProcess['parties'], roles: string[]): string | null {
    const match = parties?.find(p =>
        roles.some(r => p.role?.toLowerCase().includes(r))
    );
    return match?.name ?? null;
}

// ── Tab: Executive Summary ───────────────────────────────────────────────────
function ExecutiveSummaryTab({ process }: { process: LegalProcess }) {
    const autor = extractPartyByRole(process.parties, AUTHOR_ROLES);
    const reu = extractPartyByRole(process.parties, DEFENDANT_ROLES);
    const orgaoJulgador = extractPartyByRole(process.parties, COURT_ROLES);

    const hasProcessInfo = process.process_number || autor || reu || orgaoJulgador;

    return (
        <div className="flex flex-col gap-6">
            {/* Process identification card */}
            {hasProcessInfo && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Identificação do Processo</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-slate-100">
                        {process.process_number && (
                            <div className="bg-white px-5 py-4 col-span-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Processo</p>
                                <p className="text-sm font-bold text-slate-800 font-mono">{process.process_number}</p>
                            </div>
                        )}
                        {orgaoJulgador && (
                            <div className="bg-white px-5 py-4 col-span-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Órgão Julgador</p>
                                <p className="text-sm font-bold text-slate-800">{orgaoJulgador}</p>
                            </div>
                        )}
                        {autor && (
                            <div className="bg-white px-5 py-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Autor</p>
                                <p className="text-sm font-bold text-slate-800">{autor}</p>
                            </div>
                        )}
                        {reu && (
                            <div className="bg-white px-5 py-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Réu</p>
                                <p className="text-sm font-bold text-slate-800">{reu}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {process.executive_summary ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Resumo Executivo</h4>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{process.executive_summary}</p>
                </div>
            ) : (
                <EmptyState message="Resumo executivo não disponível." />
            )}

            {/* Critical Dates */}
            {process.critical_dates?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Calendar size={15} />
                        Datas Críticas
                    </h4>
                    <div className="flex flex-col gap-3">
                        {process.critical_dates.map((cd, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${isDatePast(cd.date) ? 'opacity-60' : ''}`}>
                                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold ${DATE_TYPE_STYLES[cd.type] ?? DATE_TYPE_STYLES.other}`}>
                                    {formatDate(cd.date)}
                                </span>
                                <span className="text-sm text-slate-700">{cd.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Confidence bar */}
            {process.extraction_confidence !== null && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500">Precisão da Extração por IA</span>
                        <span className="text-xs font-bold text-slate-700">
                            {Math.round(process.extraction_confidence * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${Math.round(process.extraction_confidence * 100)}%`,
                                background: process.extraction_confidence >= 0.7 ? '#22c55e' : '#f59e0b',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Tab: Process Summary + Timeline ─────────────────────────────────────────
function ProcessSummaryTab({ process }: { process: LegalProcess }) {
    const sortedEvents = [...(process.events_timeline ?? [])].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div className="flex flex-col gap-6">
            {process.process_summary ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Resumo do Processo</h4>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{process.process_summary}</p>
                </div>
            ) : (
                <EmptyState message="Resumo do processo não disponível." />
            )}

            {sortedEvents.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Clock size={15} />
                        Linha do Tempo
                    </h4>
                    <div className="relative pl-5 flex flex-col gap-5">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
                        {sortedEvents.map((ev, i) => {
                            const past = isDatePast(ev.date);
                            return (
                                <div key={i} className="relative flex flex-col gap-1">
                                    <div className={`absolute -left-5 top-1 size-3 rounded-full border-2 ${past ? 'bg-slate-300 border-slate-300' : 'bg-indigo-500 border-indigo-500'}`} />
                                    <span className={`text-xs font-bold ${past ? 'text-slate-400' : 'text-indigo-600'}`}>
                                        {formatDate(ev.date)}
                                    </span>
                                    <p className={`text-sm ${past ? 'text-slate-500' : 'text-slate-800'}`}>{ev.event}</p>
                                    {ev.outcome && (
                                        <p className="text-xs text-slate-400 italic">{ev.outcome}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Tab: Quesitos ─────────────────────────────────────────────────────────────
function QuesitosTab({ process }: { process: LegalProcess }) {
    const quesitos = process.quesitos ?? [];
    if (quesitos.length === 0) {
        return <EmptyState message="Nenhum quesito encontrado no processo." />;
    }

    // Group by party
    const grouped: Record<string, typeof quesitos> = {};
    for (const q of quesitos) {
        const party = q.party || 'Sem parte identificada';
        if (!grouped[party]) grouped[party] = [];
        grouped[party].push(q);
    }

    return (
        <div className="flex flex-col gap-5">
            {Object.entries(grouped).map(([party, items]) => (
                <div key={party} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-sm font-bold text-slate-700">{party}</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {items.map((q, i) => (
                            <div key={i} className="px-5 py-4 flex items-start gap-3">
                                <span className="shrink-0 size-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 leading-relaxed">{q.text}</p>
                                    {q.source_page && (
                                        <span className="inline-block mt-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                            Pág. {q.source_page}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Tab: Relevant Documents ───────────────────────────────────────────────────
function DocumentsTab({ process }: { process: LegalProcess }) {
    const docs = [...(process.relevant_documents ?? [])].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    if (docs.length === 0) {
        return <EmptyState message="Nenhum documento relevante identificado." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc, i) => {
                const categoryCls = CATEGORY_STYLES[doc.category] ?? 'bg-slate-100 text-slate-600';
                return (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{doc.name}</p>
                            {doc.category && (
                                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${categoryCls}`}>
                                    {doc.category}
                                </span>
                            )}
                        </div>
                        {doc.summary && (
                            <p className="text-xs text-slate-500 leading-relaxed">{doc.summary}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                            <span>{doc.type}</span>
                            {doc.date && <span>{formatDate(doc.date)}</span>}
                        </div>
                        {doc.parties?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {doc.parties.map((p, j) => (
                                    <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p}</span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Static exam module library ────────────────────────────────────────────────
interface ExamDetail {
    name: string;
    description: string;
    referenceValues: string;
}
interface ExamModule {
    id: string;
    name: string;
    exams: ExamDetail[];
}

const EXAM_LIBRARY: ExamModule[] = [
    {
        id: 'observacoes_iniciais',
        name: 'Observações Iniciais e Contexto Pericial',
        exams: [
            {
                name: 'Identificação e apresentação do periciando',
                description: 'Observa-se aspectos gerais de apresentação, nível de consciência, orientação no tempo e espaço, grau de cooperação com o exame e eventual uso de dispositivos auxiliares (bengala, muleta, órtese).',
                referenceValues: 'Paciente consciente, orientado, colaborativo, sem dispositivos auxiliares.',
            },
            {
                name: 'Anamnese dirigida às queixas do processo',
                description: 'Coleta estruturada do histórico médico relacionado ao objeto da perícia: início, evolução, tratamentos realizados, medicamentos em uso, limitações funcionais autorreferidas e impacto nas atividades laborais.',
                referenceValues: 'Relato coerente, sem inconsistências entre queixas e achados objetivos.',
            },
        ],
    },
    {
        id: 'sinais_vitais',
        name: 'Sinais Vitais e Medidas Antropométricas',
        exams: [
            {
                name: 'Pressão arterial (PA)',
                description: 'Aferição da pressão arterial sistólica e diastólica com esfigmomanômetro em membro superior direito, paciente sentado, após repouso de 5 minutos.',
                referenceValues: 'Normal: < 120/80 mmHg. Pré-hipertensão: 120-139/80-89 mmHg. Hipertensão: ≥ 140/90 mmHg.',
            },
            {
                name: 'Frequência cardíaca (FC)',
                description: 'Contagem dos batimentos cardíacos por minuto, por palpação radial ou ausculta precordial durante 60 segundos.',
                referenceValues: 'Normal em repouso: 60–100 bpm.',
            },
            {
                name: 'Índice de Massa Corporal (IMC)',
                description: 'Aferição de peso (kg) e altura (m) com cálculo do IMC = peso / altura². Relevante para avaliação de sobrecarga articular e risco cirúrgico.',
                referenceValues: 'Abaixo do peso: < 18,5 | Normal: 18,5–24,9 | Sobrepeso: 25–29,9 | Obesidade: ≥ 30.',
            },
            {
                name: 'Temperatura axilar',
                description: 'Aferição da temperatura com termômetro clínico na axila, após 3 minutos de contato.',
                referenceValues: 'Normal: 36,0–37,0 °C. Febre: > 37,5 °C.',
            },
        ],
    },
    {
        id: 'inspecao_postural',
        name: 'Inspeção Geral e Postural',
        exams: [
            {
                name: 'Avaliação geral do estado de saúde e constituição',
                description: 'Observa-se aparência geral, fácies, padrão respiratório, coloração cutâneo-mucosa, hidratação, presença de dor aparente ou uso de órteses. Paciente em ortostatismo e deambulação curta no consultório.',
                referenceValues: 'Bom estado geral, corado, hidratado, afebril, sem desconforto respiratório.',
            },
            {
                name: 'Avaliação postural global em ortostatismo (plano frontal e sagital)',
                description: 'Paciente em pé, descalço. Observa-se alinhamento da cabeça, ombros, escápulas, pelve, joelhos e pés; presença de escoliose, hiperlordose/hipercifose, genu valgo/varo, pronação/supinação do pé.',
                referenceValues: 'Alinhamento céfalo-caudal adequado; simetria de ombros, escápulas, cristas ilíacas e joelhos; curvaturas fisiológicas preservadas.',
            },
            {
                name: 'Inspeção segmentar da pele, cicatrizes e atrofias',
                description: 'Examina-se pele e partes moles sobre regiões sintomáticas relatadas, procurando por cicatrizes, equimoses, edema, eritema, atrofia ou deformidades.',
                referenceValues: 'Pele íntegra, sem lesões, sem cicatrizes patológicas; trofismo muscular preservado.',
            },
        ],
    },
    {
        id: 'aparelho_locomotor',
        name: 'Inspeção e Exame do Aparelho Locomotor (Triagem Ortopédica)',
        exams: [
            {
                name: 'Inspeção segmentar do sistema musculoesquelético',
                description: 'Avaliação visual de todas as articulações principais (coluna, ombros, cotovelos, punhos, quadris, joelhos, tornozelos), verificando simetria, deformidades, edema e alterações de volume.',
                referenceValues: 'Articulações simétricas, sem edema, sem deformidades, sem sinais inflamatórios.',
            },
            {
                name: 'Avaliação da marcha e transferências posturais',
                description: 'Observação da marcha (velocidade, cadência, comprimento do passo, simetria), análise das transferências sentado↔em pé e avaliação do equilíbrio estático e dinâmico.',
                referenceValues: 'Marcha simétrica, sem claudicação, transferências independentes, equilíbrio preservado.',
            },
            {
                name: 'Avaliação de deformidades e assimetrias articulares',
                description: 'Comparação bilateral de comprimento e diâmetro de membros; identificação de anquiloses, rigidez, luxações ou subluxações.',
                referenceValues: 'Simetria bilateral; ausência de deformidades estruturais.',
            },
        ],
    },
    {
        id: 'palpacao',
        name: 'Palpação de Estruturas Relevantes',
        exams: [
            {
                name: 'Palpação de pontos dolorosos e estruturas articulares',
                description: 'Palpação digital das estruturas musculares, tendinosas, ligamentares e periarticulares das regiões sintomáticas, com registro da localização, intensidade (EVA 0-10) e irradiação da dor.',
                referenceValues: 'Ausência de dor à palpação; estruturas de consistência normal sem espessamento ou nodulações.',
            },
            {
                name: 'Avaliação de tônus muscular e espasmo',
                description: 'Palpação da musculatura paravertebral e dos principais grupos musculares dos membros, verificando tônus, presença de contratura ou espasmo reflexo, pontos-gatilho (trigger points).',
                referenceValues: 'Tônus muscular normotônico; ausência de espasmos ou contraturias.',
            },
        ],
    },
    {
        id: 'adm',
        name: 'Amplitude de Movimento (ADM) Articular',
        exams: [
            {
                name: 'ADM da coluna cervical',
                description: 'Mensuração com goniômetro de flexão, extensão, rotação direita/esquerda e inclinação lateral direita/esquerda. Registro de dor, limitação ou crepitação durante o movimento.',
                referenceValues: 'Flexão 45°, extensão 45°, rotação 70°, inclinação lateral 45° (AMA, 6ª ed.).',
            },
            {
                name: 'ADM da coluna lombar',
                description: 'Avaliação de flexão (distância mão-solo ou teste de Schober modificado), extensão e inclinações laterais; verificação de escoliose funcional em movimento.',
                referenceValues: 'Flexão: aumento de 5 cm no Schober modificado (15→20 cm); extensão 30°; inclinação lateral 25°.',
            },
            {
                name: 'ADM de ombros e membros superiores',
                description: 'Goniometria de flexão, extensão, abdução, rotação interna e externa do ombro; flexão/extensão de cotovelo; pronossupinação; desvios de punho; pinça e preensão.',
                referenceValues: 'Abdução: 180°; flexão: 180°; rotação externa: 90°; rotação interna: 90° (valores normais AMA).',
            },
            {
                name: 'ADM de quadril e membros inferiores',
                description: 'Goniometria de flexão, extensão, abdução, adução e rotações do quadril; flexão/extensão de joelho; dorsiflexão e flexão plantar do tornozelo.',
                referenceValues: 'Flexão do quadril: 100–120°; extensão: 30°; rotação interna: 40°; rotação externa: 60°; joelho extensão 0°, flexão 135°.',
            },
        ],
    },
    {
        id: 'forca_muscular',
        name: 'Força Muscular (Escala MRC 0-5)',
        exams: [
            {
                name: 'Força muscular de membros superiores (MMSS)',
                description: 'Avaliação bilateral de grupos musculares proximais (deltóide, bíceps, tríceps) e distais (intrínsecos da mão, punho). Grau MRC: 0=sem contração, 1=traço, 2=mov. sem gravidade, 3=contra gravidade, 4=contra resistência parcial, 5=força normal.',
                referenceValues: 'MRC 5/5 bilateral, sem assimetria > 1 grau entre lados.',
            },
            {
                name: 'Força muscular de membros inferiores (MMII)',
                description: 'Avaliação bilateral de quadríceps, isquiotibiais, tibial anterior, tríceps sural e intrínsecos do pé. Incluir teste de sentar-levantar 5 vezes e caminhada 10 metros para avaliação funcional da força.',
                referenceValues: 'MRC 5/5 bilateral; caminhada 10m em < 10 segundos; sentar-levantar 5x em < 15 segundos.',
            },
        ],
    },
    {
        id: 'neurologico',
        name: 'Exame Neurológico',
        exams: [
            {
                name: 'Reflexos tendinosos profundos',
                description: 'Pesquisa com martelo de percussão de reflexos bicipital, tricipital, braquiorradial, patelar e aquileu, com registro de hipo/hiper-reflexia e assimetrias.',
                referenceValues: '2+ (normal) bilateralmente. Hiper-reflexia: > 3+. Hiporreflexia: < 1+. Arreflexia: 0.',
            },
            {
                name: 'Sensibilidade (tátil, dolorosa e vibratória)',
                description: 'Avaliação dermatomal da sensibilidade: tátil superficial (algodão), dolorosa (palito), vibratória (diapasão 128 Hz em proeminências ósseas) e proprioceptiva (sentido de posição segmentar).',
                referenceValues: 'Sensibilidade preservada e simétrica em todos os dermátomos avaliados. Ausência de hipoestesia, hiperestesia ou alodínia.',
            },
            {
                name: 'Coordenação e marcha neurológica',
                description: 'Provas índex-nariz, calcanhar-joelho, disdiadococinesia; avaliação de marcha tandem (calcanhar-bico), Romberg simples e sensibilizado.',
                referenceValues: 'Provas de coordenação sem dismetria; Romberg negativo; marcha tandem sem desvios > 50 cm.',
            },
        ],
    },
    {
        id: 'testes_provocativos',
        name: 'Testes Provocativos e Manobras Especiais de Coluna/Quadril',
        exams: [
            {
                name: 'Teste de Lasègue e variantes',
                description: 'Elevação da perna estendida (SLR) com ângulo de positividade; Lasègue cruzado; Teste de Bragard (dorsiflexão do pé durante SLR); interpretação de irritação radicular L4, L5, S1.',
                referenceValues: 'Negativo: elevação ≥ 70° sem dor radicular. Positivo: dor irradiada < 60°.',
            },
            {
                name: 'Testes de compressão e descompressão vertebral',
                description: 'Teste de compressão axial de Spurling (cervical); teste de distração cervical; teste de compressão lombar com sinal de Kemp; teste de Naffziger para pressão jugular.',
                referenceValues: 'Negativo: ausência de irradiação radicular à compressão.',
            },
            {
                name: 'Teste de Patrick (FABERE) para quadril',
                description: 'Flexão, ABdução, Rotação Externa em posição em "4" — avaliação de patologia coxofemoral e sacroilíaca. Complementado por Teste de FADIR (Flexão, ADução, Rotação Interna) para impingement.',
                referenceValues: 'Negativo: ausência de dor inguinal, trocantérica ou sacroilíaca.',
            },
        ],
    },
    {
        id: 'joelho',
        name: 'Testes de Joelho (se queixa em MMII)',
        exams: [
            {
                name: 'Testes ligamentares',
                description: 'Gaveta anterior e posterior (LCA/LCP); estresse em varo e valgo (LCL/LCM); Lachman; pivot-shift. Classificação da lassidão: grau I (<5mm), II (5-10mm), III (>10mm).',
                referenceValues: 'Negativos bilateralmente: ausência de gaveta, lassidão < 3mm em relação ao lado contralateral.',
            },
            {
                name: 'Avaliação patelofemoral',
                description: 'Sinal de Clarke (inibição patelar); apprehension test; avaliação do ângulo Q; palpação das facetas patelares mediail e lateral; avaliação de crepitação femoropatelar.',
                referenceValues: 'Clarke negativo; ângulo Q < 20° (homens) e < 25° (mulheres); ausência de apreensão.',
            },
            {
                name: 'Testes meniscais (McMurray e Apley)',
                description: 'McMurray: rotação interna/externa com flexão para menisco lateral/medial. Apley: compressão em decúbito ventral com rotações. Thessaly: compressão axial em apoio monopodal com rotações do tronco.',
                referenceValues: 'Negativos: ausência de clique doloroso ou bloqueio articular.',
            },
        ],
    },
    {
        id: 'funcional',
        name: 'Avaliação Funcional e Capacidade Laboral',
        exams: [
            {
                name: 'Teste de caminhada e equilíbrio',
                description: 'Timed Up and Go (TUG): sentar, levantar, caminhar 3m, retornar e sentar. Caminhada de 6 minutos (TC6M) quando indicada. Avaliação de equilíbrio estático unipodal.',
                referenceValues: 'TUG < 12 segundos: mobilidade normal. TC6M: > 400m considerado funcional. Equilíbrio unipodal > 30 segundos.',
            },
            {
                name: 'Avaliação de atividades de vida diária (AVD)',
                description: 'Análise da capacidade de realizar AVDs básicas (higiene, vestuário, alimentação) e instrumentais (transporte, compras, trabalho doméstico). Uso do Índice de Barthel ou escala de Katz quando indicado.',
                referenceValues: 'Independência plena: Barthel 100/100; Katz A (independente em todas as 6 funções).',
            },
            {
                name: 'Análise da capacidade laboral específica',
                description: 'Avaliação dirigida às demandas físicas da atividade profissional descrita no processo: postura de trabalho, carga manuseada, ciclos de movimento, demandas de força e resistência.',
                referenceValues: 'Capacidade de realizar as tarefas laborais sem restrição funcional objetiva.',
            },
        ],
    },
    {
        id: 'cardiovascular',
        name: 'Exame Cardiovascular (Triagem Pericial)',
        exams: [
            {
                name: 'Ausculta cardíaca e ritmo',
                description: 'Ausculta nos 4 focos clássicos (mitral, tricúspide, pulmonar, aórtico): avaliação de bulhas cardíacas, presença de sopros (graduação de Levine I-VI/VI), arritmias ou extrassístoles.',
                referenceValues: 'Ritmo cardíaco regular, 2 bulhas normofonéticas, ausência de sopros ou extratons.',
            },
            {
                name: 'Avaliação de pulsos periféricos e edema',
                description: 'Palpação de pulsos radial, femoral, poplíteo, tibial posterior e pedioso bilateralmente. Pesquisa de edema periférico com cacifo (godet) em tornozelos e pré-tibial.',
                referenceValues: 'Pulsos palpáveis e simétricos (2+/4+) bilateralmente. Ausência de edema periférico.',
            },
        ],
    },
    {
        id: 'respiratorio',
        name: 'Exame Respiratório (Triagem Pericial)',
        exams: [
            {
                name: 'Ausculta pulmonar',
                description: 'Ausculta comparativa dos campos pulmonares anteriores e posteriores: verificação de murmúrio vesicular, presença de estertores, sibilos, roncos ou atrito pleural. Frêmito tóraco-vocal quando indicado.',
                referenceValues: 'Murmúrio vesicular presente bilateralmente, sem ruídos adventícios.',
            },
            {
                name: 'Avaliação da expansibilidade torácica',
                description: 'Inspeção do padrão respiratório (frequência, ritmo, uso de musculatura acessória); medida da expansibilidade torácica com fita métrica (diferença inspiração/expiração máximas ao nível de T4).',
                referenceValues: 'FR: 12–20 irpm. Expansibilidade ≥ 5 cm. Ausência de uso de musculatura acessória.',
            },
        ],
    },
];

function normalizeStr(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function findModule(suggestedName: string): ExamModule | undefined {
    const norm = normalizeStr(suggestedName);
    return EXAM_LIBRARY.find(m =>
        normalizeStr(m.name).includes(norm) || norm.includes(normalizeStr(m.name).substring(0, 12))
    );
}

// ── Tab: Suggested Examinations ───────────────────────────────────────────────
function ExaminationsTab({ process }: { process: LegalProcess }) {
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());

    const aiSuggestions = process.suggested_examinations ?? [];

    // Map each AI suggestion to a module from the library
    const matchedModules: { module: ExamModule; justification: string; priority: string }[] = [];
    const unmatchedSuggestions: typeof aiSuggestions = [];

    for (const suggestion of aiSuggestions) {
        const module = findModule(suggestion.name);
        if (module) {
            if (!matchedModules.find(m => m.module.id === module.id)) {
                matchedModules.push({ module, justification: suggestion.justification, priority: suggestion.priority });
            }
        } else {
            unmatchedSuggestions.push(suggestion);
        }
    }

    if (matchedModules.length === 0 && unmatchedSuggestions.length === 0) {
        return <EmptyState message="Nenhum exame sugerido pela IA para este processo." />;
    }

    function toggleModule(id: string) {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function toggleExam(key: string) {
        setExpandedExams(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-purple-500" />
                <p className="text-xs text-slate-500">
                    A IA identificou <strong>{matchedModules.length + unmatchedSuggestions.length}</strong> módulo(s) de exame relevante(s) para este processo.
                </p>
            </div>

            {/* Matched modules with library details */}
            {matchedModules.map(({ module, justification, priority }) => {
                const ps = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.low;
                const isOpen = expandedModules.has(module.id);
                return (
                    <div key={module.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="size-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                    <Sparkles size={16} className="text-purple-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{module.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{justification}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ps.cls}`}>
                                    {ps.label}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {module.exams.length} exames
                                </span>
                                {isOpen
                                    ? <ChevronDown size={16} className="text-slate-400" />
                                    : <ChevronRight size={16} className="text-slate-400" />
                                }
                            </div>
                        </button>

                        {isOpen && (
                            <div className="border-t border-slate-100 divide-y divide-slate-100">
                                {module.exams.map((exam, ei) => {
                                    const examKey = `${module.id}-${ei}`;
                                    const examOpen = expandedExams.has(examKey);
                                    return (
                                        <div key={ei}>
                                            <button
                                                onClick={() => toggleExam(examKey)}
                                                className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="size-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                        {ei + 1}
                                                    </span>
                                                    <p className="text-sm font-semibold text-slate-700">{exam.name}</p>
                                                </div>
                                                {examOpen
                                                    ? <ChevronDown size={14} className="text-slate-400 shrink-0" />
                                                    : <ChevronRight size={14} className="text-slate-400 shrink-0" />
                                                }
                                            </button>
                                            {examOpen && (
                                                <div className="px-5 pb-4 pl-14 flex flex-col gap-3">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Descrição</p>
                                                        <p className="text-sm text-slate-600 leading-relaxed">{exam.description}</p>
                                                    </div>
                                                    <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Valores de Referência</p>
                                                        <p className="text-sm text-emerald-800 leading-relaxed">{exam.referenceValues}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Unmatched AI suggestions (free-form) */}
            {unmatchedSuggestions.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">Outros exames sugeridos pela IA</p>
                    {unmatchedSuggestions.map((exam, i) => {
                        const ps = PRIORITY_STYLES[exam.priority] ?? PRIORITY_STYLES.low;
                        return (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
                                <div className="size-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                    <Sparkles size={16} className="text-purple-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-bold text-slate-800">{exam.name}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ps.cls}`}>{ps.label}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{exam.justification}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function ProcessDetailsModal({ isOpen, onClose, process }: ProcessDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('executive');
    const [downloadingDoc, setDownloadingDoc] = useState(false);

    if (!isOpen || !process) return null;

    const displayName = process.process_name ?? process.document_name;
    const isError = process.status === 'error';
    const needsReview = process.status === 'needs_review';
    const isProcessing = process.status === 'processing';

    async function handleDownloadDocument() {
        setDownloadingDoc(true);
        try {
            const { data, error } = await supabase.storage
                .from('legal-documents')
                .createSignedUrl(process!.document_path, 300);
            if (error || !data?.signedUrl) throw error ?? new Error('URL não gerada');
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        } catch {
            alert('Não foi possível gerar o link para o documento. Verifique as permissões do bucket.');
        } finally {
            setDownloadingDoc(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[1200px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-14 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                <Scale className="text-indigo-500" size={28} strokeWidth={2} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-bold text-slate-800">{displayName}</h2>
                                <div className="flex flex-wrap items-center gap-2">
                                    {process.process_number && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 font-mono">
                                            {process.process_number}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                                        <span className="size-1.5 rounded-full bg-indigo-500" />
                                        {process.professional_role}
                                    </span>
                                    {process.parties?.length > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                            {process.parties.length} partes
                                            <ChevronDown size={12} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadDocument}
                                disabled={downloadingDoc}
                                title={`Abrir documento: ${process.document_name}`}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-60"
                            >
                                {downloadingDoc
                                    ? <Loader size={15} className="animate-spin" />
                                    : <Download size={15} />
                                }
                                <span className="hidden sm:inline">Ver documento</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* needs_review banner */}
                    {needsReview && (
                        <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                <span className="font-bold">Revisão necessária: </span>
                                {process.status_message ?? 'A extração por IA pode conter imprecisões. Revise os dados antes de usar.'}
                            </p>
                        </div>
                    )}

                    {/* error banner */}
                    {isError && (
                        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                            <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">
                                <span className="font-bold">Erro na análise: </span>
                                {process.status_message ?? 'A extração por IA falhou.'}
                            </p>
                        </div>
                    )}

                    {/* processing banner */}
                    {isProcessing && (
                        <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                            <p className="text-sm text-blue-800">
                                <span className="font-bold">Análise em andamento — </span>
                                aguarde enquanto a IA processa o documento.
                            </p>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="px-8 border-b border-slate-200 shrink-0 overflow-x-auto">
                    <div className="flex items-center gap-6 min-w-max">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                    activeTab === tab.id
                                        ? 'text-indigo-600 border-indigo-600'
                                        : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                    <div className="max-w-[1000px] mx-auto">

                        {/* Export header (shown on all tabs) */}
                        {!isProcessing && !isError && (
                            <div className="flex justify-end gap-3 mb-6">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                                    <Lock size={16} className="text-slate-400" />
                                    PDF
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                                    <Lock size={16} className="text-slate-400" />
                                    DOCX
                                </button>
                            </div>
                        )}

                        {activeTab === 'executive' && <ExecutiveSummaryTab process={process} />}
                        {activeTab === 'summary' && <ProcessSummaryTab process={process} />}
                        {activeTab === 'quesitos' && <QuesitosTab process={process} />}
                        {activeTab === 'documents' && <DocumentsTab process={process} />}
                        {activeTab === 'examinations' && <ExaminationsTab process={process} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
