'use client';
/**
 * /formations — Catalogue des formations StratIA
 * Cards sans prix (pour ne pas effrayer), modal détail avec prix + achat + chat formateur Pro
 */

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Play, Lock, Users, Clock, Star, Filter, GraduationCap, Zap,
  X, Crown, MessageCircle, Send, Eye, ChevronRight, CheckCircle,
  Radio, Video, Search,
} from 'lucide-react';

/* ──────────────── DONNÉES EXEMPLES ──────────────── */
interface Formation {
  id: string; title: string; description: string; duration: string;
  price: number; category: string; tags: string[]; featured: boolean;
  views: number; enrollments: number; rating: number;
  formateurName: string; formateurInitial: string; formateurColor: string;
  bannerGradient: string; type: 'VIDEO' | 'LIVE'; level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  liveDate?: string; isPro?: boolean; // si true : réservé abonnement Pro
}

const MOCK_FORMATIONS: Formation[] = [
  {
    id: 'f001', title: 'Maîtriser ChatGPT pour les professionnels', type: 'VIDEO',
    description: 'Apprenez à utiliser ChatGPT pour automatiser vos tâches quotidiennes, rédiger des emails, créer des rapports et gagner 2h par jour. Formation 100% pratique avec cas réels.',
    duration: '3h 20min', price: 149, category: 'ChatGPT & Prompt', level: 'Débutant',
    tags: ['ChatGPT', 'Productivité', 'Rédaction'], featured: true,
    views: 4821, enrollments: 312, rating: 4.9,
    formateurName: 'Marc-Antoine Roy', formateurInitial: 'M', formateurColor: '#6366f1',
    bannerGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
  },
  {
    id: 'f002', title: 'Automatiser sa facturation avec l\'IA', type: 'VIDEO',
    description: 'Découvrez comment automatiser la création de factures, relances clients et rapports financiers grâce à des outils IA. Économisez jusqu\'à 5h de travail par semaine.',
    duration: '2h 45min', price: 99, category: 'Automatisation', level: 'Intermédiaire',
    tags: ['Automatisation', 'Finance', 'Make', 'Zapier'],
    views: 3204, enrollments: 187, rating: 4.7, featured: false,
    formateurName: 'Sophie Beaudet', formateurInitial: 'S', formateurColor: '#8b5cf6',
    bannerGradient: 'linear-gradient(135deg, #0c1a2e 0%, #0f3460 50%, #0891b2 100%)',
  },
  {
    id: 'f003', title: 'IA pour les Ressources Humaines', type: 'VIDEO',
    description: 'Optimisez le recrutement, la rédaction de fiches de poste, les évaluations annuelles et la formation interne grâce à l\'intelligence artificielle.',
    duration: '4h 10min', price: 179, category: 'RH & IA', level: 'Intermédiaire',
    tags: ['RH', 'Recrutement', 'ChatGPT', 'HR'],
    views: 2890, enrollments: 143, rating: 4.8, featured: false, isPro: true,
    formateurName: 'Fatoumata Diallo', formateurInitial: 'F', formateurColor: '#ec4899',
    bannerGradient: 'linear-gradient(135deg, #1a0a2e 0%, #4a1055 50%, #9d174d 100%)',
  },
  {
    id: 'f007', title: 'Session live — ChatGPT pour Dirigeants', type: 'LIVE',
    description: 'Session interactive en direct avec partage d\'écran. Posez vos questions en temps réel et repartez avec un plan d\'action personnalisé pour votre entreprise.',
    duration: '90 min', price: 299, category: 'ChatGPT & Prompt', level: 'Avancé',
    tags: ['Live', 'Dirigeants', 'Stratégie', 'ChatGPT'], featured: true,
    liveDate: '15 mars 2026 — 14h00',
    views: 1540, enrollments: 28, rating: 5.0,
    formateurName: 'Marc-Antoine Roy', formateurInitial: 'M', formateurColor: '#6366f1',
    bannerGradient: 'linear-gradient(135deg, #0a2e1e 0%, #065f46 50%, #059669 100%)',
  },
  {
    id: 'f004', title: 'Data & IA : analyser vos données sans coder', type: 'VIDEO',
    description: 'Utilisez l\'IA pour analyser vos tableaux Excel, créer des visualisations automatiques et générer des rapports en quelques secondes. Aucune connaissance en programmation requise.',
    duration: '5h 30min', price: 249, category: 'Data & Analyse', level: 'Débutant',
    tags: ['Excel', 'Data', 'Analyse', 'No-code'], featured: false, isPro: true,
    views: 5632, enrollments: 421, rating: 4.9,
    formateurName: 'Julien Thibodeau', formateurInitial: 'J', formateurColor: '#f59e0b',
    bannerGradient: 'linear-gradient(135deg, #1c1300 0%, #78350f 50%, #d97706 100%)',
  },
  {
    id: 'f005', title: 'Marketing Digital avec l\'IA : doublez vos résultats', type: 'VIDEO',
    description: 'Créez du contenu, gérez vos réseaux sociaux et optimisez vos campagnes publicitaires avec l\'IA. De la stratégie à l\'exécution, tout ce qu\'il faut pour dominer votre marché.',
    duration: '3h 55min', price: 129, category: 'Marketing IA', level: 'Intermédiaire',
    tags: ['Marketing', 'Réseaux sociaux', 'Contenu', 'Publicité'],
    views: 3891, enrollments: 267, rating: 4.6, featured: false,
    formateurName: 'Amélie Fontaine', formateurInitial: 'A', formateurColor: '#10b981',
    bannerGradient: 'linear-gradient(135deg, #0a1f0a 0%, #064e3b 50%, #10b981 100%)',
  },
];

