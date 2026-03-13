'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'stratia_guide_v3';
type Lang = 'fr' | 'en';

/* ─── Étapes du tour ──────────────────────────────────────────── */
const TOUR: { id: string; emoji: string; fr: string; en: string }[] = [
  {
    id: 'hero', emoji: '👋',
    fr: "Bonjour ! Je suis votre guide StratIA. L'**intelligence artificielle** — ou IA — ce sont des programmes capables d'**apprendre, d'analyser et d'automatiser** des tâches à votre place.",
    en: "Hello! I'm your StratIA guide. **Artificial intelligence** — or AI — refers to programs capable of **learning, analysing, and automating** tasks for you.",
  },
  {
    id: 'problem', emoji: '⚡',
    fr: "La plupart des professionnels **perdent des heures chaque semaine** sur des tâches répétitives : rapports, suivis, e-mails… que l'intelligence artificielle peut prendre en charge.",
    en: "Most professionals **lose hours every week** on repetitive tasks — reports, follow-ups, emails — that artificial intelligence can handle.",
  },
  {
    id: 'formations', emoji: '🎓',
    fr: "Nous proposons **des formations vidéo expertes** pour apprendre à utiliser l'intelligence artificielle à votre rythme, avec un parcours personnalisé généré en 4 questions.",
    en: "We offer **expert video courses** to learn how to use artificial intelligence at your own pace, with a personalised path generated from 4 questions.",
  },
  {
    id: 'integration', emoji: '🏢',
    fr: "Si vous êtes une **entreprise**, nous allons plus loin : notre équipe vient chez vous, analyse vos processus, et vous livre un **plan d'intégration de l'intelligence artificielle** sur mesure.",
    en: "If you are a **business**, we go further: our team comes to you, analyses your processes, and delivers a **bespoke artificial intelligence integration plan**.",
  },
  {
    id: 'temoignages', emoji: '❤️',
    fr: "**200+ professionnels** ont déjà transformé leur façon de travailler avec nous — avec un ROI moyen de **×3,2 en 6 mois**.",
    en: "**200+ professionals** have already transformed the way they work with us — with an average ROI of **×3.2 in 6 months**.",
  },
];

/* ─── Typewriter sur texte markdown brut ── */
function useTypewriter(raw: string, speed = 22) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCount(0);
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setCount(c => {
        if (c >= raw.length) { clearInterval(ref.current!); return c; }
        return c + 1;
      });
    }, speed);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [raw, speed]);

  return { partial: raw.slice(0, count), done: count >= raw.length };
}

/* ─── Rendu markdown **bold** ── */
function RichText({ text }: { text: string }) {
  // Ne rend les ** que si la paire est fermée
  const parts: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    const open = rest.indexOf('**');
    if (open === -1) { parts.push(<span key={key++}>{rest}</span>); break; }
    if (open > 0) parts.push(<span key={key++}>{rest.slice(0, open)}</span>);
    const close = rest.indexOf('**', open + 2);
    if (close === -1) {
      // paire non fermée → affiche tel quel sans les **
      parts.push(<span key={key++}>{rest.slice(open + 2)}</span>);
      break;
    }
    parts.push(<strong key={key++} style={{ color: '#10b981' }}>{rest.slice(open + 2, close)}</strong>);
    rest = rest.slice(close + 2);
  }
  return <>{parts}</>;
}

