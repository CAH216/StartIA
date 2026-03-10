'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import AppShell from '@/components/AppShell';
import {
  Building2, Users, Award, Plus, X, Loader2, RefreshCw, Search,
  CheckCircle, ShieldAlert, CalendarClock, CheckCheck, Ban, Clock,
  Upload, FileText, UserCheck, Video,
} from 'lucide-react';

/* ─── Types ─── */
interface ClientUser {
  id: string; email: string; fullName: string | null; companyName: string | null;
  plan: string; createdAt: string;
  certificates: { id: string; name: string; issueDate: string | null }[];
  _count: { diagnostics: number; tasks: number };
}
interface CertForm { name: string; issuer: string; issueDate: string; expiryDate: string; credentialUrl: string; notes: string; }
const EMPTY_CERT: CertForm = { name: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '', notes: '' };
interface Booking {
  id: string; topic: string; description: string | null; slot: string;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED'; notes: string | null; createdAt: string;
  user: { id: string; fullName: string | null; email: string; companyName: string | null };
}

type Tab = 'overview' | 'candidatures' | 'videos' | 'sessions' | 'certificats';

const inp: React.CSSProperties = {
  background: 'var(--bg-base)', border: '1px solid var(--border)',
  color: 'var(--text-primary)', borderRadius: '0.75rem',
  padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', outline: 'none',
};

/* ─── Mock candidatures ─── */
const MOCK_CANDIDATURES = [
  { id: '1', name: 'Sophie Beaudet', email: 'sophie@gmail.com', expertise: 'IA & Machine Learning', status: 'PENDING', submitted: '2026-03-07' },
  { id: '2', name: 'Marc-Antoine Roy', email: 'marc@consulting.ca', expertise: 'Automatisation RPA', status: 'ACCEPTED', submitted: '2026-03-05' },
  { id: '3', name: 'Fatoumata Diallo', email: 'fatoumata@ia.fr', expertise: 'Prompt Engineering', status: 'PENDING', submitted: '2026-03-09' },
];

const MOCK_VIDEOS = [
  { id: '1', title: 'ChatGPT pour Dirigeants', formateur: 'Marc-Antoine Roy', status: 'PENDING', submitted: '2026-03-08' },
  { id: '2', title: 'Automatiser sa Facturation avec IA', formateur: 'Sophie Beaudet', status: 'APPROVED', submitted: '2026-03-06' },
];

const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'En attente' },
  ACCEPTED: { bg: 'rgba(5,150,105,0.12)', color: '#10b981', label: 'Accepté' },
  REFUSED: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'Refusé' },
  APPROVED: { bg: 'rgba(5,150,105,0.12)', color: '#10b981', label: 'Approuvé' },
};

