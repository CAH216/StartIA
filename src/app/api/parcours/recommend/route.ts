import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import { FORMATIONS_CATALOGUE, formatCatalogueForPrompt } from '@/lib/formations-catalogue';

const MODEL = 'llama-3.3-70b-versatile';

export interface McqAnswers {
    challenge: string;     // principal défi
    timePerWeek: string;   // temps disponible
    techLevel: string;     // niveau numérique
    teamSize?: string;     // taille équipe
}

export interface RoadmapStep {
    stepNumber: number;
    stepTitle: string;
    objective: string;
    formationId: string | null;
    formationTitle: string;
    why: string;
    estimatedWeeks: number;
}

/**
 * POST /api/parcours/recommend
 * Body: { answers: McqAnswers }
 * Returns: { steps: RoadmapStep[] }
 */
export async function POST(req: NextRequest) {
    try {
        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) return NextResponse.json({ error: 'GROQ_API_KEY manquant' }, { status: 500 });

        const { answers } = await req.json() as { answers: McqAnswers };

        // Récupérer les formations disponibles (Prisma en priorité, catalogue mock en fallback)
        let formationsList: string;
        try {
            const dbFormations = await prisma.formation.findMany({
                select: { id: true, title: true, description: true, category: true, duration: true, price: true },
                orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
                take: 30,
            });
            formationsList = dbFormations.length > 0
                ? dbFormations.map(f => `- ID: ${f.id} | "${f.title}" | Catégorie: ${f.category}${f.duration ? ` | Durée: ${f.duration}` : ''}${f.price ? ` | ${f.price}$` : ''}`).join('\n')
                : formatCatalogueForPrompt();
        } catch {
            formationsList = formatCatalogueForPrompt();
        }

        const systemPrompt = `Tu es un expert en formation professionnelle et implémentation IA. Tu crées des parcours d'apprentissage personnalisés.

Tu reçois les réponses d'un utilisateur à un petit questionnaire et la liste des formations disponibles.
Tu dois générer un parcours de 3 à 5 étapes adaptées à son profil.

RÈGLES :
- Chaque étape correspond à UNE formation concrète de la liste (utilise son ID exact).
- Si aucune formation ne correspond, mets formationId à null et invente un titre réaliste.
- Les étapes sont ordonnées : fondations d'abord, compétences avancées ensuite.
- "why" doit être personnalisé aux réponses de l'utilisateur (2-3 phrases max, ton motivant).
- estimatedWeeks : entre 1 et 3 semaines par étape.
- Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.

Format strict :
{
  "intro": "Une phrase d'accroche personnalisée pour ce parcours (20 mots max)",
  "steps": [
    {
      "stepNumber": 1,
      "stepTitle": "Titre court de l'étape (5 mots max)",
      "objective": "Ce que l'utilisateur saura faire après (1 phrase)",
      "formationId": "uuid-exact-de-la-formation-ou-null",
      "formationTitle": "Titre exact de la formation",
      "why": "Pourquoi cette formation pour cet utilisateur spécifiquement (2-3 phrases motivantes)",
      "estimatedWeeks": 2
    }
  ]
}`;

        const userPrompt = `RÉPONSES DU QUESTIONNAIRE :
- Principal défi : ${answers.challenge}
- Temps disponible par semaine : ${answers.timePerWeek}
- Niveau de confort numérique : ${answers.techLevel}
${answers.teamSize ? `- Taille de l'équipe : ${answers.teamSize}` : ''}

FORMATIONS DISPONIBLES :
${formationsList}

Génère le parcours personnalisé.`;

        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 1200,
            temperature: 0.5,
        });

        const raw = completion.choices[0]?.message?.content ?? '';
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('Réponse IA invalide');

        const result = JSON.parse(match[0]);
        return NextResponse.json(result);
    } catch (err) {
        console.error('[parcours/recommend]', err);
        // Fallback statique avec les vraies formations du catalogue
        const cat = FORMATIONS_CATALOGUE;
        return NextResponse.json({
            intro: 'Un parcours adapté à votre profil pour gagner du temps dès cette semaine.',
            steps: [
                {
                    stepNumber: 1,
                    stepTitle: 'Maîtriser ChatGPT',
                    objective: 'Rédiger des prompts efficaces et booster votre productivité quotidienne avec l\'IA.',
                    formationId: cat[0].id,
                    formationTitle: cat[0].title,
                    why: 'C\'est la base de tout — comprendre comment parler à l\'IA vous ouvre toutes les portes.',
                    estimatedWeeks: 2,
                },
                {
                    stepNumber: 2,
                    stepTitle: 'Automatiser votre travail',
                    objective: 'Créer vos premières automatisations avec Make ou Zapier sans coder.',
                    formationId: cat[1].id,
                    formationTitle: cat[1].title,
                    why: 'Les automatisations sans code permettent d\'éliminer les tâches répétitives et de gagner des heures chaque semaine.',
                    estimatedWeeks: 2,
                },
                {
                    stepNumber: 3,
                    stepTitle: 'Déployer une stratégie IA',
                    objective: 'Définir et piloter votre transformation digitale avec une feuille de route claire.',
                    formationId: cat[5].id,
                    formationTitle: cat[5].title,
                    why: 'Pour aller au-delà des outils et construire une vraie avantage concurrentiel durable.',
                    estimatedWeeks: 2,
                },
            ],
        });
    }
}
