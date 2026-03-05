'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Building2, ArrowRight, Zap, CheckCircle } from 'lucide-react';

const benefits = [
  'Diagnostic IA gratuit inclus',
  'Roadmap personnalisée 90 jours',
  'Assistant IA spécialisé construction',
  'Bibliothèque de 9+ ressources',
  'Accès à la communauté d\'entrepreneurs',
];

export default function AuthRegister() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', company: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { firstName, lastName, email, password, confirm, company } = form; // Added company

    if (!firstName || !lastName || !email || !password) { setError('Veuillez remplir tous les champs obligatoires.'); return; }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, company, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Successful registration
      router.push('/diagnostic');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left: branding ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #1e40af 0%, #1d4ed8 40%, #1e3a8a 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/30" style={{ transform: 'translate(40%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/20" style={{ transform: 'translate(-30%,30%)' }} />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">BatimatIA</p>
              <p className="text-blue-200 text-xs">Plateforme IA · Construction</p>
            </div>
          </Link>

          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Commencez<br />gratuitement
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed mb-8">
            Rejoignez plus de 248 entrepreneurs qui utilisent BatimatIA pour
            transformer leur business. Résultats dès la première semaine.
          </p>

          <ul className="space-y-3 mb-8">
            {benefits.map(b => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-blue-300 flex-shrink-0" />
                <span className="text-sm text-blue-100">{b}</span>
              </li>
            ))}
          </ul>

          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-xs font-semibold text-white">Diagnostic IA offert</p>
              <p className="text-xs text-blue-200">Évaluez votre maturité IA dès l&apos;inscription</p>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#facc15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
            <span className="text-xs text-blue-200 ml-1">4.9/5 · 248 membres actifs</span>
          </div>
        </div>
      </div>

      {/* ── Right: form ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>BatimatIA</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Créer un compte</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Batimatech note */}
          <div className="flex items-start gap-3 p-3 rounded-xl mb-6 text-xs"
            style={{ background: 'color-mix(in srgb, #e85d2b 8%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, #e85d2b 25%, transparent)', color: 'var(--text-secondary)' }}>
            <span className="mt-0.5 text-orange-400">ℹ️</span>
            <span>Client Batimatech ? Utilisez le{' '}
              <Link href="/login" className="font-semibold text-orange-400 hover:text-orange-300 underline">
                portail dédié
              </Link>{' '}
              pour accéder à vos certificats de formation.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-xs px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Prénom *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="text" value={form.firstName} onChange={set('firstName')}
                    placeholder="Jean" required className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm input-base focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom *</label>
                <input type="text" value={form.lastName} onChange={set('lastName')}
                  placeholder="Tremblay" required className="w-full px-3 py-2.5 rounded-xl text-sm input-base focus:outline-none" />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Entreprise</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={form.company} onChange={set('company')}
                  placeholder="Construction XYZ inc." className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm input-base focus:outline-none" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Adresse courriel *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="vous@exemple.com" required className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm input-base focus:outline-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe * <span style={{ color: 'var(--text-muted)' }}>(min. 8 caractères)</span></label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••" required minLength={8} className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm input-base focus:outline-none" />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirmer le mot de passe *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPwd ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                  placeholder="••••••••" required className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm input-base focus:outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création du compte...
                </span>
              ) : (
                <span className="flex items-center gap-2">Créer mon compte <ArrowRight size={15} /></span>
              )}
            </button>
          </form>

          <p className="mt-6 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            En créant un compte, vous acceptez nos{' '}
            <Link href="#" className="underline hover:text-blue-400">conditions d&apos;utilisation</Link>{' '}
            et notre{' '}
            <Link href="#" className="underline hover:text-blue-400">politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
