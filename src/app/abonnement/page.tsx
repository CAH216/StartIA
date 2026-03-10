'use client';

import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import {
  CheckCircle, XCircle, Building2, GraduationCap,
  ArrowRight, Star, Users, Newspaper, Video, Calendar,
  TrendingUp, Crown, CreditCard,
} from 'lucide-react';

function SavingsCalc() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState(1);
  const [formations, setFormations] = useState(2);
  const fullPrice = sessions * 280 + formations * 119;
  const proPrice = 49 + sessions * 140 + formations * 71;
  const saved = fullPrice - proPrice;
  return (
    <div className="rounded-2xl p-6 max-w-2xl mx-auto"
      style={{ background: 'var(--bg-surface)', border: '2px solid rgba(139,92,246,0.25)', boxShadow: '0 8px 30px rgba(139,92,246,0.1)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <TrendingUp size={16} style={{ color: '#8b5cf6' }}/>
        </div>
        <div>
          <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{t('sub_calc_title')}</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('sub_calc_sub')}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            {t('sub_formations_month')} : <span className="font-black" style={{ color: '#8b5cf6' }}>{formations}</span>
          </label>
          <input type="range" min={1} max={8} value={formations} onChange={e => setFormations(+e.target.value)} className="w-full accent-purple-500"/>
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
            {t('sub_sessions_month')} : <span className="font-black" style={{ color: '#8b5cf6' }}>{sessions}</span>
          </label>
          <input type="range" min={0} max={4} value={sessions} onChange={e => setSessions(+e.target.value)} className="w-full accent-purple-500"/>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('sub_calc_without')}</p>
          <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{fullPrice}$</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('sub_calc_with')}</p>
          <p className="text-xl font-black" style={{ color: '#8b5cf6' }}>{proPrice}$</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('sub_calc_save')}</p>
          <p className="text-xl font-black" style={{ color: '#059669' }}>−{saved}$</p>
        </div>
      </div>
    </div>
  );
}

