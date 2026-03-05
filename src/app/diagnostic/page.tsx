'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Brain, ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertTriangle, Lightbulb, Wrench, CalendarDays, ArrowRight, MapPin, Zap, TrendingUp, Clock, DollarSign, Flame } from 'lucide-react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────────────────────── */
interface DiagnosticData {
  companyName: string; sector: string; sectorCustom: string; province: string; employees: string;
  activities: string[]; activitiesNotes: string; currentTools: string[]; currentToolsNotes: string;
  problems: string[]; problemsNotes: string; goals: string[]; goalsNotes: string;
  aiUsage: string; teamReadiness: string; budget: string; toolPreference: string; decisionSpeed: string; generalNotes: string;
}
interface DiagnosticResult {
  score: number; level: string; summary: string;
  priorities: { title: string; description: string; gain: string }[];
  tools: { name: string; purpose: string; canadian: boolean }[];
  risks: string[];
  timeline: { month1: string; month2: string; month3: string };
  metrics?: {
    hoursLostPerWeek: number;
    hoursGainedPerWeek: number;
    annualHoursSaved: number;
    estimatedRoiMonthly: number;
    costOfInactionMonthly: number;
    weeksEquivalent: number;
  };
}

/* ── Constants ─────────────────────────────────────────────────────── */
const SECTORS = ['Construction & immobilier','Commerce de détail','Restauration & alimentation','Santé & services médicaux','Services professionnels','Manufacturing & production','Transport & logistique','Technologie & développement','Éducation & formation','Médias & marketing','Autre'];
const PROVINCES = ['Québec','Ontario','Colombie-Britannique','Alberta','Manitoba','Saskatchewan','Nouvelle-Écosse','Nouveau-Brunswick','Île-du-Prince-Édouard','Terre-Neuve-et-Labrador'];
const ACTIVITIES = ['Gestion clients (CRM)','Facturation & comptabilité','RH & recrutement','Marketing & publicité','Service client','Gestion de projets','Approvisionnement','Analyse de données','Communication interne','Production & opérations'];
const TOOLS = ['Microsoft 365 / Google Workspace','QuickBooks / Sage','Slack / Teams','Trello / Asana / Monday','Salesforce / HubSpot','Shopify','ChatGPT / Copilot','Aucun outil spécialisé'];
const PROBLEMS = ['Trop de tâches manuelles répétitives','Décisions prises sans données fiables','Communication client lente','Manque de visibilité sur la performance','Création de contenu trop longue','Service client surchargé','Dépassements de délais','Recrutement inefficace'];
const GOALS = ['Automatiser les tâches répétitives','Améliorer le service client','Réduire les coûts opérationnels','Accélérer la prise de décision','Former mon équipe à l\'IA','Me démarquer de la concurrence'];
const STEPS = ['Profil','Activités','Défis','Préférences','Résultats'];
const initData: DiagnosticData = { companyName:'',sector:'',sectorCustom:'',province:'',employees:'',activities:[],activitiesNotes:'',currentTools:[],currentToolsNotes:'',problems:[],problemsNotes:'',goals:[],goalsNotes:'',aiUsage:'',teamReadiness:'',budget:'',toolPreference:'',decisionSpeed:'',generalNotes:'' };

/* ── Components ────────────────────────────────────────────────────── */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="text-sm px-3 py-2 rounded-lg border transition-all duration-150"
      style={{
        borderColor: active ? '#3b82f6' : 'var(--border)',
        background: active ? 'rgba(59,130,246,0.15)' : 'var(--bg-elevated)',
        color: active ? '#60a5fa' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 400,
      }}>
      {label}
    </button>
  );
}

