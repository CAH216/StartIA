'use client';

import { useState } from 'react';
import { Building2, Users, Wrench, DollarSign, Calendar, CheckCircle, Loader2, ArrowRight, ArrowLeft, Zap, Mail } from 'lucide-react';

const SECTORS = [
  '🏗️ Construction', '🍽️ Restauration', '🛍️ Commerce de détail',
  '💼 Services professionnels', '🏥 Santé / bien-être', '🏫 Éducation',
  '🏭 Industrie / manufacturier', '📦 Transport / logistique', '🖥️ Tech / agence',
];
const TEAM_SIZES = ['1-5 employés', '6-20 employés', '21-50 employés', '51-100 employés', '100+ employés'];
const BUDGETS = [
  { label: '< 5 000$',          desc: 'Automatisations légères, outils no-code' },
  { label: '5 000$ – 15 000$',  desc: 'Intégrations personnalisées, formation équipe' },
  { label: '15 000$ – 50 000$', desc: 'Transformation numérique profonde' },
  { label: '50 000$+',           desc: 'Projet sur mesure avec intelligence artificielle générative' },
];
const SLOTS = ['Cette semaine', 'La semaine prochaine', 'Dans 2-3 semaines', 'Dans 1 mois', 'Dans 2-3 mois'];

interface FormData {
  contactEmail: string;
  companyName: string;
  sector: string;
  teamSize: string;
  currentTools: string;
  mainChallenges: string;
  budget: string;
  preferredSlot: string;
  contactPhone: string;
  notes: string;
}

