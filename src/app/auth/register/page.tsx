'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Building2, ArrowRight, Zap, CheckCircle, Loader2 } from 'lucide-react';

const BENEFITS = [
  'Accès à toutes les formations IA',
  '1 formation offerte dès le premier mois (Pro)',
  'Parcours personnalisé généré par l\'IA',
  'Sessions expert à tarif préférentiel',
  'Newsletter IA hebdomadaire incluse',
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
    const { firstName, lastName, email, password, confirm, company } = form;
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
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'inscription');
      router.push(data.redirect || '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)',
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left — branding ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,#1e1b4b 0%,#312e81 50%,#1e3a8a 100%)' }}>

        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#818cf8,transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#06b6d4,transparent)', transform: 'translate(-30%,30%)' }} />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <p className="font-black text-white text-xl">StratIA</p>
            <p className="text-indigo-300 text-xs">Formations IA · Intégration Entreprise</p>
          </div>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-black text-white leading-snug mb-3">
            Commencez<br />
            <span style={{ color: 'transparent', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundImage: 'linear-gradient(135deg,#818cf8,#06b6d4)' }}>
              gratuitement
            </span>
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-8">
            Rejoignez 200+ professionnels qui utilisent StratIA pour accélérer leur maîtrise de l&apos;IA. Résultats dès la première semaine.
          </p>
          <ul className="space-y-2.5">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle size={15} className="flex-shrink-0 text-indigo-300" />
                <span className="text-sm text-indigo-100">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-indigo-300">
          <div className="flex -space-x-1.5">
            {['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-indigo-900 flex items-center justify-center text-white font-bold text-[9px]" style={{ background: c }}>
                {['M', 'J', 'S', 'A'][i]}
              </div>
            ))}
          </div>
          200+ membres actifs ce mois
        </div>
      </div>

      {/* ── Right — form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>StratIA</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Créer un compte</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: '#6366f1' }}>
                Se connecter
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Google uniquement */}
            <div>
              <a href="/api/auth/google"
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50 dark:hover:bg-white/5"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuer avec Google
              </a>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ou avec votre courriel</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Prénom *</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="text" value={form.firstName} onChange={set('firstName')} required
                    placeholder="Jean" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none"
                    style={inp}
                    onFocus={e => (e.target.style.borderColor = '#6366f1')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom *</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} required
                  placeholder="Tremblay" className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Entreprise <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span></label>
              <div className="relative">
                <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={form.company} onChange={set('company')}
                  placeholder="Solo ou nom de votre entreprise" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Adresse courriel *</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={form.email} onChange={set('email')} required
                  placeholder="vous@exemple.com" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Mot de passe * <span style={{ color: 'var(--text-muted)' }}>(min. 8 caractères)</span>
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={8}
                  placeholder="••••••••" className="w-full pl-9 pr-11 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirmer le mot de passe *</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPwd ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} required
                  placeholder="••••••••" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={inp}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Création...</> : <>Créer mon compte <ArrowRight size={14} /></>}
            </button>
          </form>

          <p className="mt-5 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            En créant un compte, vous acceptez nos{' '}
            <Link href="#" className="underline">conditions d&apos;utilisation</Link>{' '}
            et notre{' '}
            <Link href="#" className="underline">politique de confidentialité</Link>.
          </p>

          <p className="mt-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Vous voulez enseigner sur StratIA ?{' '}
            <Link href="/devenir-formateur" className="font-semibold hover:underline" style={{ color: '#8b5cf6' }}>
              Devenir formateur →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
