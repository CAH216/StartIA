'use client';
/**
 * OnboardingModal v4 — Tour guidé StratIA avec Léa
 * - Voix ElevenLabs pré-chargée step suivant en arrière-plan
 * - Typewriter démarre exactement quand audio.onplay se déclenche
 * - Vitesse typewriter calculée sur la durée audio réelle (synchro parfaite)
 * - Spotlight CSS sur vrais éléments DOM (box-shadow trick)
 * - Même texte affiché ET parlé (zéro décalage)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Volume2, VolumeX, ChevronRight, ArrowRight, Loader2, Sparkles, GraduationCap } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────── */
interface Step {
    id: string;
    emoji: string;
    accent: string;
    title: string;
    /** Texte affiché ET lu par Léa (identique) */
    text: string;
    /** Sélecteur CSS de l'élément à spotlight-er (optionnel) */
    target?: string;
    /** Position du modal quand un target est actif */
    pos?: 'bottom-right' | 'bottom-left';
    cta?: { label: string; href: string };
}

const STORAGE_KEY = 'stratia_tour_v4';

/* ─── Steps du tour ─────────────────────────────────── */
const STEPS: Step[] = [
    {
        id: 'welcome', emoji: '👋', accent: '#6366f1',
        title: 'Bienvenue sur StratIA !',
        text: "Bonjour ! Je suis Léa, votre guide sur StratIA. Je vais vous faire visiter la plateforme en quelques secondes. StratIA est votre espace personnel pour maîtriser l'intelligence artificielle, que vous soyez débutant ou confirmé.",
    },
    {
        id: 'nav', emoji: '🧭', accent: '#0ea5e9', pos: 'bottom-right',
        target: 'aside',
        title: 'Votre navigation principale',
        text: "Sur votre gauche, voici le menu principal. Il vous donne accès à toutes les sections : votre tableau de bord, le catalogue de formations, vos rendez-vous avec des experts, vos certificats et votre profil.",
    },
    {
        id: 'dashboard', emoji: '📊', accent: '#6366f1', pos: 'bottom-right',
        target: '[data-tour="stats"], .max-w-4xl',
        title: 'Votre tableau de bord',
        text: "Voici votre tableau de bord personnel. Vous y retrouvez vos statistiques de formation, votre progression et les recommandations personnalisées générées par l'intelligence artificielle selon votre profil.",
    },
    {
        id: 'formations', emoji: '🎓', accent: '#8b5cf6', pos: 'bottom-right',
        target: 'a[href="/formations"]',
        title: 'Le catalogue de formations',
        text: "Le catalogue de formations est le cœur de StratIA. Des vidéos à la demande, des cours en direct avec de vrais formateurs, et des sessions privées avec des experts. Tout est adapté à votre secteur et votre niveau.",
        cta: { label: 'Explorer les formations', href: '/formations' },
    },
    {
        id: 'certificates', emoji: '🏆', accent: '#f59e0b', pos: 'bottom-right',
        target: 'a[href="/documents"]',
        title: 'Vos certificats StratIA',
        text: "Dans la section Certificats, retrouvez tous vos diplômes obtenus sur StratIA. Chaque certificat est officiel, téléchargeable et reconnu par nos partenaires entreprises pour valoriser votre profil professionnel.",
    },
    {
        id: 'profile', emoji: '👤', accent: '#10b981', pos: 'bottom-right',
        target: 'a[href="/profil"]',
        title: 'Votre espace personnel',
        text: "En bas du menu, accédez à votre profil pour personnaliser votre compte, modifier votre photo, changer votre mot de passe et ajuster vos préférences selon votre secteur d'activité.",
    },
    {
        id: 'cta', emoji: '✨', accent: '#6366f1',
        title: "C'est parti !",
        text: "Voilà, vous connaissez maintenant StratIA ! Mon conseil : commencez par créer votre parcours personnalisé. En répondant à quatre questions rapides, nous allons générer un plan de formation sur mesure rien que pour vous. Gratuit et en deux minutes.",
        cta: { label: 'Créer mon parcours gratuit', href: '/parcours' },
    },
];

