'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import {
    Building2, Users, Wrench, AlertCircle, DollarSign,
    Calendar, Phone, FileText, ChevronRight, ChevronLeft,
    CheckCircle, Clock, Cpu, Zap, Loader2, ArrowRight,
} from 'lucide-react';

/* ─── Données des étapes ────────────────────────────────────────── */
const SECTORS = [
    '🏗️ Construction', '🍽️ Restauration', '🛍️ Commerce de détail',
    '💼 Services professionnels', '🏥 Santé / bien-être', '🏫 Éducation',
    '🏭 Industrie / manufacturier', '📦 Transport / logistique', '🖥️ Tech / agence',
];

const TEAM_SIZES = ['1-5 employés', '6-20 employés', '21-50 employés', '51-100 employés', '100+ employés'];

const BUDGETS = [
    { label: '< 5 000$', desc: 'Automatisations légères, outils IA no-code' },
    { label: '5 000$ – 15 000$', desc: 'Intégrations personnalisées, formation équipe' },
    { label: '15 000$ – 50 000$', desc: 'Transformation numérique profonde' },
    { label: '50 000$+', desc: 'Projet IA sur mesure avec IA générative' },
];

const SLOTS = [
    'Cette semaine', 'La semaine prochaine',
    'Dans 2-3 semaines', 'Dans 1 mois', 'Dans 2-3 mois',
];

