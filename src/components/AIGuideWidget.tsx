'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

type Step = 'hidden' | 'greeting' | 'beginner' | 'advanced' | 'done';

const STORAGE_KEY = 'stratia_guide_dismissed';

/* ── messages adaptés ── */
const MESSAGES = {
  greeting: {
    fr: "Salut 👋 Je suis votre guide StratIA.\nVous connaissez l'intelligence artificielle ?",
    en: "Hi 👋 I'm your StratIA guide.\nAre you familiar with artificial intelligence?",
  },
  beginner: {
    fr: "Pas de souci — vous n'avez besoin d'aucune connaissance technique !\n\nL'IA peut vous faire gagner 2h par jour sur des tâches répétitives. Essayez notre première formation gratuitement, sans compte.",
    en: "No worries — you don't need any technical knowledge!\n\nAI can save you 2 hours a day on repetitive tasks. Try our first course for free, no account needed.",
  },
  advanced: {
    fr: "Parfait ! StratIA vous propose :\n\n→ Parcours IA personnalisé selon votre profil\n→ Sessions live avec des experts\n→ Intégration IA sur mesure pour votre équipe\n\nEssayez sans compte →",
    en: "Great! StratIA offers you:\n\n→ Personalised AI path based on your profile\n→ Live sessions with experts\n→ Custom AI integration for your team\n\nTry without account →",
  },
};

/* ── Typewriter hook ── */
function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(ref.current!); setDone(true); }
    }, speed);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [text, speed]);

  return { displayed, done };
}

export default function AIGuideWidget() {
  const { lang } = useLanguage();
  const [step, setStep] = useState<Step>('hidden');

  useEffect(() => {
    // Ne pas réafficher si déjà fermé dans la session
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setStep('greeting'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setStep('done');
  };

  if (step === 'hidden' || step === 'done') return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[150] max-w-xs w-full"
      style={{ filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.28))' }}
    >
      {/* Bulle principale */}
      <div className="rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(145deg, #0d1f17, #0b1d30)',
        border: '1px solid rgba(16,185,129,0.25)',
      }}>
        {/* Barre verte top */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg,#10b981,#0891b2)' }} />

        <div className="p-5">
          {/* Header avatar + fermer */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              {/* Avatar animé */}
              <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' }}>
                <Sparkles size={18} className="text-white" />
                {/* Pulse indicator */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: '#10b981', borderColor: '#0d1f17', animation: 'pulse 2s infinite' }} />
              </div>
              <div>
                <p className="text-xs font-black text-white">StratIA</p>
                <p className="text-[10px]" style={{ color: '#10b981' }}>
                  {lang === 'en' ? 'Online · Your guide' : 'En ligne · Votre guide'}
                </p>
              </div>
            </div>
            <button onClick={dismiss} className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <X size={12} className="text-white" />
            </button>
          </div>

          {/* Contenu selon l'étape */}
          {step === 'greeting' && <GreetingStep lang={lang} onSelectLevel={setStep} />}
          {step === 'beginner' && <MessageStep lang={lang} messageKey="beginner" onDismiss={dismiss} />}
          {step === 'advanced' && <MessageStep lang={lang} messageKey="advanced" onDismiss={dismiss} />}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
      `}</style>
    </div>
  );
}

/* ── Étape 1 : salutation + choix ── */
function GreetingStep({ lang, onSelectLevel }: { lang: string; onSelectLevel: (s: Step) => void }) {
  const text = MESSAGES.greeting[lang as 'fr' | 'en'] ?? MESSAGES.greeting.fr;
  const { displayed } = useTypewriter(text, 20);

  return (
    <div>
      <p className="text-sm leading-relaxed mb-5 whitespace-pre-line min-h-[52px]"
        style={{ color: 'rgba(255,255,255,0.85)' }}>
        {displayed}
        <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
          style={{ background: '#10b981' }} />
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelectLevel('beginner')}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-bold transition-all hover:scale-[1.03]"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
        >
          <span className="text-xl">🌱</span>
          {lang === 'en' ? 'I\'m discovering it' : 'Je découvre'}
        </button>
        <button
          onClick={() => onSelectLevel('advanced')}
          className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-bold transition-all hover:scale-[1.03]"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}
        >
          <span className="text-xl">🚀</span>
          {lang === 'en' ? 'I have experience' : "J'ai de l'expérience"}
        </button>
      </div>
    </div>
  );
}

/* ── Étape 2 : message typewriter → CTA ── */
function MessageStep({ lang, messageKey, onDismiss }: {
  lang: string;
  messageKey: 'beginner' | 'advanced';
  onDismiss: () => void;
}) {
  const text = MESSAGES[messageKey][lang as 'fr' | 'en'] ?? MESSAGES[messageKey].fr;
  const { displayed, done } = useTypewriter(text, 18);
  const tryLabel = lang === 'en' ? 'Try for free →' : 'Essayer gratuitement →';
  const loginLabel = lang === 'en' ? 'I already have an account' : "J'ai déjà un compte";

  return (
    <div>
      <p className="text-sm leading-relaxed mb-5 whitespace-pre-line min-h-[80px]"
        style={{ color: 'rgba(255,255,255,0.85)' }}>
        {displayed}
        {!done && (
          <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
            style={{ background: '#10b981' }} />
        )}
      </p>
      {done && (
        <div className="space-y-2">
          <Link
            href="/demo"
            onClick={onDismiss}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 6px 18px rgba(5,150,105,0.4)' }}
          >
            <Zap size={14} /> {tryLabel}
          </Link>
          <Link
            href="/auth/login"
            onClick={onDismiss}
            className="w-full flex items-center justify-center py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {loginLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