/* ─── SpotlightOverlay ──────────────────────────────── */
function SpotlightOverlay({ selector, accent }: { selector: string; accent: string }) {
    const [r, setR] = useState<{ top: number; left: number; w: number; h: number } | null>(null);

    useEffect(() => {
        const update = () => {
            // Essaie chaque sélecteur séparé par une virgule
            const selectors = selector.split(',').map(s => s.trim());
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setR({ top: rect.top, left: rect.left, w: rect.width, h: rect.height });
                    return;
                }
            }
            setR(null);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [selector]);

    if (!r) return null;
    const pad = 10;
    return (
        <div
            style={{
                position: 'fixed',
                top: r.top - pad, left: r.left - pad,
                width: r.w + pad * 2, height: r.h + pad * 2,
                borderRadius: 16, zIndex: 201,
                pointerEvents: 'none',
                transition: 'all 0.5s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: `0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px ${accent}, 0 0 32px ${accent}55`,
                animation: 'spotPulse 2.5s ease-in-out infinite',
            }}
        />
    );
}

/* ─── Avatar Léa ────────────────────────────────────── */
function AvatarLea({ speaking, accent }: { speaking: boolean; accent: string }) {
    return (
        <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
            {speaking && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ background: accent, animationDuration: '1.6s' }} />
            )}
            <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${accent},#06b6d4)`, boxShadow: `0 4px 20px ${accent}55` }}>
                <svg viewBox="0 0 60 60" width="52" height="52">
                    <ellipse cx="30" cy="18" rx="16" ry="16" fill="#1a1040" />
                    <rect x="14" y="22" width="32" height="10" fill="#1a1040" />
                    <ellipse cx="30" cy="32" rx="13" ry="15" fill="#F5CBA7" />
                    <ellipse cx="25" cy="29" rx="2.2" ry="2.5" fill="#2d2d2d" />
                    <ellipse cx="35" cy="29" rx="2.2" ry="2.5" fill="#2d2d2d" />
                    <circle cx="26" cy="28" r="0.8" fill="white" />
                    <circle cx="36" cy="28" r="0.8" fill="white" />
                    <path d={speaking ? 'M 24 36 Q 30 42 36 36' : 'M 24 36 Q 30 39.5 36 36'}
                        stroke="#c0392b" strokeWidth="1.8" fill="transparent" strokeLinecap="round" />
                    {speaking && <ellipse cx="30" cy="38" rx="3" ry="1.5" fill="white" />}
                    <rect x="14" y="28" width="4" height="18" rx="2" fill="#1a1040" />
                    <rect x="42" y="28" width="4" height="18" rx="2" fill="#1a1040" />
                </svg>
            </div>
            {/* Ondes sonores */}
            {speaking && (
                <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {[4, 9, 13, 9, 5].map((h, i) => (
                        <div key={i} style={{
                            width: 2, height: h, background: accent, borderRadius: 2,
                            animation: 'waveBar 0.55s ease-in-out infinite',
                            animationDelay: `${i * 70}ms`,
                        }} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Main Component ────────────────────────────────── */
export default function OnboardingModal() {
    const router = useRouter();

    const [visible, setVisible] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const [speaking, setSpeaking] = useState(false);
    const [muted, setMuted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [display, setDisplay] = useState('');
    const [textDone, setTextDone] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const cacheRef = useRef<Map<string, string>>(new Map());
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const shownRef = useRef(false);

    const step = STEPS[stepIdx];

    /* ── Detect ?welcome=1 once on mount ────────────── */
    useEffect(() => {
        if (shownRef.current) return;
        const p = new URLSearchParams(window.location.search);
        if (!p.get('welcome')) return;
        fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
            const uid = d?.id ?? 'anon';
            if (sessionStorage.getItem(`${STORAGE_KEY}_${uid}`)) return;
            shownRef.current = true;
            setTimeout(() => setVisible(true), 500);
        }).catch(() => null);
    }, []); // mount only

    /* ── Stop all audio/timers ───────────────────────── */
    function stopAll() {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }

    /* ── Start typewriter (speed = ms per char) ─────── */
    function startTypewriter(text: string, speed: number) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDisplay(''); setTextDone(false);
        let i = 0;
        timerRef.current = setInterval(() => {
            i++;
            setDisplay(text.slice(0, i));
            if (i >= text.length) { clearInterval(timerRef.current!); timerRef.current = null; setTextDone(true); }
        }, speed);
    }

    /* ── Preload audio for a step ────────────────────── */
    const preload = useCallback(async (s: Step) => {
        if (cacheRef.current.has(s.id)) return;
        try {
            const res = await fetch('/api/voice/welcome', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: s.text }),
            });
            if (res.ok) cacheRef.current.set(s.id, URL.createObjectURL(await res.blob()));
        } catch { /* silent */ }
    }, []);

    /* ── Play current step ───────────────────────────── */
    const playStep = useCallback(async (s: Step) => {
        stopAll();
        setDisplay(''); setTextDone(false); setSpeaking(false); setLoading(false);

        // Preload next step in background
        const nextS = STEPS[STEPS.indexOf(s) + 1];
        if (nextS) preload(nextS).catch(() => null);

        if (muted) {
            // No voice: just typewriter at 24ms/char
            setTimeout(() => startTypewriter(s.text, 24), 200);
            return;
        }

        // Get or fetch audio
        let url = cacheRef.current.get(s.id);
        if (!url) {
            setLoading(true);
            await preload(s);
            url = cacheRef.current.get(s.id);
            setLoading(false);
        }

        if (!url) {
            // Fallback: typewriter without voice
            startTypewriter(s.text, 24);
            return;
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => {
            setSpeaking(true);
            // Calculate speed so text finishes when voice ends
            const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : s.text.length * 0.06;
            const speed = Math.max(20, Math.floor((dur * 1000) / s.text.length));
            startTypewriter(s.text, speed);
        };

        audio.onended = () => { setSpeaking(false); setTextDone(true); };
        audio.onerror = () => {
            setSpeaking(false);
            startTypewriter(s.text, 28);
        };

        try { await audio.play(); } catch { startTypewriter(s.text, 28); }
    }, [muted, preload]);

    /* ── Trigger playStep on step change ────────────── */
    useEffect(() => {
        if (!visible || !step) return;
        playStep(step);
        return () => stopAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, stepIdx]);

    /* ── Mark tour as seen in sessionStorage ─────────── */
    function markSeen() {
        fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
            sessionStorage.setItem(`${STORAGE_KEY}_${d?.id ?? 'anon'}`, 'done');
        }).catch(() => null);
    }

    function dismiss() {
        markSeen(); stopAll(); setVisible(false);
        router.replace('/dashboard', { scroll: false });
    }

    function next() {
        stopAll();
        if (stepIdx < STEPS.length - 1) setStepIdx(i => i + 1);
        else dismiss();
    }

    function prev() {
        if (stepIdx > 0) { stopAll(); setStepIdx(i => i - 1); }
    }

    function goTo(href: string) {
        markSeen(); stopAll(); setVisible(false);
        router.push(href);
    }

    function toggleMute() {
        setMuted(m => {
            if (!m) { stopAll(); setSpeaking(false); startTypewriter(step?.text ?? '', 24); }
            return !m;
        });
    }

    if (!visible || !step) return null;

    const { accent, emoji, title, target, pos, cta } = step;
    const progress = ((stepIdx + 1) / STEPS.length) * 100;
    const isSide = !!target && !!pos;

    return (
        <>
            <style>{`
        @keyframes waveBar   { 0%,100%{transform:scaleY(0.5)} 50%{transform:scaleY(1.4)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes spotPulse { 0%,100%{box-shadow:0 0 0 9999px rgba(0,0,0,0.72),0 0 0 2px var(--sp),0 0 24px var(--sp)}
                               50%{box-shadow:0 0 0 9999px rgba(0,0,0,0.72),0 0 0 3px var(--sp),0 0 48px var(--sp)} }
      `}</style>

            {/* Backdrop (only when no spotlight target) */}
            {!target && (
                <div className="fixed inset-0 z-[199]"
                    style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.4s ease' }}
                    onClick={dismiss} />
            )}

            {/* Click-through backdrop when spotlight active */}
            {target && (
                <div className="fixed inset-0 z-[198]" onClick={dismiss}
                    style={{ background: 'transparent' }} />
            )}

            {/* Spotlight on DOM element */}
            {target && <SpotlightOverlay selector={target} accent={accent} />}

            {/* Modal card */}
            <div
                className="fixed z-[202]"
                style={{
                    ...(isSide
                        ? { bottom: 28, right: 28 }
                        : { inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }),
                    animation: 'slideUp 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    width: '100%', maxWidth: isSide ? 360 : 480,
                    background: 'var(--bg-surface)',
                    border: `1px solid ${accent}33`,
                    borderRadius: 24,
                    boxShadow: `0 32px 80px rgba(0,0,0,0.45),0 0 0 1px ${accent}1a`,
                    overflow: 'hidden',
                }}>

                    {/* Progress bar */}
                    <div style={{ height: 3, background: 'var(--bg-elevated)' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${accent},#06b6d4)`, transition: 'width 0.5s ease' }} />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-0">
                        <div className="flex items-center gap-2">
                            <span>{emoji}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>
                                StratIA Tour · {stepIdx + 1}/{STEPS.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button onClick={toggleMute} className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--text-muted)' }}>
                                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            </button>
                            <button onClick={dismiss} className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--text-muted)' }}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-5 pb-5 pt-3 space-y-3">

                        {/* Avatar + title row */}
                        <div className="flex items-center gap-4">
                            <AvatarLea speaking={speaking} accent={accent} />
                            <h2 className="text-sm font-black leading-tight flex-1" style={{ color: 'var(--text-primary)' }}>
                                {title}
                            </h2>
                        </div>

                        {/* Speech bubble */}
                        <div className="relative rounded-2xl px-4 py-3"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', minHeight: 56 }}>
                            <div className="absolute -top-2 left-8 w-3 h-3 rotate-45"
                                style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }} />
                            {loading ? (
                                <div className="flex items-center gap-2 py-1" style={{ color: 'var(--text-muted)' }}>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span className="text-xs">Préparation de la voix…</span>
                                </div>
                            ) : (
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {display}
                                    {!textDone && (
                                        <span className="inline-block w-0.5 h-3 ml-0.5 align-middle animate-pulse rounded-sm"
                                            style={{ background: accent }} />
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="space-y-1.5">
                            {cta && (
                                <button onClick={() => goTo(cta.href)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white"
                                    style={{ background: `linear-gradient(135deg,${accent},#06b6d4)`, boxShadow: `0 4px 16px ${accent}30` }}>
                                    <GraduationCap size={13} /> {cta.label} <ArrowRight size={12} />
                                </button>
                            )}
                            <div className="flex gap-1.5">
                                {stepIdx > 0 && (
                                    <button onClick={prev}
                                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
                                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                                        ← Retour
                                    </button>
                                )}
                                <button onClick={next}
                                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold"
                                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                                    {stepIdx < STEPS.length - 1 ? (
                                        <>{cta ? 'Passer' : 'Suivant'} <ChevronRight size={13} /></>
                                    ) : (
                                        <><Sparkles size={11} /> Commencer</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Step dots */}
                        <div className="flex items-center justify-center gap-1">
                            {STEPS.map((_, i) => (
                                <button key={i} onClick={() => { stopAll(); setStepIdx(i); }}
                                    className="rounded-full transition-all duration-300"
                                    style={{ width: i === stepIdx ? 18 : 5, height: 5, background: i === stepIdx ? accent : 'var(--border)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
