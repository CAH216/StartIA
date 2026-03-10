'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import {
    Video, Mic, Check, ArrowRight, Zap, Star, Users, Globe,
    Mail, User, Loader2, CheckCircle,
} from 'lucide-react';

const PERKS = [
    { icon: Users, title: '200+ apprenants actifs', desc: 'Accès immédiat à notre base d\'étudiants engagés' },
    { icon: Zap, title: '70% de vos revenus', desc: 'Vous recevez 70% de chaque vente à votre prix normal' },
    { icon: Globe, title: 'Visibilité maximale', desc: 'Newsletter hebdomadaire et mise en avant dans le catalogue' },
    { icon: Star, title: 'Support de production', desc: 'Notre équipe vous aide à structurer votre contenu' },
];

const STEPS = [
    { n: '1', title: 'Postulez', desc: 'Remplissez le formulaire avec votre expertise et un exemple de vidéo.' },
    { n: '2', title: 'Entretien', desc: 'Notre équipe vous contacte sous 48h pour valider votre profil.' },
    { n: '3', title: 'Publication', desc: 'Uploadez vos formations. Nous vérifions avant publication (48–72h).' },
    { n: '4', title: 'Revenus mensuels', desc: 'Virements le 5 de chaque mois. Tableau de bord complet.' },
];

export default function DevenirFormateurPage() {
    const [form, setForm] = useState({ name: '', email: '', expertise: '', bio: '', videoUrl: '', company: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    async function handleSubmit(e: FormEvent) {
        e.preventDefault(); setError('');
        if (!form.name || !form.email || !form.expertise) { setError('Veuillez remplir tous les champs obligatoires.'); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 1200)); // Replace with real API call
        setLoading(false);
        setSuccess(true);
    }

    const inp: React.CSSProperties = {
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        color: 'var(--text-primary)', borderRadius: '0.75rem',
        padding: '0.625rem 1rem', fontSize: '0.875rem', width: '100%', outline: 'none',
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

            {/* Nav minimal */}
            <nav className="fixed top-0 w-full z-20 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                        <Zap size={16} className="text-white" />
                    </div>
                    <span className="font-black" style={{ color: 'var(--text-primary)' }}>StratIA</span>
                </Link>
                <Link href="/auth/login" className="text-sm font-semibold hover:underline" style={{ color: 'var(--text-secondary)' }}>
                    Déjà formateur ? Se connecter →
                </Link>
            </nav>

            <div className="pt-24 pb-20 px-5">
                {/* Hero */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
                        style={{ background: 'color-mix(in srgb,#8b5cf6 10%,transparent)', border: '1px solid color-mix(in srgb,#8b5cf6 22%,transparent)', color: '#8b5cf6' }}>
                        <Video size={12} /> Rejoignez le réseau de formateurs StratIA
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
                        Partagez votre expertise.<br />
                        <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Générez des revenus.
                        </span>
                    </h1>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Créez des formations vidéo ou animez des sessions live. Vous touchez 70% de chaque vente — StratIA gère le reste.
                    </p>
                </div>

                {/* Perks grid */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                    {PERKS.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb,#8b5cf6 12%,transparent)' }}>
                                <Icon size={18} style={{ color: '#8b5cf6' }} />
                            </div>
                            <div>
                                <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Steps */}
                <div className="max-w-4xl mx-auto mb-16">
                    <h2 className="text-xl font-black text-center mb-8" style={{ color: 'var(--text-primary)' }}>Comment ça marche ?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {STEPS.map(({ n, title, desc }) => (
                            <div key={n} className="rounded-2xl p-5 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                <div className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center font-black text-white text-sm"
                                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>{n}</div>
                                <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-lg mx-auto">
                    <div className="rounded-3xl p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Postuler comme formateur</h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Notre équipe vous répond sous 48h.</p>

                        {success ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10b981' }} />
                                <p className="font-black text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Candidature envoyée !</p>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notre équipe vous contactera à <strong>{form.email}</strong> sous 48h.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>{error}</div>}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom complet *</label>
                                        <div className="relative"><User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                            <input type="text" value={form.name} onChange={set('name')} required placeholder="Sophie Tremblay" style={{ ...inp, paddingLeft: '2.25rem' }} /></div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Courriel *</label>
                                        <div className="relative"><Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                            <input type="email" value={form.email} onChange={set('email')} required placeholder="vous@exemple.com" style={{ ...inp, paddingLeft: '2.25rem' }} /></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Domaine d&apos;expertise *</label>
                                    <select value={form.expertise} onChange={set('expertise')} required style={inp}>
                                        <option value="">Choisir un domaine...</option>
                                        {['IA & Machine Learning', 'Automatisation & RPA', 'Prompt Engineering', 'ChatGPT & LLMs', 'Agents IA', 'IA pour la Finance', 'IA pour les RH', 'IA pour le Marketing', 'Autre'].map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Entreprise / Organisation</label>
                                    <input type="text" value={form.company} onChange={set('company')} placeholder="ex: Consultant indépendant" style={inp} />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                        <Mic size={11} className="inline mr-1" />Lien vidéo exemple (YouTube / Vimeo / Drive)
                                    </label>
                                    <input type="url" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://youtube.com/..." style={inp} />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Présentez-vous brièvement</label>
                                    <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Votre expérience, vos formations passées, ce que vous souhaitez enseigner..."
                                        style={{ ...inp, resize: 'vertical' as const }} />
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', boxShadow: '0 6px 20px rgba(139,92,246,0.35)' }}>
                                    {loading ? <><Loader2 size={15} className="animate-spin" />Envoi en cours...</> : <>Envoyer ma candidature <ArrowRight size={14} /></>}
                                </button>

                                <div className="flex items-center gap-2 justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <Check size={12} style={{ color: '#10b981' }} /> Réponse garantie sous 48h
                                </div>
                            </form>
                        )}
                    </div>

                    {/* FAQ rapide */}
                    <div className="mt-8 space-y-3">
                        {[
                            ['Puis-je être formateur et apprenant à la fois ?', 'Oui, votre compte formateur vous donne aussi accès aux formations de la plateforme.'],
                            ['Comment sont calculés mes revenus ?', 'Vous recevez 70% du prix que vous définissez pour chaque formation. Les remises abonnés Pro sont absorbées par StratIA.'],
                            ['Quels types de contenu puis-je créer ?', 'Des formations vidéo pré-enregistrées et des sessions live. Les formats courts (15–30 min) et longs (1–3h) sont tous acceptés.'],
                        ].map(([q, a]) => (
                            <div key={q} className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{q}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
