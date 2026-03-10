'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import {
    Video, GraduationCap, CalendarClock, Users,
    Plus, DollarSign, ArrowRight, BarChart3, Zap,
} from 'lucide-react';

interface FormateurUser { fullName: string | null; email: string; }

export default function FormateurPage() {
    const [user, setUser] = useState<FormateurUser | null>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.ok ? r.json() : null)
            .then(setUser)
            .catch(() => null);
    }, []);

    const firstName = user?.fullName?.split(' ')[0] || 'Formateur';

    const stats = [
        { label: 'Formations publiees', value: '0', icon: Video, color: '#6366f1' },
        { label: 'Apprenants inscrits', value: '0', icon: Users, color: '#8b5cf6' },
        { label: 'Sessions live', value: '0', icon: CalendarClock, color: '#06b6d4' },
        { label: 'Revenus ce mois', value: '0 $', icon: DollarSign, color: '#10b981' },
    ];

    const actions = [
        { href: '#', label: 'Publier une formation', icon: Plus, color: '#6366f1', desc: 'Uploader une video ou creer un cours live' },
        { href: '#', label: 'Planifier une session', icon: CalendarClock, color: '#06b6d4', desc: 'Session live avec inscription des apprenants' },
        { href: '#', label: 'Mes statistiques', icon: BarChart3, color: '#8b5cf6', desc: 'Performance et taux de completion' },
        { href: '#', label: 'Mes revenus', icon: DollarSign, color: '#10b981', desc: 'Paiements et commissions mensuels' },
    ];

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                            style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.18)' }}>
                            <Zap size={11} /> Espace Formateur
                        </div>
                        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                            Bonjour, {firstName} !
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Gerez vos formations, sessions live et suivez vos revenus.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
                        <Plus size={15} /> Nouvelle formation
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="p-4 rounded-2xl"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                                style={{ background: `${color}15` }}>
                                <Icon size={18} style={{ color }} />
                            </div>
                            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Actions rapides */}
                <div>
                    <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Actions rapides</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {actions.map(({ href, label, icon: Icon, color, desc }) => (
                            <Link key={label} href={href}
                                className="group flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${color}15` }}>
                                    <Icon size={18} style={{ color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                                </div>
                                <ArrowRight size={14} className="flex-shrink-0 opacity-40 group-hover:opacity-80 transition-opacity"
                                    style={{ color: 'var(--text-muted)' }} />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mes formations — empty state */}
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <h2 className="text-base font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Mes formations</h2>
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <Video size={24} style={{ color: '#6366f1' }} />
                        </div>
                        <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Aucune formation publiee</p>
                        <p className="text-xs mb-5 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                            Publiez votre premiere formation video ou planifiez une session live.
                        </p>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            <Plus size={14} /> Publier ma premiere formation
                        </button>
                    </div>
                </div>

                {/* Modele de remuneration */}
                <div className="rounded-2xl p-5"
                    style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.04))', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.12)' }}>
                            <DollarSign size={16} style={{ color: '#6366f1' }} />
                        </div>
                        <div>
                            <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                Modele de remuneration StratIA
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                Vous recevez <strong style={{ color: '#6366f1' }}>70% des revenus</strong> pour chaque formation vendue.
                                Les sessions live sont facturees separement avec <strong style={{ color: '#6366f1' }}>80% pour vous</strong>.
                                Paiements mensuels via virement bancaire.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </AppShell>
    );
}
