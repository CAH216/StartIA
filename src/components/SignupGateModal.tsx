'use client';

import { X, Zap, GraduationCap, ArrowRight, Crown, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export type GateReason =
  | 'second_course'
  | 'buy_course'
  | 'ai_path'
  | 'subscription'
  | 'chat'
  | 'certificate'
  | 'default';

interface SignupGateModalProps {
  open: boolean;
  onClose: () => void;
  reason?: GateReason;
}

const CONFIG: Record<GateReason, {
  icon: React.ElementType;
  color: string;
  titleFr: string; titleEn: string;
  bodyFr: string;  bodyEn: string;
  benefits: { fr: string; en: string }[];
}> = {
  second_course: {
    icon: GraduationCap, color: '#3b82f6',
    titleFr: "Accédez à toutes les formations",
    titleEn: "Access all courses",
    bodyFr:  "Vous venez de terminer votre aperçu gratuit. Créez votre compte pour débloquer 50+ formations.",
    bodyEn:  "You've finished your free preview. Create your account to unlock 50+ courses.",
    benefits: [
      { fr: "50+ formations vidéo et live",             en: "50+ video and live courses" },
      { fr: "Parcours IA personnalisé en 4 questions",   en: "Personalised AI path in 4 questions" },
      { fr: "Certificats téléchargeables",              en: "Downloadable certificates" },
      { fr: "Accès à vie à vos formations achetées",    en: "Lifetime access to purchased courses" },
    ],
  },
  buy_course: {
    icon: Crown, color: '#8b5cf6',
    titleFr: "Créez un compte pour acheter",
    titleEn: "Create an account to purchase",
    bodyFr:  "C'est rapide — moins de 30 secondes. Vous gardez l'accès à vie à votre formation.",
    bodyEn:  "It's quick — less than 30 seconds. You keep lifetime access to your course.",
    benefits: [
      { fr: "Achat sécurisé",                          en: "Secure purchase" },
      { fr: "Accès immédiat après paiement",            en: "Immediate access after payment" },
      { fr: "Certificat de complétion inclus",          en: "Completion certificate included" },
      { fr: "-40% sur toutes les formations avec Pro",  en: "-40% on all courses with Pro" },
    ],
  },
  ai_path: {
    icon: Sparkles, color: '#8b5cf6',
    titleFr: "Débloquez votre parcours IA personnalisé",
    titleEn: "Unlock your personalised AI path",
    bodyFr:  "Notre IA génère un parcours de formations adapté à votre profil en 4 questions rapides.",
    bodyEn:  "Our AI generates a course path tailored to your profile in 4 quick questions.",
    benefits: [
      { fr: "Parcours basé sur votre secteur et niveau", en: "Path based on your sector and level" },
      { fr: "Chaque étape = 1 formation réelle",         en: "Each step = 1 real course" },
      { fr: "Progression sauvegardée automatiquement",   en: "Progress saved automatically" },
      { fr: "Mis à jour à chaque nouvelle formation",    en: "Updated with each new course" },
    ],
  },
  subscription: {
    icon: Crown, color: '#f59e0b',
    titleFr: "Passez au Pro",
    titleEn: "Go Pro",
    bodyFr:  "L'abonnement Pro vous donne accès à toutes les formations avec -40%, plus 1 formation offerte chaque mois.",
    bodyEn:  "The Pro subscription gives you access to all courses with -40%, plus 1 free course every month.",
    benefits: [
      { fr: "-40% sur toutes les formations",           en: "-40% on all courses" },
      { fr: "1 formation offerte chaque mois",           en: "1 free course every month" },
      { fr: "Chat direct avec les formateurs",           en: "Direct chat with instructors" },
      { fr: "Sessions live incluses",                    en: "Live sessions included" },
    ],
  },
  chat: {
    icon: Lock, color: '#059669',
    titleFr: "Le chat est réservé aux membres Pro",
    titleEn: "Chat is reserved for Pro members",
    bodyFr:  "Créez un compte et abonnez-vous Pro pour discuter directement avec vos formateurs.",
    bodyEn:  "Create an account and subscribe to Pro to chat directly with your instructors.",
    benefits: [
      { fr: "Chat direct avec le formateur",             en: "Direct chat with the instructor" },
      { fr: "Réponse sous 24h garantie",                en: "Reply within 24h guaranteed" },
      { fr: "Accès à tous les formateurs StratIA",       en: "Access to all StratIA instructors" },
      { fr: "-40% sur toutes les formations Pro",        en: "-40% on all courses (Pro)" },
    ],
  },
  certificate: {
    icon: GraduationCap, color: '#f59e0b',
    titleFr: "Créez un compte pour obtenir votre certificat",
    titleEn: "Create an account to get your certificate",
    bodyFr:  "Les certificats sont générés automatiquement pour les membres inscrits.",
    bodyEn:  "Certificates are automatically generated for registered members.",
    benefits: [
      { fr: "Certificat PDF téléchargeable",            en: "Downloadable PDF certificate" },
      { fr: "Partageable sur LinkedIn",                 en: "Shareable on LinkedIn" },
      { fr: "Valide pour toutes vos formations",        en: "Valid for all your courses" },
      { fr: "Mis à jour automatiquement",               en: "Automatically updated" },
    ],
  },
  default: {
    icon: Zap, color: '#059669',
    titleFr: "Créez votre compte gratuit",
    titleEn: "Create your free account",
    bodyFr:  "Rejoignez 200+ professionnels qui se forment à l'IA avec StratIA.",
    bodyEn:  "Join 200+ professionals training in AI with StratIA.",
    benefits: [
      { fr: "Accès à votre premier cours gratuit",      en: "Access to your first free course" },
      { fr: "Parcours IA personnalisé",                 en: "Personalised AI path" },
      { fr: "Tableau de bord de progression",           en: "Progress dashboard" },
      { fr: "Certificats téléchargeables",              en: "Downloadable certificates" },
    ],
  },
};

export default function SignupGateModal({ open, onClose, reason = 'default' }: SignupGateModalProps) {
  const { lang } = useLanguage();
  const cfg = CONFIG[reason];
  const Icon = cfg.icon;

  if (!open) return null;

  const title    = lang === 'en' ? cfg.titleEn : cfg.titleFr;
  const body     = lang === 'en' ? cfg.bodyEn  : cfg.bodyFr;
  const registerLabel = lang === 'en' ? 'Create my free account' : 'Créer mon compte gratuit';
  const loginLabel    = lang === 'en' ? 'I already have an account' : "J'ai déjà un compte";
  const benefitsLabel = lang === 'en' ? 'Included with your account' : 'Inclus avec votre compte';
  const freeLabel     = lang === 'en' ? 'Free · No credit card' : 'Gratuit · Sans carte de crédit';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top gradient bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${cfg.color}, #0891b2)` }} />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <X size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>

          <div className="p-7">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: `color-mix(in srgb, ${cfg.color} 14%, transparent)`, border: `1.5px solid color-mix(in srgb, ${cfg.color} 30%, transparent)` }}>
              <Icon size={26} style={{ color: cfg.color }} />
            </div>

            {/* Title + body */}
            <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>{body}</p>

            {/* Benefits */}
            <div className="rounded-2xl p-4 mb-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>{benefitsLabel}</p>
              <ul className="space-y-2">
                {cfg.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black"
                      style={{ background: cfg.color }}>✓</span>
                    {lang === 'en' ? b.en : b.fr}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <Link
              href="/auth/register"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-white text-sm mb-3 transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${cfg.color}, #0891b2)`, boxShadow: `0 6px 20px color-mix(in srgb, ${cfg.color} 40%, transparent)` }}
            >
              <Zap size={15} /> {registerLabel} <ArrowRight size={14} />
            </Link>
            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
            >
              {loginLabel}
            </Link>

            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{freeLabel}</p>
          </div>
        </div>
      </div>
    </>
  );
}
