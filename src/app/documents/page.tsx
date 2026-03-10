'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import OnboardingModal from '@/components/OnboardingModal';
import Link from 'next/link';
import {
  Download, Award, FileText,
  Calendar, Clock, Shield, ExternalLink,
  Sparkles, ArrowRight, Star, X, PartyPopper, Loader2, AlertCircle, Lock,
} from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  credentialUrl: string | null;
  fileUrl: string | null;
  notes: string | null;
  createdAt: string;
}

export default function DocumentsPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isFirst = localStorage.getItem('btm_is_first_login') === 'true';
    if (isFirst) localStorage.removeItem('btm_is_first_login');
    return isFirst;
  });
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    fetch('/api/my/certificates')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => setCerts(Array.isArray(data) ? data : []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));

    // Client A onboarding detection
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.isNewUser) setIsNewUser(true);
      if (data?.fullName) setFirstName(data.fullName.split(' ')[0]);
    }).catch(() => null);
  }, []);

  return (
    <AppShell>
      {/* Onboarding plein-écran (déclenché via ?welcome=cert) */}
      <OnboardingModal />
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ── First-login welcome banner ────────────────────────────────── */}
        {showWelcome && (
          <div className="relative rounded-2xl p-5 pr-12 flex items-start gap-4"
            style={{ background: 'linear-gradient(135deg,#e85d2b,#c94a1f)', boxShadow: '0 6px 24px rgba(232,93,43,0.35)' }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <PartyPopper size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Bienvenue ! Vos certificats sont prêts 🎉</p>
              <p className="text-white/80 text-sm mt-0.5">
                Vos attestations sont disponibles ci-dessous. Téléchargez-les pour vos dossiers.
              </p>
            </div>
            <button onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        )}

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl p-6 flex items-start gap-6"
          style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #e85d2b 12%, var(--bg-elevated)), color-mix(in srgb, #c94a1f 8%, var(--bg-elevated)))', border: '1px solid color-mix(in srgb, #e85d2b 25%, transparent)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #e85d2b, #c94a1f)', boxShadow: '0 4px 16px rgba(232,93,43,0.35)' }}>
            <Award size={26} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#e85d2b' }}>StratIA</p>
            <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Mes certificats</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Attestations remises par votre expert StratIA.
            </p>
          </div>
        </div>

        {/* ── Certificates list ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {loading ? 'Chargement...' : `Mes attestations (${certs.length})`}
            </h2>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Shield size={12} />
              Géré par votre expert StratIA
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-2" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={20} className="animate-spin" />Chargement de vos certificats...
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle size={16} />{error}
            </div>
          )}

          {!loading && !error && certs.length === 0 && (
            <div className="text-center py-16 rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <Award size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Aucun certificat pour le moment</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Votre expert vous enverra vos attestations ici une fois disponibles.
              </p>
            </div>
          )}

          {!loading && !error && certs.length > 0 && (
            <div className="space-y-3">
              {certs.map((cert) => {
                const expired = !cert.expiryDate ? false : new Date(cert.expiryDate) < new Date();
                const fresh = new Date(cert.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const statusStyle = expired
                  ? { bg: 'color-mix(in srgb, #ef4444 12%, transparent)', text: '#f87171', border: 'color-mix(in srgb, #ef4444 30%, transparent)', label: 'Expiré' }
                  : { bg: 'color-mix(in srgb, #059669 12%, transparent)', text: '#059669', border: 'color-mix(in srgb, #059669 30%, transparent)', label: 'Disponible' };
                return (
                  <div key={cert.id} className="rounded-2xl p-5 transition-all"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, #e85d2b 12%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, #e85d2b 25%, transparent)' }}>
                        <Award size={20} style={{ color: '#e85d2b' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {fresh && <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: '#e85d2b' }}>Nouveau</span>}
                            </div>
                            <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{cert.name}</h3>
                            {cert.issuer && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{cert.issuer}</p>}
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                            style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}>
                            {statusStyle.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-5 mt-3 flex-wrap">
                          {cert.issueDate && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <Calendar size={12} /> {new Date(cert.issueDate).toLocaleDateString('fr-CA')}
                            </div>
                          )}
                          {cert.expiryDate && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: expired ? '#f87171' : 'var(--text-secondary)' }}>
                              <Clock size={12} /> Expire le {new Date(cert.expiryDate).toLocaleDateString('fr-CA')}
                            </div>
                          )}
                          {cert.notes && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <FileText size={12} /> {cert.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      {cert.fileUrl ? (
                        <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer"
                          onClick={() => setDownloaded(p => p.includes(cert.id) ? p : [...p, cert.id])}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                          style={{ background: '#e85d2b' }}>
                          <Download size={14} /> Télécharger (PDF)
                        </a>
                      ) : (
                        <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          <Lock size={14} /> Fichier non disponible
                        </button>
                      )}
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          <ExternalLink size={14} /> Vérifier en ligne
                        </a>
                      )}
                    </div>

                    {downloaded.includes(cert.id) && (
                      <div className="mt-3 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.06))', border: '1px solid rgba(139,92,246,0.25)' }}>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>✅ Certificat téléchargé !</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Vous voulez aller plus loin ? Découvrez les formations faites pour vous.</p>
                        </div>
                        <Link href="/parcours?from=cert"
                          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                          <Sparkles size={14} /> Trouver mes formations →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Parcours IA upsell ─────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(139,92,246,0.25)', boxShadow: 'var(--shadow-md)' }}>

          {/* Header band */}
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Votre prochaine étape avec StratIA</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Formations personnalisées selon votre profil — en 4 questions</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ color: '#f59e0b' }} fill="#f59e0b" />)}
              <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>4.9/5</span>
            </div>
          </div>

          <div className="p-6" style={{ background: 'var(--bg-surface)' }}>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Vous avez obtenu votre certification. Vous voulez{' '}
              <strong style={{ color: 'var(--text-primary)' }}>augmenter votre productivité, gagner plus de temps et plus d&apos;argent</strong>{' '}
              et vous ne savez pas quelles formations il vous faut ?<br /><br />
              Notre IA analyse votre profil en 4 questions et vous propose{' '}
              <strong style={{ color: 'var(--text-primary)' }}>un parcours de formations sur mesure</strong> — chaque étape correspond à une formation concrète.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { emoji: '⚡', title: '4 questions', desc: 'Moins de 2 minutes' },
                { emoji: '🤖', title: 'IA personnalisée', desc: 'Formations adaptées à vous' },
                { emoji: '🎓', title: 'Roadmap claire', desc: 'Chaque étape = 1 cours' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl mb-1">{emoji}</div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Commencer gratuitement — aucune carte nécessaire
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Exclusif aux clients StratIA · Parcours généré en secondes
                </p>
              </div>
              <Link href="/parcours?from=cert"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0 transition-all shadow-md"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                <Sparkles size={15} /> Trouver mes formations <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Need help footer ─────────────────────────────────────────────── */}
        <div className="text-center pb-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Un problème avec vos documents ?{' '}
            <a href="mailto:info@batimatech.com" className="font-medium hover:underline" style={{ color: '#e85d2b' }}>
              Contactez votre expert StratIA
            </a>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
