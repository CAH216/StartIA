'use client';

import AppShell from '@/components/AppShell';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bot, Send, RefreshCw, Paperclip, X,
  ExternalLink, CheckSquare, Square,
  Clock, Zap, Calendar, ChevronDown, ChevronUp, AlertCircle,
  TrendingUp, Youtube, MessageSquare, Trash2, Plus, Menu,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import Link from 'next/link';
import {
  loadProfile, saveProfile, hasProfile, profileToContext,
  SECTORS, HOURLY_RATE_OPTIONS, type UserProfile,
} from '@/lib/profile';
import { recordRoiEntry, saveCoachContext } from '@/lib/roi';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface RoiData { hoursPerWeek: number; monthlySavings: number; }

interface ActionCard {
  tool: string; url: string; tagline: string;
  steps: string[]; timeEstimate: string; difficulty: string;
  roi?: RoiData;
}

interface AiMessage {
  role: 'user' | 'ai';
  text: string;
  quickReplies?: string[];
  actionCard?: ActionCard | null;
  needsExpert?: boolean;
  streaming?: boolean;
  _raw?: string;
}

interface SessionMeta {
  id: string;
  title: string | null;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const JSON_RULE = `

IMPORTANT — Réponds UNIQUEMENT en JSON valide. Format :
{
  "message": "Texte en markdown. 200 mots max.",
  "quickReplies": ["Option 1 ?","Option 2 ?","Option 3 ?"],
  "actionCard": { "tool":"...","url":"https://...","tagline":"...","steps":["..."],"timeEstimate":"...","difficulty":"Facile","roi":{"hoursPerWeek":3,"monthlySavings":480} },
  "needsExpert": false
}
Règles : quickReplies 2-3 options courtes. actionCard seulement si outil à installer. Réponds en français.`;

const DEFAULT_SYSTEM = `Tu es StratIA Coach, expert en implémentation IA. Guide opérationnel pas à pas.
Jamais de phrases vagues. Donne l'outil exact, l'URL, les étapes numérotées, exemple concret.
Pose 1-2 questions ciblées si contexte manquant. Action faisable dans 10 min. needsExpert si bloqué.`;

const TUTORIAL_URL = (tool: string) =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(tool + ' tutorial français 2024');

const DIFF_COLOR: Record<string, string> = {
  Facile: '#22c55e', Intermédiaire: '#f59e0b', Avancé: '#ef4444',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STORIES
// ─────────────────────────────────────────────────────────────────────────────
const STORIES = [
  { sector: '🏗️ Construction', before: '3h par devis de soumission', after: 'Automatisé avec Zapier + ChatGPT', gain: '+1 200$/sem', prompt: 'Comment automatiser mes soumissions de construction comme dans ce cas ?' },
  { sector: '🍽️ Restauration', before: '8h/semaine à gérer les réservations', after: 'Cal.com + Make.com en 2h de setup', gain: '-960$/mois de pertes', prompt: 'Comment automatiser les réservations de mon restaurant ?' },
  { sector: '💼 Services', before: '2h/jour à répondre aux emails clients', after: 'Réponses IA en 5 min avec ChatGPT', gain: '+600$/semaine récupérés', prompt: 'Comment automatiser mes réponses emails clients avec l\'IA ?' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function renderMd(text: string) {
  const safeText = typeof text === 'string' ? text : '';
  const lines = safeText.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ');
        const content  = isBullet ? trimmed.slice(2) : line;
        const parts    = content.split(/\*\*(.+?)\*\*/g);
        const rendered = parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j}>{p}</strong> : <span key={j}>{p}</span>
        );
        return (
          <span key={i} className={isBullet ? 'flex gap-1.5 items-start' : 'block'}>
            {isBullet && <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>}
            <span>{rendered}</span>
            {!isBullet && i < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTIAL JSON MSG EXTRACTOR
// ─────────────────────────────────────────────────────────────────────────────
function extractStreamingMsg(partial: string): string {
  const marker = '"message"';
  const mi = partial.indexOf(marker);
  if (mi < 0) return '';
  const q = partial.indexOf('"', mi + marker.length + 1);
  if (q < 0) return '';
  const raw = partial.slice(q + 1);
  // Walk char by char, handle escape sequences
  let result = '';
  let i = 0;
  const BACKSLASH = 92;
  const QUOTE = 34;
  while (i < raw.length) {
    const code = raw.charCodeAt(i);
    if (code === BACKSLASH && i + 1 < raw.length) {
      const next = raw.charCodeAt(i + 1);
      if (next === 110) { result += '\n'; i += 2; }       // \n
      else if (next === 116) { result += '\t'; i += 2; }  // \t
      else if (next === QUOTE) { result += '"'; i += 2; } // \"
      else { result += raw[i + 1]; i += 2; }
    } else if (code === QUOTE) {
      break;
    } else {
      result += raw[i];
      i++;
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION CARD
// ─────────────────────────────────────────────────────────────────────────────
function ActionCardWidget({ card, hourlyRate }: { card: ActionCard; hourlyRate: number }) {
  const steps = Array.isArray(card?.steps) ? card.steps : [];
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));

  // Sync completion state if steps change
  useEffect(() => {
    setDone(Array(steps.length).fill(false));
  }, [steps.length]);

  const completed = done.filter(Boolean).length;
  const pct = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;

  useEffect(() => {
    if (steps.length > 0 && completed === steps.length && card.roi) {
      recordRoiEntry({
        toolName: card.tool,
        hoursPerWeek: card.roi.hoursPerWeek,
        monthlySavings: card.roi.monthlySavings || Math.round(card.roi.hoursPerWeek * 4.3 * hourlyRate),
      });
    }
  }, [completed, steps.length, card, hourlyRate]);

  if (!card || steps.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden bg-[var(--bg-muted)] border border-blue-500/20">
      {/* Header */}
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Zap size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-[var(--text-primary)]">{card.tool}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: (DIFF_COLOR[card.difficulty] ?? '#6366f1') + '22', color: DIFF_COLOR[card.difficulty] ?? '#6366f1' }}>
              {card.difficulty}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              <Clock size={10} /> {card.timeEstimate}
            </span>
            {card.roi && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                <TrendingUp size={9} />
                {card.roi.hoursPerWeek}h/sem
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5 text-[var(--text-secondary)]">{card.tagline}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <span className="text-xs font-medium" style={{ color: completed === steps.length ? '#22c55e' : 'var(--text-muted)' }}>
            {completed}/{steps.length}
          </span>
          {open ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
        </div>
      </button>

      {/* Progress */}
      {pct > 0 && (
        <div className="px-4 pb-1">
          <div className="h-1 rounded-full bg-[var(--border)]">
            <div className="h-1 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: pct + '%' }} />
          </div>
        </div>
      )}

      {/* Steps */}
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {steps.map((step, i) => (
            <button key={i}
              onClick={() => setDone(d => { const n = [...d]; n[i] = !n[i]; return n; })}
              className={`w-full flex items-start gap-2.5 py-2 px-3 rounded-lg text-left transition-all border ${
                done[i] 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-blue-500/30'
              }`}>
              {done[i]
                ? <CheckSquare size={15} className="flex-shrink-0 mt-0.5 text-green-500" />
                : <Square size={15} className="flex-shrink-0 mt-0.5 text-[var(--text-muted)]" />}
              <span className={`text-xs leading-relaxed ${
                done[i] ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
              }`}>
                <span className="font-semibold text-blue-500 mr-1">{i + 1}.</span>{step}
              </span>
            </button>
          ))}
          
          <div className="flex flex-wrap gap-3 mt-2 pt-1 border-t border-[var(--border)] pt-3">
            <a href={card.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline">
              <ExternalLink size={11} /> Ouvrir {card.tool}
            </a>
            <a href={TUTORIAL_URL(card.tool)} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-red-500 hover:underline">
              <Youtube size={11} /> Tutoriel vidéo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT CTA
// ─────────────────────────────────────────────────────────────────────────────
function ExpertCTA({ inline }: { inline?: boolean }) {
  return (
    <div className="mt-3 p-4 rounded-xl flex items-start gap-3 bg-purple-500/5 border border-purple-500/20">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <AlertCircle size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--text-primary)]">
          {inline ? 'Vous progressez !' : 'Cette étape nécessite un expert'}
        </p>
        <p className="text-xs mt-0.5 text-[var(--text-secondary)]">
          {inline
            ? 'Un spécialiste StratIA peut accélérer votre implémentation en session privée.'
            : 'Un expert vous guide en session 1-à-1 pour débloquer cette étape en 30 min.'}
        </p>
        <Link href="/rendez-vous"
          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity shadow-sm">
          <Calendar size={11} /> Réserver une session →
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE WIZARD
// ─────────────────────────────────────────────────────────────────────────────
type WizardStep = 'sector' | 'rate' | null;

function ProfileWizard({ onComplete }: { onComplete: (p: Partial<UserProfile>) => void }) {
  const [step, setStep]     = useState<WizardStep>('sector');
  const [sector, setSector] = useState('');

  if (step === 'sector') return (
    <div className="rounded-2xl p-5 space-y-4 bg-[var(--bg-muted)] border border-[var(--border)] max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--text-primary)]">📋 Personnalisez votre expérience</p>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/40 dark:text-blue-300">30 sec</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">Quel est votre secteur d'activité ?</p>
      <div className="flex flex-wrap gap-2">
        {SECTORS.map(s => (
          <button key={s} onClick={() => { setSector(s); setStep('rate'); }}
            className="text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-blue-500 hover:text-blue-500 transition-all">
            {s}
          </button>
        ))}
      </div>
      <button onClick={() => onComplete({})} className="text-xs text-[var(--text-muted)] hover:underline">
        Je préfère ne pas répondre
      </button>
    </div>
  );

  if (step === 'rate') return (
    <div className="rounded-2xl p-5 space-y-4 bg-[var(--bg-muted)] border border-[var(--border)] max-w-lg mx-auto">
      <div className="flex items-center justify-between">
         <p className="text-sm font-bold text-[var(--text-primary)]">💰 Taux horaire moyen</p>
         <span className="text-[10px] text-[var(--text-muted)]">pour calculer le ROI</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {HOURLY_RATE_OPTIONS.map(r => (
          <button key={r.value} onClick={() => onComplete({ sector, hourlyRate: r.value })}
            className="text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-blue-500 hover:text-blue-500 transition-all">
            {r.label}
          </button>
        ))}
      </div>
      <button onClick={() => onComplete({ sector })} className="text-xs text-[var(--text-muted)] hover:underline">
        Je ne sais pas (par défaut 60$/h)
      </button>
    </div>
  );

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN INTERNAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function AssistantInner() {
  const params     = useSearchParams();
  const taskParam  = params.get('task')  ?? '';
  const descParam  = params.get('desc')  ?? '';
  const monthParam = params.get('month') ?? '';
  const scoreParam = params.get('score') ?? '';
  const levelParam = params.get('level') ?? '';
  const hasContext = !!taskParam;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  
  const endRef = useRef<HTMLDivElement>(null);
  
  // 1. Initial Load: Profile + Sessions
  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (!hasProfile() && !hasContext) setShowWizard(true);

    fetch('/api/user/sessions')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setSessions(Array.isArray(data) ? data : []);
        setLoadingSessions(false);
      })
      .catch(() => setLoadingSessions(false));
  }, [hasContext]);

  // 2. Load Messages when Active Session Changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    fetch(`/api/user/sessions/${activeSessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages && Array.isArray(data.messages)) {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           const mapped = data.messages.map((m: any) => ({
            ...m,
            text: m.text || m.content || '',
          }));
          setMessages(mapped);
        }
      })
      .catch(err => console.error('Failed to load session', err))
      .finally(() => setLoading(false));
      
    // Close mobile menu on selection
    setMobileMenuOpen(false);
  }, [activeSessionId]);

