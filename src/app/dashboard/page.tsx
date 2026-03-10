'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import OnboardingModal from '@/components/OnboardingModal';
import {
  Sparkles, ArrowRight, Zap, Video,
  TrendingUp, Clock, DollarSign, Bell,
  Crown, ChevronRight, User, GraduationCap,
  CalendarClock, FileText, CreditCard, Award,
} from 'lucide-react';
import Link from 'next/link';
import { loadProfile } from '@/lib/profile';
import { getRoiSummary, isInactiveSince, fmt$, type RoiSummary } from '@/lib/roi';
import { useLanguage } from '@/contexts/LanguageContext';


interface DiagnosticResult { score: number; level: string; summary: string; }

export default function DashboardPage() {
  const { t, lang } = useLanguage();
  const [diag, setDiag] = useState<DiagnosticResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalTasks, setTotal] = useState(0);
  const [doneTasks, setDone] = useState(0);
  const [roi, setRoi] = useState<RoiSummary | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [profileSector, setProfileSector] = useState('');
  const [userName, setUserName] = useState('');
  const [userPlan, setUserPlan] = useState('FREE');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Diagnostic
    const d = localStorage.getItem('stratia_diagnostic');
    if (d) { try { setDiag(JSON.parse(d)); } catch { /**/ } }

    // Roadmap progress
    const t = localStorage.getItem('stratia_roadmap_progress');
    if (t) {
      try {
        const parsed = JSON.parse(t) as Record<string, string>;
        const vals = Object.values(parsed);
        const done = vals.filter(v => v === 'done').length;
        setDone(done);
        setTotal(vals.length);
        if (vals.length) setProgress(Math.round(done / vals.length * 100));
      } catch { /**/ }
    }

    // ROI
    setRoi(getRoiSummary());

    // Nudge: inactive > 48h with incomplete tasks
    if (isInactiveSince(48 * 60 * 60 * 1000)) setShowNudge(true);

    // Profile
    const p = loadProfile();
    if (p?.sector) setProfileSector(p.sector);

    // User info + onboarding
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.fullName) setUserName(data.fullName);
      if (data?.plan) setUserPlan(data.plan);
      if (data?.isNewUser) setIsNewUser(true);
    }).catch(() => null);
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = lang === 'en'
    ? (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')
    : (hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir');

  const quickLinks = [
    { href: '/parcours', label: t('nav_parcours'), icon: Sparkles, color: '#8b5cf6', desc: lang === 'en' ? 'Courses tailored to your profile' : 'Formations adaptées à votre profil' },
    { href: '/formations', label: t('nav_catalogue'), icon: GraduationCap, color: '#3b82f6', desc: lang === 'en' ? 'The full AI & integration library' : 'Toute la bibliothèque IA & intégration' },
    { href: '/rendez-vous', label: t('nav_session_expert'), icon: CalendarClock, color: '#06b6d4', desc: lang === 'en' ? 'Book a 1-on-1 with an instructor' : 'Réservez un 1-à-1 avec un formateur' },
    { href: '/documents', label: t('nav_certificats'), icon: Award, color: '#10b981', desc: lang === 'en' ? 'Download your certificates' : 'Téléchargez vos attestations' },
  ];

  return (
    <AppShell>
      {/* Onboarding plein-écran — se déclenche via URL param ?welcome=1 */}
      <OnboardingModal />
      <div className="max-w-4xl mx-auto px-5 py-8 space-y-6" data-tour="stats">
        {/* ── NUDGE ── */}
        {showNudge && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Continuez votre parcours IA</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Votre parcours personnalisé vous attend</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/parcours" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
                Reprendre <ChevronRight size={11} />
              </Link>
              <button onClick={() => setShowNudge(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
              {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Bienvenue sur StratIA — votre plateforme de formations IA et d&apos;intégration intelligente
              {profileSector && <span className="ml-2 text-blue-400 font-medium">{profileSector}</span>}
            </p>
          </div>
          {userPlan === 'PRO' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Crown size={12} /> Abonnement Pro
            </span>
          ) : (
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Passer Pro <ArrowRight size={11} />
            </Link>
          )}
        </div>

        {/* ── PARCOURS BANNER (si pas de diagnostic) ── */}
        {!diag && (
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Découvrez votre parcours IA personnalisé</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>4 questions • formations adaptées à vous • moins de 2 min</p>
              </div>
            </div>
            <Link href="/parcours" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm whitespace-nowrap flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              Trouver mes formations <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ── PROGRESS CARD (si roadmap en cours) ── */}
        {diag && totalTasks > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-purple-400" />
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Mon Parcours IA</p>
              </div>
              <Link href="/parcours" className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>
                Continuer →
              </Link>
            </div>
            <div className="w-full rounded-full h-2 mb-2" style={{ background: 'var(--bg-elevated)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#8b5cf6,#3b82f6)' }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{doneTasks}/{totalTasks} étapes complétées · {progress}%</p>
          </div>
        )}

        {/* ── ROI WIDGET ── */}
        {roi && roi.toolCount > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-emerald-400 flex-shrink-0" />
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Économies réalisées avec l&apos;IA</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  {roi.toolCount} outil{roi.toolCount > 1 ? 's' : ''} configuré{roi.toolCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Clock, value: `${roi.totalHoursPerWeek}h`, label: 'économisées/sem.', color: '#22c55e' },
                  { icon: DollarSign, value: fmt$(roi.totalMonthlySavings), label: 'économisés/mois', color: '#22c55e' },
                  { icon: Zap, value: fmt$(roi.totalAnnualSavings), label: 'projeté/année', color: '#22c55e' },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                      <Icon size={13} className="text-emerald-400" />
                    </div>
                    <p className="text-xl font-black" style={{ color }}>{value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── QUICK LINKS ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Accès rapide</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map(({ href, label, icon: Icon, color, desc }) => (
              <Link key={href} href={href}
                className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb,${color} 12%,transparent)` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
                <ChevronRight size={15} className="flex-shrink-0 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* ── ABONNEMENT TEASER (si FREE) ── */}
        {userPlan === 'FREE' && (
          <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,191,36,0.04))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <Crown size={18} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Passez à Pro — 49$/mois</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>1 formation offerte · sessions live incluses · newsletter IA hebdomadaire · 50% sur les sessions expert</p>
              </div>
            </div>
            <Link href="/pricing"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white whitespace-nowrap flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
              Voir les plans <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* ── BOTTOM ACTIONS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/formations', label: 'Formations', icon: Video },
            { href: '/pricing', label: 'Abonnements', icon: CreditCard },
            { href: '/rendez-vous', label: 'Sessions expert', icon: CalendarClock },
            { href: '/documents', label: 'Mes certificats', icon: FileText },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl border text-sm transition-colors hover:border-blue-500/30"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-2"><Icon size={13} className="flex-shrink-0 opacity-60" />{label}</span>
              <ArrowRight size={11} className="opacity-30" />
            </Link>
          ))}
        </div>

        {/* ── PROFILE CARD ── */}
        {profileSector && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <User size={16} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{profileSector}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Profil personnalisé — formations adaptées à votre secteur</p>
            </div>
            <Link href="/parcours"
              className="text-xs px-3 py-1.5 rounded-lg border flex-shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Modifier
            </Link>
          </div>
        )}

      </div>
    </AppShell >
  );
}
