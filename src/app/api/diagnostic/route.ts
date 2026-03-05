import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const { diagnosticData } = await req.json();

    const systemPrompt = `Tu es un consultant expert en implémentation de l'intelligence artificielle pour les PME québécoises. 
Tu dois analyser les données d'une entreprise et produire un diagnostic IA complet avec des CHIFFRES CONCRETS ET RÉALISTES.

Réponds UNIQUEMENT en JSON valide (pas de texte avant ou après), avec exactement cette structure :
{
  "score": 65,
  "level": "Intermédiaire",
  "summary": "Résumé en 2-3 phrases du profil IA de l'entreprise",
  "priorities": [
    { "title": "Titre de la priorité", "description": "Description actionnable en 1 phrase", "gain": "Ex: 6h/semaine récupérées" }
  ],
  "tools": [
    { "name": "Nom de l'outil", "purpose": "Usage concret", "canadian": boolean, "url": "url (optionnel)" }
  ],
  "risks": ["Risque 1", "Risque 2"],
  "timeline": {
    "month1": "Actions du mois 1",
    "month2": "Actions du mois 2",
    "month3": "Actions du mois 3"
  },
  "metrics": {
    "hoursLostPerWeek": 12,
    "hoursGainedPerWeek": 8,
    "annualHoursSaved": 416,
    "estimatedRoiMonthly": 1400,
    "costOfInactionMonthly": 1680,
    "weeksEquivalent": 10
  }
}

RÈGLES DE CALCUL DES MÉTRIQUES (taux horaire moyen PME québécoise = 38$/h) :
- hoursLostPerWeek : heures perdues/semaine sur tâches manuelles (base selon nb employés × processus inefficaces cochés). 1-5 emp ≈ 8-15h, 6-25 ≈ 15-35h, 26-100 ≈ 35-80h, 100+ ≈ 80-200h. Ajuste selon le nombre de problèmes cochés.
- hoursGainedPerWeek : 55-70% de hoursLostPerWeek (gain réaliste avec IA)
- annualHoursSaved : hoursGainedPerWeek × 52
- estimatedRoiMonthly : hoursGainedPerWeek × 4.33 × 38 (en dollars CAD, arrondi à la centaine)
- costOfInactionMonthly : hoursLostPerWeek × 4.33 × 38 (coût de NE PAS agir, en dollars CAD)
- weeksEquivalent : Math.round(annualHoursSaved / 40) (semaines de travail équivalentes libérées)

IMPORTANT : Ces chiffres doivent être réalistes, spécifiques au secteur et à la taille de l'équipe, pas génériques.
Pour les priorités, le champ "gain" doit être concret : "4h/semaine récupérées (840$/mois)" ou "−23% temps de traitement".

OUTILS RECOMMANDÉS (très important):
- NE RECOMMANDE PAS que "ChatGPT" et "Zapier" systématiquement.
- Cherche des outils SPÉCIFIQUES au secteur (ex: construction = Procore, Fieldwire; immo = Follow Up Boss, kvCORE; etc.).
- Propose 3 à 5 outils distincts et pertinents.
- Inclus si possible une courte description de l'usage précis (ex: "Scan de factures", "Automatisation des rendez-vous").

Le score va de 0 à 100. Les niveaux sont : Débutant (0-30), En transition (31-55), Intermédiaire (56-75), Avancé (76-100).
Inclus 3-4 priorités, 3-4 outils, 2-3 risques.
Si la préférence est "Canadien", priorise des outils canadiens (ex: Cohere, Ada, Xero, etc.) et indique canadian: true.
Si "Open-source", priorise des solutions open-source (Ollama, LangChain, etc.) avec canadian: false.
Réponds uniquement en JSON valide.`;

    const userPrompt = `Voici les données du diagnostic de l'entreprise :
${JSON.stringify(diagnosticData, null, 2)}

Génère un diagnostic IA complet et personnalisé basé sur ces informations.`;

    const groq = new Groq({ apiKey: groqKey });
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1800,
      temperature: 0.4,
    });

    const rawContent = completion.choices[0]?.message?.content ?? '';

    // Extract JSON from the response (sometimes the model wraps it in markdown)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Diagnostic API error:', error);
    // Fallback static response if AI fails
    return NextResponse.json({
      score: 45,
      level: 'En transition',
      summary:
        "Votre entreprise montre un intérêt clair pour l'IA mais n'a pas encore de processus structurés. Des gains rapides sont possibles dans l'automatisation des tâches répétitives.",
      priorities: [
        {
          title: 'Automatisation des tâches administratives',
          description: 'Identifiez 3 tâches répétitives et automatisez-les avec des outils no-code.',
          gain: '5-8h/semaine',
        },
        {
          title: 'Formation de l\'équipe aux outils IA',
          description: 'Commencez par ChatGPT ou Copilot pour améliorer la productivité immédiatement.',
          gain: '3-5h/semaine',
        },
      ],
      tools: [
        { name: 'ChatGPT', purpose: 'Rédaction, résumés, emails', canadian: false },
        { name: 'Zapier', purpose: 'Automatisation des flux de travail', canadian: false },
      ],
      risks: [
        'Résistance au changement de l\'équipe',
        'Manque de données structurées pour l\'IA',
      ],
      timeline: {
        month1: 'Audit des processus et formation de base aux outils IA',
        month2: 'Déploiement de 2-3 automatisations prioritaires',
        month3: 'Mesure des gains et planification de la prochaine phase',
      },
      metrics: {
        hoursLostPerWeek: 12,
        hoursGainedPerWeek: 8,
        annualHoursSaved: 416,
        estimatedRoiMonthly: 1400,
        costOfInactionMonthly: 1980,
        weeksEquivalent: 10,
      },
    });
  }
}
