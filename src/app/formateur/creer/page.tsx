'use client';
/**
 * /formateur/creer — Créer une formation (vidéo ou live)
 * Upload sécurisé vers Supabase Storage
 * Seuls les formateurs peuvent uploader (vérifié côté API)
 */

import { useRef, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useRouter } from 'next/navigation';
import {
  Upload, Video, Radio, CheckCircle, AlertTriangle,
  Loader2, X, Plus, DollarSign, Clock, Tag,
} from 'lucide-react';

type FormType = 'video' | 'live';

const CATEGORIES = ['Intelligence Artificielle', 'ChatGPT', 'Automatisation', 'Data & Analyse', 'Marketing IA', 'RH & IA', 'Finance & IA', 'Santé & IA', 'Autre'];

export default function CreerFormationPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType]         = useState<FormType>('video');
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice]       = useState('');
  const [duration, setDuration] = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const inp: React.CSSProperties = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', borderRadius: 12, padding: '10px 14px',
    fontSize: 14, width: '100%',
  };

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'];
    if (!allowed.includes(f.type)) { setMsg({ type: 'err', text: 'Format non supporté (MP4, WebM, MOV)' }); return; }
    if (f.size > 2 * 1024 * 1024 * 1024) { setMsg({ type: 'err', text: 'Fichier trop volumineux (2 Go maximum)' }); return; }
    setFile(f); setMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setMsg({ type: 'err', text: 'Le titre est requis' }); return; }
    if (type === 'video' && !file) { setMsg({ type: 'err', text: 'Veuillez sélectionner une vidéo' }); return; }
    if (!price || isNaN(Number(price)) || Number(price) < 0) { setMsg({ type: 'err', text: 'Prix invalide' }); return; }

    setUploading(true); setProgress(0); setMsg(null);

    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', title.trim());
      fd.append('description', desc.trim());
      fd.append('category', category);
      fd.append('price', price);
      fd.append('duration', duration);
      if (file) fd.append('video', file);

      // Upload avec suivi progression (XMLHttpRequest pour le progress)
      if (type === 'video' && file) {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
          };
          xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(data.error || 'Erreur upload'));
          };
          xhr.onerror = () => reject(new Error('Erreur réseau'));
          xhr.open('POST', '/api/formateur/formations');
          xhr.send(fd);
        });
      } else {
        const res = await fetch('/api/formateur/formations', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur création');
      }

      setMsg({ type: 'ok', text: 'Formation créée avec succès ! En attente de validation.' });
      setTimeout(() => router.push('/formateur'), 2000);
    } catch (err: unknown) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur inconnue' });
    } finally { setUploading(false); }
  }

  const sizeLabel = file ? `${(file.size / 1024 / 1024).toFixed(0)} Mo` : '';

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Créer une formation</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Publiez une formation vidéo ou planifiez une session live
          </p>
        </div>

        {/* Flash */}
        {msg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: msg.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${msg.type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: msg.type === 'ok' ? '#10b981' : '#f87171',
            }}>
            {msg.type === 'ok' ? <CheckCircle size={15}/> : <AlertTriangle size={15}/>}
            {msg.text}
          </div>
        )}

        {/* Type toggle */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'var(--bg-elevated)' }}>
          {([['video', 'Formation vidéo', Video], ['live', 'Session live', Radio]] as const).map(([t, label, Icon]) => (
            <button key={t} onClick={() => setType(t)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: type === t ? 'var(--bg-surface)' : 'transparent',
                color: type === t ? (t === 'video' ? '#6366f1' : '#06b6d4') : 'var(--text-muted)',
                boxShadow: type === t ? 'var(--shadow-sm)' : 'none',
              }}>
              <Icon size={16}/> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Titre */}
          <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Informations de base</h2>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Titre *</label>
              <input style={inp} placeholder="ex: Maîtriser ChatGPT pour les professionnels"
                value={title} onChange={e => setTitle(e.target.value)} maxLength={120}/>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }}
                placeholder="Décrivez ce que les apprenants vont apprendre..."
                value={desc} onChange={e => setDesc(e.target.value)} maxLength={2000}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
                <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Durée estimée
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}/>
                  <input style={{ ...inp, paddingLeft: 34 }} placeholder="ex: 2h30" value={duration} onChange={e => setDuration(e.target.value)}/>
                </div>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tarification</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Prix (CAD $) *</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}/>
                  <input type="number" min="0" step="1" style={{ ...inp, paddingLeft: 34 }}
                    placeholder="99" value={price} onChange={e => setPrice(e.target.value)}/>
                </div>
              </div>
              <div className="flex flex-col justify-end pb-1">
                {price && !isNaN(Number(price)) && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Votre part : <span className="font-bold" style={{ color: '#10b981' }}>
                      {(Number(price) * 0.7).toFixed(0)} $ {type === 'live' ? '(80%)' : '(70%)'}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Vidéo upload */}
          {type === 'video' && (
            <div className="p-5 rounded-2xl space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Fichier vidéo</h2>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center py-8 rounded-2xl border-2 border-dashed transition-opacity hover:opacity-70"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {file ? (
                  <><Video size={28} className="mb-2" style={{ color: '#6366f1' }}/>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                    <p className="text-xs mt-1">{sizeLabel}</p>
                  </>
                ) : (
                  <><Upload size={28} className="mb-2"/>
                    <p className="text-sm font-semibold">Cliquer pour sélectionner une vidéo</p>
                    <p className="text-xs mt-1">MP4, WebM ou MOV · Max 2 Go</p>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/mov,video/quicktime"
                className="hidden" onChange={handleFile}/>
              {file && (
                <button type="button" onClick={() => setFile(null)}
                  className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <X size={12}/> Supprimer le fichier
                </button>
              )}
              {/* Progress bar */}
              {uploading && progress > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Upload en cours…</span><span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#06b6d4)', borderRadius: 99, transition: 'width 0.3s' }}/>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981' }}>
                <CheckCircle size={13} className="flex-shrink-0 mt-0.5"/>
                Votre vidéo est stockée de manière sécurisée sur Supabase Storage. Les clients ne peuvent accéder qu'aux formations qu'ils ont achetées.
              </div>
            </div>
          )}

          {/* Tags optionnels */}
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} style={{ color: 'var(--text-muted)' }}/>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tags (optionnel)</p>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              Après validation, un employer StratIA vérifiera votre formation avant publication.
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
            {uploading ? <><Loader2 size={16} className="animate-spin"/> Envoi en cours… ({progress}%)</> :
              <><Plus size={16}/> {type === 'video' ? 'Publier la formation' : 'Créer la session'}</>}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
