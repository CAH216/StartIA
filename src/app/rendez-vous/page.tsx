'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { loadCoachContext } from '@/lib/roi';
import { Video, Clock, CheckCircle2, User, Mail, Building2, MessageSquare, Zap, ArrowLeft, Loader2 } from 'lucide-react';

const TOPICS = ['Blocage sur ma roadmap','Choisir les bons outils IA','Stratégie IA globale','Automatisation d\'un processus','Former mon équipe','Autre'];
const SLOTS = ['Lundi 9 h','Lundi 14 h','Mardi 10 h','Mardi 15 h','Mercredi 9 h','Mercredi 13 h','Jeudi 10 h','Jeudi 15 h','Vendredi 9 h','Vendredi 11 h'];

interface Booking {
  id: string;
  topic: string;
  description: string | null;
  slot: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  employer?: { fullName: string | null; companyName: string | null };
}

interface F { topic: string; description: string; slot: string; }
const init: F = { topic:'', description:'', slot:'' };

export default function SessionPage() {
  const [form, setForm] = useState<F>(init);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<Partial<F>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    // 1. Load context for form pre-fill
    const ctx = loadCoachContext();
    if (ctx) {
      const summary = ctx.lastMessages.slice(0, 3).join('\n');
      setForm(f => ({
        ...f,
        topic: 'Blocage sur ma roadmap',
        description: 'Suite à ma session StratIA Coach :\n' + summary,
      }));
    }

    // 2. Load existing bookings
    fetch('/api/sessions/book')
      .then(res => res.ok ? res.json() : [])
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(e => console.error('Failed to load bookings', e))
      .finally(() => setLoadingBookings(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const e2: Partial<F> = {};
    if (!form.topic) e2.topic = 'Requis';
    if (!form.description.trim()) e2.description = 'Requis';
    if (!form.slot) e2.slot = 'Requis';
    setErr(e2);
    if (Object.keys(e2).length) return;

    setSubmitting(true); setSubmitErr('');
    try {
      const res = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: form.topic, description: form.description, slot: form.slot }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitErr(data.error || 'Erreur lors de la réservation'); return; }
      
      // Add new booking to list immediately
      setBookings(prev => [data, ...prev]);
      setDone(true);
    } catch {
      setSubmitErr('Erreur réseau, veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase = "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors";
  const inputSt = { background:'var(--bg-elevated)', borderColor:'var(--border)', color:'var(--text-primary)' } as React.CSSProperties;
  const errSt = { ...inputSt, borderColor:'#ef4444' };

  if (done) return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle2 size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-black mb-2" style={{ color:'var(--text-primary)' }}>Session confirmée !</h1>
        <p className="text-sm mb-8" style={{ color:'var(--text-secondary)' }}>
          Votre demande a été enregistrée. Un expert vous contactera pour confirmer le créneau.
        </p>
        <div className="rounded-2xl p-6 text-left space-y-4 mb-8" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
          <h2 className="font-bold text-sm" style={{ color:'var(--text-primary)' }}>Détails</h2>
          {[
            { icon:Clock,  label:'Durée',   val:'30 minutes' },
            { icon:Video,  label:'Format',  val:'Google Meet' },
            { icon:Zap,    label:'Créneau', val:form.slot },
            { icon:MessageSquare, label:'Sujet', val:form.topic },
          ].map(({ icon:Icon, label, val }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon size={14} className="text-blue-400 flex-shrink-0" />
              <span style={{ color:'var(--text-secondary)' }}>{label} —</span>
              <span className="font-medium" style={{ color:'var(--text-primary)' }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 text-sm text-left mb-8" style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)' }}>
          <p className="font-semibold text-blue-400 mb-2">Préparez votre session</p>
          <ul className="space-y-1" style={{ color:'var(--text-secondary)' }}>
            <li>▸ Notez les 2–3 blocages que vous voulez débloquer</li>
            <li>▸ Ayez accès à vos outils actuels si possible</li>
            <li>▸ Consultez votre Roadmap IA avant la session</li>
          </ul>
        </div>
        <button onClick={() => { setForm(init); setDone(false); setErr({}); }}
          className="flex items-center gap-2 text-sm mx-auto" style={{ color:'var(--text-secondary)' }}>
          <ArrowLeft size={14} /> Réserver une autre session
        </button>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Video size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color:'var(--text-primary)' }}>Réserver une session</h1>
              <p className="text-xs" style={{ color:'var(--text-secondary)' }}>Un expert IA vous accompagne en 30 min</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            {[{icon:Clock,t:'30 minutes'},{icon:Video,t:'Appel vidéo'},{icon:User,t:'Expert IA'}].map(({icon:Icon,t}) => (
              <div key={t} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-secondary)' }}>
                <Icon size={11} className="text-blue-400" /> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="rounded-2xl p-7 space-y-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium mb-2.5" style={{ color:'var(--text-secondary)' }}>Sujet de la session</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button type="button" key={t} onClick={() => setForm({...form, topic:t})}
                  className="text-sm px-3 py-2 rounded-lg border transition-all"
                  style={{ borderColor: form.topic===t ? '#3b82f6' : 'var(--border)', background: form.topic===t ? 'rgba(59,130,246,0.15)' : 'var(--bg-elevated)', color: form.topic===t ? '#60a5fa' : 'var(--text-secondary)', fontWeight: form.topic===t ? 600 : 400 }}>
                  {t}
                </button>
              ))}
            </div>
            {err.topic && <p className="text-xs text-red-400 mt-1">{err.topic}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--text-secondary)' }}>
              <MessageSquare size={12} className="inline mr-1" />Décrivez votre situation
            </label>
            <textarea className={`${inputBase} resize-none`} style={err.description ? errSt : inputSt}
              rows={3} placeholder="Plus vous êtes précis, plus la session sera productive..."
              value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
            {err.description && <p className="text-xs text-red-400 mt-1">{err.description}</p>}
          </div>

          {/* Slots */}
          <div>
            <label className="block text-sm font-medium mb-2.5" style={{ color:'var(--text-secondary)' }}>Créneau préféré <span style={{ color:'var(--text-muted)' }}>(heure de Montréal)</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SLOTS.map(s => (
                <button type="button" key={s} onClick={() => setForm({...form, slot:s})}
                  className="py-2.5 px-2 rounded-xl text-sm text-center border transition-all"
                  style={{ borderColor: form.slot===s ? '#3b82f6' : 'var(--border)', background: form.slot===s ? 'rgba(59,130,246,0.15)' : 'var(--bg-elevated)', color: form.slot===s ? '#60a5fa' : 'var(--text-secondary)', fontWeight: form.slot===s ? 600 : 400 }}>
                  {s}
                </button>
              ))}
            </div>
            {err.slot && <p className="text-xs text-red-400 mt-1">{err.slot}</p>}
          </div>

          {submitErr && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {submitErr}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin" />Envoi...</> : 'Confirmer la session'}
          </button>
          <p className="text-xs text-center" style={{ color:'var(--text-muted)' }}>L&apos;expert confirmera votre créneau par message</p>
        </form>

        {/* --- Liste des demandes --- */}
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Vos demandes</h2>
          {loadingBookings ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 rounded-xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm text-muted-foreground">Aucune demande en cours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="p-4 rounded-xl border flex items-start justify-between gap-4"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {b.status === 'PENDING' ? 'EN ATTENTE' : b.status === 'CONFIRMED' ? 'CONFIRMÉ' : b.status === 'CANCELLED' ? 'ANNULÉ' : b.status}
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{b.topic}</span>
                    </div>
                    <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{b.description || 'Aucune description'}</p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1"><Clock size={12} /> {b.slot}</span>
                      <span className="flex items-center gap-1"><Building2 size={12} /> {new Date(b.createdAt).toLocaleDateString('fr-CA')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}


