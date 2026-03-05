'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import {
  Download, Award, FileText,
  Calendar, Clock, Shield, ExternalLink,
  Brain, Map, Bot, ArrowRight, Zap, Star, X, PartyPopper, Loader2, AlertCircle, Lock,
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
  const [certs,       setCerts]       = useState<Certificate[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isFirst = localStorage.getItem('btm_is_first_login') === 'true';
    if (isFirst) localStorage.removeItem('btm_is_first_login');
    return isFirst;
  });
  const [downloaded, setDownloaded] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/my/certificates')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => setCerts(Array.isArray(data) ? data : []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
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
                const fresh   = new Date(cert.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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
                      <div className="mt-3 rounded-xl p-4 flex items-center justify-between gap-3"
                        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.06))', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>✅ Certificat téléchargé !</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Transformez cette formation en plan d&apos;action concret.</p>
                        </div>
                        <Link href="/diagnostic"
                          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                          style={{ background: 'var(--primary)' }}>
                          <Brain size={14} /> Faire le diagnostic →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── BatimatIA upsell ─────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>

          {/* Header band */}
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, var(--bg-elevated)), color-mix(in srgb, var(--accent) 10%, var(--bg-elevated)))', borderBottom: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Zap size={17} className="text-white" />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Votre prochaine étape avec StratIA</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Transformez votre formation en plan d&apos;action concret — en 5 minutes</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={11} style={{ color: '#f59e0b' }} fill="#f59e0b" />)}
              <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>4.9/5</span>
            </div>
          </div>

          <div className="p-6" style={{ background: 'var(--bg-surface)' }}>
            <div className="mb-5">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Vous avez obtenu votre certification. Maintenant, voyons comment appliquer ces connaissances{' '}
                <strong style={{ color: 'var(--text-primary)' }}>concrètement dans votre entreprise</strong> — avec un plan à 90 jours personnalisé à votre réalité.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Brain,  title: 'Diagnostic IA',   desc: 'Obtenez votre score de maturité IA + 3 priorités concrètes en 5 minutes.',       color: '#3b82f6', cta: 'Faire le diagnostic →', href: '/diagnostic', highlight: true },
                { icon: Map,    title: 'Roadmap 90 jours',desc: 'Un plan mensuel actionnable adapté à votre score. Tâches, checklists, outils.',   color: '#8b5cf6', cta: 'Voir la roadmap →',    href: '/roadmap',    highlight: false },
                { icon: Bot,    title: 'Assistant guidé', desc: 'Conseils concrets sur vos défis : soumissions, temps, équipe, finances.',          color: '#06b6d4', cta: 'Consulter →',         href: '/assistant',  highlight: false },
              ].map(({ icon: Icon, title, desc, color, cta, href, highlight }) => (
                <div key={title} className="rounded-xl p-4 relative"
                  style={{ background: 'var(--bg-elevated)', border: `1px solid ${highlight ? `color-mix(in srgb, ${color} 35%, transparent)` : 'var(--border)'}` }}>
                  {highlight && (
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: color }}>
                      Commencer ici
                    </div>
                  )}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                  <Link href={href} className="text-xs font-semibold" style={{ color }}>
                    {cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl"
              style={{ background: 'color-mix(in srgb, var(--primary) 8%, var(--bg-elevated))', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Diagnostic gratuit — aucune carte nécessaire
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Exclusif aux clients StratIA · Commencez en 5 minutes
                </p>
              </div>
              <Link href="/diagnostic"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0 transition-all shadow-md"
                style={{ background: 'var(--primary)' }}>
                <Brain size={15} /> Commencer gratuitement <ArrowRight size={14} />
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
