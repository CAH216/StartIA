'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { Building2, Users, Award, Plus, X, Loader2, RefreshCw, Search, CheckCircle, Brain, ShieldAlert, CalendarClock, CheckCheck, Ban, Clock, Upload, FileText } from 'lucide-react';

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

export default function EmployerPage() {
  const [tab,       setTab]       = useState<'overview' | 'certificats' | 'sessions'>('overview');
  const [clients,   setClients]   = useState<ClientUser[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [selClient, setSelClient] = useState<ClientUser | null>(null);
  const [showCert,  setShowCert]  = useState(false);
  const [certForm,  setCertForm]  = useState<CertForm>(EMPTY_CERT);
  const [saving,    setSaving]    = useState(false);
  const [certError, setCertError] = useState('');
  const [certFile,  setCertFile]  = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sessions state
  const [bookings,    setBookings]    = useState<Booking[]>([]);
  const [bookingLoad, setBookingLoad] = useState(false);
  const [selBooking,  setSelBooking]  = useState<Booking | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [acting,      setActing]      = useState(false);
  const [showDecide,  setShowDecide]  = useState(false);
  const [decideAction, setDecideAction] = useState<'ACCEPTED' | 'REFUSED'>('ACCEPTED');

  const loadClients = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/employer/clients');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de chargement');
      setClients(Array.isArray(data) ? data : []);
    } catch (e) { setError((e as Error).message); }
    finally    { setLoading(false); }
  };

  const loadBookings = async () => {
    setBookingLoad(true);
    try {
      const res  = await fetch('/api/employer/sessions');
      const data = await res.json();
      if (res.ok) setBookings(Array.isArray(data) ? data : []);
    } catch {}
    finally { setBookingLoad(false); }
  };

  useEffect(() => {
    if (tab === 'certificats') loadClients();
    if (tab === 'sessions')   loadBookings();
  }, [tab]);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || [c.email, c.fullName, c.companyName].some(v => v?.toLowerCase().includes(q));
  });

  async function handleAddCert(e: FormEvent) {
    e.preventDefault(); if (!selClient) return;
    setCertError(''); setSaving(true);
    try {
      // Upload PDF if selected
      let fileUrl: string | undefined;
      if (certFile) {
        const fd = new FormData();
        fd.append('file', certFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) { setCertError(upData.error || 'Erreur upload'); setSaving(false); return; }
        fileUrl = upData.url;
      }

      const res  = await fetch(`/api/employer/clients/${selClient.id}/certificates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: certForm.name, issuer: certForm.issuer || undefined,
          issueDate: certForm.issueDate || undefined, expiryDate: certForm.expiryDate || undefined,
          credentialUrl: certForm.credentialUrl || undefined, notes: certForm.notes || undefined,
          fileUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCertError(data.error || 'Erreur'); return; }
      setClients(prev => prev.map(c =>
        c.id === selClient.id
          ? { ...c, certificates: [{ id: data.id, name: data.name, issueDate: data.issueDate }, ...c.certificates] }
          : c
      ));
      setShowCert(false); setCertForm(EMPTY_CERT); setCertFile(null);
    } catch { setCertError('Erreur reseau'); }
    finally { setSaving(false); }
  }

  async function handleDecide() {
    if (!selBooking) return;
    setActing(true);
    try {
      const res = await fetch(`/api/employer/sessions/${selBooking.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decideAction, notes: actionNotes || null }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === selBooking.id ? { ...b, status: decideAction, notes: actionNotes || null } : b));
        setShowDecide(false); setSelBooking(null); setActionNotes('');
      }
    } catch {}
    finally { setActing(false); }
  }

  const inp = {
    background: 'var(--bg-base)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', outline: 'none',
  } as React.CSSProperties;

  const statusBadge = (status: Booking['status']) => {
    const cfg = {
      PENDING:  { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', label: 'En attente', icon: Clock },
      ACCEPTED: { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'Acceptée',  icon: CheckCheck },
      REFUSED:  { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', label: 'Refusée',   icon: Ban },
    }[status];
    const Icon = cfg.icon;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
        style={{ background: cfg.bg, color: cfg.color }}>
        <Icon size={10} />{cfg.label}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Building2 size={15} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                Employer
              </span>
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Dashboard Employer</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gérez vos clients, sessions et certifications</p>
          </div>
          {(tab === 'certificats' || tab === 'sessions') && (
            <button onClick={() => tab === 'certificats' ? loadClients() : loadBookings()} disabled={loading || bookingLoad}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <RefreshCw size={14} className={(loading || bookingLoad) ? 'animate-spin' : ''} />Actualiser
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          {([
            ['overview',    "Vue d'ensemble"],
            ['certificats', 'Certificats'],
            ['sessions',    'Sessions Expert'],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t
                ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
                : { color: 'var(--text-muted)' }}>
              {label}
              {t === 'sessions' && bookings.filter(b => b.status === 'PENDING').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                  style={{ background: '#e85d2b', color: '#fff' }}>
                  {bookings.filter(b => b.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Users,         label: 'Total clients',       value: String(clients.length),                                                          accent: '#3b82f6' },
                { icon: Award,         label: 'Certificats emis',   value: String(clients.reduce((s, c) => s + c.certificates.length, 0)),                   accent: '#10b981' },
                { icon: CalendarClock, label: 'Sessions en attente', value: String(bookings.filter(b => b.status === 'PENDING').length),                     accent: '#f59e0b' },
              ].map(({ icon: Icon, label, value, accent }) => (
                <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${accent}18` }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <Users size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Gérez vos clients</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Consultez tous vos clients et gérez leurs certificats directement.</p>
                <button onClick={() => setTab('certificats')}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: '#e85d2b', color: '#fff' }}>
                  Voir les certificats
                </button>
              </div>
              <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <CalendarClock size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Sessions Expert</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Consultez et gérez les demandes de sessions envoyées par vos clients.</p>
                <button onClick={() => setTab('sessions')}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: '#f59e0b', color: '#fff' }}>
                  Voir les sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'certificats' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un client..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            {error && (
              <div className="mx-4 mt-4 p-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <ShieldAlert size={14} />{error}
              </div>
            )}
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={20} className="animate-spin" />Chargement...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {search ? 'Aucun résultat pour cette recherche.' : 'Aucun client inscrit pour le moment.'}
                </p>
              </div>
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
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {client.fullName || client.email}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            {client.email}{client.companyName && ` - ${client.companyName}`}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              <Brain size={9} className="inline mr-0.5" />{client._count.diagnostics} diag.
                            </span>
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              <Award size={9} className="inline mr-0.5" />{client.certificates.length} cert.
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelClient(client); setShowCert(true); setCertForm(EMPTY_CERT); setCertError(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-opacity hover:opacity-80"
                        style={{ background: '#e85d2b', color: '#fff' }}>
                        <Plus size={13} />Certificat
                      </button>
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

        {tab === 'sessions' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-4 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Demandes de sessions</h2>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{bookings.length} total</span>
            </div>
            {bookingLoad ? (
              <div className="py-16 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={20} className="animate-spin" />Chargement...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center">
                <CalendarClock size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune demande de session pour le moment.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {bookings.map(b => (
                  <div key={b.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {statusBadge(b.status)}
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(b.createdAt).toLocaleDateString('fr-CA')}
                          </span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{b.topic}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {b.user.fullName || b.user.email} — Créneau : <strong>{b.slot}</strong>
                        </p>
                        {b.description && <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--text-secondary)' }}>{b.description}</p>}
                        {b.notes && <p className="text-xs mt-1 italic" style={{ color: '#fbbf24' }}>Note : {b.notes}</p>}
                      </div>
                      {b.status === 'PENDING' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => { setSelBooking(b); setDecideAction('ACCEPTED'); setActionNotes(''); setShowDecide(true); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                            <CheckCheck size={12} />Accepter
                          </button>
                          <button
                            onClick={() => { setSelBooking(b); setDecideAction('REFUSED'); setActionNotes(''); setShowDecide(true); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                            <Ban size={12} />Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificate modal */}
      {showCert && selClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setShowCert(false); setCertFile(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Award size={16} style={{ color: '#10b981' }} />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Ajouter un certificat</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>pour {selClient.fullName || selClient.email}</p>
              </div>
            </div>
            <form onSubmit={handleAddCert} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nom du certificat *</label>
                <input type="text" required value={certForm.name} onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="ex: Certification PMP" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Organisme emetteur</label>
                <input type="text" value={certForm.issuer} onChange={e => setCertForm(f => ({ ...f, issuer: e.target.value }))} style={inp} placeholder="ex: PMI, ASC..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date emission</label>
                  <input type="date" value={certForm.issueDate} onChange={e => setCertForm(f => ({ ...f, issueDate: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date expiration</label>
                  <input type="date" value={certForm.expiryDate} onChange={e => setCertForm(f => ({ ...f, expiryDate: e.target.value }))} style={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>URL de verification</label>
                <input type="url" value={certForm.credentialUrl} onChange={e => setCertForm(f => ({ ...f, credentialUrl: e.target.value }))} style={inp} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <textarea value={certForm.notes} onChange={e => setCertForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} style={{ ...inp, resize: 'vertical' as const }} placeholder="Informations complementaires..." />
              </div>
              {/* PDF upload */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Fichier PDF du certificat
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={e => setCertFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed transition-colors"
                  style={{ borderColor: certFile ? '#10b981' : 'var(--border)', color: certFile ? '#10b981' : 'var(--text-muted)', background: 'var(--bg-base)' }}>
                  {certFile ? (
                    <><FileText size={14} />{certFile.name}</>
                  ) : (
                    <><Upload size={14} />Choisir un fichier PDF / image</>
                  )}
                </button>
                {certFile && (
                  <button type="button" onClick={() => setCertFile(null)}
                    className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Retirer le fichier
                  </button>
                )}
              </div>
              {certError && <div className="px-3 py-2 rounded-xl text-xs" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{certError}</div>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowCert(false); setCertFile(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-70"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{ background: '#10b981', color: '#fff' }}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />{certFile ? 'Upload...' : 'Enregistrement...'}</> : <><Plus size={14} />Ajouter</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept/Refuse modal */}
      {showDecide && selBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => setShowDecide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: decideAction === 'ACCEPTED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)' }}>
                {decideAction === 'ACCEPTED' ? <CheckCheck size={16} style={{ color: '#10b981' }} /> : <Ban size={16} style={{ color: '#f87171' }} />}
              </div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {decideAction === 'ACCEPTED' ? 'Accepter la session' : 'Refuser la session'}
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              <strong>{selBooking.topic}</strong> — {selBooking.user.fullName || selBooking.user.email}
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Note pour le client (optionnel)
              </label>
              <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)}
                rows={3} style={{ ...inp, resize: 'vertical' as const }}
                placeholder={decideAction === 'ACCEPTED' ? 'ex: Je vous confirme le créneau...' : 'ex: Indisponible ce créneau...'} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDecide(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Annuler</button>
              <button onClick={handleDecide} disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                style={{ background: decideAction === 'ACCEPTED' ? '#10b981' : '#ef4444', color: '#fff' }}>
                {acting ? <Loader2 size={14} className="animate-spin" /> : null}
                {decideAction === 'ACCEPTED' ? 'Confirmer acceptation' : 'Confirmer refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

