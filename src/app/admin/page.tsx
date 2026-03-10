'use client';

import { useState, useEffect, FormEvent } from 'react';
import AppShell from '@/components/AppShell';
import {
  Users, TrendingUp, DollarSign, Brain, CheckCircle,
  Activity, Crown, Search, ChevronDown, ChevronUp,
  RefreshCw, ShieldAlert, Building2, MapPin, Zap,
  Plus, Trash2, Edit2, X, Loader2, UserPlus,
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Stats {
  totalUsers: number; activeToday: number; avgScore: number;
  totalDiagnostics: number; tasksCompleted: number;
  proUsers: number; totalRevenue: number; employerCount: number;
}
interface AdminUser {
  id: string; email: string; fullName: string | null;
  companyName: string | null; role: 'USER' | 'EMPLOYER' | 'FORMATEUR' | 'ADMIN';
  plan: string; province: string | null; sector: string | null;
  createdAt: string; lastActiveAt: string | null; employerId: string | null;
  employer: { id: string; fullName: string | null; email: string } | null;
  _count?: { diagnostics: number; tasks: number; certificates: number };
}
interface AddForm {
  email: string; password: string; fullName: string;
  companyName: string; role: 'USER' | 'EMPLOYER' | 'FORMATEUR' | 'ADMIN';
  plan: 'FREE' | 'PRO';
}

/* ── Helpers ───────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, accent, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  accent: string; trend?: { val: string; up: boolean };
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {trend && (
          <span className="text-xs font-semibold flex items-center gap-0.5"
            style={{ color: trend.up ? '#10b981' : '#ef4444' }}>
            {trend.up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}{trend.val}
          </span>
        )}
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ADMIN: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'Admin' },
    EMPLOYER: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Employeur' },
    FORMATEUR: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', label: 'Formateur' },
    USER: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', label: 'Client' },
  };
  const s = map[role] ?? map.USER;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const isPro = plan === 'PRO';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={isPro ? { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
      {isPro && <Crown size={9} />}{plan}
    </span>
  );
}

const EMPTY_FORM: AddForm = { email: '', password: '', fullName: '', companyName: '', role: 'USER', plan: 'FREE' };

/* ── Main Component ────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleF] = useState<'all' | 'USER' | 'EMPLOYER' | 'FORMATEUR' | 'ADMIN'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'users'>('overview');
  const [sortCol, setSortCol] = useState<keyof AdminUser>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const employers = users.filter(u => u.role === 'EMPLOYER');

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [sRes, uRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);
      if (!sRes.ok || !uRes.ok) {
        const errData = await (!sRes.ok ? sRes : uRes).json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || 'Erreur de chargement');
      }
      const [sData, uData] = await Promise.all([sRes.json(), uRes.json()]);
      setStats(sData);
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  /* Filtered + sorted */
  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || [u.email, u.fullName, u.companyName].some(v => v?.toLowerCase().includes(q));
      const matchR = roleFilter === 'all' || u.role === roleFilter;
      return matchQ && matchR;
    })
    .sort((a, b) => {
      const av = String(a[sortCol] ?? '');
      const bv = String(b[sortCol] ?? '');
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  function toggleSort(col: keyof AdminUser) {
    if (sortCol === col) setSortAsc(p => !p);
    else { setSortCol(col); setSortAsc(false); }
  }

  async function handleAddUser(e: FormEvent) {
    e.preventDefault(); setAddError(''); setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || 'Erreur'); return; }
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      await loadData();
    } catch { setAddError('Erreur réseau'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
      else { const d = await res.json(); alert(d.error || 'Erreur'); }
    } finally { setActionId(null); }
  }

  async function handleRoleChange(id: string, role: 'USER' | 'EMPLOYER' | 'FORMATEUR' | 'ADMIN') {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      else { const d = await res.json(); alert(d.error || 'Erreur'); }
    } finally { setActionId(null); }
  }

  const TH = ({ col, children }: { col: keyof AdminUser; children: React.ReactNode }) => (
    <th onClick={() => toggleSort(col)}
      className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide cursor-pointer select-none hover:opacity-75"
      style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', whiteSpace: 'nowrap' }}>
      <span className="flex items-center gap-1">
        {children}
        {sortCol === col && (sortAsc ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
      </span>
    </th>
  );

  const inp = {
    background: 'var(--bg-base)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%',
    outline: 'none',
  } as React.CSSProperties;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-orange-500 flex items-center justify-center">
                <ShieldAlert size={15} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                Super Admin
              </span>
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Dashboard Plateforme</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gestion complete — StratIA</p>
          </div>
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Actualiser
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm flex items-start gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <ShieldAlert size={15} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Erreur : </span>{error}
              <span className="block mt-1 text-xs opacity-70">Assurez-vous d&apos;etre connecte en tant qu&apos;admin.</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-scroll mb-6">
          {([['overview', "Vue d'ensemble"], ['users', 'Utilisateurs']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
              style={tab === t
                ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
                : { color: 'var(--text-muted)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} label="Utilisateurs total" value={loading ? '...' : String(stats?.totalUsers ?? 0)} accent="#3b82f6" sub={`${stats?.activeToday ?? 0} actifs aujourd'hui`} />
              <StatCard icon={Crown} label="Abonnes Pro" value={loading ? '...' : String(stats?.proUsers ?? 0)} accent="#f59e0b" sub="Plan 149$/mois" trend={{ val: '+12%', up: true }} />
              <StatCard icon={DollarSign} label="Revenu mensuel" value={loading ? '...' : `${(stats?.totalRevenue ?? 0).toLocaleString('fr-CA')} $`} accent="#10b981" sub="MRR estime" trend={{ val: '+8%', up: true }} />
              <StatCard icon={Brain} label="Score moyen IA" value={loading ? '...' : `${stats?.avgScore ?? 0}/100`} accent="#8b5cf6" />
              <StatCard icon={Activity} label="Diagnostics lances" value={loading ? '...' : String(stats?.totalDiagnostics ?? 0)} accent="#06b6d4" />
              <StatCard icon={CheckCircle} label="Taches completees" value={loading ? '...' : String(stats?.tasksCompleted ?? 0)} accent="#22c55e" />
              <StatCard icon={Building2} label="Employers" value={loading ? '...' : String(stats?.employerCount ?? 0)} accent="#f97316" />
              <StatCard icon={Zap} label="Actifs aujourd'hui" value={loading ? '...' : String(stats?.activeToday ?? 0)} accent="#a855f7" />
            </div>

            {/* Recent users */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Inscriptions recentes</h2>
                <button onClick={() => setTab('users')} className="text-xs font-semibold" style={{ color: '#60a5fa' }}>Voir tous →</button>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: 'var(--bg-elevated)' }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded animate-pulse w-32" style={{ background: 'var(--bg-elevated)' }} />
                      <div className="h-2.5 rounded animate-pulse w-24" style={{ background: 'var(--bg-elevated)' }} />
                    </div>
                  </div>
                )) : users.slice(0, 6).map(u => (
                  <div key={u.id} className="px-6 py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(u.fullName ?? u.email ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{u.fullName || u.email}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {u.companyName && <><Building2 size={9} className="inline mr-0.5" />{u.companyName} · </>}
                        {u.province && <><MapPin size={9} className="inline mr-0.5" />{u.province} · </>}
                        {new Date(u.createdAt).toLocaleDateString('fr-CA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={u.role} />
                      <PlanBadge plan={u.plan} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── USERS MANAGEMENT ── */}
        {tab === 'users' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {/* Toolbar */}
            <div className="px-4 py-4 flex flex-col sm:flex-row gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, courriel, entreprise..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] as const).map(r => (
                  <button key={r} onClick={() => setRoleF(r)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={roleFilter === r
                      ? { background: '#e85d2b', color: '#fff' }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {r === 'all' ? 'Tous' : r === 'USER' ? 'Clients' : r === 'EMPLOYER' ? 'Employeurs' : r === 'FORMATEUR' ? 'Formateurs' : 'Admins'}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowAdd(true); setAddError(''); setAddForm(EMPTY_FORM); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-opacity hover:opacity-90"
                style={{ background: '#e85d2b', color: '#fff' }}>
                <UserPlus size={15} />Ajouter
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr>
                    <TH col="fullName">Utilisateur</TH>
                    <TH col="companyName">Entreprise</TH>
                    <TH col="role">Role</TH>
                    <TH col="plan">Plan</TH>
                    <TH col="province">Province</TH>
                    <TH col="createdAt">Inscrit le</TH>
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="h-3 rounded animate-pulse w-20" style={{ background: 'var(--bg-elevated)' }} />
                        </td>
                      ))}
                    </tr>
                  )) : filtered.map(u => (
                    <tr key={u.id} className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderTop: '1px solid var(--border)' }}>
                      {/* User */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {(u.fullName ?? u.email ?? '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate max-w-[130px]" style={{ color: 'var(--text-primary)' }}>
                              {u.fullName || '—'}
                            </p>
                            <p className="text-[10px] truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs truncate max-w-[110px] block" style={{ color: 'var(--text-secondary)' }}>
                          {u.companyName || '—'}
                        </span>
                        {u.employer && (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            via {u.employer.fullName || u.employer.email}
                          </span>
                        )}
                      </td>
                      {/* Role change dropdown */}
                      <td className="px-3 py-3">
                        {actionId === u.id ? (
                          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                        ) : (
                          <select value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value as 'USER' | 'EMPLOYER' | 'FORMATEUR' | 'ADMIN')}
                            className="text-[11px] font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer"
                            style={{ background: 'transparent', color: u.role === 'ADMIN' ? '#f87171' : u.role === 'EMPLOYER' ? '#fbbf24' : u.role === 'FORMATEUR' ? '#a78bfa' : '#60a5fa' }}>
                            <option value="USER">Client</option>
                            <option value="EMPLOYER">Employeur</option>
                            <option value="FORMATEUR">Formateur</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-3"><PlanBadge plan={u.plan} /></td>
                      <td className="px-3 py-3">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u.province || '—'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString('fr-CA')}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => handleDelete(u.id)}
                          disabled={actionId === u.id}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 disabled:opacity-40"
                          title="Supprimer">
                          <Trash2 size={14} style={{ color: '#f87171' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Users size={28} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucun resultat</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── ADD USER MODAL ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <UserPlus size={16} style={{ color: '#e85d2b' }} />
              </div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Ajouter un utilisateur</h2>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Courriel *</label>
                  <input type="email" required value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} style={inp} placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Mot de passe *</label>
                  <input type="password" required value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} style={inp} placeholder="Min. 6 caracteres" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nom complet</label>
                  <input type="text" value={addForm.fullName} onChange={e => setAddForm(f => ({ ...f, fullName: e.target.value }))} style={inp} placeholder="Prénom Nom" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Entreprise <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span></label>
                  <input type="text" value={addForm.companyName} onChange={e => setAddForm(f => ({ ...f, companyName: e.target.value }))} style={inp} placeholder="Nom de l'entreprise" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Rôle</label>
                  <select value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value as AddForm['role'] }))} style={inp}>
                    <option value="USER">Client</option>
                    <option value="FORMATEUR">Formateur</option>
                    <option value="EMPLOYER">Employeur StratIA</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                {addForm.role === 'USER' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Plan</label>
                    <select value={addForm.plan} onChange={e => setAddForm(f => ({ ...f, plan: e.target.value as AddForm['plan'] }))} style={inp}>
                      <option value="FREE">FREE</option>
                      <option value="PRO">PRO</option>
                    </select>
                  </div>
                )}
              </div>

              {addError && (
                <div className="px-3 py-2 rounded-xl text-xs" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                  {addError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-70"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{ background: '#e85d2b', color: '#fff' }}>
                  {saving ? <><Loader2 size={14} className="animate-spin" />Creation...</> : <><Plus size={14} />Creer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
