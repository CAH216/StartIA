'use client';
/**
 * /demo — Page formation accessible sans compte (Mode Guest)
 * Affiche la formation de démonstration sans authentification.
 * Toute action protégée → SignupGateModal
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  Zap, Play, CheckCircle, ArrowRight, Clock, Users, Star,
  Lock, GraduationCap, ChevronRight, X, Sparkles,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import SignupGateModal, { type GateReason } from '@/components/SignupGateModal';

/* ─── Données de la formation démo ─────────────────── */
const DEMO_FORMATION = {
  id: 'demo',
  title: 'Maîtriser ChatGPT pour les professionnels',
  titleEn: 'Mastering ChatGPT for professionals',
  description: "Apprenez à utiliser ChatGPT pour automatiser vos tâches quotidiennes, rédiger des emails, créer des rapports et gagner 2h par jour. Formation 100% pratique avec cas réels.",
  descriptionEn: "Learn how to use ChatGPT to automate your daily tasks, write emails, create reports and save 2 hours a day. 100% practical course with real-life cases.",
  duration: '3h 20min',
  level: 'Débutant',
  levelEn: 'Beginner',
  rating: 4.9,
  enrollments: 312,
  formateur: 'Marc-Antoine Roy',
  formateurInitial: 'M',
  formateurColor: '#6366f1',
  bannerGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
  /* Vidéo YouTube publique — intro à ChatGPT sans embed commercial */
  videoId: 'JTxsNm9IdYU',
  chapters: [
    { title: "Introduction à ChatGPT",                time: "0:00",  free: true },
    { title: "Créer des prompts efficaces",            time: "18:32", free: true },
    { title: "Automatiser vos emails",                 time: "42:15", free: false },
    { title: "Générer des rapports professionnels",    time: "1:08:40", free: false },
    { title: "Cas pratique : Gestion de projet",       time: "1:45:20", free: false },
  ],
  chaptersEn: [
    { title: "Introduction to ChatGPT",                time: "0:00",  free: true },
    { title: "Creating effective prompts",             time: "18:32", free: true },
    { title: "Automating your emails",                 time: "42:15", free: false },
    { title: "Generating professional reports",        time: "1:08:40", free: false },
    { title: "Case study: Project management",         time: "1:45:20", free: false },
  ],
  learns: [
    "Maîtriser les prompts avancés",
    "Automatiser 5 tâches métier récurrentes",
    "Créer des rapports en 10min au lieu de 2h",
    "Rédiger des emails parfaits en 30s",
  ],
  learnsEn: [
    "Master advanced prompts",
    "Automate 5 recurring business tasks",
    "Create reports in 10 min instead of 2h",
    "Write perfect emails in 30 seconds",
  ],
};

