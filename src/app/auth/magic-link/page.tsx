'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Shield } from 'lucide-react';

/* ── Inner component: uses useSearchParams ── */
function MagicLinkVerifyInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token');
  const email        = searchParams.get('email') ?? '';

  const [phase, setPhase] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (!token) {
      setTimeout(() => setPhase('error'), 0);
      return;
    }

    const t = setTimeout(() => {
      setPhase('success');

      if (typeof window !== 'undefined') {
        const key = `btm_first_login_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          localStorage.setItem('btm_is_first_login', 'true');
        } else {
          localStorage.removeItem('btm_is_first_login');
        }
        localStorage.setItem('btm_email', email);
        localStorage.setItem('btm_logged_in', 'true');
      }

      setTimeout(() => router.push('/documents'), 900);
    }, 1500);

    return () => clearTimeout(t);
  }, [token, email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center px-6 max-w-sm w-full">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: phase === 'error'
              ? 'color-mix(in srgb,#ef4444 12%,var(--bg-elevated))'
              : 'color-mix(in srgb,#e85d2b 12%,var(--bg-elevated))',
            border: `2px solid ${phase === 'error'
              ? 'color-mix(in srgb,#ef4444 30%,transparent)'
              : 'color-mix(in srgb,#e85d2b 30%,transparent)'}`,
          }}>
          {phase === 'verifying' && (
            <div className="w-9 h-9 rounded-full border-4 border-white/20 animate-spin"
              style={{ borderTopColor: '#e85d2b' }} />
          )}
          {phase === 'success' && <CheckCircle size={36} style={{ color: '#e85d2b' }} />}
          {phase === 'error'   && <Shield size={36} style={{ color: '#ef4444' }} />}
        </div>

        {phase === 'verifying' && (
          <>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Vérification de votre lien…
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Authentification sécurisée en cours, veuillez patienter.
            </p>
            <div className="flex justify-center gap-2 mt-5">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full"
                  style={{ background: '#e85d2b', animation: `btm-bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </>
        )}

        {phase === 'success' && (
          <>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Connexion réussie !</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Redirection vers vos certificats…</p>
          </>
        )}

        {phase === 'error' && (
          <>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Lien invalide ou expiré</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Ce lien n&apos;est plus valide. Veuillez en demander un nouveau.
            </p>
            <button onClick={() => router.push('/auth/login')}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#e85d2b,#c94a1f)' }}>
              Retour à la connexion
            </button>
          </>
        )}

        <p className="mt-10 text-xs" style={{ color: 'var(--text-muted)' }}>
          Batimatech · Connexion sécurisée par lien magique
        </p>
      </div>

      <style jsx>{`
        @keyframes btm-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Page export: Suspense wrapper required by Next.js for useSearchParams ── */
export default function MagicLinkVerify() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-10 h-10 rounded-full border-4 border-white/20 animate-spin" style={{ borderTopColor: '#e85d2b' }} />
      </div>
    }>
      <MagicLinkVerifyInner />
    </Suspense>
  );
}