function Radio({ value, current, label, desc, onClick }: { value: string; current: string; label: string; desc?: string; onClick: () => void }) {
  const active = current === value;
  return (
    <button type="button" onClick={onClick}
      className="flex items-start gap-3 w-full text-left p-4 rounded-xl border transition-all duration-150"
      style={{
        borderColor: active ? '#3b82f6' : 'var(--border)',
        background: active ? 'rgba(59,130,246,0.08)' : 'var(--bg-elevated)',
      }}>
      <div className="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{ borderColor: active ? '#3b82f6' : 'var(--border)' }}>
        {active && <div className="w-2 h-2 rounded-full bg-blue-500" />}
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>}
      </div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {children}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 76 ? '#22c55e' : score >= 56 ? '#3b82f6' : score >= 31 ? '#f59e0b' : '#ef4444';
  const r = 48; const circ = 2 * Math.PI * r; const dash = circ * (score / 100);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - dash} />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-black" style={{ color }}>{score}</p>
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/100</p>
      </div>
    </div>
  );
}

function MetricsPanel({ m }: { m: NonNullable<DiagnosticResult['metrics']> }) {
  const fmt = (n: number) => n.toLocaleString('fr-CA');
  const tiles = [
    {
      icon: <Clock size={16} className="text-red-400" />,
      label: 'Heures perdues / semaine',
      value: `${m.hoursLostPerWeek}h`,
      sub: 'sur des tâches manuelles actuellement',
      accent: '#ef4444',
      bg: 'rgba(239,68,68,0.07)',
      bord: 'rgba(239,68,68,0.18)',
    },
    {
      icon: <TrendingUp size={16} className="text-emerald-400" />,
      label: 'Heures récupérées avec IA',
      value: `${m.hoursGainedPerWeek}h/sem`,
      sub: `soit ${fmt(m.annualHoursSaved)}h/an — ${m.weeksEquivalent} semaines libérées`,
      accent: '#10b981',
      bg: 'rgba(16,185,129,0.07)',
      bord: 'rgba(16,185,129,0.18)',
    },
    {
      icon: <Flame size={16} className="text-orange-400" />,
      label: "Coût de l'inaction / mois",
      value: `${fmt(m.costOfInactionMonthly)} $`,
      sub: 'vous perdez cela chaque mois sans agir',
      accent: '#f97316',
      bg: 'rgba(249,115,22,0.07)',
      bord: 'rgba(249,115,22,0.18)',
    },
    {
      icon: <DollarSign size={16} className="text-blue-400" />,
      label: 'ROI estimé / mois avec IA',
      value: `+${fmt(m.estimatedRoiMonthly)} $`,
      sub: `basé sur 38$/h moyen PME québécoise`,
      accent: '#3b82f6',
      bg: 'rgba(59,130,246,0.07)',
      bord: 'rgba(59,130,246,0.18)',
    },
  ];
  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={16} className="text-blue-400" />
        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Impact chiffré — données réelles</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
          Basé sur votre profil
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiles.map((t, i) => (
          <div key={i} className="rounded-xl p-4"
            style={{ background: t.bg, border: `1px solid ${t.bord}` }}>
            <div className="flex items-center gap-2 mb-2">
              {t.icon}
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.label}</span>
            </div>
            <p className="text-2xl font-black mb-0.5" style={{ color: t.accent }}>{t.value}</p>
            <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{t.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function DiagnosticPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DiagnosticData>(initData);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState('');

  // Load latest diagnostic from DB on mount
  useEffect(() => {
    fetch('/api/user/diagnostic')
      .then(r => r.ok ? r.json() : null)
      .then((d: { data?: DiagnosticResult } | null) => {
        if (d?.data) {
          const r = d.data as DiagnosticResult;
          setResult(r);
          localStorage.setItem('stratia_diagnostic', JSON.stringify(r));
          setStep(4); // jump straight to results
        }
      })
      .catch(() => {/* silent — fallback to localStorage */});
  }, []);

  function toggle(field: 'activities'|'currentTools'|'problems'|'goals', val: string) {
    setData(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val] }));
  }

  async function runDiagnostic() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/diagnostic', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ diagnosticData: data }) });
      const json = await res.json();
      setResult(json);
      localStorage.setItem('stratia_diagnostic', JSON.stringify(json));
      // Persist to DB for cross-device access
      fetch('/api/user/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score:   json.score,
          level:   json.level,
          summary: json.summary ?? null,
          data:    json,
        }),
      }).catch(console.error);
      setStep(4);
    } catch { setError("Erreur lors de l'analyse. Veuillez réessayer."); }
    finally { setLoading(false); }
  }

  const pct = ((step + 1) / STEPS.length) * 100;

  /* Input style */
  const inputCls = "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-colors";
  const inputSt = { background:'var(--bg-elevated)', borderColor:'var(--border)', color:'var(--text-primary)' } as React.CSSProperties;

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background:'var(--bg-base)' }}>
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* ── Header ── */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black" style={{ color:'var(--text-primary)' }}>Diagnostic IA</h1>
                <p className="text-xs" style={{ color:'var(--text-secondary)' }}>Analyse personnalisée en 4 étapes</p>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        background: i < step ? '#3b82f6' : i === step ? 'linear-gradient(135deg,#2563eb,#0891b2)' : 'var(--bg-elevated)',
                        color: i <= step ? '#fff' : 'var(--text-muted)',
                        border: i > step ? '1px solid var(--border)' : 'none',
                        boxShadow: i === step ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none',
                      }}>
                      {i < step ? <CheckCircle2 size={13} /> : i + 1}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block" style={{ color: i === step ? '#60a5fa' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400 }}>
                      {s}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-2 mb-4" style={{ background: i < step ? '#3b82f6' : 'var(--border)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Loading overlay ── */}
          {loading && (
            <div className="rounded-2xl p-12 text-center" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} className="animate-spin text-white" />
              </div>
              <p className="font-bold text-lg mb-1" style={{ color:'var(--text-primary)' }}>Analyse en cours...</p>
              <p className="text-sm" style={{ color:'var(--text-secondary)' }}>L'IA génère votre diagnostic personnalisé</p>
            </div>
          )}

          {error && <div className="rounded-xl px-5 py-4 mb-4 text-sm text-red-400 border border-red-500/30 bg-red-500/10">{error}</div>}

          {/* ─── STEP 0 — Profil ─── */}
          {!loading && step === 0 && (
            <div className="rounded-2xl p-7 space-y-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div>
                <h2 className="text-lg font-black mb-1" style={{ color:'var(--text-primary)' }}>Votre entreprise</h2>
                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>Quelques informations pour calibrer l'analyse</p>
              </div>
              <Field label="Nom de l'entreprise (optionnel)">
                <input className={inputCls} style={inputSt} placeholder="Ex : Compagnie Dupont inc."
                  value={data.companyName} onChange={e => setData({...data, companyName:e.target.value})} />
              </Field>
              <Field label="Secteur d'activité">
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map(s => <Chip key={s} label={s} active={data.sector===s} onClick={() => setData({...data, sector:s})} />)}
                </div>
                {data.sector === 'Autre' && (
                  <input className={`${inputCls} mt-3`} style={inputSt} placeholder="Précisez votre secteur..."
                    value={data.sectorCustom} onChange={e => setData({...data, sectorCustom:e.target.value})} />
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Province">
                  <select className={inputCls} style={{ ...inputSt, appearance:'none' }}
                    value={data.province} onChange={e => setData({...data, province:e.target.value})}>
                    <option value="" style={{ background:'#1e293b' }}>Choisir...</option>
                    {PROVINCES.map(p => <option key={p} value={p} style={{ background:'#1e293b' }}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Taille de l'équipe">
                  <div className="flex flex-col gap-1.5">
                    {['1 – 5','6 – 25','26 – 100','100+'].map(v => (
                      <Chip key={v} label={v} active={data.employees===v} onClick={() => setData({...data, employees:v})} />
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* ─── STEP 1 — Activités ─── */}
          {!loading && step === 1 && (
            <div className="rounded-2xl p-7 space-y-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div>
                <h2 className="text-lg font-black mb-1" style={{ color:'var(--text-primary)' }}>Activités &amp; outils</h2>
                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>Qu'est-ce qui occupe votre équipe au quotidien ?</p>
              </div>
              <Field label="Activités principales (plusieurs choix)">
                <div className="flex flex-wrap gap-2">
                  {ACTIVITIES.map(a => <Chip key={a} label={a} active={data.activities.includes(a)} onClick={() => toggle('activities', a)} />)}
                </div>
                <textarea className={`${inputCls} mt-3 resize-none`} style={inputSt} rows={2}
                  placeholder="Précisez ou ajoutez d'autres activités..." value={data.activitiesNotes}
                  onChange={e => setData({...data, activitiesNotes:e.target.value})} />
              </Field>
              <Field label="Outils utilisés actuellement">
                <div className="flex flex-wrap gap-2">
                  {TOOLS.map(t => <Chip key={t} label={t} active={data.currentTools.includes(t)} onClick={() => toggle('currentTools', t)} />)}
                </div>
                <textarea className={`${inputCls} mt-3 resize-none`} style={inputSt} rows={2}
                  placeholder="Autres outils..." value={data.currentToolsNotes}
                  onChange={e => setData({...data, currentToolsNotes:e.target.value})} />
              </Field>
            </div>
          )}

          {/* ─── STEP 2 — Défis ─── */}
          {!loading && step === 2 && (
            <div className="rounded-2xl p-7 space-y-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div>
                <h2 className="text-lg font-black mb-1" style={{ color:'var(--text-primary)' }}>Défis &amp; objectifs</h2>
                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>Où sont vos frictions et que voulez-vous accomplir ?</p>
              </div>
              <Field label="Principaux défis (plusieurs choix)">
                <div className="flex flex-wrap gap-2">
                  {PROBLEMS.map(p => <Chip key={p} label={p} active={data.problems.includes(p)} onClick={() => toggle('problems', p)} />)}
                </div>
                <textarea className={`${inputCls} mt-3 resize-none`} style={inputSt} rows={2}
                  placeholder="Décrivez vos défis en détail..." value={data.problemsNotes}
                  onChange={e => setData({...data, problemsNotes:e.target.value})} />
              </Field>
              <Field label="Objectifs avec l'IA">
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => <Chip key={g} label={g} active={data.goals.includes(g)} onClick={() => toggle('goals', g)} />)}
                </div>
                <textarea className={`${inputCls} mt-3 resize-none`} style={inputSt} rows={2}
                  placeholder="Vos priorités spécifiques..." value={data.goalsNotes}
                  onChange={e => setData({...data, goalsNotes:e.target.value})} />
              </Field>
            </div>
          )}

          {/* ─── STEP 3 — Préférences ─── */}
          {!loading && step === 3 && (
            <div className="rounded-2xl p-7 space-y-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
              <div>
                <h2 className="text-lg font-black mb-1" style={{ color:'var(--text-primary)' }}>Maturité &amp; préférences</h2>
                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>Pour calibrer les recommandations</p>
              </div>
              <Field label="Utilisation actuelle de l'IA">
                <div className="space-y-2">
                  {[
                    {v:'aucune',l:'Aucune utilisation',d:"Nous n'avons jamais utilisé l'IA"},
                    {v:'personnelle',l:'Usage personnel',d:'Quelques membres utilisent ChatGPT à titre personnel'},
                    {v:'experimentation',l:'Expérimentation',d:'Tests ponctuels, aucun processus établi'},
                    {v:'partielle',l:'Intégration partielle',d:"L'IA est dans 1-2 processus"},
                    {v:'avancee',l:'Intégration avancée',d:"L'IA est au cœur de plusieurs processus clés"},
                  ].map(({v,l,d}) => <Radio key={v} value={v} current={data.aiUsage} label={l} desc={d} onClick={() => setData({...data, aiUsage:v})} />)}
                </div>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Budget mensuel IA">
                  <div className="space-y-1.5">
                    {['0 $ (gratuit)','1 – 100 $','101 – 500 $','501 – 2 000 $','2 000 $+'].map(v => (
                      <Chip key={v} label={v} active={data.budget===v} onClick={() => setData({...data, budget:v})} />
                    ))}
                  </div>
                </Field>
                <Field label="Préférence d'outils">
                  <div className="space-y-2">
                    {[
                      {v:'canadien',l:'🇨🇦 Outils canadiens',d:'Hébergement et données au Canada'},
                      {v:'opensource',l:'🔓 Open-source',d:'Solutions libres, auto-hébergeables'},
                      {v:'nopreference',l:'⚡ Le plus performant',d:"Peu importe l'origine"},
                    ].map(({v,l,d}) => <Radio key={v} value={v} current={data.toolPreference} label={l} desc={d} onClick={() => setData({...data, toolPreference:v})} />)}
                  </div>
                </Field>
              </div>
              <Field label="Contexte supplémentaire (optionnel)">
                <textarea className={`${inputCls} resize-none`} style={inputSt} rows={3}
                  placeholder="Contraintes, secteur de niche, réglementations, taille de l'équipe technique..."
                  value={data.generalNotes} onChange={e => setData({...data, generalNotes:e.target.value})} />
              </Field>
            </div>
          )}

          {/* ─── STEP 4 — Résultats ─── */}
          {!loading && step === 4 && result && (
            <div className="space-y-5">
              {/* Score card */}
              <div className="rounded-2xl p-8 text-center" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <ScoreRing score={result.score} />
                <p className="text-xl font-black mt-4" style={{ color:'var(--text-primary)' }}>{result.level}</p>
                {data.province && (
                  <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color:'var(--text-muted)' }}>
                    <MapPin size={11} /> {data.companyName || 'Votre entreprise'} · {data.province}
                  </p>
                )}
                <p className="text-sm mt-4 max-w-md mx-auto leading-relaxed" style={{ color:'var(--text-secondary)' }}>{result.summary}</p>
              </div>

              {/* Metrics */}
              {result.metrics && <MetricsPanel m={result.metrics} />}

              {/* Priorities */}
              <div className="rounded-2xl p-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb size={16} className="text-yellow-400" />
                  <h3 className="font-bold" style={{ color:'var(--text-primary)' }}>Priorités</h3>
                </div>
                <div className="space-y-3">
                  {result.priorities.map((p, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 p-4 rounded-xl" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                        <div>
                          <p className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{p.title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color:'var(--text-secondary)' }}>{p.description}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg whitespace-nowrap">{p.gain}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="rounded-2xl p-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <Wrench size={16} className="text-blue-400" />
                  <h3 className="font-bold" style={{ color:'var(--text-primary)' }}>Outils recommandés</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.tools.map((t, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{t.name}</span>
                        {t.canadian && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' }}>🇨🇦 Canadien</span>}
                      </div>
                      <p className="text-xs" style={{ color:'var(--text-secondary)' }}>{t.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div className="rounded-2xl p-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <h3 className="font-bold" style={{ color:'var(--text-primary)' }}>Points de vigilance</h3>
                </div>
                <ul className="space-y-2">
                  {result.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color:'var(--text-secondary)' }}>
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl p-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <CalendarDays size={16} className="text-purple-400" />
                  <h3 className="font-bold" style={{ color:'var(--text-primary)' }}>Plan 90 jours</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {label:'Mois 1',content:result.timeline.month1,accent:'#3b82f6'},
                    {label:'Mois 2',content:result.timeline.month2,accent:'#8b5cf6'},
                    {label:'Mois 3',content:result.timeline.month3,accent:'#06b6d4'},
                  ].map(({label,content,accent}) => (
                    <div key={label} className="p-4 rounded-xl" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md mb-3 inline-block" style={{ background:`${accent}20`, color:accent }}>{label}</span>
                      <p className="text-sm leading-relaxed" style={{ color:'var(--text-secondary)' }}>{content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/roadmap" className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity">
                  Voir ma Roadmap IA <ArrowRight size={16} />
                </Link>
                <button onClick={() => { setStep(0); setData(initData); setResult(null); }}
                  className="flex-1 py-3.5 px-6 rounded-xl font-semibold border transition-colors"
                  style={{ borderColor:'var(--border)', color:'var(--text-secondary)' }}>
                  Refaire le diagnostic
                </button>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          {!loading && step < 4 && (
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-30"
                style={{ borderColor:'var(--border)', color:'var(--text-secondary)', background:'var(--bg-elevated)' }}>
                <ChevronLeft size={16} /> Précédent
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity">
                  Suivant <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={runDiagnostic} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity disabled:opacity-50">
                  <Zap size={15} /> Lancer l'analyse IA
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
