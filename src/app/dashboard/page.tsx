'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import {
  Brain, Map, Bot, ArrowRight, Zap, Video,
  TrendingUp, Clock, DollarSign, Bell, Crown,
  ChevronRight, User,
} from 'lucide-react';
import Link from 'next/link';
import { loadProfile } from '@/lib/profile';
import { getRoiSummary, isInactiveSince, fmt$, type RoiSummary } from '@/lib/roi';

interface DiagnosticResult { score: number; level: string; summary: string; }

export default function DashboardPage() {
  const [diag, setDiag]         = useState<DiagnosticResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalTasks, setTotal]  = useState(0);
  const [doneTasks, setDone]    = useState(0);
  const [roi, setRoi]           = useState<RoiSummary | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [profileSector, setProfileSector] = useState('');

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
  }, []);

  const scoreColor = (s: number) =>
    s >= 76 ? '#22c55e' : s >= 56 ? '#3b82f6' : s >= 31 ? '#f59e0b' : '#ef4444';

  const actions = [
    { icon: Brain, href: '/diagnostic', label: 'Diagnostic IA',   desc: diag ? 'Score actuel : ' + diag.score + '/100' : 'Évaluez votre maturité IA', color: '#3b82f6', cta: 'Voir' },
    { icon: Map,   href: '/roadmap',    label: 'Roadmap 90 j',    desc: progress ? 'Progression : ' + progress + '%' : "Plan d'action personnalisé", color: '#8b5cf6', cta: 'Continuer' },
    { icon: Bot,   href: '/assistant',  label: 'StratIA Coach',   desc: 'Guide pas à pas · streaming', color: '#06b6d4', cta: 'Discuter' },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">

        {/* ── NUDGE notification ── */}
        {showNudge && totalTasks > doneTasks && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Reprenez votre roadmap IA
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {totalTasks - doneTasks} tâche{totalTasks - doneTasks > 1 ? 's' : ''} en attente depuis votre dernière visite
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/roadmap"
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg,#d97706,#ea580c)' }}>
                Reprendre <ChevronRight size={11} />
              </Link>
              <button onClick={() => setShowNudge(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Tableau de bord</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Bienvenue sur StratIA — implémentation IA pour votre entreprise
            {profileSector && <span className="ml-2 text-blue-400 font-medium">{profileSector}</span>}
          </p>
        </div>

        {/* ── DIAGNOSTIC BANNER (no diag) ── */}
        {!diag && (
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(8,145,178,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Commencez par votre diagnostic IA</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Obtenez un plan d'action personnalisé en 5 minutes</p>
              </div>
            </div>
            <Link href="/diagnostic" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0">
              Démarrer <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ── SCORE + PROGRESS (has diag) ── */}
        {diag && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Maturité IA</p>
              <p className="text-3xl font-black" style={{ color: scoreColor(diag.score) }}>
                {diag.score}<span className="text-sm font-medium ml-0.5" style={{ color: 'var(--text-muted)' }}>/100</span>
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{diag.level}</p>
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-1.5 rounded-full" style={{ width: diag.score + '%', background: scoreColor(diag.score) }} />
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Roadmap</p>
              <p className="text-3xl font-black" style={{ color: '#8b5cf6' }}>
                {progress}<span className="text-sm font-medium ml-0.5" style={{ color: 'var(--text-muted)' }}>%</span>
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{doneTasks}/{totalTasks} tâches</p>
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" style={{ width: progress + '%' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── ROI WIDGET ── */}
        {roi && roi.toolCount > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-emerald-400 flex-shrink-0" />
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Économies réalisées avec l'IA</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  {roi.toolCount} outil{roi.toolCount > 1 ? 's' : ''} configuré{roi.toolCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <Clock size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-xl font-black" style={{ color: '#22c55e' }}>{roi.totalHoursPerWeek}h</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>économisées/semaine</p>
                </div>
                <div className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <DollarSign size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-xl font-black" style={{ color: '#22c55e' }}>{fmt$(roi.totalMonthlySavings)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>économisés/mois</p>
                </div>
                <div className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <Zap size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-xl font-black" style={{ color: '#22c55e' }}>{fmt$(roi.totalAnnualSavings)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>projeté/année</p>
                </div>
              </div>
              {/* Tool list */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {roi.entries.map((e, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)', color: '#86efac' }}>
                    ✓ {e.toolName}
                  </span>
                ))}
              </div>
            </div>
            {roi.totalMonthlySavings > 0 && (
              <div className="px-5 py-3 text-xs" style={{ background: 'rgba(34,197,94,0.04)', borderTop: '1px solid rgba(34,197,94,0.1)', color: 'var(--text-secondary)' }}>
                💡 Votre abonnement StratIA (69$/mois) est rentabilisé en <strong style={{ color: '#22c55e' }}>
                  {Math.ceil(69 / roi.totalMonthlySavings * 100) / 100 < 1 ? 'moins d\'un jour' : Math.ceil(69 / roi.totalMonthlySavings) + ' jour' + (Math.ceil(69 / roi.totalMonthlySavings) > 1 ? 's' : '')}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* ── ROI TEASER (no tools yet) ── */}
        {(!roi || roi.toolCount === 0) && diag && (
          <div className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>Calculateur ROI en temps réel</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Implémentez votre premier outil avec le Coach IA — vos économies s'afficheront ici automatiquement.
              </p>
              <Link href="/assistant" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-2">
                Commencer maintenant <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}

        {/* ── QUICK ACTIONS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map(({ icon: Icon, href, label, desc, color, cta }) => (
            <Link key={href} href={href}
              className="group rounded-2xl p-5 flex flex-col transition-all hover:scale-[1.01]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'color-mix(in srgb,' + color + ' 15%, transparent)' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs flex-1 mb-4" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              <span className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color }}>
                {cta} <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>

        {/* ── PROFILE CARD ── */}
        {profileSector && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.1)' }}>
              <User size={16} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{profileSector}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Profil personnalisé — réponses IA adaptées à votre secteur
              </p>
            </div>
            <Link href="/assistant?setup=1"
              className="text-xs px-3 py-1.5 rounded-lg border flex-shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Modifier
            </Link>
          </div>
        )}

        {/* ── BOTTOM LINKS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/formations',   label: 'Formations' },
            { href: '/bibliotheque', label: 'Bibliothèque' },
            { href: '/communaute',   label: 'Communauté' },
            { href: '/rendez-vous',  label: 'Réserver une session', icon: Video },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl border text-sm transition-colors hover:border-blue-500/30"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <span>{label}</span>
              {Icon ? <Icon size={13} className="text-blue-400 flex-shrink-0" /> : <ArrowRight size={12} className="opacity-40" />}
            </Link>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