  // 3. Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const profileCtx = profile ? profileToContext(profile) : '';
  const hourlyRate = profile?.hourlyRate ?? 60;

  const systemOverride = hasContext
    ? `Tu es StratIA Coach, expert en implémentation IA. GUIDE OPÉRATIONNEL pas à pas.
CONTEXTE ROADMAP :
- Mois ${monthParam} — Tâche : "${taskParam}${descParam ? ' — ' + descParam : ''}"
- Niveau IA : ${levelParam} — Score ${scoreParam}/100
${profileCtx}
MISSION : Guide concret pas à pas pour cette tâche. Outil exact + URL + étapes + exemple.
1ère étape faisable maintenant. needsExpert si bloqué.` + JSON_RULE
    : DEFAULT_SYSTEM + profileCtx + JSON_RULE;

  const welcomeText = hasContext
    ? `Bonjour ! Contexte reçu : **Mois ${monthParam}** — ${taskParam}.\n\nJe prépare votre guide d'implémentation pas à pas...`
    : ""; // Handled by UI when empty

  // Auto-send context message if task param is present
  useEffect(() => {
    if (hasContext && messages.length === 0 && !activeSessionId && !loading && !loadingSessions) {
      send(welcomeText, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasContext, messages.length, activeSessionId, loadingSessions]);

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ───────────────────────────────────────────────────────────────────────────
  
  async function createSession(initialMsgs: AiMessage[]) {
    try {
      const title = initialMsgs[0]?.text.slice(0, 40) || 'Nouvelle conversation';
      const res = await fetch('/api/user/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, messages: initialMsgs }),
      });
      const newSession = await res.json();
      if (newSession.id) {
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      }
    } catch (e) {
      console.error('Failed to create session', e);
    }
  }

  async function updateSession(id: string, msgs: AiMessage[]) {
    fetch(`/api/user/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs }),
    }).catch(e => console.error('Failed to update session', e));
  }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Supprimer cette conversation ?')) return;
    
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
    }
    fetch(`/api/user/sessions/${id}`, { method: 'DELETE' });
  }

  async function send(txt: string = input, isAuto = false) {
    if ((!txt.trim() && !isAuto) || loading) return;
    
    const userMsg: AiMessage = { role: 'user', text: txt };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
          systemOverride,
        }),
      });

      if (!res.ok || !res.body) throw new Error(res.statusText);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedText = '';
      
      setMessages(prev => [...prev, { role: 'ai', text: '', streaming: true }]);

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.token) {
                  streamedText += data.token;
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.role === 'ai') {
                      return [...prev.slice(0, -1), { 
                        ...last, 
                        text: extractStreamingMsg(streamedText) || (streamedText.includes('"message":') ? '' : '...') 
                      }];
                    }
                    return prev;
                  });
                } else if (data.done) {
                  const finalMsg: AiMessage = {
                    role: 'ai',
                    text: data.message || streamedText,
                    quickReplies: data.quickReplies,
                    actionCard: data.actionCard,
                    needsExpert: data.needsExpert,
                    streaming: false
                  };
                  
                  const finalHistory = [...newHistory, finalMsg];
                  setMessages(finalHistory);
                  
                  if (activeSessionId) {
                    updateSession(activeSessionId, finalHistory);
                  } else {
                    createSession(finalHistory);
                  }
                  
                  const last3 = finalHistory.slice(-3).map(m => m.text);
                  const tools = data.actionCard ? [data.actionCard.tool] : [];
                  saveCoachContext({ lastMessages: last3, toolsFound: tools });
                }
              } catch (e) {
                console.error('Stream parse error', e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => prev.filter(m => !m.streaming));
    } finally {
      setLoading(false);
    }
  }

  function handleWizardComplete(p: Partial<UserProfile>) {
    const combined = { ...profile, ...p } as UserProfile;
    saveProfile(combined);
    setProfile(combined);
    setShowWizard(false);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UI COMPONENTS
  // ───────────────────────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border)]">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
         <span className="font-bold text-sm text-[var(--text-primary)]">Contexte</span>
         {desktopSidebarOpen && (
           <button onClick={() => setDesktopSidebarOpen(false)} className="md:block hidden p-1.5 hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-muted)]">
             <PanelLeftClose size={16} />
           </button>
         )}
      </div>
      <div className="px-3 pt-3">
        <button onClick={() => { setActiveSessionId(null); setMessages([]); }}
          className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all shadow-sm">
          <Plus size={16} /> Nouvelle discussion
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingSessions ? (
          <div className="flex flex-col gap-2 p-2">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-[var(--bg-muted)] animate-pulse rounded-lg"/>)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 px-4 text-[var(--text-muted)]">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs">Aucune conversation</p>
          </div>
        ) : (
          sessions.map(s => (
            <div key={s.id} onClick={() => setActiveSessionId(s.id)}
              className={`group flex items-center gap-3 p-3 rounded-lg text-sm cursor-pointer transition-all ${
                activeSessionId === s.id 
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-transparent'
              }`}>
              <MessageSquare size={14} className={activeSessionId === s.id ? 'text-blue-500' : 'text-[var(--text-muted)]'} />
              <div className="flex-1 min-w-0">
                <p className="truncate">{s.title || 'Discussion'}</p>
                <p className="text-[10px] opacity-60 truncate">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={(e) => deleteSession(s.id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Session Info Footer */}
      <div className="p-3 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] text-center">
        {sessions.length} conversations • Taux: {hourlyRate}$/h
      </div>
    </div>
  );

  return (
    <div className="relative flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-surface)]">
      
      {/* Desktop Sidebar (Collapsible) */}
      <aside className={`hidden md:block border-r border-[var(--border)] transition-all duration-300 ease-in-out ${
         desktopSidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'
      }`}>
        <div className="w-[280px] h-full">
           <SidebarContent />
        </div>
      </aside>

      {/* Button to reopen sidebar */}
      {!desktopSidebarOpen && (
        <button 
          onClick={() => setDesktopSidebarOpen(true)}
          className="hidden md:flex absolute top-4 left-4 z-10 p-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-sm hover:bg-[var(--bg-muted)] text-[var(--text-muted)] transition-all">
          <PanelLeftOpen size={20} />
        </button>
      )}

      {/* Mobile Sidebar (Overlay) */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" style={{ zIndex: 100 }}>
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
           <aside className="relative w-[85%] max-w-[300px] h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <SidebarContent />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white backdrop-blur-md md:hidden">
                <X size={16} />
              </button>
           </aside>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-surface)] md:hidden">
            <div className="flex items-center gap-3">
                <button className="p-2 -ml-2 hover:bg-[var(--bg-elevated)] rounded-full transition-colors" onClick={() => setMobileMenuOpen(true)}>
                  <Menu size={20} className="text-[var(--text-primary)]" />
                </button>
                <span className="font-semibold text-sm text-[var(--text-primary)]">StratIA Coach</span>
            </div>
            <div className="w-8"></div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.length === 0 && !loading && !activeSessionId ? (
              <div className="mt-8 space-y-8 animate-in fade-in zoom-in duration-500">
                {showWizard ? (
                  <ProfileWizard onComplete={handleWizardComplete} />
                ) : (
                  <>
                    <div className="text-center space-y-5">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 mb-6">
                        <Bot size={40} className="text-white" />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                        StratIA Coach
                      </h1>
                      <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                        Expert en intégration IA pour les PME. <br/>
                        Des solutions concrètes, chiffrées et immédiates.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      {STORIES.map((s, i) => (
                        <button key={i} onClick={() => setInput(s.prompt)}
                          className="text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-md">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-2">{s.sector}</div>
                          <div className="text-sm font-medium mb-2 line-clamp-2 text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">{s.before}</div>
                          <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                            <TrendingUp size={10} /> {s.gain}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''} group animate-in slide-in-from-bottom-2 duration-300`}>
                  {m.role === 'ai' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  
                  <div className={`space-y-2 max-w-[85%] sm:max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-none'
                    }`}>
                      {m.role === 'ai' && m.streaming && !m.text ? (
                         <div className="flex gap-1 py-1">
                           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                           <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                         </div>
                      ) : (
                        renderMd(m.text)
                      )}
                    </div>

                    {m.role === 'ai' && !m.streaming && (
                      <div className="space-y-2 w-full animate-in fade-in duration-500 slide-in-from-top-2">
                        {m.actionCard && (
                          <div className="w-full max-w-md">
                            <ActionCardWidget card={m.actionCard} hourlyRate={hourlyRate} />
                          </div>
                        )}
                        {m.quickReplies && m.quickReplies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {m.quickReplies.map((qr, j) => (
                              <button key={j} onClick={() => send(qr)}
                                className="text-xs px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
                                {qr}
                              </button>
                            ))}
                          </div>
                        )}
                        {m.needsExpert && <ExpertCTA inline />}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border)]">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <button className="p-3 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] rounded-xl transition-colors hidden sm:block" title="Joindre un fichier">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 relative bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Posez votre question..."
                className="w-full pl-4 pr-12 py-3.5 bg-transparent resize-none focus:outline-none text-sm max-h-32 text-[var(--text-primary)]"
                rows={1}
                disabled={loading}
              />
              <button 
                onClick={() => send()} 
                disabled={!input.trim() || loading}
                className="absolute right-2 bottom-2 p-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-all shadow-sm">
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center mt-3 text-[var(--text-muted)] opacity-70">
            StratIA peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function AssistantPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><RefreshCw className="animate-spin text-blue-500"/></div>}>
        <AssistantInner />
      </Suspense>
    </AppShell>
  );
}
