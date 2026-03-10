'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CheckCircle, XCircle, Zap, Building2, GraduationCap,
  ArrowRight, Star, Users, Newspaper, Video, Calendar, TrendingUp,
} from 'lucide-react';

/* ─── Token ─── */
const S = {
  base: 'var(--bg-base)',
  surface: 'var(--bg-surface)',
  elevated: 'var(--bg-elevated)',
  text: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
  faint: 'var(--text-muted)',
  border: 'var(--border)',
};

/* ─── Plan data ─── */
const PLANS = [
  {
    id: 'unit',
    name: "À l'unité",
    tagline: 'Pour tester une formation précise',
    price: '89–149',
    suffix: '$ / formation',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-sky-500',
    highlight: false,
    features: [
      { label: 'Accès à vie à la formation achetée', ok: true },
      { label: 'Visionnage illimité', ok: true },
      { label: 'Certificat de complétion', ok: true },
      { label: 'Mises à jour de la formation', ok: false },
      { label: 'Formations live', ok: false },
      { label: 'Newsletter IA hebdomadaire', ok: false },
      { label: 'Réduction sessions expert', ok: false },
      { label: 'Archive des replays live', ok: false },
    ] as { label: string; ok: boolean }[],
    cta: 'Explorer les formations',
    href: '/formations',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Le choix intelligent pour rester à jour',
    price: '49',
    suffix: '$ / mois',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-blue-500',
    highlight: true,
    badge: '⭐ Le plus populaire',
    features: [
      { label: '−40% sur toutes les formations', ok: true },
      { label: '1 formation offerte chaque mois', ok: true },
      { label: 'Mises à jour auto incluses', ok: true },
      { label: 'Formations live incluses', ok: true },
      { label: 'Newsletter IA hebdomadaire', ok: true },
      { label: '−50% sur sessions expert 1-à-1', ok: true },
      { label: 'Archive de tous les replays live', ok: true },
      { label: 'Support prioritaire', ok: true },
    ] as { label: string; ok: boolean }[],
    cta: 'Commencer le Pro',
    href: '/auth/register',
  },
  {
    id: 'equipe',
    name: 'Équipe',
    tagline: "Pour former toute votre organisation",
    price: '149',
    suffix: '$ / mois',
    color: '#059669',
    gradient: 'from-emerald-500 to-teal-500',
    highlight: false,
    features: [
      { label: 'Tout le plan Pro × 5 utilisateurs', ok: true },
      { label: 'Dashboard manager (suivi équipe)', ok: true },
      { label: '2 sessions expert incluses / mois', ok: true },
      { label: 'Rapport mensuel progression équipe', ok: true },
      { label: 'Sessions live privées à tarif réduit', ok: true },
      { label: 'Onboarding personnalisé', ok: true },
      { label: 'Facturation centralisée', ok: true },
      { label: 'Account manager dédié', ok: true },
    ] as { label: string; ok: boolean }[],
    cta: 'Contacter les ventes',
    href: '/integration',
  },
];

/* ─── Comparison rows ─── */
const COMPARE = [
  { label: 'Formations vidéo', unit: 'Prix plein (89–149$)', pro: '−40% + 1 offerte/mois', equipe: '−40% × 5 users' },
  { label: 'Formations live', unit: '✗', pro: '✅ Inclus', equipe: '✅ Inclus + privées' },
  { label: 'Mises à jour contenu', unit: '✗', pro: '✅ Auto', equipe: '✅ Auto' },
  { label: 'Sessions expert 1-à-1', unit: '250–400$ (plein tarif)', pro: '−50% → 125–200$', equipe: '−50% + 2 incluses/mois' },
  { label: 'Newsletter IA hebdo', unit: '✗', pro: '✅', equipe: '✅' },
  { label: 'Archive replays live', unit: '✗', pro: '✅', equipe: '✅' },
  { label: 'Nb utilisateurs', unit: '1', pro: '1', equipe: "Jusqu'à 5" },
  { label: 'Support', unit: 'Standard', pro: 'Prioritaire', equipe: 'Account manager dédié' },
];

