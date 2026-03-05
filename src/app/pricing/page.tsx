'use client';

import AppShell from '@/components/AppShell';
import { CheckCircle, XCircle, Zap, Star, Crown, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Essentiel',
    price: 29,
    period: '/mois',
    description: 'Pour découvrir l\'IA et poser les bases',
    color: 'border-[#2d3748]',
    badge: null,
    features: [
      { label: 'Tableau de bord StratIA', included: true },
      { label: 'Historique & certificats (jusqu\'à 10)', included: true },
      { label: 'Rappels conformité (3 max)', included: true },
      { label: 'Diagnostic stratégique IA', included: true },
      { label: 'Assistant IA (Groq · Llama 3.3)', included: true },
      { label: 'Bibliothèque (5 ressources gratuites)', included: true },
      { label: 'Roadmap IA personnalisée 90 jours', included: false },
      { label: 'Bibliothèque complète (9 ressources)', included: false },
      { label: 'Accès communauté', included: false },
      { label: 'Sessions Q&A mensuelles', included: false },
      { label: 'Analyse personnalisée avancée', included: false },
    ],
    cta: 'Commencer',
    ctaStyle: 'outline',
  },
  {
    name: 'Professionnel',
    price: 69,
    period: '/mois',
    description: 'Le choix des entrepreneurs qui veulent performer',
    color: 'border-blue-500/50',
    badge: 'Populaire',
    features: [
      { label: 'Tableau de bord StratIA', included: true },
      { label: 'Historique & certificats illimités', included: true },
      { label: 'Rappels conformité illimités', included: true },
      { label: 'Diagnostic stratégique IA', included: true },
      { label: 'Assistant IA (Groq · Llama 3.3)', included: true },
      { label: 'Bibliothèque complète (9 ressources)', included: true },
      { label: 'Roadmap IA personnalisée 90 jours', included: true },
      { label: 'Accès communauté', included: true },
      { label: 'Sessions Q&A mensuelles', included: false },
      { label: 'Analyse personnalisée avancée', included: false },
    ],
    cta: 'Choisir Professionnel',
    ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    name: 'Avancé',
    price: 119,
    period: '/mois',
    description: 'Accompagnement complet pour une transformation réelle',
    color: 'border-yellow-500/40',
    badge: 'Premium',
    features: [
      { label: 'Tableau de bord StratIA', included: true },
      { label: 'Historique & certificats illimités', included: true },
      { label: 'Rappels conformité illimités', included: true },
      { label: 'Diagnostic stratégique IA', included: true },
      { label: 'Assistant IA (Groq · Llama 3.3)', included: true },
      { label: 'Bibliothèque complète + ressources Pro', included: true },
      { label: 'Roadmap IA personnalisée 90 jours', included: true },
      { label: 'Accès communauté', included: true },
      { label: 'Sessions Q&A mensuelles (1h)', included: true },
      { label: 'Analyse personnalisée avancée', included: true },
    ],
    cta: 'Choisir Avancé',
    ctaStyle: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white',
  },
];

const faq = [
  {
    q: 'Puis-je changer de plan à tout moment ?',
    a: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prennent effet au prochain cycle de facturation.',
  },
  {
    q: 'Y a-t-il un engagement minimum ?',
    a: 'Aucun engagement. Vous pouvez annuler à tout moment sans frais. Nous offrons également une garantie satisfait ou remboursé de 14 jours.',
  },
  {
    q: 'Les sessions Q&A sont-elles individuelles ?',
    a: 'Pour le plan Avancé, les sessions sont semi-privées (max 4 participants) pour garantir un accompagnement de qualité.',
  },
  {
    q: 'L\'assistant IA utilise-t-il mes données ?',
    a: 'Non. Vos données restent sur notre plateforme sécurisée et ne sont jamais partagées avec des modèles IA tiers.',
  },
];

export default function Pricing() {
  return (
    <AppShell>
    <div className="p-4 md:p-8 space-y-12" style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Investissez dans votre transformation IA</h1>
        <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>Des plans adaptés à chaque étape de votre parcours. Annulable à tout moment.</p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name}
            className={`rounded-2xl flex flex-col relative overflow-hidden ${plan.name === 'Professionnel' ? 'ring-1 ring-blue-500/30' : ''}`}
            style={{ background: 'var(--bg-surface)', border: `1px solid ${plan.name === 'Essentiel' ? 'var(--border)' : plan.name === 'Professionnel' ? 'rgba(59,130,246,0.5)' : 'rgba(234,179,8,0.4)'}` }}>

            {/* Badge */}
            {plan.badge && (
              <div className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full
                ${plan.badge === 'Populaire' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/40'}`}>
                {plan.badge === 'Populaire' ? <span className="flex items-center gap-1"><Zap size={10} /> {plan.badge}</span> :
                 <span className="flex items-center gap-1"><Crown size={10} /> {plan.badge}</span>}
              </div>
            )}

            <div className="p-6 pb-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{plan.price}$</span>
                <span className="mb-1" style={{ color: 'var(--text-secondary)' }}>{plan.period}</span>
              </div>
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col">
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: f.included ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {f.included
                      ? <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      : <XCircle size={15} className="text-gray-700 flex-shrink-0 mt-0.5" />}
                    {f.label}
                  </li>
                ))}
              </ul>

              <button className={`mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${plan.ctaStyle === 'outline' ? 'btn-outline' : plan.ctaStyle}`}>
                {plan.cta} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compare CTA */}
      <div className="flex justify-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Besoin d&apos;un plan équipe ou entreprise ? <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Contactez-nous</a></p>
      </div>

      {/* Social proof */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '248+', label: 'entrepreneurs actifs' },
            { value: '4.9/5', label: 'satisfaction moyenne' },
            { value: '12h', label: 'économisées/semaine en moy.' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-2xl p-5 text-center card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-bold gradient-text">{value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-7 border border-blue-500/20">
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />)}
        </div>
        <p className="italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          &ldquo;En 6 mois avec StratIA, j&apos;ai récupéré environ 3 200$/mois de valeur en temps économisé.
          Ce n&apos;est pas une dépense, c&apos;est un investissement. Le plan Avancé se rembourse en moins de 2 semaines.&rdquo;
        </p>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">JC</div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Jean-Pierre Côté</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Dirigeante PME · Montréal</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>Questions fréquentes</h2>
        <div className="space-y-4">
          {faq.map((f, i) => (
            <div key={i} className="rounded-2xl p-5 card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{f.q}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </AppShell>
  );
}
