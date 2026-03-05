"""
Writes 3 large TypeScript files for StratIA features:
- api/chat/route.ts  (streaming SSE + ROI)
- assistant/page.tsx (streaming + profile wizard + ROI + success stories)
- dashboard/page.tsx (ROI tracker + nudge + profile view)
"""
import pathlib

BASE = pathlib.Path(r"c:\Users\Malado Sidibe\OneDrive\Bureau\BatimatProject\Tutorat2.0\batimiatia\src")

# ─────────────────────────────────────────────────────────────────────────────
# 1. api/chat/route.ts  — Streaming SSE
# ─────────────────────────────────────────────────────────────────────────────
ROUTE = r"""import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es StratIA Coach, expert en implémentation IA pour les entrepreneurs. Tu es un GUIDE OPÉRATIONNEL pas à pas, jamais un consultant théorique.

RÈGLES ABSOLUES :
1. Jamais de phrases vagues ("explorez les options", "plusieurs outils existent"). TU DONNES l'outil exact.
2. Toujours : outil nommé + URL + étapes numérotées + exemple adapté au secteur.
3. Pose 1-2 questions ciblées si tu manques de contexte (secteur, logiciels, budget).
4. Chaque réponse = action faisable dans les 10 prochaines minutes.
5. Si trop complexe ou utilisateur bloqué : needsExpert: true.

PROFIL : Si un profil client est fourni dans le contexte, adapte tes réponses en conséquence.

IMPORTANT — Réponds UNIQUEMENT en JSON valide. Format strict :
{
  "message": "Texte principal en markdown (**gras**, - listes, sauts de ligne). 200 mots max.",
  "quickReplies": ["Option courte 1 ?", "Option courte 2 ?", "Option courte 3 ?"],
  "actionCard": {
    "tool": "Nom exact de l'outil",
    "url": "https://url-directe.com",
    "tagline": "Description en 6 mots max",
    "steps": ["Étape 1 concrète", "Étape 2 concrète", "Étape 3 concrète"],
    "timeEstimate": "20 min",
    "difficulty": "Facile",
    "roi": { "hoursPerWeek": 3, "monthlySavings": 480 }
  },
  "needsExpert": false
}

Règles JSON :
- "quickReplies" : 2-3 options courtes (moins de 8 mots chacune).
- "actionCard" : inclure SEULEMENT si tu recommandes un outil à installer/configurer.
  - "roi.hoursPerWeek" : heures hebdomadaires économisées (estimation réaliste).
  - "roi.monthlySavings" : économies mensuelles en dollars (basé sur 60$/h si taux inconnu).
- Réponds toujours en français.`;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ActionCard {
  tool: string; url: string; tagline: string;
  steps: string[]; timeEstimate: string; difficulty: string;
  roi?: { hoursPerWeek: number; monthlySavings: number };
}

interface StructuredReply {
  message: string;
  quickReplies?: string[];
  actionCard?: ActionCard;
  needsExpert?: boolean;
}

type ApiMessage = { role: 'user' | 'assistant' | 'system'; content: string };

// ─────────────────────────────────────────────────────────────────────────────
// JSON EXTRACTION (tolerant — finds first { ... })
// ─────────────────────────────────────────────────────────────────────────────
function extractJSON(raw: string): StructuredReply | null {
  const start = raw.indexOf('{');
  const end   = raw.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(raw.slice(start, end + 1)) as StructuredReply; }
  catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat  — returns SSE stream
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, systemOverride } = await req.json() as {
      messages: ApiMessage[];
      systemOverride?: string;
    };

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      const errData = { done: true, message: 'Clé GROQ_API_KEY manquante dans .env.local.', quickReplies: [], actionCard: null, needsExpert: false };
      return new Response('data: ' + JSON.stringify(errData) + '\n\n', {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    }

    const groq = new Groq({ apiKey: groqKey });
    const groqStream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemOverride ?? SYSTEM_PROMPT },
        ...messages.filter(m => m.role !== 'system'),
      ],
      max_tokens: 900,
      temperature: 0.65,
      stream: true,
    });

    const encoder  = new TextEncoder();
    let   fullText = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of groqStream) {
            const token = chunk.choices[0]?.delta?.content ?? '';
            if (token) {
              fullText += token;
              controller.enqueue(encoder.encode('data: ' + JSON.stringify({ token }) + '\n\n'));
            }
          }
          // Send final structured response
          const structured = extractJSON(fullText);
          const final: Record<string, unknown> = structured?.message
            ? { done: true, ...structured }
            : { done: true, message: fullText, quickReplies: [], actionCard: null, needsExpert: false };
          controller.enqueue(encoder.encode('data: ' + JSON.stringify(final) + '\n\n'));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Erreur IA';
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ done: true, message: msg, quickReplies: [], actionCard: null, needsExpert: false }) + '\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const errData = { done: true, message: 'Erreur serveur: ' + msg, quickReplies: [], actionCard: null, needsExpert: false };
    return new Response('data: ' + JSON.stringify(errData) + '\n\n', {
      status: 500,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 2. assistant/page.tsx — Full featured coach UI
# ─────────────────────────────────────────────────────────────────────────────
ASSISTANT = r"""'use client';

