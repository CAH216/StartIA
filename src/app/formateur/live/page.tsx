'use client';
/**
 * /formateur/live — Planifier une session live
 * Crée une session live avec date, heure, capacité et prix
 */

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useRouter } from 'next/navigation';
import {
  Radio, Calendar, Clock, Users, DollarSign, CheckCircle,
  AlertTriangle, Loader2, Plus, Link as LinkIcon,
} from 'lucide-react';

const CATEGORIES = ['ChatGPT & Prompt', 'Automatisation', 'Data & IA', 'Marketing IA', 'RH & IA', 'Finance & IA', 'Développement IA', 'Autre'];

export default function FormateurLivePage() {
  const router = useRouter();

  const [title,      setTitle]      = useState('');
  const [desc,       setDesc]       = useState('');
  const [category,   setCategory]   = useState('');
  const [date,       setDate]       = useState('');
  const [time,       setTime]       = useState('');
  const [duration,   setDuration]   = useState('60');
  const [capacity,   setCapacity]   = useState('20');
  const [price,      setPrice]      = useState('');
  const [meetLink,   setMeetLink]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const inp: React.CSSProperties = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', borderRadius: 12, padding: '10px 14px',
    fontSize: 14, width: '100%',
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setMsg({ type: 'err', text: 'Le titre est requis' }); return; }
    if (!date || !time) { setMsg({ type: 'err', text: 'La date et l\'heure sont requises' }); return; }
    if (!price || isNaN(Number(price))) { setMsg({ type: 'err', text: 'Prix invalide' }); return; }

    setLoading(true); setMsg(null);

    try {
      const fd = new FormData();
      fd.append('type', 'live');
      fd.append('title', title.trim());
      fd.append('description', desc.trim());
      fd.append('category', category);
      fd.append('price', price);
      fd.append('duration', `${duration} min`);
      fd.append('liveDate', `${date}T${time}:00`);
      fd.append('capacity', capacity);
      fd.append('meetLink', meetLink.trim());

      const res = await fetch('/api/formateur/formations', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur création');

      setMsg({ type: 'ok', text: 'Session live planifiée ! Les inscriptions sont ouvertes.' });
      setTimeout(() => router.push('/formateur/sessions'), 2000);
    } catch (err: unknown) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erreur inconnue' });
    } finally { setLoading(false); }
  }

  const startDateTime = date && time ? new Date(`${date}T${time}`) : null;
  const endDateTime   = startDateTime ? new Date(startDateTime.getTime() + Number(duration) * 60_000) : null;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(6,182,212,0.08)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.18)' }}>
            <Radio size={11}/> Session live
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Planifier une session live</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Organisez une formation en direct avec vos apprenants
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

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Infos session */}
          <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Informations de la session</h2>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Titre *</label>
              <input style={inp} placeholder="ex: Introduction à ChatGPT pour les débutants"
                value={title} onChange={e => setTitle(e.target.value)} maxLength={120}/>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }}
                placeholder="Ce que les participants vont apprendre..."
                value={desc} onChange={e => setDesc(e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
              <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">-- Choisir --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Date & heure */}
          <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Date & Heure</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar size={11} className="inline mr-1"/>Date *
                </label>
                <input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Clock size={11} className="inline mr-1"/>Heure *
                </label>
                <input type="time" style={inp} value={time} onChange={e => setTime(e.target.value)}/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Durée (minutes)
              </label>
              <select style={inp} value={duration} onChange={e => setDuration(e.target.value)}>
                {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            {startDateTime && endDateTime && (
              <p className="text-xs" style={{ color: '#06b6d4' }}>
                Session : {startDateTime.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} → {endDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Capacité + prix */}
          <div className="p-5 rounded-2xl space-y-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tarification & accès</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <DollarSign size={11} className="inline"/>Prix (CAD $) *
                </label>
                <input type="number" min="0" step="1" style={inp}
                  placeholder="79" value={price} onChange={e => setPrice(e.target.value)}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Users size={11} className="inline mr-0.5"/>Capacité max
                </label>
                <input type="number" min="1" max="500" step="1" style={inp}
                  value={capacity} onChange={e => setCapacity(e.target.value)}/>
              </div>
            </div>
            {price && !isNaN(Number(price)) && (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Votre part : <span className="font-bold" style={{ color: '#10b981' }}>{(Number(price) * 0.8).toFixed(0)} $ (80%)</span> · StratIA : {(Number(price) * 0.2).toFixed(0)} $ (20%)
              </p>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <LinkIcon size={11} className="inline mr-1"/>Lien de réunion (Google Meet, Zoom…)
              </label>
              <input type="url" style={inp} placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={meetLink} onChange={e => setMeetLink(e.target.value)}/>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Le lien sera envoyé uniquement aux participants qui se sont inscrits, 1h avant la session.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', boxShadow: '0 4px 20px rgba(6,182,212,0.35)' }}>
            {loading ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>}
            {loading ? 'Planification…' : 'Planifier la session live'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
