import { NextRequest } from 'next/server';
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
