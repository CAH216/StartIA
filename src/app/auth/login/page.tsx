'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Zap } from 'lucide-react';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') || '';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Connexion echouee'); return; }
      // Persist role synchronously so Sidebar can read it on first render
      if (data.user?.role) localStorage.setItem('stratia_role', data.user.role);
      router.push(from || data.redirect);
    } catch {
      setError('Erreur reseau. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <Zap size={20} style={{ color: '#e85d2b' }} />
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>StratIA</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Connexion</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Acces a votre espace de travail</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Adresse courriel</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input id="password" type={showPwd ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none border focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
              style={{ background: '#e85d2b', color: '#fff' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Connexion en cours...</> : 'Se connecter'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
          Pas encore de compte?{' '}
          <a href="/auth/register" style={{ color: '#e85d2b' }} className="font-medium hover:underline">Creer un compte</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}><Loader2 size={24} className="animate-spin" style={{ color: '#e85d2b' }} /></div>}>
      <LoginForm />
    </Suspense>
  );
}