export default function AbonnementPage() {
  const { t, lang } = useLanguage();

  const PLANS = [
    {
      id: 'unit', name: t('plan_unit'), price: '89–149', suffix: t('sub_per_formation'),
      color: '#3b82f6', gradient: 'from-blue-500 to-sky-500', highlight: false,
      tagline: lang === 'en' ? 'To test a specific course' : 'Pour tester une formation précise',
      features: [
        { label: lang === 'en' ? 'Lifetime access to purchased course' : 'Accès à vie à la formation achetée', ok: true },
        { label: lang === 'en' ? 'Unlimited viewing' : 'Visionnage illimité', ok: true },
        { label: lang === 'en' ? 'Completion certificate' : 'Certificat de complétion', ok: true },
        { label: lang === 'en' ? 'Course updates' : 'Mises à jour de la formation', ok: false },
        { label: lang === 'en' ? 'Live courses' : 'Formations live', ok: false },
        { label: lang === 'en' ? 'Weekly AI newsletter' : 'Newsletter IA hebdomadaire', ok: false },
        { label: lang === 'en' ? 'Discount on expert sessions' : 'Réduction sessions expert', ok: false },
        { label: lang === 'en' ? 'Live replay archive' : 'Archive des replays live', ok: false },
      ] as { label: string; ok: boolean }[],
      cta: lang === 'en' ? 'Explore courses' : 'Explorer les formations', href: '/formations',
    },
    {
      id: 'pro', name: 'Pro', price: '49', suffix: t('sub_per_month'),
      color: '#8b5cf6', gradient: 'from-purple-500 to-blue-500', highlight: true,
      badge: t('popular'),
      tagline: lang === 'en' ? 'The smart choice to stay current' : 'Le choix intelligent pour rester à jour',
      features: [
        { label: lang === 'en' ? '−40% on all courses' : '−40% sur toutes les formations', ok: true },
        { label: lang === 'en' ? '1 free course per month' : '1 formation offerte chaque mois', ok: true },
        { label: lang === 'en' ? 'Auto content updates' : 'Mises à jour auto incluses', ok: true },
        { label: lang === 'en' ? 'Live courses included' : 'Formations live incluses', ok: true },
        { label: lang === 'en' ? 'Weekly AI newsletter' : 'Newsletter IA hebdomadaire', ok: true },
        { label: lang === 'en' ? '−50% expert sessions' : '−50% sur sessions expert 1-à-1', ok: true },
        { label: lang === 'en' ? 'All live replays archive' : 'Archive de tous les replays live', ok: true },
        { label: lang === 'en' ? 'Priority support' : 'Support prioritaire', ok: true },
      ] as { label: string; ok: boolean }[],
      cta: t('subscribe'), href: '/auth/register',
    },
    {
      id: 'equipe', name: lang === 'en' ? 'Team' : 'Équipe', price: '149', suffix: t('sub_per_month'),
      color: '#059669', gradient: 'from-emerald-500 to-teal-500', highlight: false,
      tagline: lang === 'en' ? 'For your entire organisation' : 'Pour former toute votre organisation',
      features: [
        { label: lang === 'en' ? 'All Pro plan × 5 users' : 'Tout le plan Pro × 5 utilisateurs', ok: true },
        { label: lang === 'en' ? 'Manager dashboard (team tracking)' : 'Dashboard manager (suivi équipe)', ok: true },
        { label: lang === 'en' ? '2 expert sessions included / month' : '2 sessions expert incluses / mois', ok: true },
        { label: lang === 'en' ? 'Monthly team progress report' : 'Rapport mensuel progression équipe', ok: true },
        { label: lang === 'en' ? 'Private live sessions at reduced rate' : 'Sessions live privées à tarif réduit', ok: true },
        { label: lang === 'en' ? 'Personalised onboarding' : 'Onboarding personnalisé', ok: true },
        { label: lang === 'en' ? 'Centralised billing' : 'Facturation centralisée', ok: true },
        { label: lang === 'en' ? 'Dedicated account manager' : 'Account manager dédié', ok: true },
      ] as { label: string; ok: boolean }[],
      cta: lang === 'en' ? 'Contact sales' : 'Contacter les ventes', href: '/integration',
    },
  ];

  const COMPARE = [
    { label: lang === 'en' ? 'Video courses' : 'Formations vidéo', unit: lang === 'en' ? 'Full price (89–149$)' : 'Prix plein (89–149$)', pro: '−40% + 1 offerte/mois', equipe: '−40% × 5 users' },
    { label: lang === 'en' ? 'Live courses' : 'Formations live', unit: '✗', pro: '✅ Inclus', equipe: '✅ Inclus + privées' },
    { label: lang === 'en' ? 'Content updates' : 'Mises à jour contenu', unit: '✗', pro: '✅ Auto', equipe: '✅ Auto' },
    { label: lang === 'en' ? 'Expert sessions 1-on-1' : 'Sessions expert 1-à-1', unit: '250–400$ (full price)', pro: '−50% → 125–200$', equipe: '−50% + 2 incluses/mois' },
    { label: lang === 'en' ? 'Weekly AI newsletter' : 'Newsletter IA hebdo', unit: '✗', pro: '✅', equipe: '✅' },
    { label: lang === 'en' ? 'Live replays archive' : 'Archive replays live', unit: '✗', pro: '✅', equipe: '✅' },
    { label: lang === 'en' ? 'Users' : 'Nb utilisateurs', unit: '1', pro: '1', equipe: lang === 'en' ? 'Up to 5' : "Jusqu'à 5" },
    { label: 'Support', unit: lang === 'en' ? 'Standard' : 'Standard', pro: lang === 'en' ? 'Priority' : 'Prioritaire', equipe: lang === 'en' ? 'Dedicated account manager' : 'Account manager dédié' },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.18)' }}>
            <CreditCard size={11}/> {t('nav_abonnements')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('sub_title')}
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('sub_subtitle')}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            {t('sub_cancel')}
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map(plan => (
            <div key={plan.id} className="flex flex-col rounded-2xl overflow-hidden relative"
              style={{
                background: plan.highlight ? 'linear-gradient(160deg,rgba(139,92,246,0.07),var(--bg-surface))' : 'var(--bg-surface)',
                border: plan.highlight ? '2px solid rgba(139,92,246,0.4)' : '1px solid var(--border)',
                boxShadow: plan.highlight ? '0 16px 50px rgba(139,92,246,0.18)' : 'none',
                transform: plan.highlight ? 'scale(1.02)' : 'none',
              }}>
              {plan.badge && (
                <div className="text-center py-2 text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${plan.color},${plan.color}cc)` }}>
                  {plan.badge}
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                  {plan.id === 'equipe' ? <Users size={18} className="text-white"/>
                    : plan.id === 'unit' ? <GraduationCap size={18} className="text-white"/>
                    : <Crown size={18} className="text-white"/>}
                </div>
                <h2 className="font-black text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>{plan.name}</h2>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{plan.tagline}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black" style={{ color: plan.highlight ? plan.color : 'var(--text-primary)' }}>{plan.price}$</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{plan.suffix}</span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f.label} className="flex items-start gap-2 text-xs">
                      {f.ok
                        ? <CheckCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }}/>
                        : <XCircle size={12} className="flex-shrink-0 mt-0.5 opacity-30" style={{ color: 'var(--text-muted)' }}/>}
                      <span style={{ color: f.ok ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={plan.highlight
                    ? { background: `linear-gradient(135deg,${plan.color},${plan.color}aa)`, color: 'white', boxShadow: '0 6px 20px rgba(139,92,246,0.3)' }
                    : { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  {plan.cta} <ArrowRight size={13}/>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Calculateur */}
        <div className="text-center">
          <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{t('sub_calc_title')}</h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>{t('sub_calc_sub')}</p>
          <SavingsCalc/>
        </div>

        {/* Tableau comparatif */}
        <div>
          <h2 className="text-xl font-black text-center mb-5" style={{ color: 'var(--text-primary)' }}>{t('sub_compare_title')}</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-4 divide-x" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <div className="p-3 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t('sub_feature')}</div>
              {[t('plan_unit'), 'Pro 49$/mois', lang === 'en' ? 'Team 149$/mo' : 'Équipe 149$/mois'].map(h => (
                <div key={h} className="p-3 text-xs font-bold text-center" style={{ color: 'var(--text-primary)' }}>{h}</div>
              ))}
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.label} className="grid grid-cols-4 divide-x"
                style={{ borderBottom: i < COMPARE.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-base)' }}>
                <div className="p-3 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{row.label}</div>
                <div className="p-3 text-xs text-center" style={{ color: row.unit.startsWith('✗') ? 'var(--text-muted)' : 'var(--text-primary)', opacity: row.unit.startsWith('✗') ? 0.5 : 1 }}>{row.unit}</div>
                <div className="p-3 text-xs text-center font-semibold" style={{ color: row.pro.startsWith('✅') || row.pro.startsWith('−') ? '#8b5cf6' : 'var(--text-primary)' }}>{row.pro}</div>
                <div className="p-3 text-xs text-center font-semibold" style={{ color: row.equipe.startsWith('✅') || row.equipe.startsWith('−') ? '#059669' : 'var(--text-primary)' }}>{row.equipe}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Avantages Pro */}
        <div>
          <h2 className="text-xl font-black text-center mb-2" style={{ color: 'var(--text-primary)' }}>{t('sub_why_title')}</h2>
          <p className="text-center text-xs mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>{t('sub_why_body')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Video, color: '#3b82f6', title: lang === 'en' ? '1 free course/month' : '1 formation offerte/mois', desc: lang === 'en' ? 'A curated course every month.' : 'Une formation sélectionnée chaque mois.' },
              { icon: Newspaper, color: '#8b5cf6', title: lang === 'en' ? 'Weekly AI newsletter' : 'Veille IA hebdomadaire', desc: lang === 'en' ? 'AI changes impacting your sector.' : 'Les évolutions IA qui impactent votre secteur.' },
              { icon: Calendar, color: '#06b6d4', title: lang === 'en' ? 'Live courses included' : 'Formations live incluses', desc: lang === 'en' ? 'Live sessions with Q&A.' : 'Sessions en direct avec questions.' },
              { icon: Star, color: '#f59e0b', title: lang === 'en' ? 'Always up-to-date content' : 'Contenu toujours à jour', desc: lang === 'en' ? 'Your courses evolve with AI.' : "Vos formations évoluent avec l'IA." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                  <Icon size={14} style={{ color }}/>
                </div>
                <p className="font-bold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intégration CTA */}
        <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg,rgba(5,150,105,0.06),var(--bg-surface))', border: '1px solid rgba(5,150,105,0.2)' }}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3">
            <Building2 size={20} className="text-white"/>
          </div>
          <h3 className="text-base font-black mb-1" style={{ color: 'var(--text-primary)' }}>{t('sub_integration_title')}</h3>
          <p className="text-xs max-w-sm mx-auto mb-4" style={{ color: 'var(--text-muted)' }}>{t('sub_integration_body')}</p>
          <Link href="/integration"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#059669,#06b6d4)', boxShadow: '0 4px 16px rgba(5,150,105,0.25)' }}>
            {t('sub_integration_cta')} <ArrowRight size={13}/>
          </Link>
        </div>

        <p className="text-center text-xs pb-6" style={{ color: 'var(--text-muted)' }}>
          {t('sub_questions')}{' '}
          <Link href="/rendez-vous" className="font-semibold hover:underline" style={{ color: '#8b5cf6' }}>
            {t('sub_talk_consultant')}
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
