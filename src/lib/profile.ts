// ── User Profile — persisted in localStorage ─────────────────────────────────

export interface UserProfile {
  sector: string;       // "Construction", "Restauration", etc.
  employees: string;    // "1-5", "6-20", "21-50", "50+"
  tools: string;        // comma-separated: "QuickBooks, Outlook, Excel"
  budget: string;       // "Gratuit", "$20-50/mois", "$50-200/mois", "$200+/mois"
  hourlyRate: number;   // $/h — used for ROI calculations
  updatedAt: number;
}

const KEY = 'stratia_profile';

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch { return null; }
}

export function saveProfile(partial: Partial<UserProfile>): UserProfile {
  const base: UserProfile = {
    sector: '', employees: '', tools: '', budget: '', hourlyRate: 60, updatedAt: 0,
  };
  const current = loadProfile() ?? base;
  const updated: UserProfile = { ...current, ...partial, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function hasProfile(): boolean {
  const p = loadProfile();
  return !!(p?.sector);
}

/** Returns a compact paragraph injected into every system prompt */
export function profileToContext(p: UserProfile): string {
  const parts: string[] = [];
  if (p.sector)     parts.push(`Secteur : ${p.sector}`);
  if (p.employees)  parts.push(`Équipe : ${p.employees} employés`);
  if (p.tools)      parts.push(`Outils actuels : ${p.tools}`);
  if (p.budget)     parts.push(`Budget IA : ${p.budget}`);
  if (p.hourlyRate) parts.push(`Taux horaire : ${p.hourlyRate}$/h`);
  if (!parts.length) return '';
  return `\nPROFIL CLIENT :\n${parts.join(' | ')}\nPersonnalise tes réponses en fonction de ce profil.`;
}

// Sector options shown in the wizard
export const SECTORS = [
  '🏗️ Construction', '🍽️ Restauration', '🛍️ Commerce de détail',
  '💼 Services professionnels', '🏥 Santé / bien-être', '🏫 Éducation / formation',
  '🏭 Industrie / manufacturier', '📦 Transport / logistique', '🖥️ Tech / agence web',
];

export const EMPLOYEE_OPTIONS = ['1-5', '6-20', '21-50', '50+'];

export const BUDGET_OPTIONS = [
  'Gratuit seulement', '$20-50/mois', '$50-200/mois', '$200+/mois',
];

export const HOURLY_RATE_OPTIONS = [
  { label: '$20-40/h', value: 30 },
  { label: '$40-60/h', value: 50 },
  { label: '$60-90/h', value: 75 },
  { label: '$90-120/h', value: 105 },
  { label: '$120+/h', value: 140 },
];
