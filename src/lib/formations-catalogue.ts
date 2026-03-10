/**
 * Catalogue partagé des formations StratIA
 * Utilisé par : /api/parcours/recommend  et  /api/chat
 * Doit rester synchronisé avec les données mock de /formations/page.tsx
 */

export interface CatalogueFormation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  type: 'VIDEO' | 'LIVE';
}

export const FORMATIONS_CATALOGUE: CatalogueFormation[] = [
  {
    id: 'f001',
    title: 'Maîtriser ChatGPT & le Prompt Engineering',
    description: 'Apprenez à rédiger des prompts efficaces pour obtenir des réponses précises, automatiser la rédaction et booster votre productivité avec ChatGPT.',
    category: 'ChatGPT & Prompt',
    level: 'Débutant',
    duration: '4h30',
    price: 129,
    type: 'VIDEO',
  },
  {
    id: 'f002',
    title: 'Automatiser votre entreprise avec Make & Zapier',
    description: 'Créez des automatisations sans code pour connecter vos outils (CRM, email, Google Sheets) et éliminer les tâches répétitives.',
    category: 'Automatisation',
    level: 'Intermédiaire',
    duration: '6h',
    price: 179,
    type: 'VIDEO',
  },
  {
    id: 'f003',
    title: 'IA pour les RH : Recrutement & Onboarding',
    description: 'Utilisez l\'IA pour rédiger des offres d\'emploi, analyser des CV, automatiser l\'onboarding et réduire le temps de recrutement de 60%.',
    category: 'RH & IA',
    level: 'Intermédiaire',
    duration: '3h45',
    price: 149,
    type: 'VIDEO',
  },
  {
    id: 'f004',
    title: 'Data & IA : Analyser vos données d\'entreprise',
    description: 'Exploitez vos données avec des outils IA pour générer des rapports automatiques, identifier des tendances et prendre de meilleures décisions.',
    category: 'Data & Analyse',
    level: 'Avancé',
    duration: '8h',
    price: 249,
    type: 'VIDEO',
  },
  {
    id: 'f005',
    title: 'Marketing Digital avec l\'IA',
    description: 'Créez des campagnes marketing percutantes : textes publicitaires, visuels, planification de contenu et analyse de performance avec l\'IA.',
    category: 'Marketing IA',
    level: 'Débutant',
    duration: '5h',
    price: 159,
    type: 'VIDEO',
  },
  {
    id: 'f006',
    title: 'Intégrer l\'IA dans votre PME : Stratégie complète',
    description: 'Définissez une feuille de route IA sur mesure, identifiez les cas d\'usage prioritaires et pilotez la transformation digitale de votre entreprise.',
    category: 'Automatisation',
    level: 'Avancé',
    duration: '5h30',
    price: 299,
    type: 'VIDEO',
  },
  {
    id: 'f007',
    title: 'Session Live : Automatiser vos devis & soumissions',
    description: 'Atelier pratique en direct pour automatiser la création de devis, soumissions et contrats avec des outils IA no-code.',
    category: 'Automatisation',
    level: 'Intermédiaire',
    duration: '2h live',
    price: 89,
    type: 'LIVE',
  },
  {
    id: 'f008',
    title: 'Copywriting IA : Rédiger 10x plus vite',
    description: 'Maîtrisez les techniques de rédaction assistée par IA pour emails, pages de vente, réseaux sociaux et contenus marketing.',
    category: 'Marketing IA',
    level: 'Débutant',
    duration: '3h',
    price: 119,
    type: 'VIDEO',
  },
  {
    id: 'f009',
    title: 'Chatbots & Assistants IA pour votre entreprise',
    description: 'Construisez des chatbots personnalisés pour le service client, la qualification de leads et le support interne sans écrire de code.',
    category: 'Automatisation',
    level: 'Intermédiaire',
    duration: '4h',
    price: 169,
    type: 'VIDEO',
  },
  {
    id: 'f010',
    title: 'Session Live : IA & Gestion de projet',
    description: 'Apprenez en direct à utiliser l\'IA pour planifier, suivre et optimiser vos projets avec des outils comme Notion AI et Asana.',
    category: 'Automatisation',
    level: 'Débutant',
    duration: '1h30 live',
    price: 69,
    type: 'LIVE',
  },
];

/** Génère la liste formatée pour les prompts IA */
export function formatCatalogueForPrompt(): string {
  return FORMATIONS_CATALOGUE
    .map(f =>
      `- ID: ${f.id} | "${f.title}" | Catégorie: ${f.category} | Niveau: ${f.level} | Durée: ${f.duration} | Prix: ${f.price}$ | Type: ${f.type}`
    )
    .join('\n');
}

/** Génère un résumé compact pour le chatbot */
export function formatCatalogueForChat(): string {
  return FORMATIONS_CATALOGUE
    .map(f =>
      `• **${f.title}** (${f.category}, ${f.level}, ${f.duration}, ${f.price}$) — ID: ${f.id} — ${f.description.slice(0, 80)}…`
    )
    .join('\n');
}
