'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import {
    Sparkles, ChevronRight, ChevronLeft, Loader2,
    Play, Lock, CheckCircle, Clock, ArrowRight, Zap,
    RotateCcw, GraduationCap,
} from 'lucide-react';

/* ──────────────── Types ────────────────────────────────── */
interface McqAnswers {
    challenge: string;
    timePerWeek: string;
    techLevel: string;
    teamSize: string;
}

interface RoadmapStep {
    stepNumber: number;
    stepTitle: string;
    objective: string;
    formationId: string | null;
    formationTitle: string;
    why: string;
    estimatedWeeks: number;
}

interface Roadmap {
    intro: string;
    steps: RoadmapStep[];
}

/* ──────────────── Questions MCQ ───────────────────────── */
const QUESTIONS = [
    {
        key: 'challenge' as const,
        label: 'Quel est votre principal défi en ce moment ?',
        emoji: '🎯',
        options: [
            { value: 'Trop de tâches répétitives à la main', emoji: '⏱️' },
            { value: 'Je perds des clients face à la concurrence', emoji: '📉' },
            { value: 'Je ne sais pas quels outils IA utiliser', emoji: '🤔' },
            { value: 'Mon équipe résiste au changement technologique', emoji: '👥' },
            { value: 'Je veux automatiser mes soumissions / devis', emoji: '📋' },
        ],
    },
    {
        key: 'timePerWeek' as const,
        label: 'Combien de temps par semaine pouvez-vous investir ?',
        emoji: '⏰',
        options: [
            { value: 'Moins de 1h par semaine', emoji: '⚡' },
            { value: '1 à 3h par semaine', emoji: '🌱' },
            { value: '3 à 5h par semaine', emoji: '🚀' },
            { value: 'Plus de 5h par semaine', emoji: '💪' },
        ],
    },
    {
        key: 'techLevel' as const,
        label: 'Votre niveau de confort avec les outils numériques ?',
        emoji: '💻',
        options: [
            { value: 'Débutant — j\'utilise surtout email et Excel', emoji: '🌱' },
            { value: 'Intermédiaire — j\'utilise des logiciels métier', emoji: '⚙️' },
            { value: 'Avancé — j\'explore déjà des outils IA', emoji: '🤖' },
        ],
    },
    {
        key: 'teamSize' as const,
        label: 'Quelle est la taille de votre équipe ?',
        emoji: '👤',
        options: [
            { value: 'Seul(e) ou 1-2 personnes', emoji: '🧍' },
            { value: '3 à 10 personnes', emoji: '👫' },
            { value: '11 à 50 personnes', emoji: '👥' },
            { value: 'Plus de 50 personnes', emoji: '🏢' },
        ],
    },
];

/* ──────────────── StepBadge ────────────────────────────── */
function StepBadge({ step, total, completed }: { step: number; total: number; completed: boolean }) {
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                        width: i === step - 1 ? 24 : 8,
                        background: i < step - 1 || completed ? '#10b981' : i === step - 1 ? 'var(--primary)' : 'var(--border)',
                    }}
                />
            ))}
        </div>
    );
}

