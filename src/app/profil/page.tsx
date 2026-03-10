'use client';

import { useEffect, useRef, useState } from 'react';
import AppShell from '@/components/AppShell';
import {
    User, Mail, Lock, Building2, MapPin, Eye, EyeOff,
    Camera, Trash2, Save, Shield, AlertTriangle, CheckCircle,
    GraduationCap, Zap, Crown, ChevronRight, Loader2,
} from 'lucide-react';

interface Profile {
    id: string; email: string; fullName: string | null;
    companyName: string | null; sector: string | null;
    province: string | null; role: string; plan: string;
    avatarUrl: string | null; createdAt: string;
    oauthProvider: string | null;
}

type Tab = 'profil' | 'securite' | 'compte';

const SECTORS = [
    'Technologie', 'Finance', 'Sante', 'Education', 'Commerce',
    'Industrie', 'Construction', 'Transport', 'Agriculture', 'Autre',
];

export default function ProfilPage() {
    const [tab, setTab] = useState<Tab>('profil');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showPwd, setShowPwd] = useState({ cur: false, new: false });

    // Form states
    const [form, setForm] = useState({ fullName: '', companyName: '', sector: '', province: '' });
    const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });

    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/profil')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    setProfile(data);
                    setForm({
                        fullName: data.fullName || '',
                        companyName: data.companyName || '',
                        sector: data.sector || '',
                        province: data.province || '',
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    function flash(type: 'ok' | 'err', text: string) {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 4000);
    }

    async function saveProfil(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/profil', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setProfile(p => p ? { ...p, ...data } : p);
            flash('ok', 'Profil mis a jour avec succes !');
        } catch (e: unknown) {
            flash('err', e instanceof Error ? e.message : 'Erreur inconnue');
        } finally { setSaving(false); }
    }

    async function savePassword(e: React.FormEvent) {
        e.preventDefault();
        if (pwdForm.newPwd !== pwdForm.confirm) { flash('err', 'Les mots de passe ne correspondent pas'); return; }
        if (pwdForm.newPwd.length < 8) { flash('err', 'Mot de passe trop court (8 caracteres min)'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/profil', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.newPwd }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPwdForm({ current: '', newPwd: '', confirm: '' });
            flash('ok', 'Mot de passe modifie !');
        } catch (e: unknown) {
            flash('err', e instanceof Error ? e.message : 'Erreur');
        } finally { setSaving(false); }
    }

    async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/profil/avatar', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setProfile(p => p ? { ...p, avatarUrl: data.avatarUrl } : p);
            flash('ok', 'Photo mise a jour !');
        } catch (e: unknown) {
            flash('err', e instanceof Error ? e.message : 'Erreur upload');
        } finally { setAvatarUploading(false); }
    }

    async function deleteAccount() {
        setDeleting(true);
        try {
            const res = await fetch('/api/profil/avatar', { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur suppression');
            window.location.href = '/';
        } catch (e: unknown) {
            flash('err', 'Erreur lors de la suppression');
            setDeleting(false);
        }
    }

    const inp: React.CSSProperties = {
        background: 'var(--bg-elevated)', borderColor: 'var(--border)',
        color: 'var(--text-primary)', border: '1px solid var(--border)',
    };

    const roleColor: Record<string, string> = {
        ADMIN: '#ef4444', EMPLOYER: '#f59e0b', FORMATEUR: '#8b5cf6', USER: '#2563eb',
    };
    const roleLabel: Record<string, string> = {
        ADMIN: 'Administrateur', EMPLOYER: 'Employeur StratIA',
        FORMATEUR: 'Formateur', USER: 'Client',
    };

    if (loading) return (
        <AppShell>
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={28} className="animate-spin" style={{ color: '#6366f1' }} />
            </div>
        </AppShell>
    );

    const avatarLetter = (profile?.fullName || profile?.email || 'U')[0].toUpperCase();
    const roleC = roleColor[profile?.role || 'USER'];

    return (
        <AppShell>
            <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Mon profil</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Gerez vos informations personnelles et preferences
                    </p>
                </div>

                {/* Flash message */}
                {msg && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                        style={{
                            background: msg.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${msg.type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            color: msg.type === 'ok' ? '#10b981' : '#f87171',
                        }}>
                        {msg.type === 'ok' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        {msg.text}
                    </div>
                )}

                {/* Avatar + role card */}
                <div className="flex flex-wrap items-center gap-4 p-5 rounded-2xl"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    {/* Photo */}
                    <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-black"
                            style={{ background: profile?.avatarUrl ? 'transparent' : `linear-gradient(135deg,${roleC},#06b6d4)` }}>
                            {profile?.avatarUrl
                                ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                : avatarLetter}
                        </div>
                        <button onClick={() => fileRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-opacity hover:opacity-80"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                            title="Changer la photo">
                            {avatarUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                        </button>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden" onChange={uploadAvatar} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-base font-black truncate" style={{ color: 'var(--text-primary)' }}>
                            {profile?.fullName || 'Mon compte'}
                        </p>
                        <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${roleC}15`, color: roleC, border: `1px solid ${roleC}30` }}>
                                {roleLabel[profile?.role || 'USER']}
                            </span>
                            {profile?.plan === 'PRO' && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                                    <Crown size={9} className="inline mr-0.5" /> PRO
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-scroll">
                    {([['profil', 'Informations', User], ['securite', 'Sécurité', Shield], ['compte', 'Compte', Trash2]] as const).map(([id, label, Icon]) => (
                        <button key={id} onClick={() => setTab(id)}
                            className="flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold transition-all"
                            style={{
                                background: tab === id ? 'var(--bg-surface)' : 'transparent',
                                color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
                                boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
                            }}>
                            <Icon size={13} /> {label}
                        </button>
                    ))}
                </div>

                {/* ── TAB PROFIL ────────────────────────────── */}
                {tab === 'profil' && (
                    <form onSubmit={saveProfil} className="space-y-4 p-5 rounded-2xl"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Informations personnelles</h2>

                        {/* Nom complet */}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom complet</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    placeholder="Votre nom complet" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm" style={inp} />
                            </div>
                        </div>

                        {/* Email (readonly) */}
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Adresse email <span className="text-[10px] font-normal opacity-60">(non modifiable)</span>
                            </label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input type="email" value={profile?.email || ''} readOnly
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm opacity-60 cursor-not-allowed" style={inp} />
                            </div>
                        </div>

                        {/* Entreprise (uniquement si USER) */}
                        {(profile?.role === 'USER' || profile?.role === 'FORMATEUR') && (
                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    Entreprise <span className="text-[10px] font-normal opacity-60">(optionnel)</span>
                                </label>
                                <div className="relative">
                                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                    <input type="text" value={form.companyName}
                                        onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                                        placeholder="Nom de votre entreprise" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm" style={inp} />
                                </div>
                            </div>
                        )}

                        {/* Secteur */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Secteur</label>
                                <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm" style={inp}>
                                    <option value="">-- Choisir --</option>
                                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Province / Region</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                    <input type="text" value={form.province}
                                        onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                                        placeholder="ex: Ontario" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm" style={inp} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </form>
                )}

                {/* ── TAB SECURITE ──────────────────────────── */}
                {tab === 'securite' && (
                    <div className="space-y-4 p-5 rounded-2xl"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Securite du compte</h2>

                        {profile?.oauthProvider ? (
                            <div className="flex items-start gap-3 p-4 rounded-xl"
                                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                <Zap size={16} style={{ color: '#6366f1' }} className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Connexion via Google</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                        Votre compte est connecte via Google OAuth.
                                        La gestion du mot de passe se fait directement sur votre compte Google.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={savePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe actuel</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <input type={showPwd.cur ? 'text' : 'password'} value={pwdForm.current}
                                            onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))}
                                            placeholder="Mot de passe actuel" className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm" style={inp} />
                                        <button type="button" onClick={() => setShowPwd(s => ({ ...s, cur: !s.cur }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                            {showPwd.cur ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <input type={showPwd.new ? 'text' : 'password'} value={pwdForm.newPwd}
                                            onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))}
                                            placeholder="Nouveau mot de passe (8+ caracteres)" className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm" style={inp} />
                                        <button type="button" onClick={() => setShowPwd(s => ({ ...s, new: !s.new }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                            {showPwd.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                        <input type="password" value={pwdForm.confirm}
                                            onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                                            placeholder="Confirmer le nouveau mot de passe" className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm" style={inp} />
                                    </div>
                                </div>
                                <button type="submit" disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                                    {saving ? 'Enregistrement...' : 'Changer le mot de passe'}
                                </button>
                            </form>
                        )}

                        {/* Info membre depuis */}
                        <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Membre depuis le {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── TAB COMPTE ────────────────────────────── */}
                {tab === 'compte' && (
                    <div className="space-y-4">

                        {/* Fonctionnalites par role */}
                        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Votre espace {roleLabel[profile?.role || 'USER']}</h2>
                            <div className="space-y-2">
                                {profile?.role === 'USER' && (
                                    <>
                                        <div className="flex items-center justify-between py-2 text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>Plan actuel</span>
                                            <span className="font-bold" style={{ color: profile?.plan === 'PRO' ? '#f59e0b' : 'var(--text-primary)' }}>
                                                {profile?.plan === 'PRO' ? 'Pro' : 'Gratuit'}
                                            </span>
                                        </div>
                                        {profile?.plan !== 'PRO' && (
                                            <a href="/pricing"
                                                className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-semibold"
                                                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                                                <span className="flex items-center gap-2"><Crown size={14} /> Passer au plan Pro</span>
                                                <ChevronRight size={14} />
                                            </a>
                                        )}
                                    </>
                                )}
                                {profile?.role === 'FORMATEUR' && (
                                    <div className="flex items-center justify-between py-2 text-sm">
                                        <span style={{ color: 'var(--text-secondary)' }}>Commission formations</span>
                                        <span className="font-bold" style={{ color: '#6366f1' }}>70%</span>
                                    </div>
                                )}
                                {(profile?.role === 'FORMATEUR' || profile?.role === 'USER') && (
                                    <a href="/formations"
                                        className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-semibold"
                                        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', color: '#6366f1' }}>
                                        <span className="flex items-center gap-2"><GraduationCap size={14} /> Catalogue formations</span>
                                        <ChevronRight size={14} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Zone danger — suppression compte */}
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <h2 className="text-base font-bold mb-1 text-red-400">Zone de danger</h2>
                            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                                La suppression de votre compte est permanente et irreversible. Toutes vos donnees seront effacees.
                            </p>

                            {!deleteConfirm ? (
                                <button onClick={() => setDeleteConfirm(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                                    <Trash2 size={14} /> Supprimer mon compte
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                        <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-400 font-semibold">
                                            Etes-vous certain ? Cette action est irreversible.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setDeleteConfirm(false)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                                            Annuler
                                        </button>
                                        <button onClick={deleteAccount} disabled={deleting}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                                            style={{ background: '#ef4444' }}>
                                            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                            {deleting ? 'Suppression...' : 'Confirmer la suppression'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </AppShell>
    );
}