import AppShell from '@/components/AppShell';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bot, Send, User, RefreshCw, Sparkles, Paperclip, X,
  Map, ChevronLeft, ExternalLink, CheckSquare, Square,
  Clock, Zap, Calendar, ChevronDown, ChevronUp, AlertCircle,
  TrendingUp, Youtube, Star,
} from 'lucide-react';
import Link from 'next/link';
import {
  loadProfile, saveProfile, hasProfile, profileToContext,
  SECTORS, HOURLY_RATE_OPTIONS, type UserProfile,
} from '@/lib/profile';
import { recordRoiEntry, saveCoachContext, touchActivity, fmt$ } from '@/lib/roi';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ApiMessage { role: 'user' | 'assistant'; content: string; }

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

interface AttachedFile { name: string; content: string; }

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

// Tutorial links — YouTube search queries by tool name
const TUTORIAL_URL = (tool: string) =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(tool + ' tutorial français 2024');

const DIFF_COLOR: Record<string, string> = {
  Facile: '#22c55e', Intermédiaire: '#f59e0b', Avancé: '#ef4444',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STORIES — shown in starter section
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
  const lines = text.split('\n');
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
// Partial JSON message extractor (for streaming)
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
// ACTION CARD — checkable step guide + ROI + tutorial link
// ─────────────────────────────────────────────────────────────────────────────
function ActionCardWidget({ card, hourlyRate }: { card: ActionCard; hourlyRate: number }) {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<boolean[]>(card.steps.map(() => false));
  const completed = done.filter(Boolean).length;
  const pct = Math.round((completed / card.steps.length) * 100);

  // When all steps done, record ROI
  useEffect(() => {
    if (completed === card.steps.length && card.roi) {
      recordRoiEntry({
        toolName: card.tool,
        hoursPerWeek: card.roi.hoursPerWeek,
        monthlySavings: card.roi.monthlySavings || Math.round(card.roi.hoursPerWeek * 4.3 * hourlyRate),
      });
    }
  }, [completed, card, hourlyRate]);

  return (
    <div className="mt-3 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}>

      {/* Header */}
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{card.tool}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: (DIFF_COLOR[card.difficulty] ?? '#6366f1') + '22', color: DIFF_COLOR[card.difficulty] ?? '#6366f1' }}>
              {card.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock size={10} /> {card.timeEstimate}
            </span>
            {/* ROI pill */}
            {card.roi && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <TrendingUp size={9} />
                {card.roi.hoursPerWeek}h/sem · {fmt$(card.roi.monthlySavings)}/mois
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.tagline}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <span className="text-xs font-medium" style={{ color: completed === card.steps.length ? '#22c55e' : 'var(--text-muted)' }}>
            {completed}/{card.steps.length}
          </span>
          {open ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      {/* Progress bar */}
      {pct > 0 && (
        <div className="px-4 pb-1">
          <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
            <div className="h-1 rounded-full transition-all duration-500"
              style={{ width: pct + '%', background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' }} />
          </div>
        </div>
      )}

      {/* Steps */}
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {card.steps.map((step, i) => (
            <button key={i}
              onClick={() => setDone(d => { const n = [...d]; n[i] = !n[i]; return n; })}
              className="w-full flex items-start gap-2.5 py-2 px-3 rounded-lg text-left transition-all"
              style={{
                background: done[i] ? 'rgba(34,197,94,0.06)' : 'var(--bg-elevated)',
                border: '1px solid ' + (done[i] ? 'rgba(34,197,94,0.2)' : 'var(--border)'),
              }}>
              {done[i]
                ? <CheckSquare size={15} className="flex-shrink-0 mt-0.5 text-green-400" />
                : <Square size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />}
              <span className="text-xs leading-relaxed"
                style={{ color: done[i] ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done[i] ? 'line-through' : 'none' }}>
                <span className="font-semibold text-blue-400 mr-1">{i + 1}.</span>{step}
              </span>
            </button>
          ))}

          {/* Links row */}
          <div className="flex flex-wrap gap-3 mt-2 pt-1">
            <a href={card.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
              <ExternalLink size={11} /> Ouvrir {card.tool}
            </a>
            <a href={TUTORIAL_URL(card.tool)} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline"
              style={{ color: '#f87171' }}>
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
    <div className="mt-3 p-4 rounded-xl flex items-start gap-3"
      style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center flex-shrink-0">
        <AlertCircle size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {inline ? 'Vous progressez !' : 'Cette étape nécessite un expert'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {inline
            ? 'Un spécialiste StratIA peut accélérer votre implémentation en session privée.'
            : 'Un expert vous guide en session 1-à-1 pour débloquer cette étape en 30 min.'}
        </p>
        <Link href="/rendez-vous"
          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}>
          <Calendar size={11} /> Réserver une session →
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE WIZARD — shown on first visit
// ─────────────────────────────────────────────────────────────────────────────
type WizardStep = 'sector' | 'rate' | null;

function ProfileWizard({ onComplete }: { onComplete: (p: Partial<UserProfile>) => void }) {
  const [step, setStep]     = useState<WizardStep>('sector');
  const [sector, setSector] = useState('');

  if (step === 'sector') return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        📋 Personnalisez votre expérience <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>— 30 secondes</span>
      </p>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Quel est votre secteur d'activité ?</p>
      <div className="flex flex-wrap gap-2">
        {SECTORS.map(s => (
          <button key={s} onClick={() => { setSector(s); setStep('rate'); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:border-blue-500/40"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
            {s}
          </button>
        ))}
      </div>
      <button onClick={() => onComplete({})} className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Passer →
      </button>
    </div>
  );

  if (step === 'rate') return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        <span className="text-blue-400">✓ {sector}</span> — Votre taux horaire ?
      </p>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Utilisé pour calculer vos économies réelles
      </p>
      <div className="flex flex-wrap gap-2">
        {HOURLY_RATE_OPTIONS.map(o => (
          <button key={o.label} onClick={() => onComplete({ sector, hourlyRate: o.value })}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:border-blue-500/40"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
            {o.label}
          </button>
        ))}
      </div>
      <button onClick={() => onComplete({ sector })} className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Ignorer →
      </button>
    </div>
  );

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
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

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (!hasProfile() && !hasContext) setShowWizard(true);
  }, [hasContext]);

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
    : "Bonjour ! Je suis votre **StratIA Coach**.\n\nContrairement à un moteur de recherche générique, je vous guide directement — outil exact, étapes concrètes, économies calculées.\n\nDécrivez votre situation :";

  const [api, setApi]       = useState<ApiMessage[]>([]);
  const [msgs, setMsgs]     = useState<AiMessage[]>([{ role: 'ai', text: welcomeText }]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const [file, setFile]     = useState<AttachedFile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const sentRef   = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  useEffect(() => {
    if (hasContext && !sentRef.current && !showWizard) {
      sentRef.current = true;
      const autoMsg = `Je travaille sur ma roadmap — Mois ${monthParam}, tâche : "${taskParam}${descParam ? ' — ' + descParam : ''}". Niveau : ${levelParam} (${scoreParam}/100). Guide concret pas à pas : outils exacts, installation, première action maintenant.`;
      sendMsg(autoMsg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWizard]);

  function handleWizardComplete(partial: Partial<UserProfile>) {
    if (Object.keys(partial).length > 0) {
      const saved = saveProfile(partial);
      setProfile(saved);
    }
    setShowWizard(false);
    if (hasContext && !sentRef.current) {
      sentRef.current = true;
      setTimeout(() => {
        const autoMsg = `Je travaille sur ma roadmap — Mois ${monthParam}, tâche : "${taskParam}". Niveau : ${levelParam} (${scoreParam}/100). Guide pas à pas stp.`;
        sendMsg(autoMsg);
      }, 200);
    }
  }

  async function sendMsg(text: string) {
    if (!text.trim() || typing) return;
    setInput('');
    touchActivity();

    let fullContent = text;
    if (file) {
      const truncated = file.content.length > 8000
        ? file.content.slice(0, 8000) + '\n...[tronqué]'
        : file.content;
      fullContent = '[Fichier : "' + file.name + '"]\n\n' + truncated + '\n\n---\n\n' + text;
      setFile(null);
    }

    const withUser = [...msgs, { role: 'user' as const, text }];
    const streamPlaceholder: AiMessage = { role: 'ai', text: '', streaming: true, _raw: '' };
    setMsgs([...withUser, streamPlaceholder]);

    const newApi: ApiMessage[] = [...api, { role: 'user', content: fullContent }];
    setApi(newApi);
    setTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApi, systemOverride }),
      });

      if (!res.body) throw new Error('No stream body');
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (evt.done) {
              const reply = (evt.message as string) ?? '';
              setApi(p => [...p, { role: 'assistant', content: reply }]);
              setMsgs(p => [...p.slice(0, -1), {
                role: 'ai', text: reply,
                quickReplies: (evt.quickReplies as string[]) ?? [],
                actionCard:   (evt.actionCard  as ActionCard | null) ?? null,
                needsExpert:  (evt.needsExpert as boolean) ?? false,
                streaming: false,
              }]);
              // Save context for session pre-fill
              saveCoachContext({
                lastTask: taskParam || 'Conversation générale',
                lastMessages: [...withUser.slice(-3).map(m => m.role + ': ' + m.text.slice(0, 100)), 'ai: ' + reply.slice(0, 100)],
              });
            } else if (typeof evt.token === 'string') {
              setMsgs(p => {
                const last = p[p.length - 1];
                if (!last?.streaming) return p;
                const newRaw = (last._raw ?? '') + evt.token;
                const displayed = extractStreamingMsg(newRaw);
                return [...p.slice(0, -1), { ...last, text: displayed || '...', _raw: newRaw }];
              });
            }
          } catch { /* skip parse errors */ }
        }
      }
    } catch {
      setMsgs(p => {
        const withoutStream = p[p.length - 1]?.streaming ? p.slice(0, -1) : p;
        return [...withoutStream, { role: 'ai', text: 'Erreur de connexion. Réessayez.' }];
      });
    } finally {
      setTyping(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setFile({ name: f.name, content: (ev.target?.result as string) ?? '' });
    reader.readAsText(f);
    e.target.value = '';
  }

  function reset() {
    setApi([]); setFile(null); sentRef.current = false;
    setMsgs([{ role: 'ai', text: welcomeText }]);
    if (hasContext) {
      sentRef.current = true;
      setTimeout(() => sendMsg('Je reprends ma roadmap — Mois ' + monthParam + ', tâche : "' + taskParam + '". Niveau : ' + levelParam + ' (' + scoreParam + '/100). Guide pas à pas stp.'), 100);
    }
  }

  const lastMsg = msgs[msgs.length - 1];
  const aiCount = msgs.filter(m => m.role === 'ai').length;
  const showExpertBanner = aiCount >= 5 && lastMsg?.role === 'ai' && !lastMsg?.needsExpert && !lastMsg?.streaming;
  const showStarters = !hasContext && msgs.length === 1 && !showWizard;

  return (
    <AppShell>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 0px)', maxHeight: '100vh' }}>

        {/* ── HEADER ── */}
        <div className="flex-shrink-0 px-4 py-3 sm:px-6" style={{ borderBottom: '1px solid var(--border)' }}>
          {hasContext && (
            <div className="flex items-center gap-2 mb-3 py-2 px-3 rounded-xl flex-wrap"
              style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Map size={13} className="text-blue-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-blue-400">Roadmap · Mois {monthParam}</span>
              <span className="text-xs font-medium truncate max-w-[180px] sm:max-w-xs" style={{ color: 'var(--text-primary)' }}>— {taskParam}</span>
              <Link href="/roadmap" className="ml-auto flex items-center gap-1 text-xs hover:underline flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={11} /> Retour
              </Link>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Bot size={17} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>StratIA Coach</p>
              <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block flex-shrink-0" />
                <span className="truncate">
                  En ligne · Implémentation pas à pas
                  {profile?.sector ? ' · ' + profile.sector : ''}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/rendez-vous"
                className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Calendar size={11} /> Expert
              </Link>
              {msgs.length > 1 && (
                <button onClick={reset}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
                  <RefreshCw size={11} /> Nouveau
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 sm:px-5">

          {/* Profile wizard */}
          {showWizard && <ProfileWizard onComplete={handleWizardComplete} />}

          {msgs.map((msg, i) => (
            <div key={i} className={'flex gap-2.5 ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}>
              <div className={'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ' +
                (msg.role === 'ai' ? 'bg-gradient-to-br from-blue-600 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-blue-600')}>
                {msg.role === 'ai' ? <Bot size={13} className="text-white" /> : <User size={13} className="text-white" />}
              </div>

              <div style={{ maxWidth: 'min(88%, 520px)' }}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <div className="text-sm leading-relaxed space-y-0.5">
                    {renderMd(msg.text)}
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-3.5 rounded-sm animate-pulse ml-0.5" style={{ background: 'var(--text-secondary)', verticalAlign: 'middle' }} />
                    )}
                  </div>
                </div>

                {/* Action card */}
                {!msg.streaming && msg.actionCard && (
                  <ActionCardWidget card={msg.actionCard} hourlyRate={hourlyRate} />
                )}

                {/* Expert CTA */}
                {!msg.streaming && msg.needsExpert && <ExpertCTA />}

                {/* Quick replies — last AI message only */}
                {msg.role === 'ai' && !msg.streaming && msg.quickReplies && msg.quickReplies.length > 0
                  && i === msgs.length - 1 && !typing && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.quickReplies.map((qr, qi) => (
                      <button key={qi} onClick={() => sendMsg(qr)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:border-blue-500/50 hover:text-blue-400"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing dots (while streaming but no text yet) */}
          {typing && !msgs[msgs.length - 1]?.streaming && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Bot size={13} className="text-white" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-1 py-3">
                {[0, 1, 2].map(j => (
                  <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--text-muted)', animationDelay: j * 0.15 + 's' }} />
                ))}
              </div>
            </div>
          )}

          {/* Starter tiles + Success stories */}
          {showStarters && !typing && (
            <div className="space-y-4">
              {/* Success stories */}
              <div>
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Star size={10} className="text-yellow-400" /> Cas concrets
                </p>
                <div className="space-y-2">
                  {STORIES.map((s, i) => (
                    <button key={i} onClick={() => sendMsg(s.prompt)}
                      className="w-full text-left p-3 rounded-xl border transition-all hover:border-blue-500/30"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{s.sector}</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: '#ef4444' }}>Avant :</span> {s.before}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: '#22c55e' }}>Après :</span> {s.after}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                          {s.gain}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Topic starters */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>💡 Thèmes populaires</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { icon: '⏱️', label: "Je perds trop de temps sur des tâches répétitives" },
                    { icon: '🚀', label: "Je ne sais pas par où commencer avec l'IA" },
                    { icon: '🔧', label: "Quel outil IA choisir pour mon secteur ?" },
                    { icon: '📊', label: "Comment mesurer le ROI de l'IA dans mon entreprise ?" },
                  ].map(s => (
                    <button key={s.label} onClick={() => sendMsg(s.label)}
                      className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:border-blue-500/40 hover:bg-blue-500/5"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                      <span className="text-base flex-shrink-0">{s.icon}</span>
                      <span className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expert reminder */}
          {showExpertBanner && !typing && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Vous avancez bien ! Envie d&apos;un accompagnement personnalisé avec un expert StratIA ?
              </p>
              <Link href="/rendez-vous"
                className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}>
                <Calendar size={11} /> Réserver
              </Link>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── INPUT ── */}
        <div className="flex-shrink-0 px-3 pt-2 pb-3 sm:px-4 sm:pb-4" style={{ borderTop: '1px solid var(--border)' }}>
          {file && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#f59e0b' }}>
                <Paperclip size={11} />
                <span className="max-w-[160px] truncate">{file.name}</span>
                <button onClick={() => setFile(null)} className="ml-1 hover:text-red-400"><X size={11} /></button>
              </div>
            </div>
          )}

          <div className="flex gap-2 max-w-3xl mx-auto">
            <button onClick={() => fileRef.current?.click()} title="Joindre un fichier"
              className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: file ? 'rgba(234,179,8,0.4)' : 'var(--border)', color: file ? '#f59e0b' : 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
              <Paperclip size={15} />
            </button>
            <input ref={fileRef} type="file" className="hidden"
              accept=".txt,.md,.csv,.json,.pdf,.docx,.xlsx" onChange={handleFile} />

            <input value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg(input)}
              placeholder="Décrivez votre situation ou posez votre question…"
              disabled={typing}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-w-0"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />

            <button onClick={() => sendMsg(input)}
              disabled={typing || (!input.trim() && !file)}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0">
              <Send size={14} className="text-white" />
            </button>
          </div>

          <p className="text-xs text-center mt-2 flex items-center justify-center gap-4" style={{ color: 'var(--text-muted)' }}>
            <span><Sparkles size={10} className="inline mr-1" />Groq · Llama 3.3 70B · Streaming</span>
            <Link href="/rendez-vous" className="flex items-center gap-1 hover:text-purple-400 transition-colors sm:hidden">
              <Calendar size={10} /> Expert
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}

export default function AssistantPage() {
  return <Suspense><AssistantInner /></Suspense>;
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 3. dashboard/page.tsx — ROI widget + nudge + profile view
# ─────────────────────────────────────────────────────────────────────────────
DASHBOARD = r"""'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import {
  Brain, Map, Bot, ArrowRight, Zap, Video,
  TrendingUp, Clock, DollarSign, Bell, Crown,
  ChevronRight, User,
} from 'lucide-react';
import Link from 'next/link';
import { loadProfile } from '@/lib/profile';
import { getRoiSummary, isInactiveSince, fmt$, type RoiSummary } from '@/lib/roi';

interface DiagnosticResult { score: number; level: string; summary: string; }

export default function DashboardPage() {
  const [diag, setDiag]         = useState<DiagnosticResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalTasks, setTotal]  = useState(0);
  const [doneTasks, setDone]    = useState(0);
  const [roi, setRoi]           = useState<RoiSummary | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [profileSector, setProfileSector] = useState('');

  useEffect(() => {
    // Diagnostic
    const d = localStorage.getItem('stratia_diagnostic');
    if (d) { try { setDiag(JSON.parse(d)); } catch { /**/ } }

    // Roadmap progress
    const t = localStorage.getItem('stratia_roadmap_progress');
    if (t) {
      try {
        const parsed = JSON.parse(t) as Record<string, string>;
        const vals = Object.values(parsed);
        const done = vals.filter(v => v === 'done').length;
        setDone(done);
        setTotal(vals.length);
        if (vals.length) setProgress(Math.round(done / vals.length * 100));
      } catch { /**/ }
    }

    // ROI
    setRoi(getRoiSummary());

    // Nudge: inactive > 48h with incomplete tasks
    if (isInactiveSince(48 * 60 * 60 * 1000)) setShowNudge(true);

    // Profile
    const p = loadProfile();
    if (p?.sector) setProfileSector(p.sector);
  }, []);

  const scoreColor = (s: number) =>
    s >= 76 ? '#22c55e' : s >= 56 ? '#3b82f6' : s >= 31 ? '#f59e0b' : '#ef4444';

  const actions = [
    { icon: Brain, href: '/diagnostic', label: 'Diagnostic IA',   desc: diag ? 'Score actuel : ' + diag.score + '/100' : 'Évaluez votre maturité IA', color: '#3b82f6', cta: 'Voir' },
    { icon: Map,   href: '/roadmap',    label: 'Roadmap 90 j',    desc: progress ? 'Progression : ' + progress + '%' : "Plan d'action personnalisé", color: '#8b5cf6', cta: 'Continuer' },
    { icon: Bot,   href: '/assistant',  label: 'StratIA Coach',   desc: 'Guide pas à pas · streaming', color: '#06b6d4', cta: 'Discuter' },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">

        {/* ── NUDGE notification ── */}
        {showNudge && totalTasks > doneTasks && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Reprenez votre roadmap IA
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {totalTasks - doneTasks} tâche{totalTasks - doneTasks > 1 ? 's' : ''} en attente depuis votre dernière visite
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/roadmap"
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg,#d97706,#ea580c)' }}>
                Reprendre <ChevronRight size={11} />
              </Link>
              <button onClick={() => setShowNudge(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Tableau de bord</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Bienvenue sur StratIA — implémentation IA pour votre entreprise
            {profileSector && <span className="ml-2 text-blue-400 font-medium">{profileSector}</span>}
          </p>
        </div>

        {/* ── DIAGNOSTIC BANNER (no diag) ── */}
        {!diag && (
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(8,145,178,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Commencez par votre diagnostic IA</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Obtenez un plan d'action personnalisé en 5 minutes</p>
              </div>
            </div>
            <Link href="/diagnostic" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0">
              Démarrer <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ── SCORE + PROGRESS (has diag) ── */}
        {diag && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Maturité IA</p>
              <p className="text-3xl font-black" style={{ color: scoreColor(diag.score) }}>
                {diag.score}<span className="text-sm font-medium ml-0.5" style={{ color: 'var(--text-muted)' }}>/100</span>
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{diag.level}</p>
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-1.5 rounded-full" style={{ width: diag.score + '%', background: scoreColor(diag.score) }} />
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Roadmap</p>
              <p className="text-3xl font-black" style={{ color: '#8b5cf6' }}>
                {progress}<span className="text-sm font-medium ml-0.5" style={{ color: 'var(--text-muted)' }}>%</span>
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{doneTasks}/{totalTasks} tâches</p>
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" style={{ width: progress + '%' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── ROI WIDGET ── */}
        {roi && roi.toolCount > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-emerald-400 flex-shrink-0" />
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Économies réalisées avec l'IA</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold ml-auto"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  {roi.toolCount} outil{roi.toolCount > 1 ? 's' : ''} configuré{roi.toolCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <Clock size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-xl font-black" style={{ color: '#22c55e' }}>{roi.totalHoursPerWeek}h</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>économisées/semaine</p>
                </div>
                <div className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <DollarSign size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-xl font-black" style={{ color: '#22c55e' }}>{fmt$(roi.totalMonthlySavings)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>économisés/mois</p>
                </div>
                <div className="text-center py-3 px-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                    <Zap size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-xl font-black" style={{ color: '#22c55e' }}>{fmt$(roi.totalAnnualSavings)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>projeté/année</p>
                </div>
              </div>
              {/* Tool list */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {roi.entries.map((e, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)', color: '#86efac' }}>
                    ✓ {e.toolName}
                  </span>
                ))}
              </div>
            </div>
            {roi.totalMonthlySavings > 0 && (
              <div className="px-5 py-3 text-xs" style={{ background: 'rgba(34,197,94,0.04)', borderTop: '1px solid rgba(34,197,94,0.1)', color: 'var(--text-secondary)' }}>
                💡 Votre abonnement StratIA (69$/mois) est rentabilisé en <strong style={{ color: '#22c55e' }}>
                  {Math.ceil(69 / roi.totalMonthlySavings * 100) / 100 < 1 ? 'moins d\'un jour' : Math.ceil(69 / roi.totalMonthlySavings) + ' jour' + (Math.ceil(69 / roi.totalMonthlySavings) > 1 ? 's' : '')}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* ── ROI TEASER (no tools yet) ── */}
        {(!roi || roi.toolCount === 0) && diag && (
          <div className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>Calculateur ROI en temps réel</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Implémentez votre premier outil avec le Coach IA — vos économies s'afficheront ici automatiquement.
              </p>
              <Link href="/assistant" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-2">
                Commencer maintenant <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}

        {/* ── QUICK ACTIONS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map(({ icon: Icon, href, label, desc, color, cta }) => (
            <Link key={href} href={href}
              className="group rounded-2xl p-5 flex flex-col transition-all hover:scale-[1.01]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'color-mix(in srgb,' + color + ' 15%, transparent)' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs flex-1 mb-4" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              <span className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color }}>
                {cta} <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>

        {/* ── PROFILE CARD ── */}
        {profileSector && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.1)' }}>
              <User size={16} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{profileSector}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Profil personnalisé — réponses IA adaptées à votre secteur
              </p>
            </div>
            <Link href="/assistant?setup=1"
              className="text-xs px-3 py-1.5 rounded-lg border flex-shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Modifier
            </Link>
          </div>
        )}

        {/* ── BOTTOM LINKS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/formations',   label: 'Formations' },
            { href: '/bibliotheque', label: 'Bibliothèque' },
            { href: '/communaute',   label: 'Communauté' },
            { href: '/rendez-vous',  label: 'Réserver une session', icon: Video },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl border text-sm transition-colors hover:border-blue-500/30"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <span>{label}</span>
              {Icon ? <Icon size={13} className="text-blue-400 flex-shrink-0" /> : <ArrowRight size={12} className="opacity-40" />}
            </Link>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# WRITE FILES
# ─────────────────────────────────────────────────────────────────────────────
files = {
    BASE / "app/api/chat/route.ts":    ROUTE,
    BASE / "app/assistant/page.tsx":   ASSISTANT,
    BASE / "app/dashboard/page.tsx":   DASHBOARD,
}

for path, content in files.items():
    path.write_text(content, encoding="utf-8")
    print(f"Written {path.name} ({len(content.splitlines())} lines)")

print("All done!")