export default function DemoPage() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState<GateReason>('default');
  const [playing, setPlaying] = useState(false);

  const openGate = (reason: GateReason) => {
    setGateReason(reason);
    setGateOpen(true);
  };

  const f = DEMO_FORMATION;
  const title      = lang === 'en' ? f.titleEn      : f.title;
  const description= lang === 'en' ? f.descriptionEn: f.description;
  const level      = lang === 'en' ? f.levelEn      : f.level;
  const chapters   = lang === 'en' ? f.chaptersEn   : f.chapters;
  const learns     = lang === 'en' ? f.learnsEn     : f.learns;

  const bg      = isDark ? 'var(--bg-base)'    : '#f8fafc';
  const surface = isDark ? 'var(--bg-surface)' : '#ffffff';
  const border  = 'var(--border)';
  const text    = 'var(--text-primary)';
  const muted   = 'var(--text-secondary)';

  const freeLabel         = lang === 'en' ? '🎁 Free preview · No account required' : '🎁 Aperçu gratuit · Sans inscription';
  const chaptersLabel     = lang === 'en' ? 'Course outline' : 'Contenu de la formation';
  const lockedLabel       = lang === 'en' ? 'Unlock to continue' : 'Débloquer pour continuer';
  const learnsLabel       = lang === 'en' ? "What you'll learn" : "Ce que vous allez apprendre";
  const ctaTitle          = lang === 'en' ? 'Liked it? Keep learning.' : 'Vous avez aimé ? Continuez à apprendre.';
  const ctaBody           = lang === 'en'
    ? '50+ expert courses on AI. Start free, no credit card needed.'
    : '50+ formations expertes sur l\'IA. Commencez gratuitement, sans carte de crédit.';
  const ctaBtn            = lang === 'en' ? 'Create my free account' : 'Créer mon compte gratuit';
  const seeCatalogLabel   = lang === 'en' ? 'See all courses' : 'Voir toutes les formations';
  const freeChaptersLabel = lang === 'en' ? 'Free chapters' : 'Chapitres gratuits';
  const lockedChapLabel   = lang === 'en' ? 'Unlock all chapters' : 'Débloquer tous les chapitres';
  const backLabel         = lang === 'en' ? '← Back to home' : '← Retour à l\'accueil';
  const watchLabel        = lang === 'en' ? 'Watch free preview' : 'Voir l\'aperçu gratuit';
  const instructorLabel   = lang === 'en' ? 'Instructor' : 'Formateur';
  const enrollLabel       = lang === 'en' ? 'enrolled' : 'inscrits';
  const durationLabel     = lang === 'en' ? 'Duration' : 'Durée';

  return (
    <div style={{ background: bg, minHeight: '100vh' }}>
      {/* ── Topnav Guest léger ── */}
      <header className="sticky top-0 z-50 px-5 h-14 flex items-center justify-between"
        style={{ background: isDark ? 'rgba(2,13,24,0.92)' : 'rgba(248,250,252,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${border}` }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-black text-base" style={{ color: text }}>Strat<span style={{ color: '#059669' }}>IA</span></span>
        </Link>

        {/* Badge aperçu */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#059669' }}>
          <Sparkles size={11} /> {freeLabel}
        </div>

        <Link href="/auth/register" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
          {lang === 'en' ? 'Sign up free' : 'S\'inscrire gratuitement'} <ArrowRight size={12} />
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Breadcrumb */}
        <p className="text-sm mb-6 hover:underline cursor-pointer" style={{ color: muted }}>
          <Link href="/">{backLabel}</Link>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Colonne principale ──────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner + player */}
            <div className="rounded-3xl overflow-hidden relative" style={{ aspectRatio: '16/9', background: f.bannerGradient }}>
              {!playing ? (
                /* Thumbnail avec bouton play */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <button
                    onClick={() => setPlaying(true)}
                    className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}
                  >
                    <Play size={32} className="text-white ml-1" />
                  </button>
                  <span className="text-white font-bold text-lg text-center px-4">{watchLabel}</span>
                  <span className="text-white/60 text-sm">{lang === 'en' ? 'Chapters 1 & 2 — Free' : 'Chapitres 1 & 2 — Gratuits'}</span>
                </div>
              ) : (
                /* YouTube player */
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${f.videoId}?autoplay=1&rel=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={title}
                />
              )}
            </div>

            {/* Titre + meta */}
            <div>
              <h1 className="text-2xl font-black mb-3" style={{ color: text }}>{title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="flex items-center gap-1 text-sm font-medium" style={{ color: '#f59e0b' }}>
                  <Star size={14} fill="#f59e0b" /> {f.rating}
                </span>
                <span className="flex items-center gap-1 text-sm" style={{ color: muted }}>
                  <Users size={13} /> {f.enrollments} {enrollLabel}
                </span>
                <span className="flex items-center gap-1 text-sm" style={{ color: muted }}>
                  <Clock size={13} /> {durationLabel} : {f.duration}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.25)' }}>
                  {level}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: muted }}>{description}</p>
            </div>

            {/* Ce que vous apprendrez */}
            <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
              <h2 className="font-black text-base mb-4" style={{ color: text }}>{learnsLabel}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {learns.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: muted }}>
                    <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan du cours */}
            <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${border}` }}>
                <h2 className="font-black text-base" style={{ color: text }}>{chaptersLabel}</h2>
                <p className="text-xs mt-0.5" style={{ color: muted }}>
                  {freeChaptersLabel} : 1 & 2 → <span style={{ color: '#059669' }}>✓ {lang === 'en' ? 'Included' : 'Inclus'}</span>
                </p>
              </div>
              {chapters.map((ch, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3.5 transition-all"
                  style={{
                    borderBottom: i < chapters.length - 1 ? `1px solid ${border}` : 'none',
                    background: ch.free ? 'transparent' : isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)',
                    cursor: ch.free ? 'pointer' : 'default',
                  }}
                  onClick={() => { if (ch.free) setPlaying(true); else openGate('second_course'); }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{ background: ch.free ? 'rgba(5,150,105,0.12)' : 'rgba(0,0,0,0.08)', color: ch.free ? '#059669' : muted }}>
                    {ch.free ? <Play size={12} /> : <Lock size={12} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: ch.free ? text : muted }}>{ch.title}</p>
                    <p className="text-xs" style={{ color: muted }}>{ch.time}</p>
                  </div>
                  {!ch.free && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {lockedChapLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Sidebar droite ──────────────────────── */}
          <div className="space-y-4">
            {/* Card formateur */}
            <div className="rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: muted }}>{instructorLabel}</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black flex-shrink-0"
                  style={{ background: f.formateurColor }}>
                  {f.formateurInitial}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: text }}>{f.formateur}</p>
                  <p className="text-xs" style={{ color: muted }}>
                    {lang === 'en' ? 'Expert StratIA · replies within 24h' : 'Expert StratIA · répond sous 24h'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => openGate('chat')}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-elevated)', border: `1px solid ${border}`, color: muted }}
              >
                <Lock size={13} />
                {lang === 'en' ? 'Chat (Pro members only)' : 'Chat (réservé Pro)'}
              </button>
            </div>

            {/* Card CTA inscription */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg,#059669,#0891b2)' }} />
              <div className="p-5" style={{ background: surface }}>
                <h3 className="font-black text-base mb-2" style={{ color: text }}>{ctaTitle}</h3>
                <p className="text-sm mb-5" style={{ color: muted }}>{ctaBody}</p>
                <Link
                  href="/auth/register"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm mb-3 transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 6px 20px rgba(5,150,105,0.3)' }}>
                  <GraduationCap size={15} /> {ctaBtn} <ChevronRight size={14} />
                </Link>
                <Link
                  href="/formations"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ color: muted, border: `1px solid ${border}`, background: 'var(--bg-elevated)' }}>
                  {seeCatalogLabel}
                </Link>
                <p className="text-center text-xs mt-3" style={{ color: muted, opacity: 0.5 }}>
                  {lang === 'en' ? 'Free · No credit card' : 'Gratuit · Sans carte de crédit'}
                </p>
              </div>
            </div>

            {/* Bouton "voir 2e formation" → gate */}
            <button
              onClick={() => openGate('second_course')}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all hover:scale-[1.01] group"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(139,92,246,0.1)' }}>
                  <Lock size={16} style={{ color: '#8b5cf6' }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ color: text }}>
                    {lang === 'en' ? 'Next course' : 'Formation suivante'}
                  </p>
                  <p className="text-xs" style={{ color: muted }}>
                    {lang === 'en' ? 'Requires an account' : 'Nécessite un compte'}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: muted }} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ── Bannière CTA bas de page ── */}
        <div className="mt-16 rounded-3xl p-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(5,150,105,0.08),rgba(8,145,178,0.05))', border: '1px solid rgba(5,150,105,0.18)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(5,150,105,0.12),transparent 60%)' }} />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: text }}>
              {lang === 'en' ? 'Ready to go further?' : 'Prêt à aller plus loin ?'}
            </h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: muted }}>
              {lang === 'en'
                ? '50+ courses, a personalised AI path and certificates. Create your account in 30 seconds.'
                : '50+ formations, un parcours IA personnalisé et des certificats. Créez votre compte en 30 secondes.'}
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 8px 32px rgba(5,150,105,0.35)' }}>
              <Zap size={16} />
              {lang === 'en' ? 'Start for free' : 'Commencer gratuitement'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Gate modal */}
      <SignupGateModal open={gateOpen} reason={gateReason} onClose={() => setGateOpen(false)} />
    </div>
  );
}