export default function EmployerPage() {
  const [tab, setTab] = useState<Tab>('overview');

  // Clients / certs
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selClient, setSelClient] = useState<ClientUser | null>(null);
  const [showCert, setShowCert] = useState(false);
  const [certForm, setCertForm] = useState<CertForm>(EMPTY_CERT);
  const [saving, setSaving] = useState(false);
  const [certError, setCertError] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sessions
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLoad, setBookingLoad] = useState(false);
  const [selBooking, setSelBooking] = useState<Booking | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [acting, setActing] = useState(false);
  const [showDecide, setShowDecide] = useState(false);
  const [decideAction, setDecideAction] = useState<'ACCEPTED' | 'REFUSED'>('ACCEPTED');

  const loadClients = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/employer/clients');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setClients(Array.isArray(data) ? data : []);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const loadBookings = async () => {
    setBookingLoad(true);
    try {
      const res = await fetch('/api/employer/sessions');
      const data = await res.json();
      if (res.ok) setBookings(Array.isArray(data) ? data : []);
    } catch { }
    finally { setBookingLoad(false); }
  };

  useEffect(() => {
    if (tab === 'certificats') loadClients();
    if (tab === 'sessions' || tab === 'overview') loadBookings();
  }, [tab]);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || [c.email, c.fullName, c.companyName].some(v => v?.toLowerCase().includes(q));
  });

  async function handleAddCert(e: FormEvent) {
    e.preventDefault(); if (!selClient) return;
    setCertError(''); setSaving(true);
    try {
      let fileUrl: string | undefined;
      if (certFile) {
        const fd = new FormData(); fd.append('file', certFile);
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const ud = await up.json();
        if (!up.ok) { setCertError(ud.error || 'Erreur upload'); setSaving(false); return; }
        fileUrl = ud.url;
      }
      const res = await fetch(`/api/employer/clients/${selClient.id}/certificates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: certForm.name, issuer: certForm.issuer || undefined,
          issueDate: certForm.issueDate || undefined, expiryDate: certForm.expiryDate || undefined,
          credentialUrl: certForm.credentialUrl || undefined, notes: certForm.notes || undefined, fileUrl
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCertError(data.error || 'Erreur'); return; }
      setClients(prev => prev.map(c => c.id === selClient.id
        ? { ...c, certificates: [{ id: data.id, name: data.name, issueDate: data.issueDate }, ...c.certificates] } : c));
      setShowCert(false); setCertForm(EMPTY_CERT); setCertFile(null);
    } catch { setCertError('Erreur réseau'); }
    finally { setSaving(false); }
  }

  async function handleDecide() {
    if (!selBooking) return; setActing(true);
    try {
      const res = await fetch(`/api/employer/sessions/${selBooking.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decideAction, notes: actionNotes || null }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === selBooking.id ? { ...b, status: decideAction, notes: actionNotes || null } : b));
        setShowDecide(false); setSelBooking(null); setActionNotes('');
      }
    } catch { }
    finally { setActing(false); }
  }

  const statusBadge = (s: Booking['status']) => {
    const c = {
      PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'En attente', I: Clock },
      ACCEPTED: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Acceptée', I: CheckCheck },
      REFUSED: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'Refusée', I: Ban }
    }[s];
    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}><c.I size={10} />{c.label}</span>;
  };

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'candidatures', label: 'Candidatures', badge: MOCK_CANDIDATURES.filter(c => c.status === 'PENDING').length },
    { id: 'videos', label: 'Vérif. Vidéos', badge: MOCK_VIDEOS.filter(v => v.status === 'PENDING').length },
    { id: 'sessions', label: 'Sessions Expert', badge: bookings.filter(b => b.status === 'PENDING').length || undefined },
    { id: 'certificats', label: 'Certificats' },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Building2 size={15} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                Employeur StratIA
              </span>
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Espace Employeur</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gérez les candidatures formateurs, validez les vidéos, émettez les certificats</p>
          </div>
          {(tab === 'certificats' || tab === 'sessions') && (
            <button onClick={() => tab === 'certificats' ? loadClients() : loadBookings()} disabled={loading || bookingLoad}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <RefreshCw size={14} className={(loading || bookingLoad) ? 'animate-spin' : ''} />Actualiser
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="tabs-scroll mb-6">
          {TABS.map(({ id, label, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
              style={tab === id ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' } : { color: 'var(--text-muted)' }}>
              {label}
              {badge ? <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full" style={{ background: '#e85d2b', color: '#fff' }}>{badge}</span> : null}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: UserCheck, label: 'Candidatures', value: String(MOCK_CANDIDATURES.filter(c => c.status === 'PENDING').length), sub: 'En attente', accent: '#f59e0b', click: () => setTab('candidatures') },
                { icon: Video, label: 'Vidéos à valider', value: String(MOCK_VIDEOS.filter(v => v.status === 'PENDING').length), sub: 'Soumises', accent: '#3b82f6', click: () => setTab('videos') },
                { icon: CalendarClock, label: 'Sessions', value: String(bookings.filter(b => b.status === 'PENDING').length), sub: 'En attente', accent: '#f59e0b', click: () => setTab('sessions') },
                { icon: Award, label: 'Certificats', value: String(clients.reduce((s, c) => s + c.certificates.length, 0)), sub: 'Émis total', accent: '#10b981', click: () => setTab('certificats') },
              ].map(({ icon: Icon, label, value, sub, accent, click }) => (
                <button key={label} onClick={click} className="rounded-2xl p-5 text-left transition-all hover:scale-[1.01]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `color-mix(in srgb,${accent} 12%,transparent)` }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                </button>
              ))}
            </div>
            <div className="p-4 rounded-2xl text-sm" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🏗️ Rôle Employeur StratIA</p>
              <p style={{ color: 'var(--text-secondary)' }}>Vous validez les candidatures formateurs, approuvez les vidéos avant publication, gérez les sessions expert et émettez les certificats clients. Les formations et lives sont gérés par les formateurs eux-mêmes.</p>
            </div>
          </div>
        )}

        {/* ─── CANDIDATURES ─── */}
        {tab === 'candidatures' && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{MOCK_CANDIDATURES.length} candidature(s) au total</p>
            {MOCK_CANDIDATURES.map(c => (
              <div key={c.id} className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.email} · {c.expertise}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Soumis le {new Date(c.submitted).toLocaleDateString('fr-CA')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: BADGE[c.status].bg, color: BADGE[c.status].color }}>{BADGE[c.status].label}</span>
                  {c.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                        <CheckCheck size={12} />Accepter
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                        <Ban size={12} />Refuser
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── VERIFICATION VIDÉOS ─── */}
        {tab === 'videos' && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{MOCK_VIDEOS.length} vidéo(s) soumise(s)</p>
            {MOCK_VIDEOS.map(v => (
              <div key={v.id} className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Video size={18} style={{ color: '#3b82f6' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{v.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Par {v.formateur} · Soumis le {new Date(v.submitted).toLocaleDateString('fr-CA')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: BADGE[v.status].bg, color: BADGE[v.status].color }}>{BADGE[v.status].label}</span>
                  {v.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                        Visionner
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                        <CheckCheck size={12} />Approuver
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                        <Ban size={12} />Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── SESSIONS ─── */}
        {tab === 'sessions' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Demandes de sessions expert</h2>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{bookings.length} total</span>
            </div>
            {bookingLoad ? (
              <div className="py-16 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}><Loader2 size={20} className="animate-spin" />Chargement...</div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center"><CalendarClock size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune demande.</p></div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {bookings.map(b => (
                  <div key={b.id} className="px-4 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">{statusBadge(b.status)}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString('fr-CA')}</span></div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{b.topic}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.user.fullName || b.user.email} — <strong>{b.slot}</strong></p>
                    </div>
                    {b.status === 'PENDING' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setSelBooking(b); setDecideAction('ACCEPTED'); setActionNotes(''); setShowDecide(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><CheckCheck size={12} />Accepter</button>
                        <button onClick={() => { setSelBooking(b); setDecideAction('REFUSED'); setActionNotes(''); setShowDecide(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><Ban size={12} />Refuser</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── CERTIFICATS ─── */}
        {tab === 'certificats' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            {error && <div className="mx-4 mt-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}><ShieldAlert size={14} />{error}</div>}
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}><Loader2 size={20} className="animate-spin" />Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center"><Users size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{search ? 'Aucun résultat.' : 'Aucun client.'}</p></div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map(client => (
                  <div key={client.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {(client.fullName ?? client.email ?? '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{client.fullName || client.email}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{client.email}{client.companyName && ` - ${client.companyName}`}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSelClient(client); setShowCert(true); setCertForm(EMPTY_CERT); setCertError(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
                        style={{ background: '#e85d2b', color: '#fff' }}><Plus size={13} />Certificat</button>
                    </div>
                    {client.certificates.length > 0 && (
                      <div className="mt-3 space-y-1.5" style={{ marginLeft: '3.25rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' }}>
                        {client.certificates.map(cert => (
                          <div key={cert.id} className="flex items-center gap-2">
                            <CheckCircle size={12} style={{ color: '#10b981' }} />
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{cert.name}</span>
                            {cert.issueDate && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>— {new Date(cert.issueDate).toLocaleDateString('fr-CA')}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal cert */}
      {showCert && selClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 relative" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setShowCert(false); setCertFile(null); }} className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}><Award size={16} style={{ color: '#10b981' }} /></div>
              <div><h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Ajouter un certificat</h2><p className="text-xs" style={{ color: 'var(--text-muted)' }}>pour {selClient.fullName || selClient.email}</p></div>
            </div>
            <form onSubmit={handleAddCert} className="space-y-4">
              <div><label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nom *</label><input type="text" required value={certForm.name} onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="ex: Formation IA Avancée" /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Émetteur</label><input type="text" value={certForm.issuer} onChange={e => setCertForm(f => ({ ...f, issuer: e.target.value }))} style={inp} placeholder="StratIA" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Émission</label><input type="date" value={certForm.issueDate} onChange={e => setCertForm(f => ({ ...f, issueDate: e.target.value }))} style={inp} /></div>
                <div><label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Expiration</label><input type="date" value={certForm.expiryDate} onChange={e => setCertForm(f => ({ ...f, expiryDate: e.target.value }))} style={inp} /></div>
              </div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>URL vérification</label><input type="url" value={certForm.credentialUrl} onChange={e => setCertForm(f => ({ ...f, credentialUrl: e.target.value }))} style={inp} placeholder="https://..." /></div>
              <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => setCertFile(e.target.files?.[0] ?? null)} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border-2 border-dashed" style={{ borderColor: certFile ? '#10b981' : 'var(--border)', color: certFile ? '#10b981' : 'var(--text-muted)', background: 'var(--bg-base)' }}>
                {certFile ? <><FileText size={14} />{certFile.name}</> : <><Upload size={14} />Choisir fichier PDF</>}
              </button>
              {certError && <div className="px-3 py-2 rounded-xl text-xs" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{certError}</div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowCert(false); setCertFile(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60" style={{ background: '#10b981', color: '#fff' }}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />...</> : <><Plus size={14} />Ajouter</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal session */}
      {showDecide && selBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 relative" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => setShowDecide(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: decideAction === 'ACCEPTED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)' }}>
                {decideAction === 'ACCEPTED' ? <CheckCheck size={16} style={{ color: '#10b981' }} /> : <Ban size={16} style={{ color: '#f87171' }} />}
              </div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{decideAction === 'ACCEPTED' ? 'Accepter' : 'Refuser'} la session</h2>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}><strong>{selBooking.topic}</strong> — {selBooking.user.fullName || selBooking.user.email}</p>
            <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' as const }} placeholder="Note pour le client (optionnel)" className="mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowDecide(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Annuler</button>
              <button onClick={handleDecide} disabled={acting} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60" style={{ background: decideAction === 'ACCEPTED' ? '#10b981' : '#ef4444', color: '#fff' }}>
                {acting ? <Loader2 size={14} className="animate-spin" /> : null}{decideAction === 'ACCEPTED' ? 'Accepter' : 'Refuser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
