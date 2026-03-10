'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, GraduationCap, Video, TrendingUp, Loader2 } from 'lucide-react';

const PERKS = [
  { icon: GraduationCap, text: 'Accès à toutes les formations IA' },
  { icon: Video, text: 'Sessions live avec nos formateurs' },
  { icon: TrendingUp, text: 'Parcours IA personnalisé en secondes' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identifiants incorrects.');
      const role = data.role;
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'EMPLOYER') router.push('/employer');
      else if (role === 'FORMATEUR') router.push('/formateur');
      else router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left — StratIA brandpanel ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,#1e1b4b 0%,#312e81 50%,#1e3a8a 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#818cf8,transparent)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#06b6d4,transparent)', transform: 'translate(-30%,30%)' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <p className="font-black text-white text-xl">StratIA</p>
            <p className="text-indigo-300 text-xs">Formations IA · Intégration Entreprise</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Bienvenue<br />
            <span className="text-transparent" style={{ WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundImage: 'linear-gradient(135deg,#818cf8,#06b6d4)' }}>
              sur StratIA
            </span>
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed mb-8">
            La plateforme de formations IA et d&apos;intégration intelligente pour les entreprises modernes.
          </p>
          <ul className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-indigo-300" />
                </div>
                <span className="text-sm text-indigo-100">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Social proof */}
        <div className="relative flex items-center gap-2 text-xs text-indigo-300">
          <div className="flex -space-x-1.5">
            {['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-indigo-900 flex items-center justify-center text-white font-bold text-[9px]" style={{ background: c }}>
                {['M', 'J', 'S', 'A'][i]}
              </div>
            ))}
          </div>
          200+ professionnels formés ce mois
        </div>
      </div>

      {/* ── Right — Login form ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-black text-xl" style={{ color: 'var(--text-primary)' }}>StratIA</span>
          </div>

          <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Connexion</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: '#6366f1' }}>
              S&apos;inscrire gratuitement
            </Link>
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Adresse courriel</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : <>Se connecter <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Vous êtes formateur ?{' '}
            <Link href="/devenir-formateur" className="font-semibold hover:underline" style={{ color: '#8b5cf6' }}>
              Rejoindre le réseau →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
