// T024: ProcessAnalysisProgress
// Timeline-style progress while Gemini analyzes the legal document.
// Steps turn green progressively, aligned to the ~5-minute real analysis time.

import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

interface ProcessAnalysisProgressProps {
    processName: string;
}

const STEPS = [
    { label: 'Lendo o documento',                     sub: '~0:08' },
    { label: 'Identificando partes e representantes', sub: '~0:16' },
    { label: 'Extraindo datas e prazos críticos',     sub: '~0:24' },
    { label: 'Analisando quesitos apresentados',      sub: '~0:32' },
    { label: 'Gerando resumo executivo',              sub: '~0:40' },
    { label: 'Organizando documentos relevantes',     sub: '~0:50' },
    { label: 'Sugerindo exames pertinentes',          sub: '~1:00' },
    { label: 'Finalizando análise',                   sub: '~1:10' },
];

// Threshold in seconds when each step becomes active (~8 s each)
const THRESHOLDS = [0, 8, 16, 24, 32, 40, 50, 60];

export function ProcessAnalysisProgress({ processName }: ProcessAnalysisProgressProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setElapsed((s: number) => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const elapsedStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

    // Active step = last threshold that has been crossed
    const activeStep = THRESHOLDS.reduce(
        (acc, t, i) => (elapsed >= t ? i : acc),
        0
    );

    return (
        <div
            className="flex flex-col gap-6 p-6"
            role="status"
            aria-live="polite"
            aria-label={`Analisando processo: ${STEPS[activeStep].label}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="relative size-10 shrink-0">
                    <div className="absolute inset-0 rounded-full bg-indigo-50 border-2 border-indigo-100 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={18} className="text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">Análise em andamento</p>
                    <p className="text-xs text-slate-400 truncate">{processName}</p>
                </div>
                <span className="ml-auto text-xs font-mono text-slate-400 shrink-0">{elapsedStr} / ~5:00</span>
            </div>

            {/* Timeline */}
            <div className="flex flex-col">
                {STEPS.map((step, i) => {
                    const isDone    = i < activeStep;
                    const isActive  = i === activeStep;
                    const isPending = i > activeStep;
                    const isLast    = i === STEPS.length - 1;

                    return (
                        <div key={i} className="flex gap-3">
                            {/* Left column: dot + connector line */}
                            <div className="flex flex-col items-center">
                                {/* Circle */}
                                <div className={`relative size-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
                                    isDone   ? 'bg-emerald-500'
                                    : isActive ? 'bg-white border-2 border-emerald-400'
                                    : 'bg-white border-2 border-slate-200'
                                }`}>
                                    {isDone && (
                                        <Check size={13} className="text-white" strokeWidth={3} />
                                    )}
                                    {isActive && (
                                        <>
                                            <div className="size-2 rounded-full bg-emerald-400" />
                                            {/* Pulse ring */}
                                            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
                                        </>
                                    )}
                                    {isPending && (
                                        <div className="size-2 rounded-full bg-slate-200" />
                                    )}
                                </div>

                                {/* Connector line */}
                                {!isLast && (
                                    <div className={`w-0.5 flex-1 my-0.5 min-h-[20px] transition-colors duration-500 ${
                                        isDone ? 'bg-emerald-400' : 'bg-slate-200'
                                    }`} />
                                )}
                            </div>

                            {/* Right column: text */}
                            <div className={`pb-4 ${isLast ? 'pb-0' : ''} flex items-start justify-between w-full min-w-0`}>
                                <p className={`text-sm leading-6 font-medium transition-colors duration-300 ${
                                    isDone    ? 'text-emerald-600'
                                    : isActive ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}>
                                    {step.label}
                                </p>
                                <span className={`text-xs leading-6 font-mono shrink-0 ml-2 transition-colors duration-300 ${
                                    isDone    ? 'text-emerald-400'
                                    : isActive ? 'text-slate-500'
                                    : 'text-slate-300'
                                }`}>
                                    {step.sub}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer note */}
            <p className="text-xs text-slate-400 text-center border-t border-slate-100 pt-4">
                Você pode fechar esta tela — a análise continua em segundo plano.
            </p>
        </div>
    );
}
