'use client';
/**
 * /formateur/sessions — Mes sessions (formations vendues + sessions live)
 * Remplace l'ancien lien /rendez-vous (sessions utilisateur)
 */

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import {
  Video, Radio, Users, Clock, CheckCircle, AlertCircle,
  Loader2, Plus, Eye, DollarSign, Calendar,
} from 'lucide-react';

interface Formation {
  id: string; title: string; type: string; status: string;
  price: number; category: string | null; duration: string | null;
  createdAt: string; _count: { enrollments: number };
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'En attente',  color: '#f59e0b' },
  APPROVED:  { label: 'Approuvée',   color: '#10b981' },
  REJECTED:  { label: 'Refusée',     color: '#ef4444' },
  PUBLISHED: { label: 'Publiée',     color: '#6366f1' },
};

export default function FormateurSessionsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<'all' | 'VIDEO' | 'LIVE'>('all');

  useEffect(() => {
    fetch('/api/formateur/formations')
      .then(r => r.ok ? r.json() : [])
      .then(setFormations)
      .catch(() => setFormations([]))
      .finally(() => setLoading(false));
  }, []);

  const list = filter === 'all' ? formations : formations.filter(f => f.type === filter);

  const totalEarnings = formations
    .filter(f => f.status === 'PUBLISHED')
    .reduce((acc, f) => acc + f.price * f._count.enrollments * 0.7, 0);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Mes formations & sessions</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Gérez vos formations publiées et suivez leur performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/formateur/creer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
              <Plus size={15}/> Nouvelle formation
            </Link>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total formations', value: formations.length, icon: Video, color: '#6366f1' },
            { label: 'Apprenants inscrits', value: formations.reduce((a, f) => a + f._count.enrollments, 0), icon: Users, color: '#8b5cf6' },
            { label: 'Revenus estimés', value: `${totalEarnings.toFixed(0)} $`, icon: DollarSign, color: '#10b981' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={15} style={{ color }}/>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              </div>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtre */}
        <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-elevated)' }}>
          {([['all','Tout'], ['VIDEO','Vidéos'], ['LIVE','Lives']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === v ? 'var(--bg-surface)' : 'transparent',
                color: filter === v ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: '#6366f1' }}/>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Video size={28} style={{ color: '#6366f1' }}/>
            </div>
            <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Aucune formation
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Publiez votre première formation pour commencer à gagner
            </p>
            <Link href="/formateur/creer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Plus size={14}/> Créer une formation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(f => {
              const st = STATUS_LABEL[f.status] ?? { label: f.status, color: 'var(--text-muted)' };
              return (
                <div key={f.id} className="p-4 rounded-2xl flex items-center gap-4"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  {/* Icon type */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: f.type === 'LIVE' ? 'rgba(6,182,212,0.1)' : 'rgba(99,102,241,0.1)' }}>
                    {f.type === 'LIVE' ? <Radio size={18} style={{ color: '#06b6d4' }}/> : <Video size={18} style={{ color: '#6366f1' }}/>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {f.category && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.category}</span>}
                      {f.duration  && <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-muted)' }}><Clock size={10}/>{f.duration}</span>}
                      <span className="flex items-center gap=0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Calendar size={10} className="mr-0.5"/>{new Date(f.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{f.price} $</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Users size={9} className="inline mr-0.5"/>{f._count.enrollments} inscrits
                    </p>
                  </div>
                  {/* Status */}
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}30` }}>
                    {st.label}
                  </span>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {f.status === 'PENDING'   && <span title="En attente de validation"><AlertCircle size={14} style={{ color: '#f59e0b' }}/></span>}
                    {f.status === 'PUBLISHED' && <span title="Publiée"><CheckCircle size={14} style={{ color: '#10b981' }}/></span>}
                    <button className="p-1.5 rounded-lg transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }} title="Voir">
                      <Eye size={14}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
