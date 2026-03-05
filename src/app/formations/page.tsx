'use client';

import AppShell from '@/components/AppShell';
import { useState, useEffect, useCallback, useRef } from 'react';
import { GraduationCap, Search, Plus, Pencil, Trash2, X, Loader2, Calendar, Clock, Tag, Monitor, MapPin, Upload, FileText } from 'lucide-react';

interface Formation {
  id: string;
  title: string;
  description: string | null;
  dates: string[];
  duration: string | null;
  price: number | null;
  priceLabel: string | null;
  format: string;
  category: string;
  tags: string[];
  featured: boolean;
  fileUrl: string | null;
  createdById: string;
  createdBy: { fullName: string | null };
  createdAt: string;
}

interface FormationForm {
  title: string; description: string; dates: string; duration: string;
  price: string; priceLabel: string; format: string; category: string; tags: string; featured: boolean; fileUrl: string;
}
const EMPTY_FORM: FormationForm = {
  title: '', description: '', dates: '', duration: '', price: '', priceLabel: '',
  format: 'En ligne', category: 'IA', tags: '', featured: false, fileUrl: '',
};

const FORMAT_ICON: Record<string, React.ElementType> = {
  'En ligne': Monitor, 'Présentiel': MapPin, 'Hybride': GraduationCap,
};

export default function Formations() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('Tous');
  const [role,       setRole]       = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState<Formation | null>(null);
  const [form,       setForm]       = useState<FormationForm>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formErr,    setFormErr]    = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setRole(d.role));
    loadFormations();
  }, []);

  const loadFormations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/formations');
      if (res.ok) setFormations(await res.json());
    } finally { setLoading(false); }
  }, []);

  const isEmployer = role === 'EMPLOYER' || role === 'ADMIN';

  const categories = ['Tous', ...Array.from(new Set(formations.map(f => f.category)))];

  const filtered = formations.filter(f => {
    const matchCat = category === 'Tous' || f.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || f.title.toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setFormErr(''); setUploadFile(null); setShowModal(true); }
  function openEdit(f: Formation) {
    setEditing(f);
    setForm({
      title: f.title, description: f.description ?? '', dates: f.dates.join(', '),
      duration: f.duration ?? '', price: f.price !== null ? String(f.price) : '',
      priceLabel: f.priceLabel ?? '', format: f.format, category: f.category,
      tags: f.tags.join(', '), featured: f.featured, fileUrl: f.fileUrl ?? '',
    });
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
        fd.append('folder', 'formations');
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) { setFormErr(upData.error || 'Erreur upload'); setSaving(false); return; }
        resolvedFileUrl = upData.url;
      }

      const url    = editing ? `/api/formations/${editing.id}` : '/api/formations';
      const method = editing ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       form.title,
          description: form.description || null,
          dates:       form.dates.split(',').map(d => d.trim()).filter(Boolean),
          duration:    form.duration || null,
          price:       form.price ? parseFloat(form.price) : null,
          priceLabel:  form.priceLabel || null,
          format:      form.format,
          category:    form.category,
          tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
          featured:    form.featured,
          fileUrl:     resolvedFileUrl || null,
        }),
      });
      if (!res.ok) {
        let msg = `Erreur ${res.status}`;
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        setFormErr(msg); return;
      }
      await loadFormations();
      setShowModal(false);
    } catch (e) { setFormErr('Erreur réseau : ' + (e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette formation ?')) return;
    await fetch(`/api/formations/${id}`, { method: 'DELETE' });
    setFormations(prev => prev.filter(f => f.id !== id));
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
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Formations</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              {formations.length} formation{formations.length !== 1 ? 's' : ''} disponible{formations.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isEmployer && (
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#e85d2b', color: '#fff' }}>
              <Plus size={15} />Ajouter une formation
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{
                background:  category === cat ? '#e85d2b' : 'var(--bg-elevated)',
                color:       category === cat ? '#fff'     : 'var(--text-secondary)',
                borderColor: category === cat ? '#e85d2b'  : 'var(--border)',
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
            <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
            <p>{search || category !== 'Tous' ? 'Aucune formation trouvée.' : 'Aucune formation pour le moment.'}</p>
            {isEmployer && !search && (
              <button onClick={openAdd} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#e85d2b', color: '#fff' }}>
                Ajouter la première formation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(f => {
              const FmtIcon = FORMAT_ICON[f.format] ?? GraduationCap;
              return (
                <div key={f.id} className="rounded-2xl p-5 flex flex-col"
                  style={{ background: 'var(--bg-surface)', border: `1px solid ${f.featured ? 'rgba(232,93,43,0.3)' : 'var(--border)'}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                        {f.category}
                      </span>
                      {f.featured && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                          style={{ background: 'rgba(232,93,43,0.15)', color: '#e85d2b', border: '1px solid rgba(232,93,43,0.3)' }}>
                          Vedette
                        </span>
                      )}
                    </div>
                    {isEmployer && (
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(f)}
                          className="p-1.5 rounded-lg hover:opacity-70"
                          style={{ color: 'var(--text-muted)' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(f.id)}
                          className="p-1.5 rounded-lg hover:opacity-70"
                          style={{ color: '#f87171' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  {f.description && (
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
                  )}

                  <div className="mt-auto space-y-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    {f.dates.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Calendar size={11} />{f.dates[0]}{f.dates.length > 1 ? ` +${f.dates.length - 1}` : ''}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <FmtIcon size={11} />{f.format}
                        {f.duration && <><Clock size={11} className="ml-2" />{f.duration}</>}
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {f.price !== null ? `${f.price} $` : (f.priceLabel ?? 'Gratuit')}
                      </span>
                    </div>
                    {f.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {f.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
              {editing ? 'Modifier la formation' : 'Ajouter une formation'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Titre *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} style={{ ...inp, resize: 'vertical' as const }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp} placeholder="IA, Stratégie..." />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Format</label>
                  <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} style={inp}>
                    {['En ligne','Présentiel','Hybride','À votre rythme'].map(fmt => (
                      <option key={fmt} value={fmt}>{fmt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Dates (séparées par virgule)</label>
                <input value={form.dates} onChange={e => setForm(f => ({ ...f, dates: e.target.value }))} style={inp} placeholder="25 mars 2026, 10 avril 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Durée</label>
                  <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={inp} placeholder="2h, À votre rythme..." />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Prix ($)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inp} placeholder="0 = Gratuit" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tags (séparés par virgule)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={inp} placeholder="IA, Construction, RBQ" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fichier de la formation (PDF / image)</label>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                  onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 border-dashed transition-colors"
                  style={{ borderColor: uploadFile ? '#e85d2b' : 'var(--border)', color: uploadFile ? '#e85d2b' : 'var(--text-muted)', background: 'var(--bg-base)' }}>
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
                    <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} style={inp} placeholder="Ou coller une URL..." />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <label htmlFor="featured" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Formation vedette</label>
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
