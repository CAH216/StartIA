// ── ROI Tracker — persisted in localStorage ───────────────────────────────────

export interface RoiEntry {
  toolName: string;
  hoursPerWeek: number;   // hours saved per week
  monthlySavings: number; // $ saved per month (calculated from hourlyRate × hours)
  addedAt: number;
}

const KEY = 'stratia_roi';

export function loadRoi(): RoiEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RoiEntry[]) : [];
  } catch { return []; }
}

/** Upsert — if tool already tracked, update its values */
export function recordRoiEntry(entry: Omit<RoiEntry, 'addedAt'>) {
  const entries = loadRoi();
  const idx = entries.findIndex(e => e.toolName.toLowerCase() === entry.toolName.toLowerCase());
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], hoursPerWeek: entry.hoursPerWeek, monthlySavings: entry.monthlySavings };
  } else {
    entries.push({ ...entry, addedAt: Date.now() });
  }
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export interface RoiSummary {
  totalHoursPerWeek: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  toolCount: number;
  entries: RoiEntry[];
}

export function getRoiSummary(): RoiSummary {
  const entries = loadRoi();
  const totalHoursPerWeek   = entries.reduce((s, e) => s + (e.hoursPerWeek   ?? 0), 0);
  const totalMonthlySavings = entries.reduce((s, e) => s + (e.monthlySavings ?? 0), 0);
  return {
    totalHoursPerWeek,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    toolCount: entries.length,
    entries,
  };
}

export function fmt$(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k$`;
  return `${Math.round(n)}$`;
}

/** Compute estimated monthly savings from hours + hourly rate */
export function calcMonthlySavings(hoursPerWeek: number, hourlyRate: number): number {
  return Math.round(hoursPerWeek * 4.3 * hourlyRate); // 4.3 weeks/month
}

// ── Conversation context saved after each coach session ───────────────────────
export interface CoachContext {
  lastTask?: string;
  lastMessages: string[];
  toolsFound?: string[];
  savedAt: number;
}

const CTX_KEY = 'stratia_coach_context';

export function saveCoachContext(ctx: Omit<CoachContext, 'savedAt'>) {
  localStorage.setItem(CTX_KEY, JSON.stringify({ ...ctx, savedAt: Date.now() }));
}

export function loadCoachContext(): CoachContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CTX_KEY);
    return raw ? (JSON.parse(raw) as CoachContext) : null;
  } catch { return null; }
}

// ── Last activity timestamp (for nudge) ───────────────────────────────────────
const ACTIVITY_KEY = 'stratia_last_activity';

export function touchActivity() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
  }
}

export function isInactiveSince(ms: number): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(ACTIVITY_KEY);
  if (!raw) return false;
  return Date.now() - parseInt(raw) > ms;
}