/* ─── StatusBadge ───────────────────────────────────────────────── */
const STATUS_CONFIG = {
    PENDING: { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    REVIEWING: { label: 'En analyse', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    SCHEDULED: { label: 'RDV confirmé', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    IN_PROGRESS: { label: 'Visite en cours', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    DELIVERED: { label: 'Rapport livré', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    CANCELLED: { label: 'Annulé', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
} as const;

/* ─── Timeline de suivi ─────────────────────────────────────────── */
function StatusTimeline({ status }: { status: keyof typeof STATUS_CONFIG }) {
    const steps: Array<keyof typeof STATUS_CONFIG> = ['PENDING', 'REVIEWING', 'SCHEDULED', 'IN_PROGRESS', 'DELIVERED'];
    const currentIdx = steps.indexOf(status);

    return (
        <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5" style={{ background: 'var(--border)' }} />
            <div className="flex justify-between relative">
                {steps.map((step, i) => {
                    const cfg = STATUS_CONFIG[step];
                    const done = i <= currentIdx;
                    return (
                        <div key={step} className="flex flex-col items-center gap-2 z-10" style={{ width: `${100 / steps.length}%` }}>
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                style={done
                                    ? { background: cfg.color, color: 'white', boxShadow: `0 0 0 3px ${cfg.bg}` }
                                    : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '2px solid var(--border)' }}
                            >
                                {done ? <CheckCircle size={14} /> : i + 1}
                            </div>
                            <span className="text-xs text-center leading-tight" style={{ color: done ? cfg.color : 'var(--text-muted)' }}>
                                {cfg.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Composant principal ───────────────────────────────────────── */
interface FormData {
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

type Step = 1 | 2 | 3 | 4;

export default function IntegrationPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [requestId, setRequestId] = useState('');
    const [form, setForm] = useState<FormData>({
        companyName: '', sector: '', teamSize: '',
        currentTools: '', mainChallenges: '',
        budget: '', preferredSlot: '',
        contactPhone: '', notes: '',
    });

    const set = (k: keyof FormData, v: string) => setForm(prev => ({ ...prev, [k]: v }));

    function canNext() {
        if (step === 1) return form.companyName.trim() && form.sector && form.teamSize;
        if (step === 2) return form.currentTools.trim() && form.mainChallenges.trim();
        if (step === 3) return form.budget && form.preferredSlot;
        return true;
    }

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const res = await fetch('/api/integration/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.ok) {
                setRequestId(data.requestId);
                setSubmitted(true);
            }
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Succès ── */
    if (submitted) {
        return (
            <AppShell>
                <div className="max-w-2xl mx-auto px-6 py-12">
                    <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <CheckCircle size={32} style={{ color: '#10b981' }} />
                        </div>
                        <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Demande envoyée !</h1>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            Référence #{requestId.slice(0, 8).toUpperCase()} · Notre équipe vous contactera sous 48h ouvrables.
                        </p>

                        <div className="mb-8 p-5 rounded-xl text-left" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Suivi de votre demande</p>
                            <StatusTimeline status="PENDING" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
                            {[
                                { icon: Clock, title: '48h ouvrables', desc: 'Délai de réponse garanti' },
                                { icon: Phone, title: 'Appel de découverte', desc: '30 min pour comprendre vos besoins' },
                                { icon: Building2, title: 'Visite sur site', desc: 'Analyse de vos processus en personne' },
                                { icon: FileText, title: 'Rapport personnalisé', desc: 'Plan d\'action IA sur mesure' },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
                                        <Icon size={14} style={{ color: '#3b82f6' }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                            style={{ background: 'var(--primary)', color: 'white' }}
                        >
                            Retour au tableau de bord <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </AppShell>
        );
    }

    const STEPS = [
        { n: 1, label: 'Entreprise', icon: Building2 },
        { n: 2, label: 'Processus', icon: Wrench },
        { n: 3, label: 'Budget', icon: DollarSign },
        { n: 4, label: 'Résumé', icon: CheckCircle },
    ];

    return (
        <AppShell>
            <div className="max-w-2xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                            <Cpu size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Intégration IA en Entreprise</h1>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Notre équipe vient analyser vos processus et vous livrer un plan d&#39;action</p>
                        </div>
                    </div>

                    {/* Bénéfices */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                            { icon: Building2, label: 'Visite sur site', sub: 'Analyse terrain' },
                            { icon: FileText, label: 'Rapport complet', sub: 'Plan personnalisé' },
                            { icon: Zap, label: 'Implémentation', sub: 'Guidée pas à pas' },
                        ].map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                <Icon size={16} className="mx-auto mb-1" style={{ color: 'var(--primary)' }} />
                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center mb-8">
                    {STEPS.map(({ n, label, icon: Icon }, i) => {
                        const active = step === n;
                        const done = step > n;
                        return (
                            <div key={n} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                                        style={done
                                            ? { background: '#10b981', color: 'white' }
                                            : active
                                                ? { background: 'var(--primary)', color: 'white', boxShadow: '0 0 0 4px rgba(59,130,246,0.2)' }
                                                : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                                    >
                                        {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: active ? 'var(--primary)' : done ? '#10b981' : 'var(--text-muted)' }}>
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
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>

                    {/* STEP 1 — Entreprise */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Votre entreprise</h2>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Nom de l&#39;entreprise *</label>
                                <input
                                    type="text"
                                    value={form.companyName}
                                    onChange={e => set('companyName', e.target.value)}
                                    placeholder="Ex : Construction Tremblay Inc."
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Secteur d&#39;activité *</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {SECTORS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => set('sector', s)}
                                            className="px-3 py-2 rounded-xl text-xs text-left transition-all"
                                            style={form.sector === s
                                                ? { background: 'var(--primary)', color: 'white' }
                                                : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Taille de l&#39;équipe *</label>
                                <div className="flex flex-wrap gap-2">
                                    {TEAM_SIZES.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => set('teamSize', s)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all"
                                            style={form.teamSize === s
                                                ? { background: 'var(--primary)', color: 'white' }
                                                : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                                        >
                                            <Users size={12} /> {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Téléphone de contact (optionnel)</label>
                                <input
                                    type="tel"
                                    value={form.contactPhone}
                                    onChange={e => set('contactPhone', e.target.value)}
                                    placeholder="+1 (514) 000-0000"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — Processus */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Vos processus actuels</h2>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                    Outils et logiciels actuellement utilisés *
                                </label>
                                <textarea
                                    value={form.currentTools}
                                    onChange={e => set('currentTools', e.target.value)}
                                    rows={3}
                                    placeholder="Ex : Excel, QuickBooks, Outlook, Procore, papier pour les bons de travail..."
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                    <AlertCircle size={13} className="inline mr-1" style={{ color: '#f59e0b' }} />
                                    Principaux défis et pertes de temps *
                                </label>
                                <textarea
                                    value={form.mainChallenges}
                                    onChange={e => set('mainChallenges', e.target.value)}
                                    rows={4}
                                    placeholder="Ex : Soumissions qui prennent 5h chacune, suivi de chantier sur papier, communications non centralisées entre contremaitres et bureau..."
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Notes supplémentaires (optionnel)</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => set('notes', e.target.value)}
                                    rows={2}
                                    placeholder="Ex : Nous avons déjà tenté d'implémenter X, résistance de l'équipe..."
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — Budget & Créneau */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Budget & disponibilités</h2>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Fourchette de budget *</label>
                                <div className="space-y-2">
                                    {BUDGETS.map(({ label, desc }) => (
                                        <button
                                            key={label}
                                            onClick={() => set('budget', label)}
                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all"
                                            style={form.budget === label
                                                ? { background: 'var(--primary)', color: 'white', border: '2px solid var(--primary)' }
                                                : { background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                                        >
                                            <DollarSign size={16} className="flex-shrink-0" style={{ color: form.budget === label ? 'white' : 'var(--text-muted)' }} />
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
                                    <Calendar size={13} className="inline mr-1" style={{ color: 'var(--primary)' }} />
                                    Créneau préféré pour le premier contact *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SLOTS.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => set('preferredSlot', slot)}
                                            className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                                            style={form.preferredSlot === slot
                                                ? { background: 'var(--primary)', color: 'white' }
                                                : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                                        >
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
                                    { label: 'Entreprise', value: form.companyName },
                                    { label: 'Secteur', value: form.sector },
                                    { label: 'Équipe', value: form.teamSize },
                                    { label: 'Outils', value: form.currentTools },
                                    { label: 'Défis', value: form.mainChallenges },
                                    { label: 'Budget', value: form.budget },
                                    { label: 'Créneau', value: form.preferredSlot },
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
                                    ✔ Notre équipe analysera votre dossier et vous contactera sous 48h ouvrables pour planifier un appel de découverte gratuit.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-5">
                    <button
                        onClick={() => setStep(s => (s > 1 ? (s - 1) as Step : s))}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                        <ChevronLeft size={16} /> Précédent
                    </button>

                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Étape {step} / 4</span>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(s => (s < 4 ? (s + 1) as Step : s))}
                            disabled={!canNext()}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
                            style={{ background: 'var(--primary)' }}
                        >
                            Suivant <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                            style={{ background: '#10b981' }}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            {submitting ? 'Envoi...' : 'Soumettre la demande'}
                        </button>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