/* ──────────────── RoadmapCard ──────────────────────────── */
function RoadmapCard({ step, index, onOpenFormation }: {
    step: RoadmapStep;
    index: number;
    onOpenFormation: (formationId: string) => void;
}) {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    const color = colors[index % colors.length];

    return (
        <div className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                >
                    {step.stepNumber}
                </div>
                {index < 4 && <div className="w-0.5 flex-1 mt-2" style={{ background: 'var(--border)', minHeight: 32 }} />}
            </div>

            {/* Card */}
            <div className="flex-1 mb-4">
                <div
                    className="rounded-2xl p-5 transition-all"
                    style={{ background: 'var(--bg-surface)', border: `1px solid var(--border)`, boxShadow: 'var(--shadow-sm)' }}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                            <span
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color }}
                            >
                                Étape {step.stepNumber} · {step.estimatedWeeks} semaine{step.estimatedWeeks > 1 ? 's' : ''}
                            </span>
                            <h3 className="font-black text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>
                                {step.stepTitle}
                            </h3>
                        </div>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
                        >
                            {step.formationId ? <Play size={14} style={{ color }} /> : <GraduationCap size={14} style={{ color }} />}
                        </div>
                    </div>

                    {/* Objectif */}
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Objectif : </span>
                        {step.objective}
                    </p>

                    {/* Why */}
                    <div
                        className="p-3 rounded-xl mb-4 text-xs leading-relaxed"
                        style={{ background: `color-mix(in srgb, ${color} 8%, var(--bg-elevated))`, border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`, color: 'var(--text-secondary)' }}
                    >
                        💡 {step.why}
                    </div>

                    {/* Formation CTA */}
                    <div
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <GraduationCap size={14} style={{ color, flexShrink: 0 }} />
                            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                {step.formationTitle}
                            </span>
                        </div>
                        {step.formationId ? (
                            <button
                                onClick={() => onOpenFormation(step.formationId!)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 ml-2"
                                style={{ background: color }}
                            >
                                Voir <Play size={10} />
                            </button>
                        ) : (
                            <Link
                                href="/formations"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ml-2"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            >
                                Parcourir <ArrowRight size={10} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────── Page principale ─────────────────────── */
type PageState = 'intro' | 'quiz' | 'loading' | 'result';

function ParcoursPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromCert = searchParams.get('from') === 'cert';

    const [state, setState] = useState<PageState>('intro');
    const [qIndex, setQIndex] = useState(0);
    const [answers, setAnswers] = useState<McqAnswers>({ challenge: '', timePerWeek: '', techLevel: '', teamSize: '' });
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [error, setError] = useState('');
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Persist roadmap in localStorage
    useEffect(() => {
        const saved = localStorage.getItem('stratia_parcours');
        if (saved) {
            try { setRoadmap(JSON.parse(saved)); setState('result'); } catch { /* */ }
        }
    }, []);

    const currentQ = QUESTIONS[qIndex];
    const currentAnswer = answers[currentQ?.key ?? 'challenge'];

    function selectOption(value: string) {
        setAnswers(prev => ({ ...prev, [currentQ.key]: value }));
    }

    function nextQuestion() {
        if (qIndex < QUESTIONS.length - 1) {
            setQIndex(i => i + 1);
        } else {
            generateRoadmap();
        }
    }

    function prevQuestion() {
        if (qIndex > 0) setQIndex(i => i - 1);
    }

    async function generateRoadmap() {
        setState('loading');
        setError('');
        try {
            const res = await fetch('/api/parcours/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });
            const data: Roadmap = await res.json();
            setRoadmap(data);
            localStorage.setItem('stratia_parcours', JSON.stringify(data));
            setState('result');
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
            setState('quiz');
        }
    }

    function restart() {
        localStorage.removeItem('stratia_parcours');
        setRoadmap(null);
        setAnswers({ challenge: '', timePerWeek: '', techLevel: '', teamSize: '' });
        setQIndex(0);
        setState('intro');
        setCompletedSteps(new Set());
    }

    function openFormation(formationId: string) {
        router.push(`/formations?open=${formationId}`);
    }

    const totalWeeks = roadmap?.steps.reduce((s, st) => s + st.estimatedWeeks, 0) ?? 0;

    /* ── INTRO ── */
    if (state === 'intro') {
        return (
            <AppShell>
                <div className="max-w-2xl mx-auto px-6 py-12">
                    <div className="rounded-3xl p-8 sm:p-12 text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.25)' }}>
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '0 8px 30px rgba(139,92,246,0.4)' }}>
                            <Sparkles size={28} className="text-white" />
                        </div>

                        {fromCert ? (
                            <>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
                                    <CheckCircle size={12} /> Certificat téléchargé avec succès
                                </div>
                                <h1 className="text-3xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Et maintenant, quelle est<br />
                                    <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>votre prochaine étape ?</span>
                                </h1>
                                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                                    Vous voulez <strong style={{ color: 'var(--text-primary)' }}>augmenter votre productivité</strong>, gagner plus de temps et plus d&apos;argent, mais vous ne savez pas quelles formations venir ?<br /><br />
                                    Notre IA analyse votre profil en <strong style={{ color: 'var(--text-primary)' }}>3 questions</strong> et vous propose un parcours de formations fait pour vous.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Votre parcours IA<br />
                                    <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>sur mesure</span>
                                </h1>
                                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                                    Vous voulez <strong style={{ color: 'var(--text-primary)' }}>gagner du temps, réduire vos coûts et rester compétitif</strong> — mais vous ne savez pas par où commencer ?<br /><br />
                                    Répondez à <strong style={{ color: 'var(--text-primary)' }}>4 questions rapides</strong> et notre IA vous génère un parcours de formations personnalisé.
                                </p>
                            </>
                        )}

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { icon: '⚡', label: '4 questions', sub: 'Moins de 2 min' },
                                { icon: '🤖', label: 'IA personnalisée', sub: 'Adapté à vous' },
                                { icon: '🎓', label: 'Formations concrètes', sub: 'Chaque étape = 1 cours' },
                            ].map(({ icon, label, sub }) => (
                                <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                    <div className="text-xl mb-1">{icon}</div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setState('quiz')}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white text-base shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}
                        >
                            <Zap size={18} /> Trouver mes formations <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </AppShell>
        );
    }

    /* ── QUIZ ── */
    if (state === 'quiz') {
        const isLast = qIndex === QUESTIONS.length - 1;
        return (
            <AppShell>
                <div className="max-w-xl mx-auto px-6 py-10">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => qIndex === 0 ? setState('intro') : prevQuestion()} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <ChevronLeft size={16} /> Retour
                        </button>
                        <StepBadge step={qIndex + 1} total={QUESTIONS.length} completed={false} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{qIndex + 1} / {QUESTIONS.length}</span>
                    </div>

                    {/* Question */}
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-3">{currentQ.emoji}</div>
                        <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{currentQ.label}</h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 mb-8">
                        {currentQ.options.map(({ value, emoji }) => {
                            const selected = currentAnswer === value;
                            return (
                                <button
                                    key={value}
                                    onClick={() => selectOption(value)}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all"
                                    style={selected
                                        ? { background: 'var(--primary)', color: 'white', border: '2px solid var(--primary)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)', transform: 'scale(1.01)' }
                                        : { background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                >
                                    <span className="text-xl flex-shrink-0">{emoji}</span>
                                    <span className="text-sm font-semibold">{value}</span>
                                    {selected && <CheckCircle size={16} className="ml-auto flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

                    <button
                        onClick={nextQuestion}
                        disabled={!currentAnswer}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-base transition-all disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
                    >
                        {isLast ? (
                            <><Sparkles size={18} /> Générer mon parcours </>
                        ) : (
                            <>Suivant <ChevronRight size={18} /></>
                        )}
                    </button>
                </div>
            </AppShell>
        );
    }

    /* ── LOADING ── */
    if (state === 'loading') {
        return (
            <AppShell>
                <div className="max-w-xl mx-auto px-6 py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                        <Loader2 size={28} className="text-white animate-spin" />
                    </div>
                    <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Notre IA analyse votre profil…</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nous sélectionnons les formations les plus adaptées à vos réponses.</p>
                    <div className="mt-8 flex justify-center gap-2">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: `${i * 150}ms` }} />
                        ))}
                    </div>
                </div>
            </AppShell>
        );
    }

    /* ── RESULT ── */
    if (state === 'result' && roadmap) {
        const completedCount = completedSteps.size;
        const progressPct = roadmap.steps.length ? Math.round(completedCount / roadmap.steps.length * 100) : 0;

        return (
            <AppShell>
                <div className="max-w-2xl mx-auto px-6 py-8">

                    {/* Header */}
                    <div className="rounded-2xl p-6 mb-6"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.25)' }}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>Parcours personnalisé</span>
                                </div>
                                <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Votre parcours IA</h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{roadmap.intro}</p>
                            </div>
                            <button onClick={restart} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                <RotateCcw size={12} /> Refaire
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {[
                                { label: 'Étapes', value: roadmap.steps.length },
                                { label: 'Semaines estimées', value: totalWeeks },
                                { label: 'Complétées', value: `${completedCount}/${roadmap.steps.length}` },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center py-2.5 px-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.12)' }}>
                                    <p className="text-lg font-black text-white">{value}</p>
                                    <p className="text-xs text-white/70">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-white/80">Progression</span>
                                <span className="text-xs font-bold text-white">{progressPct}%</span>
                            </div>
                            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'rgba(255,255,255,0.9)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Étapes */}
                    <div className="mb-6">
                        <h2 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Votre parcours étape par étape</h2>
                        {roadmap.steps.map((step, i) => (
                            <div key={step.stepNumber} className="relative">
                                {/* Completed overlay toggle */}
                                <div className="absolute top-3 right-3 z-10">
                                    <button
                                        onClick={() => setCompletedSteps(prev => {
                                            const next = new Set(prev);
                                            if (next.has(step.stepNumber)) next.delete(step.stepNumber);
                                            else next.add(step.stepNumber);
                                            return next;
                                        })}
                                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                                        style={completedSteps.has(step.stepNumber)
                                            ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                                            : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                                    >
                                        <CheckCircle size={11} />
                                        {completedSteps.has(step.stepNumber) ? 'Fait' : 'Marquer'}
                                    </button>
                                </div>
                                <RoadmapCard step={step} index={i} onOpenFormation={openFormation} />
                            </div>
                        ))}
                    </div>

                    {/* CTA final */}
                    <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Prêt à démarrer l&apos;étape 1 ?</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                <Clock size={11} className="inline mr-1" />
                                Environ {roadmap.steps[0]?.estimatedWeeks ?? 1} semaine{(roadmap.steps[0]?.estimatedWeeks ?? 1) > 1 ? 's' : ''} pour compléter la première étape
                            </p>
                        </div>
                        <Link href="/formations"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                            <GraduationCap size={15} /> Voir toutes les formations <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    return null;
}

/* ── Suspense wrapper obligatoire pour useSearchParams() en Next.js 15 ── */
export default function ParcoursPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ParcoursPageInner />
    </Suspense>
  );
}
