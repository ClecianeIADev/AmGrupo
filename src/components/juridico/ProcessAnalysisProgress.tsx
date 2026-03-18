// T024: ProcessAnalysisProgress
// Shows animated progress while Gemini is analyzing the legal document.
// Displays elapsed time vs 5-minute estimate and a friendly status message.

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProcessAnalysisProgressProps {
    processName: string;
}

const MESSAGES = [
    'Lendo o documento...',
    'Identificando partes e representantes...',
    'Extraindo datas e prazos críticos...',
    'Analisando quesitos apresentados...',
    'Gerando resumo executivo...',
    'Organizando documentos relevantes...',
    'Sugerindo exames pertinentes...',
    'Finalizando análise...',
];

export function ProcessAnalysisProgress({ processName }: ProcessAnalysisProgressProps) {
    const [elapsed, setElapsed] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const rotator = setInterval(() => {
            setMessageIndex(i => (i + 1) % MESSAGES.length);
        }, 8000);
        return () => clearInterval(rotator);
    }, []);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const elapsedStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
    const progress = Math.min((elapsed / 300) * 100, 98); // cap at 98% until confirmed

    return (
        <div
            className="flex flex-col items-center gap-6 p-8 text-center"
            role="status"
            aria-live="polite"
            aria-label={`Analisando processo: ${MESSAGES[messageIndex]}`}
        >
            {/* Animated icon */}
            <div className="relative size-20">
                <div className="absolute inset-0 rounded-full bg-indigo-50 border-4 border-indigo-100 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={32} className="text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
            </div>

            {/* Title */}
            <div>
                <p className="text-base font-bold text-slate-800">Análise em andamento</p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                    {processName}
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-sm">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                    <span>{MESSAGES[messageIndex]}</span>
                    <span>{elapsedStr} / ~5:00</span>
                </div>
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
                A análise por IA pode levar até 5 minutos para documentos extensos. Você pode fechar esta tela — o processo continuará em segundo plano.
            </p>
        </div>
    );
}
