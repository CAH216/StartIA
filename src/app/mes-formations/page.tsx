'use client';
/**
 * /mes-formations — Espace formations achetées du client
 * Lecteur vidéo simulé (plein écran) + chat formateur (Pro uniquement)
 */

import { useEffect, useState, useRef } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import {
  Play, Pause, Maximize2, Minimize2, Radio,
  GraduationCap, Clock, User, ChevronRight, ShoppingBag,
  Crown, MessageCircle, Send, X, CheckCircle, Star, Eye, Users,
} from 'lucide-react';

/* ──────────────── TYPES ──────────────── */
interface Formation {
  id: string; title: string; description: string; duration: string;
  price: number; category: string; tags: string[]; featured: boolean;
  views: number; enrollments: number; rating: number;
  formateurName: string; formateurInitial: string; formateurColor: string;
  bannerGradient: string; type: 'VIDEO' | 'LIVE'; level: string;
  liveDate?: string; purchasedAt?: string;
}

interface ChatMsg { role: 'user' | 'formateur'; text: string; time: string }

/* ──────────────── CHAT PRO ──────────────── */
function ChatPanel({ formation }: { formation: Formation }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'formateur', text: `Bonjour ! Je suis ${formation.formateurName}. Je suis disponible pour répondre à vos questions sur "${formation.title}".`, time: 'maintenant' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  function send() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMsgs(m => [...m, { role: 'user', text: input.trim(), time: now }]);
    setInput('');
    setTimeout(() => setMsgs(m => [...m, {
      role: 'formateur',
      text: 'Merci pour votre question ! Je vous prépare une réponse détaillée. En attendant, consultez les ressources dans la formation.',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }]), 1400);
  }

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: formation.bannerGradient, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          {formation.formateurInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{formation.formateurName}</p>
          <p className="text-[10px] text-white/65">Formateur · répond sous 24h</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--bg-elevated)' }}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'formateur' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black mr-2 flex-shrink-0 mt-1"
                style={{ background: formation.formateurColor }}>
                {formation.formateurInitial}
              </div>
            )}
            <div className="max-w-[78%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed"
              style={m.role === 'user'
                ? { background: formation.formateurColor, color: '#fff', borderBottomRightRadius: 4 }
                : { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }}>
              {m.text}
              <span className="block text-[9px] mt-1 opacity-50">{m.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 flex-shrink-0"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Posez votre question…"
          className="flex-1 text-xs px-3 py-2.5 rounded-xl outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}/>
        <button onClick={send} disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 text-white flex-shrink-0"
          style={{ background: formation.formateurColor }}>
          <Send size={14}/>
        </button>
      </div>
    </div>
  );
}