/* ─── Savings calculator ─── */
function SavingsCalc() {
  const [sessions, setSessions] = useState(1);
  const [formations, setFormations] = useState(2);

  const fullPrice = sessions * 280 + formations * 119;
  const proPrice = 49 + sessions * 140 + formations * 71;
  const saved = fullPrice - proPrice;

  return (
    <div className="rounded-3xl p-8 max-w-2xl mx-auto" style={{ background: S.surface, border: `2px solid color-mix(in srgb,#8b5cf6 25%,transparent)`, boxShadow: '0 12px 40px rgba(139,92,246,0.12)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
          <TrendingUp size={18} style={{ color: '#8b5cf6' }} />
        </div>
        <div>
          <h3 className="font-black" style={{ color: S.text }}>Calculez vos économies</h3>
          <p className="text-xs" style={{ color: S.faint }}>Comparez Pro vs achat à l&apos;unité</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: S.muted }}>
            Formations par mois : <span className="font-black" style={{ color: '#8b5cf6' }}>{formations}</span>
          </label>
          <input type="range" min={1} max={8} value={formations} onChange={e => setFormations(+e.target.value)} className="w-full accent-purple-500" />
        </div>
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: S.muted }}>
            Sessions expert / mois : <span className="font-black" style={{ color: '#8b5cf6' }}>{sessions}</span>
          </label>
          <input type="range" min={0} max={4} value={sessions} onChange={e => setSessions(+e.target.value)} className="w-full accent-purple-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl p-4" style={{ background: S.elevated, border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: S.faint }}>Sans abonnement</p>
          <p className="text-2xl font-black" style={{ color: S.text }}>{fullPrice}$</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: S.elevated, border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: S.faint }}>Avec Pro</p>
          <p className="text-2xl font-black" style={{ color: '#8b5cf6' }}>{proPrice}$</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'color-mix(in srgb,#059669 10%,transparent)', border: '1px solid color-mix(in srgb,#059669 25%,transparent)' }}>
          <p className="text-xs mb-1" style={{ color: S.faint }}>Vous économisez</p>
          <p className="text-2xl font-black" style={{ color: '#059669' }}>−{saved}$</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: S.base }}>
      {/* Hero */}
      <div className="pt-24 pb-16 px-5 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-xs font-semibold transition-opacity opacity-50 hover:opacity-100" style={{ color: S.muted }}>
          <ArrowRight size={13} className="rotate-180" /> Retour à l&apos;accueil
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
          style={{ background: 'color-mix(in srgb,#8b5cf6 10%,transparent)', border: '1px solid color-mix(in srgb,#8b5cf6 22%,transparent)', color: '#8b5cf6' }}>
          <Zap size={12} /> Tarifs simples et transparents
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-4" style={{ color: S.text }}>Choisissez votre plan</h1>
        <p className="text-lg max-w-xl mx-auto mb-3" style={{ color: S.muted }}>
          L&apos;IA évolue chaque semaine. Restez toujours compétitif avec l&apos;abonnement Pro.
        </p>
        <p className="text-sm" style={{ color: S.faint }}>
          Annulez à tout moment · Pas d&apos;engagement annuel · Paiement sécurisé
        </p>
      </div>

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto px-5 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map(plan => (
            <div key={plan.id} className="flex flex-col rounded-3xl overflow-hidden relative"
              style={{
                background: plan.highlight ? `linear-gradient(160deg,color-mix(in srgb,${plan.color} 7%,${S.surface}),${S.surface})` : S.surface,
                border: plan.highlight ? `2px solid color-mix(in srgb,${plan.color} 40%,transparent)` : `1px solid ${S.border}`,
                boxShadow: plan.highlight ? `0 20px 60px color-mix(in srgb,${plan.color} 20%,transparent)` : 'none',
                transform: plan.highlight ? 'scale(1.03)' : 'none',
              }}>
              {plan.badge && (
                <div className="text-center py-2 text-xs font-bold text-white" style={{ background: `linear-gradient(135deg,${plan.color},${plan.color}cc)` }}>
                  {plan.badge}
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                {/* Icon + name */}
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  {plan.id === 'equipe' ? <Users size={20} className="text-white" /> :
                    plan.id === 'unit' ? <GraduationCap size={20} className="text-white" /> :
                      <Zap size={20} className="text-white" />}
                </div>
                <h2 className="font-black text-xl mb-0.5" style={{ color: S.text }}>{plan.name}</h2>
                <p className="text-sm mb-5" style={{ color: S.faint }}>{plan.tagline}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  {plan.id === 'unit' ? (
                    <>
                      <span className="text-3xl font-black" style={{ color: S.text }}>{plan.price}$</span>
                      <span className="text-sm" style={{ color: S.faint }}>/ formation</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black" style={{ color: plan.highlight ? plan.color : S.text }}>{plan.price}$</span>
                      <span className="text-sm" style={{ color: S.faint }}>/mois</span>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map(f => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      {f.ok
                        ? <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                        : <XCircle size={14} className="flex-shrink-0 mt-0.5 opacity-30" style={{ color: S.faint }} />}
                      <span style={{ color: f.ok ? S.muted : S.faint, textDecoration: f.ok ? 'none' : 'none' }}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.href}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
                  style={plan.highlight
                    ? { background: `linear-gradient(135deg,${plan.color},${plan.color}aa)`, color: 'white', boxShadow: `0 8px 24px color-mix(in srgb,${plan.color} 35%,transparent)` }
                    : { background: S.elevated, border: `1px solid ${S.border}`, color: S.text }}>
                  {plan.cta} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Savings calculator */}
        <div className="mt-20 mb-8 text-center">
          <h2 className="text-2xl font-black mb-2" style={{ color: S.text }}>Combien économisez-vous avec le Pro ?</h2>
          <p className="text-sm mb-8" style={{ color: S.faint }}>Ajustez selon votre utilisation mensuelle estimée</p>
          <SavingsCalc />
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="text-2xl font-black text-center mb-8" style={{ color: S.text }}>Comparatif détaillé</h2>
          <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${S.border}` }}>
            {/* Header */}
            <div className="grid grid-cols-4 divide-x"
              style={{ borderBottom: `1px solid ${S.border}`, background: S.elevated }}>
              <div className="p-4 font-bold text-sm" style={{ color: S.muted }}>Fonctionnalité</div>
              {['À l&apos;unité', 'Pro 49$/mois', 'Équipe 149$/mois'].map(h => (
                <div key={h} className="p-4 font-bold text-sm text-center" style={{ color: S.text }} dangerouslySetInnerHTML={{ __html: h }} />
              ))}
            </div>
            {/* Rows */}
            {COMPARE.map((row, i) => (
              <div key={row.label} className="grid grid-cols-4 divide-x"
                style={{ borderBottom: i < COMPARE.length - 1 ? `1px solid ${S.border}` : 'none', background: i % 2 === 0 ? S.surface : S.base }}>
                <div className="p-4 text-sm font-medium" style={{ color: S.muted }}>{row.label}</div>
                <div className="p-4 text-sm text-center" style={{ color: row.unit.startsWith('✗') ? S.faint : S.text, opacity: row.unit.startsWith('✗') ? 0.5 : 1 }}>{row.unit}</div>
                <div className="p-4 text-sm text-center font-semibold" style={{ color: row.pro.startsWith('✅') || row.pro.startsWith('−') ? '#8b5cf6' : S.text }}>{row.pro}</div>
                <div className="p-4 text-sm text-center font-semibold" style={{ color: row.equipe.startsWith('✅') || row.equipe.startsWith('−') ? '#059669' : S.text }}>{row.equipe}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why subscribe section */}
        <div className="mt-20 mb-20">
          <h2 className="text-2xl font-black text-center mb-3" style={{ color: S.text }}>Pourquoi s&apos;abonner plutôt qu&apos;acheter ?</h2>
          <p className="text-center text-sm mb-10 max-w-xl mx-auto" style={{ color: S.faint }}>
            L&apos;IA évolue chaque semaine. En achetant une formation une seule fois, vous risquez d&apos;apprendre quelque chose de dépassé dans 6 mois. <strong style={{ color: S.muted }}>L&apos;abonnement Pro, lui, vous garde toujours à la pointe.</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Video, color: '#3b82f6', title: '1 formation offerte/mois', desc: 'Chaque mois, une formation sélectionnée par nos experts vous est offerte automatiquement.' },
              { icon: Newspaper, color: '#8b5cf6', title: 'Veille IA hebdomadaire', desc: 'Recevez les évolutions IA qui impactent votre secteur, chaque semaine, directement dans votre boite mail.' },
              { icon: Calendar, color: '#06b6d4', title: 'Formations live incluses', desc: 'Assistez en direct aux sessions animées par nos formateurs. Questions, échanges, pratique.' },
              { icon: Star, color: '#f59e0b', title: 'Contenu toujours à jour', desc: 'Vos formations achetées évoluent avec l\'IA. Pas de contenu obsolète, jamais.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="rounded-2xl p-5" style={{ background: S.surface, border: `1px solid ${S.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `color-mix(in srgb,${color} 12%,transparent)` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: S.text }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: S.faint }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration CTA */}
        <div className="rounded-3xl p-8 text-center mb-20" style={{ background: `linear-gradient(135deg,color-mix(in srgb,#059669 8%,${S.surface}),${S.surface})`, border: '1px solid color-mix(in srgb,#059669 25%,transparent)' }}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
            <Building2 size={22} className="text-white" />
          </div>
          <h3 className="text-xl font-black mb-2" style={{ color: S.text }}>Intégration IA sur mesure</h3>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: S.faint }}>
            Notre équipe vient analyser vos processus, créer un plan d&apos;intégration IA et former vos équipes. Tarif sur devis selon le périmètre.
          </p>
          <Link href="/integration"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#059669,#06b6d4)', boxShadow: '0 6px 20px rgba(5,150,105,0.3)' }}>
            Demander un devis <ArrowRight size={14} />
          </Link>
        </div>

        <p className="text-center text-sm pb-12" style={{ color: S.faint }}>
          Des questions ? <Link href="/rendez-vous" className="font-semibold hover:underline" style={{ color: '#8b5cf6' }}>Parlez à un consultant →</Link>
        </p>
      </div>
    </div>
  );
}