/* ─── Scroll doux vers section ── */
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ──────────── WIDGET ──────────── */
export default function AIGuideWidget() {
  const { lang } = useLanguage();
  const l = lang as Lang;

  const [visible, setVisible] = useState(false);
  const [tourIdx, setTourIdx] = useState(0);
  const [phase, setPhase] = useState<'tour' | 'choice' | 'msg' | 'done'>('tour');
  const [choice, setChoice] = useState<'formation' | 'integration' | 'both' | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible || phase !== 'tour') return;
    scrollTo(TOUR[tourIdx].id);
  }, [visible, tourIdx, phase]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setPhase('done');
    setVisible(false);
  };

  if (!visible || phase === 'done') return null;

  return (
    <div className="fixed z-[150]" style={{
      bottom: '1rem', right: '1rem',
      maxWidth: 'min(272px, calc(100vw - 2rem))',
      filter: 'drop-shadow(0 8px 28px rgba(0,0,0,0.35))',
    }}>
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(145deg,#0d1f17,#0b1d30)',
        border: '1px solid rgba(16,185,129,0.2)',
      }}>
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#10b981,#0891b2)' }} />
        <div className="p-3.5">

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 3px 10px rgba(5,150,105,0.4)' }}>
                <Sparkles size={13} className="text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border"
                  style={{ background: '#10b981', borderColor: '#0d1f17', animation: 'guidepulse 2s infinite' }} />
              </div>
              <div>
                <p className="text-[11px] font-black text-white leading-none">StratIA</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#10b981' }}>
                  {l === 'en' ? 'Your guide' : 'Votre guide'}
                </p>
              </div>
            </div>
            <button onClick={dismiss} className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <X size={10} className="text-white" />
            </button>
          </div>

          {phase === 'tour' && (
            <TourSlide step={TOUR[tourIdx]} lang={l} idx={tourIdx} total={TOUR.length}
              onNext={() => {
                if (tourIdx < TOUR.length - 1) setTourIdx(i => i + 1);
                else { scrollTo('hero'); setPhase('choice'); }
              }}
              onSkip={dismiss}
            />
          )}

          {phase === 'choice' && (
            <ChoiceStep lang={l}
              onChoice={(c) => { setChoice(c); setPhase('msg'); }}
            />
          )}

          {phase === 'msg' && choice && (
            <MsgStep lang={l} choice={choice} onDismiss={dismiss} />
          )}
        </div>
      </div>
      <style>{`@keyframes guidepulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

/* ─── Slide du tour ── */
function TourSlide({ step, lang, idx, total, onNext, onSkip }: {
  step: typeof TOUR[0]; lang: Lang; idx: number; total: number;
  onNext: () => void; onSkip: () => void;
}) {
  const raw = lang === 'en' ? step.en : step.fr;
  const { partial, done } = useTypewriter(raw, 20);
  const isLast = idx === total - 1;

  return (
    <div>
      {/* Barre de progression */}
      <div className="flex gap-1 mb-2.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= idx ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>

      {/* Texte typewriter */}
      <div className="flex gap-1.5 mb-3">
        <span className="text-sm flex-shrink-0 mt-0.5">{step.emoji}</span>
        <p className="text-[11px] leading-relaxed min-h-[52px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          <RichText text={partial} />
          {!done && <span className="inline-block w-1 h-3 ml-0.5 align-middle rounded-sm animate-pulse" style={{ background: '#10b981' }} />}
        </p>
      </div>

      {/* Boutons */}
      {done && (
        <div className="flex items-center gap-2">
          <button onClick={onNext}
            className="flex-1 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
            {isLast
              ? (lang === 'en' ? "Got it →" : "Compris →")
              : (lang === 'en' ? "Next →" : "Suivant →")}
          </button>
          <button onClick={onSkip}
            className="py-2 px-2 rounded-xl text-[10px] transition-all hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {lang === 'en' ? 'Skip' : 'Passer'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Choix : formation / intégration / les deux ── */
function ChoiceStep({ lang, onChoice }: {
  lang: Lang;
  onChoice: (c: 'formation' | 'integration' | 'both') => void;
}) {
  const q = lang === 'en'
    ? "What best describes your goal?"
    : "Quel est votre objectif principal ?";
  const opts = lang === 'en'
    ? [
        { v: 'formation'  as const, e: '🎓', l: 'Learn on my own' },
        { v: 'integration'as const, e: '🏢', l: 'Integrate in my business' },
        { v: 'both'       as const, e: '✨', l: 'Both' },
      ]
    : [
        { v: 'formation'  as const, e: '🎓', l: 'Apprendre en autonomie' },
        { v: 'integration'as const, e: '🏢', l: 'Intégrer dans mon entreprise' },
        { v: 'both'       as const, e: '✨', l: 'Les deux' },
      ];

  return (
    <div>
      <p className="text-[11px] mb-2.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>{q}</p>
      <div className="space-y-1.5">
        {opts.map(o => (
          <button key={o.v} onClick={() => onChoice(o.v)}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-[11px] font-medium transition-all hover:scale-[1.02] text-left"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.82)' }}>
            <span>{o.e}</span> {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Messages finaux + CTA ── */
const MSGS = {
  formation: {
    fr: "Super ! Commencez par notre **formation gratuite** — aucun compte requis pour tester.",
    en: "Great! Start with our **free course** — no account required to try it.",
  },
  integration: {
    fr: "Parfait ! Remplissez notre **formulaire rapide** et notre équipe vous contacte sous **48h** pour discuter de votre projet.",
    en: "Perfect! Fill in our **quick form** and our team will contact you within **48h** to discuss your project.",
  },
  both: {
    fr: "Excellent choix ! Vous pouvez **tester les formations** maintenant et **déposer une demande d'intégration** en parallèle — notre équipe s'occupe du reste.",
    en: "Excellent choice! You can **try the courses** now and **submit an integration request** in parallel — our team handles the rest.",
  },
};

function MsgStep({ lang, choice, onDismiss }: {
  lang: Lang; choice: 'formation' | 'integration' | 'both'; onDismiss: () => void;
}) {
  const raw = MSGS[choice][lang];
  const { partial, done } = useTypewriter(raw, 22);

  const ctas = {
    formation: {
      primary: { href: '/demo', label: lang === 'en' ? '🎓 Try for free' : '🎓 Essayer gratuitement' },
      secondary: null,
    },
    integration: {
      primary: { href: '/demander-integration', label: lang === 'en' ? '📋 Start my project' : '📋 Démarrer mon projet' },
      secondary: { href: '/auth/register', label: lang === 'en' ? 'Create account' : 'Créer un compte' },
    },
    both: {
      primary: { href: '/demo', label: lang === 'en' ? '🎓 Try courses' : '🎓 Tester les formations' },
      secondary: { href: '/demander-integration', label: lang === 'en' ? '🏢 Integration request' : "🏢 Demande d'intégration" },
    },
  }[choice];

  return (
    <div>
      <p className="text-[11px] leading-relaxed mb-3 min-h-[44px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
        <RichText text={partial} />
        {!done && <span className="inline-block w-1 h-3 ml-0.5 align-middle rounded-sm animate-pulse" style={{ background: '#10b981' }} />}
      </p>
      {done && (
        <div className="space-y-1.5">
          <Link href={ctas.primary.href} onClick={onDismiss}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
            <Zap size={11} /> {ctas.primary.label}
          </Link>
          {ctas.secondary && (
            <Link href={ctas.secondary.href} onClick={onDismiss}
              className="w-full flex items-center justify-center py-1.5 rounded-lg text-[10px] font-medium"
              style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {ctas.secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
