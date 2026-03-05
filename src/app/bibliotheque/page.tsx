'use client';

import AppShell from '@/components/AppShell';
import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Download, Star, Lock, Search, Plus, Pencil, Trash2, X, Loader2, Upload, FileText } from 'lucide-react';

type Category = 'Tous' | 'Politique IA' | 'Gestion risques' | 'Adoption interne' | 'ROI & Stratégie' | 'Templates';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  fileUrl: string | null;
  premium: boolean;
  createdById: string;
  createdBy: { fullName: string | null };
  createdAt: string;
}

interface ResourceForm {
  title: string; description: string; category: string; type: string; fileUrl: string; premium: boolean;
}
const EMPTY_FORM: ResourceForm = { title: '', description: '', category: 'Politique IA', type: 'PDF', fileUrl: '', premium: false };

const CATEGORIES: Category[] = ['Tous', 'Politique IA', 'Gestion risques', 'Adoption interne', 'ROI & Stratégie', 'Templates'];
const CATEGORY_COLORS: Record<string, string> = {
  'Politique IA':    'bg-blue-900/50 text-blue-300 border border-blue-500/30',
  'Gestion risques': 'bg-red-900/50 text-red-300 border border-red-500/30',
  'Adoption interne':'bg-purple-900/50 text-purple-300 border border-purple-500/30',
  'ROI & Stratégie': 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30',
  'Templates':       'bg-cyan-900/50 text-cyan-300 border border-cyan-500/30',
};

export default function Bibliotheque() {
  const [resources,   setResources]   = useState<Resource[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [category,    setCategory]    = useState<Category>('Tous');
  const [search,      setSearch]      = useState('');
  const [role,        setRole]        = useState<string | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState<Resource | null>(null);
  const [form,        setForm]        = useState<ResourceForm>(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [formErr,     setFormErr]     = useState('');
  const [uploadFile,  setUploadFile]  = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setRole(d.role));
    loadResources();
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resources');
      if (res.ok) setResources(await res.json());
    } finally { setLoading(false); }
  }, []);

  const isEmployer = role === 'EMPLOYER' || role === 'ADMIN';

  const filtered = resources.filter(r => {
    const matchCat = category === 'Tous' || r.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setFormErr(''); setUploadFile(null); setShowModal(true); }
  function openEdit(r: Resource) {
    setEditing(r);
    setForm({ title: r.title, description: r.description ?? '', category: r.category, type: r.type, fileUrl: r.fileUrl ?? '', premium: r.premium });
    setFormErr('');
    setUploadFile(null);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormErr('Le titre est requis'); return; }
    setSaving(true); setFormErr('');
    try {
      // Upload file to Supabase if one was selected
      let resolvedFileUrl = form.fileUrl;
      if (uploadFile) {
        const fd = new FormData();
        fd.append('file', uploadFile);
        fd.append('folder', 'resources');
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) { setFormErr(upData.error || 'Erreur upload'); setSaving(false); return; }
        resolvedFileUrl = upData.url;
      }

      const url    = editing ? `/api/resources/${editing.id}` : '/api/resources';
      const method = editing ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fileUrl: resolvedFileUrl || null, description: form.description || null }),
      });
      if (!res.ok) {
        let msg = `Erreur ${res.status}`;
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        setFormErr(msg); return;
      }
      await loadResources();
      setShowModal(false);
    } catch (e) { setFormErr('Erreur réseau : ' + (e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette ressource ?')) return;
    await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    setResources(prev => prev.filter(r => r.id !== id));
  }

  const inp = {
    background: 'var(--bg-base)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', outline: 'none',
  } as React.CSSProperties;

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-8" style={{ color: 'var(--text-primary)' }}>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Bibliothèque stratégique</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              Documents exploitables — {resources.length} ressource{resources.length !== 1 ? 's' : ''} disponible{resources.length !== 1 ? 's' : ''}.
            </p>
          </div>
          {isEmployer && (
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#e85d2b', color: '#fff' }}>
              <Plus size={15} />Ajouter une ressource
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une ressource..."
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{
                background: category === cat ? '#3b82f6' : 'var(--bg-elevated)',
                color:      category === cat ? '#fff'   : 'var(--text-secondary)',
                borderColor:category === cat ? '#3b82f6' : 'var(--border)',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="animate-spin" />Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>{search || category !== 'Tous' ? 'Aucune ressource trouvée.' : 'Aucune ressource pour le moment.'}</p>
            {isEmployer && !search && (
              <button onClick={openAdd} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#e85d2b', color: '#fff' }}>
                Ajouter la première ressource
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => (
              <div key={r.id} className="rounded-2xl p-5 flex flex-col"
                style={{ background: 'var(--bg-surface)', border: `1px solid ${r.premium ? 'rgba(234,179,8,0.2)' : 'var(--border)'}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${CATEGORY_COLORS[r.category] ?? 'bg-gray-700 text-gray-300'}`}>
                      {r.category}
                    </span>
                    {r.premium && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
                        style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.3)' }}>
                        <Star size={9} fill="currentColor" />Pro
                      </span>
                    )}
                  </div>
                  {isEmployer && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--text-muted)' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ color: '#f87171' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold mb-2 leading-snug flex-1" style={{ color: 'var(--text-primary)' }}>{r.title}</h3>
                {r.description && (
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{r.description}</p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.type}</span>
                  {r.fileUrl ? (
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: r.premium ? 'rgba(234,179,8,0.1)' : 'rgba(59,130,246,0.1)', color: r.premium ? '#fbbf24' : '#60a5fa', border: `1px solid ${r.premium ? 'rgba(234,179,8,0.2)' : 'rgba(59,130,246,0.2)'}` }}>
                      {r.premium ? <><Lock size={11} />Accès Pro</> : <><Download size={11} />Accéder</>}
                    </a>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {r.premium ? 'Réservé Pro' : 'Bientôt disponible'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
              {editing ? 'Modifier la ressource' : 'Ajouter une ressource'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Titre *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} placeholder="Nom de la ressource" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} style={{ ...inp, resize: 'vertical' as const }} placeholder="Description courte..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                    {['Politique IA','Gestion risques','Adoption interne','ROI & Stratégie','Templates'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                    {['PDF','Word','Excel','Slides','Notion','Vidéo','Lien'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fichier (PDF / image)</label>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                  onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed transition-colors"
                  style={{ borderColor: uploadFile ? '#3b82f6' : 'var(--border)', color: uploadFile ? '#60a5fa' : 'var(--text-muted)', background: 'var(--bg-base)' }}>
                  {uploadFile ? <><FileText size={14} />{uploadFile.name}</> : <><Upload size={14} />Choisir un fichier</>}
                </button>
                {uploadFile && (
                  <button type="button" onClick={() => setUploadFile(null)}
                    className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Retirer
                  </button>
                )}
                {!uploadFile && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ou coller une URL</label>
                    <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} style={inp} placeholder="https://..." />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="premium" checked={form.premium}
                  onChange={e => setForm(f => ({ ...f, premium: e.target.checked }))} />
                <label htmlFor="premium" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Réservé aux membres Pro</label>
              </div>
              {formErr && (
                <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {formErr}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Annuler</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                  style={{ background: '#e85d2b', color: '#fff' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {editing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