const CATEGORIES = ['Toutes', 'ChatGPT & Prompt', 'Automatisation', 'RH & IA', 'Data & Analyse', 'Marketing IA'];
const LEVEL_COLOR: Record<string, string> = { Débutant: '#10b981', Intermédiaire: '#f59e0b', Avancé: '#ef4444' };


/* ──────────────── MODAL DÉTAIL ──────────────── */
import { useRouter } from 'next/navigation';

function FormationModal({
  f, userPlan, onClose
}: {
  f: Formation; userPlan: string; onClose: () => void;
}) {
  const router = useRouter();
  const [purchasing, setPurchasing] = useState(false);
  const isPro = userPlan === 'PRO';
  const alreadyPurchased = (() => {
    try { return (JSON.parse(localStorage.getItem('mes-formations-data') || '[]') as Formation[]).some(x => x.id === f.id); }
    catch { return false; }
  })();

  async function handlePurchase() {
    setPurchasing(true);
    await new Promise(r => setTimeout(r, 1400));
    /* Sauvegarde dans localStorage avec toutes les données de la formation */
    try {
      const stored: Formation[] = JSON.parse(localStorage.getItem('mes-formations-data') || '[]');
      if (!stored.some(x => x.id === f.id)) {
        stored.push({ ...f, purchasedAt: new Date().toISOString() } as Formation & { purchasedAt: string });
        localStorage.setItem('mes-formations-data', JSON.stringify(stored));
      }
    } catch {}
    router.push('/mes-formations');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '90dvh' }}
        onClick={e => e.stopPropagation()}>

        {/* Fermer */}
        <button onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
          <X size={16}/>
        </button>

        {/* Bannière verrouillée */}
        <div className="relative aspect-video flex-shrink-0 flex items-center justify-center" style={{ background: f.bannerGradient }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', border: '2px solid rgba(255,255,255,0.2)' }}>
            <Lock size={24} className="text-white opacity-70"/>
          </div>
          {f.featured && (
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-white"
              style={{ background: 'rgba(245,158,11,0.9)' }}>
              <Star size={10} fill="white"/> Vedette
            </span>
          )}
          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ background: 'rgba(0,0,0,0.6)' }}>
            <Clock size={10} className="inline mr-1"/>{f.duration}
          </span>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Titre + badges */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {f.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${LEVEL_COLOR[f.level]}15`, color: LEVEL_COLOR[f.level] }}>
                {f.level}
              </span>
              {f.type === 'LIVE' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
                  <Radio size={9}/> Live
                </span>
              )}
            </div>
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{f.title}</h2>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
          </div>

          {/* Formateur */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
              style={{ background: f.formateurColor }}>
              {f.formateurInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{f.formateurName}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span><Eye size={10} className="inline mr-0.5"/>{f.views.toLocaleString('fr-FR')} vues</span>
                <span><Users size={10} className="inline mr-0.5"/>{f.enrollments} inscrits</span>
                <span><Star size={10} className="inline mr-0.5"/>{f.rating}/5</span>
              </div>
            </div>
            {isPro && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-bold"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Crown size={10}/> Chat Pro inclus
              </span>
            )}
          </div>

          {/* Si déjà acheté */}
          {alreadyPurchased && (
            <div className="p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle size={18} style={{ color: '#10b981' }}/>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#10b981' }}>Vous avez déjà cette formation !</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Retrouvez-la dans Mes formations pour la regarder.</p>
              </div>
              <a href="/mes-formations" className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: '#10b981' }}>
                <Play size={12} className="inline mr-1"/>Regarder
              </a>
            </div>
          )}

          {/* Prix + Achat */}
          {!alreadyPurchased && !isPro && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Prix de la formation</p>
                  <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {f.price} $<span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>CAD</span>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Accès illimité · Certificat inclus</p>
                </div>
                <div className="text-right">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>ou avec</p>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <Crown size={10} className="inline mr-1"/>Abonnement Pro
                  </span>
                </div>
              </div>

              <button onClick={handlePurchase} disabled={purchasing}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${f.formateurColor}, #06b6d4)`, boxShadow: `0 4px 20px ${f.formateurColor}40` }}>
                {purchasing
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Traitement…</>
                  : <><Play size={15}/> Acheter et regarder — {f.price} $</>}
              </button>

              {/* Upsell Pro */}
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.06))', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} style={{ color: '#8b5cf6' }}/>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Mieux avec l&apos;Abonnement Pro</p>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <strong>-40% sur toutes les formations</strong>, <strong>1 formation offerte/mois</strong> et chat direct avec vos formateurs.
                </p>
                <a href="/pricing" className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                  <span>Voir les plans Pro</span><ChevronRight size={15}/>
                </a>
              </div>
            </div>
          )}

          {/* Pro : bouton accès direct */}
          {isPro && !alreadyPurchased && (
            <button onClick={() => router.push('/mes-formations')}
              className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 4px 20px rgba(139,92,246,0.35)' }}>
              <Play size={15}/> Regarder (inclus dans votre Pro)
            </button>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {f.tags.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-md"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── CARD FORMATION ──────────────── */
function FormationCard({ f, onClick }: { f: Formation; onClick: () => void }) {
  return (
    <div className="group rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-200"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      onClick={onClick}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}>

      {/* Bannière colorée */}
      <div className="relative aspect-video flex items-center justify-center"
        style={{ background: f.bannerGradient }}>
        {/* Icône play central */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.25)' }}>
          {f.type === 'LIVE' ? <Radio size={18} className="text-white"/> : <Play size={18} className="text-white ml-0.5"/>}
        </div>

        {/* Initial formateur en grand en fond */}
        <span className="absolute right-4 bottom-2 text-6xl font-black opacity-10 text-white select-none">
          {f.formateurInitial}
        </span>

        {/* Badges top */}
        {f.featured && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
            style={{ background: 'rgba(245,158,11,0.85)' }}>
            <Star size={9} fill="white"/> Vedette
          </span>
        )}
        {f.type === 'LIVE' && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
            style={{ background: 'rgba(6,182,212,0.85)' }}>
            <Radio size={9}/> Live
          </span>
        )}
        {f.isPro && !f.type && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
            style={{ background: 'rgba(139,92,246,0.85)' }}>
            <Crown size={9} className="inline mr-0.5"/>Pro
          </span>
        )}

        {/* Durée bas gauche */}
        <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <Clock size={9} className="inline mr-0.5"/>{f.duration}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            {f.category}
          </span>
          <span className="text-[10px] font-semibold"
            style={{ color: LEVEL_COLOR[f.level] }}>
            {f.level}
          </span>
        </div>

        <h3 className="font-bold text-sm leading-snug mb-2 flex-1" style={{ color: 'var(--text-primary)' }}>
          {f.title}
        </h3>

        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
          {f.description}
        </p>

        {/* Formateur + stats */}
        <div className="flex items-center gap-2 mt-auto pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
            style={{ background: f.formateurColor }}>
            {f.formateurInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
              {f.formateurName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span><Eye size={9} className="inline mr-0.5"/>{f.views > 1000 ? `${(f.views/1000).toFixed(1)}k` : f.views}</span>
            <span><Users size={9} className="inline mr-0.5"/>{f.enrollments}</span>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── PAGE ──────────────── */
const LEVEL_FILTERS = ['Tous niveaux', 'Débutant', 'Intermédiaire', 'Avancé'] as const;

export default function FormationsPage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [selected,    setSelected]    = useState<Formation | null>(null);
  const [catFilter,   setCatFilter]   = useState('Toutes');
  const [levelFilter, setLevelFilter] = useState<typeof LEVEL_FILTERS[number]>('Tous niveaux');
  const [typeFilter,  setTypeFilter]  = useState<'all' | 'VIDEO' | 'LIVE'>('all');
  const [search,      setSearch]      = useState('');
  const [userPlan,    setUserPlan]    = useState('FREE');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.plan) setUserPlan(d.plan); });
    /* Auto-ouvre le modal si ?open=ID est dans l'URL (depuis parcours/chatbot) */
    const openId = new URLSearchParams(window.location.search).get('open');
    if (openId) {
      const f = MOCK_FORMATIONS.find(f => f.id === openId);
      if (f) setSelected(f);
    }
  }, []);

  const visible = MOCK_FORMATIONS.filter(f => {
    if (catFilter !== 'Toutes' && f.category !== catFilter) return false;
    if (levelFilter !== 'Tous niveaux' && f.level !== levelFilter) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.formateurName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.18)' }}>
              <GraduationCap size={11}/> Catalogue
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              Formations StratIA
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {MOCK_FORMATIONS.length} formations pour maîtriser l&apos;IA dans votre métier
            </p>
          </div>
          {userPlan !== 'PRO' && (
            <a href="/pricing"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}>
              <Crown size={14}/> Passer Pro — tout inclus
            </a>
          )}
        </div>

        {/* Bannière Pro (si pas Pro) */}
        {userPlan !== 'PRO' && (
          <div className="p-4 rounded-2xl flex flex-wrap items-center gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.06))', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.15)' }}>
              <Zap size={18} style={{ color: '#8b5cf6' }}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                Abonnement Pro — −40% sur toutes les formations
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                1 formation offerte chaque mois, chat avec les formateurs, sessions live prioritaires. Dès 79 $/mois.
              </p>
            </div>
            <a href="/pricing"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
              style={{ background: '#8b5cf6' }}>
              Voir les plans
            </a>
          </div>
        )}

        {/* Search + filtres */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une formation, un formateur…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}/>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={13} style={{ color: 'var(--text-muted)' }}/>
            <div className="tabs-scroll flex-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={catFilter === c
                    ? { background: '#6366f1', color: '#fff' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {([['all', 'Tout'], ['VIDEO', 'Vidéo'], ['LIVE', 'Live']] as const).map(([v, label]) => (
                <button key={v} onClick={() => setTypeFilter(v)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  style={typeFilter === v
                    ? { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '2px solid var(--border-strong)' }
                    : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Niveau */}
          <div className="flex gap-1.5 flex-wrap">
            {LEVEL_FILTERS.map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={levelFilter === l
                  ? { background: l === 'Tous niveaux' ? 'var(--text-primary)' : LEVEL_COLOR[l], color: '#fff' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Résultats */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {visible.length} formation{visible.length !== 1 ? 's' : ''} trouvée{visible.length !== 1 ? 's' : ''}
        </p>

        {/* Grille */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <GraduationCap size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }}/>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Aucune formation trouvée</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Essayez de changer les filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(f => (
              <FormationCard key={f.id} f={f} onClick={() => setSelected(f)}/>
            ))}
          </div>
        )}

        {/* CTA bas de page */}
        {userPlan !== 'PRO' && (
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Crown size={28} className="mx-auto mb-3" style={{ color: '#a78bfa' }}/>
            <h2 className="text-lg font-black text-white mb-1">Passez au Pro</h2>
            <p className="text-sm text-white/70 mb-4 max-w-md mx-auto">
              -40% sur toutes les formations, 1 formation offerte chaque mois, chat avec vos formateurs
              et accès prioritaire aux sessions live.
            </p>
            <a href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
              <Zap size={15}/> Voir les plans Pro
            </a>
          </div>
        )}
      </div>

      {/* Modal détail */}
      {selected && (
        <FormationModal f={selected} userPlan={userPlan} onClose={() => setSelected(null)}/>
      )}
    </AppShell>
  );
}