export default function DemanderIntegrationPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [form, setForm] = useState<FormData>({
    contactEmail: '', companyName: '', sector: '', teamSize: '',
    currentTools: '', mainChallenges: '', budget: '', preferredSlot: '',
    contactPhone: '', notes: '',
  });

  const set = (k: keyof FormData, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  function canNext() {
    if (step === 1) return form.contactEmail.trim() && form.companyName.trim() && form.sector && form.teamSize;
    if (step === 2) return form.currentTools.trim() && form.mainChallenges.trim();
    if (step === 3) return form.budget && form.preferredSlot;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/demander-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) { setRequestId(data.requestId); setSubmitted(true); }
    } finally { setSubmitting(false); }
  }

  const STEPS = [
    { n: 1, label: 'Contact',   icon: Mail },
    { n: 2, label: 'Processus', icon: Wrench },
    { n: 3, label: 'Budget',    icon: DollarSign },
    { n: 4, label: 'Résumé',    icon: CheckCircle },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-lg w-full rounded-2xl p-8 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle size={32} style={{ color: '#10b981' }} />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Demande envoyée !</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Référence #{requestId.slice(0, 8).toUpperCase()} · Notre équipe vous contactera sous 48h ouvrables
            à l&apos;adresse <strong style={{ color: 'var(--text-primary)' }}>{form.contactEmail}</strong>.
          </p>
          <div className="space-y-2 text-left mb-6">
            {[
              { label: '48h', desc: 'Délai de réponse garanti' },
              { label: '📞', desc: 'Appel de découverte gratuit (30 min)' },
              { label: '🏢', desc: 'Visite sur site pour analyse de vos processus' },
              { label: '📋', desc: 'Plan d\'intégration personnalisé livré' },
            ].map(({ label, desc }) => (
              <div key={desc} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <span className="font-black text-sm w-8 text-center flex-shrink-0" style={{ color: '#10b981' }}>{label}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</span>
              </div>
            ))}
          </div>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
            Retour à l&apos;accueil <ArrowRight size={15} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-12" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#0891b2)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            Intégration en entreprise
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Notre équipe vient analyser vos processus et vous livrer un plan d&apos;action concret.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map(({ n, label, icon: Icon }, i) => {
            const active = step === n, done = step > n;
            return (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={done ? { background: '#10b981', color: 'white' }
                      : active ? { background: 'linear-gradient(135deg,#059669,#0891b2)', color: 'white', boxShadow: '0 0 0 4px rgba(5,150,105,0.2)' }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block"
                    style={{ color: active ? '#059669' : done ? '#10b981' : 'var(--text-muted)' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-4" style={{ background: step > n ? '#10b981' : 'var(--border)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 mb-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

          {/* STEP 1 — Contact & Entreprise */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Votre entreprise</h2>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Email de contact *
                </label>
                <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                  placeholder="votre@email.com" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Nom de l&apos;entreprise *
                </label>
                <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
                  placeholder="Ex : Construction Tremblay Inc." className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Secteur *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTORS.map(s => (
                    <button key={s} onClick={() => set('sector', s)} className="px-3 py-2 rounded-xl text-xs text-left transition-all"
                      style={form.sector === s
                        ? { background: 'linear-gradient(135deg,#059669,#0891b2)', color: 'white' }
                        : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Taille de l&apos;équipe *</label>
                <div className="flex flex-wrap gap-2">
                  {TEAM_SIZES.map(s => (
                    <button key={s} onClick={() => set('teamSize', s)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
                      style={form.teamSize === s
                        ? { background: 'linear-gradient(135deg,#059669,#0891b2)', color: 'white' }
                        : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      <Users size={12} /> {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Téléphone (optionnel)</label>
                <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)}
                  placeholder="+1 (514) 000-0000" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          )}

          {/* STEP 2 — Processus */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Vos processus actuels</h2>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Outils utilisés *</label>
                <textarea value={form.currentTools} onChange={e => set('currentTools', e.target.value)} rows={3}
                  placeholder="Ex : Excel, QuickBooks, Outlook, papier pour les bons de travail..." className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Principaux défis *</label>
                <textarea value={form.mainChallenges} onChange={e => set('mainChallenges', e.target.value)} rows={4}
                  placeholder="Ex : Soumissions qui prennent 5h chacune, suivi de chantier sur papier..." className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Notes additionnelles (optionnel)</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                  placeholder="Toute info supplémentaire utile..." className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          )}

          {/* STEP 3 — Budget */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Budget & disponibilités</h2>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Fourchette de budget *</label>
                <div className="space-y-2">
                  {BUDGETS.map(({ label, desc }) => (
                    <button key={label} onClick={() => set('budget', label)}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all"
                      style={form.budget === label
                        ? { background: 'linear-gradient(135deg,#059669,#0891b2)', color: 'white' }
                        : { background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <DollarSign size={16} style={{ color: form.budget === label ? 'white' : 'var(--text-muted)', flexShrink: 0 }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: form.budget === label ? 'white' : 'var(--text-primary)' }}>{label}</p>
                        <p className="text-xs" style={{ color: form.budget === label ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Calendar size={13} className="inline mr-1" style={{ color: '#059669' }} />
                  Créneau préféré *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SLOTS.map(slot => (
                    <button key={slot} onClick={() => set('preferredSlot', slot)}
                      className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={form.preferredSlot === slot
                        ? { background: 'linear-gradient(135deg,#059669,#0891b2)', color: 'white' }
                        : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Résumé */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Résumé de votre demande</h2>
              <div className="space-y-2">
                {[
                  { label: 'Email',     value: form.contactEmail },
                  { label: 'Entreprise',value: form.companyName },
                  { label: 'Secteur',   value: form.sector },
                  { label: 'Équipe',    value: form.teamSize },
                  { label: 'Outils',    value: form.currentTools },
                  { label: 'Défis',     value: form.mainChallenges },
                  { label: 'Budget',    value: form.budget },
                  { label: 'Créneau',   value: form.preferredSlot },
                  ...(form.contactPhone ? [{ label: 'Téléphone', value: form.contactPhone }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-xs font-semibold w-20 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-xs" style={{ color: '#10b981' }}>
                  ✔ Notre équipe analysera votre dossier et vous contactera sous 48h ouvrables pour planifier un appel gratuit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(s => (s > 1 ? (s - 1) as 1 : s))} disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={16} /> Précédent
          </button>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Étape {step} / 4</span>
          {step < 4 ? (
            <button onClick={() => setStep(s => (s < 4 ? (s + 1) as 4 : s))} disabled={!canNext()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
              Suivant <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: '#10b981' }}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {submitting ? 'Envoi...' : 'Soumettre'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