/* ──────────────── LECTEUR VIDÉO ──────────────── */
function VideoPlayer({ formation, isPro, onClose }: {
  formation: Formation; isPro: boolean; onClose: () => void;
}) {
  const [playing,   setPlaying]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showChat,  setShowChat]  = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress(p => {
      if (p >= 100) { setPlaying(false); return 100; }
      return p + 0.25;
    }), 100);
    return () => clearInterval(id);
  }, [playing]);

  const elapsed = Math.floor((progress / 100) * parseInt(formation.duration));

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-[60] flex' : 'relative'}`}
      style={{ background: fullscreen ? '#000' : undefined }}>

      {/* ── Layout : vidéo + chat si Pro ── */}
      <div className={`${fullscreen ? 'flex-1 flex' : ''} ${showChat && isPro ? 'flex gap-0' : ''}`}
        style={{ height: fullscreen ? '100vh' : undefined }}>

        {/* Zone vidéo */}
        <div className={`relative flex flex-col ${showChat && isPro ? 'flex-1' : 'w-full'}`}
          style={{ background: '#000', minHeight: fullscreen ? '100vh' : 340 }}>

          {/* Fond + miniature */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ background: formation.bannerGradient }}>
            <p className="text-9xl font-black opacity-5 text-white select-none">{formation.formateurInitial}</p>
          </div>

          {/* Overlay bouton play */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {!playing && (
              <button onClick={() => setPlaying(true)}
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)' }}>
                <Play size={32} className="text-white ml-2"/>
              </button>
            )}
          </div>

          {/* Barre contrôles bas */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Barre progression cliquable */}
            <div className="h-1.5 w-full cursor-pointer group"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - r.left) / r.width) * 100); }}>
              <div className="h-full group-hover:h-2 transition-all relative"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#10b981,#06b6d4)' }}>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"/>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-3 px-4 py-2.5"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <button onClick={() => setPlaying(p => !p)}
                className="text-white hover:text-green-400 transition-colors">
                {playing ? <Pause size={18}/> : <Play size={18}/>}
              </button>

              <div className="flex-1 text-xs text-white/60">
                {elapsed ? `${elapsed} min regardées` : `0 min`} / {formation.duration}
                <span className="ml-2">· {Math.round(progress)}% visionné</span>
              </div>

              {/* Chat toggle (Pro) */}
              {isPro && (
                <button onClick={() => setShowChat(s => !s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                  style={{ background: showChat ? formation.formateurColor : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <MessageCircle size={13}/> Chat
                </button>
              )}

              {/* Plein écran */}
              <button onClick={() => setFullscreen(f => !f)}
                className="text-white/70 hover:text-white transition-colors">
                {fullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
              </button>

              {/* Fermer */}
              {!fullscreen && (
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                  <X size={16}/>
                </button>
              )}
              {fullscreen && (
                <button onClick={() => setFullscreen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={16}/>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel Chat Pro */}
        {showChat && isPro && (
          <div className="flex-shrink-0" style={{ width: fullscreen ? 360 : 320, background: 'var(--bg-surface)' }}>
            <ChatPanel formation={formation}/>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────── PAGE ──────────────── */
export default function MesFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [userPlan,   setUserPlan]   = useState('FREE');
  const [playing,    setPlaying]    = useState<Formation | null>(null);

  useEffect(() => {
    /* Lecture localStorage */
    try {
      const stored: Formation[] = JSON.parse(localStorage.getItem('mes-formations-data') || '[]');
      setFormations(stored);
    } catch {}
    /* Plan utilisateur */
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.plan) setUserPlan(d.plan); }).catch(() => {});
  }, []);

  const isPro = userPlan === 'PRO';

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.18)' }}>
              <GraduationCap size={11}/> Mes formations
            </div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              Mes formations
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {formations.length} formation{formations.length !== 1 ? 's' : ''} achetée{formations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <Link href="/pricing"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Crown size={13}/> Passer Pro
              </Link>
            )}
            <Link href="/formations"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
              <ShoppingBag size={14}/> Acheter une formation
            </Link>
          </div>
        </div>

        {/* Pro banner si pas Pro */}
        {!isPro && formations.length > 0 && (
          <div className="p-4 rounded-2xl flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.04))', border: '1px solid rgba(139,92,246,0.18)' }}>
            <Crown size={20} style={{ color: '#8b5cf6', flexShrink: 0 }}/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                Débloquez le chat avec vos formateurs
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Le chat en direct avec les formateurs est réservé aux membres Pro.
              </p>
            </div>
            <Link href="/pricing" className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
              Voir les plans
            </Link>
          </div>
        )}

        {/* ── LECTEUR EN COURS ── */}
        {playing && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: '#000' }}>
            <VideoPlayer formation={playing} isPro={isPro} onClose={() => setPlaying(null)}/>
          </div>
        )}

        {/* ── LISTE ── */}
        {formations.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <GraduationCap size={40} style={{ color: '#6366f1', opacity: 0.4 }}/>
            </div>
            <p className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              Aucune formation achetée
            </p>
            <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Explorez le catalogue pour trouver votre première formation IA et commencer à vous former.
            </p>
            <Link href="/formations"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
              Voir le catalogue <ChevronRight size={15}/>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {formations.map((f) => (
              <div key={f.id}
                className="rounded-2xl overflow-hidden transition-all hover:scale-[1.005]"
                style={{ background: 'var(--bg-surface)', border: playing?.id === f.id ? `2px solid ${f.formateurColor}` : '1px solid var(--border)' }}>
                <div className="flex items-stretch gap-0">

                  {/* Bannière colorée */}
                  <div className="w-28 sm:w-36 flex-shrink-0 flex items-center justify-center relative"
                    style={{ background: f.bannerGradient, minHeight: 100 }}>
                    <button onClick={() => setPlaying(playing?.id === f.id ? null : f)}
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.3)' }}>
                      {f.type === 'LIVE'
                        ? <Radio size={16} className="text-white"/>
                        : playing?.id === f.id
                          ? <Pause size={16} className="text-white"/>
                          : <Play size={16} className="text-white ml-0.5"/>}
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 text-white font-black text-2xl opacity-10 select-none">
                      {f.formateurInitial}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-base truncate" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
                      </div>
                      {playing?.id === f.id && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: f.formateurColor }}>
                          <Play size={9}/> En cours
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10}/>{f.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <User size={10}/>{f.formateurName}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Star size={10}/>{f.rating}/5
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {f.category}
                      </span>
                    </div>

                    {/* Actions bas */}
                    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <button
                        onClick={() => setPlaying(playing?.id === f.id ? null : f)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: playing?.id === f.id ? '#475569' : `linear-gradient(135deg, ${f.formateurColor}, #06b6d4)` }}>
                        {playing?.id === f.id ? <><Pause size={12}/>Pause</> : <><Play size={12}/>Regarder</>}
                      </button>

                      {isPro ? (
                        <button
                          onClick={() => { setPlaying(f); setTimeout(() => {}, 100); }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                          <MessageCircle size={12}/> Chat formateur
                        </button>
                      ) : (
                        <Link href="/pricing"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: 'rgba(139,92,246,0.05)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.15)' }}>
                          <Crown size={11}/> Chat (Pro)
                        </Link>
                      )}

                      <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle size={10} style={{ color: '#10b981' }}/> Accès illimité
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
