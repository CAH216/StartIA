'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, CheckCircle, FileText, Award, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    // Simulate login — replace with real auth later
    setTimeout(() => {
      setLoading(false);
      router.push('/documents');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left panel — Batimatech branding ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #e85d2b 0%, #c94a1f 40%, #a33b15 100%)' }}>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.3)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', transform: 'translate(-30%, 30%)' }} />
        </div>

        <div className="relative">
          {/* Batimatech Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="22" width="32" height="6" rx="2" fill="white"/>
                <rect x="10" y="10" width="20" height="10" rx="2" fill="white" opacity="0.8"/>
                <rect x="16" y="4" width="8" height="6" rx="1" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight">Batimatech</p>
              <p className="text-orange-200 text-xs font-medium">Innovation · Construction · Numérique</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h1 className="text-3xl font-black text-white leading-tight mb-3">
              Vos certificats<br />de formation <span className="text-orange-200">sont prêts</span>
            </h1>
            <p className="text-orange-100 text-base leading-relaxed">
              Connectez-vous pour accéder à vos attestations RBQ et documents de formation.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Award,     text: 'Attestations reconnues RBQ, CMMTQ et CMEQ' },
              { icon: FileText,  text: 'Téléchargez vos certificats en format PDF' },
              { icon: Shield,    text: 'Documents sécurisés et disponibles en tout temps' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <p className="text-orange-100 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <div className="relative">
          <p className="text-orange-200 text-xs">© 2026 Batimatech · 405 avenue Ogilvy, Montréal QC</p>
        </div>
      </div>

      {/* ── Right panel — Login form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#e85d2b' }}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="22" width="32" height="6" rx="2" fill="white"/>
                <rect x="10" y="10" width="20" height="10" rx="2" fill="white" opacity="0.8"/>
                <rect x="16" y="4" width="8" height="6" rx="1" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <span className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>Batimatech</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
              Accédez à vos documents
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Connectez-vous avec les identifiants fournis par Batimatech
            </p>
          </div>

          {/* Formation email reminder */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl mb-6"
            style={{ background: 'color-mix(in srgb, #f59e0b 12%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, #f59e0b 35%, transparent)' }}>
            <span className="text-lg leading-none mt-0.5">📧</span>
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: '#d97706' }}>Adresse courriel requise</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Utilisez l&apos;adresse courriel avec laquelle vous vous êtes inscrit(e)
                à votre <strong>formation Batimatech</strong>. Elle diffère peut-être de votre courriel habituel.
              </p>
            </div>
          </div>

          {/* Certificate notification */}
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
            style={{ background: 'color-mix(in srgb, #e85d2b 10%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, #e85d2b 30%, transparent)' }}>
            <CheckCircle size={18} style={{ color: '#e85d2b', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Votre certificat est prêt !
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Connectez-vous pour le télécharger
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Adresse courriel
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#e85d2b'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#e85d2b'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{ background: loading ? '#c94a1f' : '#e85d2b', opacity: loading ? 0.8 : 1 }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Connexion en cours...</>
              ) : (
                <> Accéder à mes documents <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a href="mailto:info@batimatech.com" className="hover:underline block">
              Problème de connexion ? Contactez Batimatech
            </a>
            <p>
              Pas encore inscrit(e) à BatimatIA ?{' '}
              <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Powered by BatimatIA */}
          <div className="mt-10 pt-6 flex items-center justify-center gap-2 text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <span>Portail propulsé par</span>
            <Link href="/" className="font-semibold" style={{ color: 'var(--primary)' }}>BatimatIA</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
