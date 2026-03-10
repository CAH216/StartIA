'use client';

import { useState, FormEvent } from 'react';
import { Newspaper, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function NewsletterBanner() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'Vous êtes inscrit(e) ! Bienvenue dans la veille IA StratIA.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Une erreur est survenue.');
            }
        } catch {
            setStatus('error');
            setMessage('Erreur réseau, veuillez réessayer.');
        }
    }

    return (
        <section className="py-20 px-5">
            <div className="max-w-3xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
                    style={{ background: 'color-mix(in srgb,#8b5cf6 10%,transparent)', border: '1px solid color-mix(in srgb,#8b5cf6 22%,transparent)', color: '#8b5cf6' }}>
                    <Newspaper size={12} /> Gratuit · Chaque semaine
                </div>

                <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
                    La veille IA qui fait la différence
                </h2>
                <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Chaque semaine : l&apos;outil IA du moment, un cas client concret, les évolutions de ChatGPT / Claude / Gemini
                    et leur impact pour votre entreprise. <strong style={{ color: 'var(--text-primary)' }}>200+ dirigeants et managers</strong> déjà abonnés.
                </p>

                {status === 'success' ? (
                    <div className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl text-sm font-semibold"
                        style={{ background: 'color-mix(in srgb,#059669 12%,transparent)', border: '1px solid color-mix(in srgb,#059669 30%,transparent)', color: '#059669' }}>
                        <CheckCircle size={18} />
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            required
                            placeholder="votre@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={status === 'loading'}
                            className="flex-1 px-5 py-3.5 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-70"
                            style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', boxShadow: '0 6px 20px rgba(139,92,246,0.35)', whiteSpace: 'nowrap' }}>
                            {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={15} /> Je m&apos;inscris</>}
                        </button>
                    </form>
                )}

                {status === 'error' && (
                    <p className="mt-3 text-xs" style={{ color: '#f87171' }}>{message}</p>
                )}

                <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Pas de spam. Désabonnement en 1 clic. Données protégées.
                </p>

                {/* Social proof chips */}
                <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                    {['📈 Cas clients concrets', '🔧 Outils testés', '🚀 Chaque semaine', '🔒 Sans spam'].map(chip => (
                        <span key={chip} className="text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            {chip}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
