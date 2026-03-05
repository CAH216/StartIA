'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { useTheme } from '@/components/ThemeProvider';
import {
  CheckCircle, Circle, Clock, Bot, Lock, ArrowRight,
  Lightbulb, PlayCircle, ChevronDown, ChevronUp, Sparkles, Crown,
  GitBranch, X, Zap, Flag, Sun, Moon,
  TrendingUp, DollarSign, Flame,
} from 'lucide-react';
import Link from 'next/link';

type TaskStatus = 'idle' | 'active' | 'done';

interface DiagnosticResult {
  score: number;
  level: string;
  summary: string;
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

interface TaskState { [key: string]: TaskStatus; }

function buildMonths(d: DiagnosticResult) {
  const numMonths = d.score < 30 ? 4 : d.score < 65 ? 3 : 2;
  const titles = [d.timeline.month1, d.timeline.month2, d.timeline.month3];
  return Array.from({ length: numMonths }, (_, i) => {
    const slice = d.priorities.slice(i * 2, i * 2 + 2);
    const tasks: string[] = slice.length
      ? slice.map(p => `${p.title} — ${p.description}`)
      : i === 1
        ? ["Former l'équipe aux outils sélectionnés", 'Automatiser un processus interne prioritaire']
        : ['Mesurer les résultats et affiner la stratégie IA', 'Documenter et pérenniser les nouvelles pratiques'];
    return { title: titles[i] ?? `Phase ${i + 1}`, tasks };
  });
}

const MONTH_GRADIENTS = [
  { from: '#2563eb', to: '#0891b2' },
  { from: '#7c3aed', to: '#a21caf' },
  { from: '#d97706', to: '#ea580c' },
  { from: '#059669', to: '#0d9488' },
];

// ─────────────────────────────────────────────────────────────────────────────
// N8N-STYLE FLOW DIAGRAM — THEME-AWARE
// ─────────────────────────────────────────────────────────────────────────────
const PHASE_COLORS = [
  { from: '#3b82f6', to: '#0891b2', glow: '59,130,246'   },
  { from: '#8b5cf6', to: '#a855f7', glow: '139,92,246'  },
  { from: '#f59e0b', to: '#ef4444', glow: '245,158,11'  },
  { from: '#10b981', to: '#06b6d4', glow: '16,185,129'  },
];

interface FlowMonth { title: string; tasks: string[]; }
interface FlowProps {
  months: FlowMonth[];
  tasks: TaskState;
  isPro: boolean;
  score: number;
  level: string;
  onClose: () => void;
  onJumpTo: (mi: number) => void;
}

function FlowDiagram({ months, tasks, isPro, score, level, onClose, onJumpTo }: FlowProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  // — LAYOUT —
  const NODE_W    = 256;
  const NODE_GAP  = 100;
  const PAD       = 56;
  const HEADER_H  = 80;
  const TASK_H    = 38;
  const FOOT_H    = 42;
  const SPECIAL_H = 120;

  type NodeKind = 'trigger' | 'phase' | 'finish';
  interface FlowNode { kind: NodeKind; phaseIdx?: number; title: string; sub: string; tasks: string[]; }

  const nodes: FlowNode[] = [
    { kind: 'trigger', title: 'Diagnostic IA',      sub: score + '/100 · ' + level, tasks: [] },
    ...months.map((m, i): FlowNode => ({ kind: 'phase', phaseIdx: i, title: m.title, sub: 'Phase ' + (i + 1) + ' · Mois ' + (i + 1), tasks: m.tasks })),
    { kind: 'finish',  title: 'Objectif atteint',   sub: 'Implémentation complète',  tasks: [] },
  ];

  const nodeHeight = (n: FlowNode) =>
    n.kind !== 'phase' ? SPECIAL_H : HEADER_H + TASK_H * n.tasks.length + FOOT_H;

  const heights  = nodes.map(nodeHeight);
  const maxH     = Math.max(...heights);
  const canvasH  = maxH + PAD * 2 + 80;
  const canvasW  = NODE_W * nodes.length + NODE_GAP * (nodes.length - 1) + PAD * 2;

  const nx  = (i: number) => PAD + i * (NODE_W + NODE_GAP);
  const ncy = (i: number) => PAD + (maxH - heights[i]) / 2 + heights[i] / 2;

  const paths = nodes.slice(0, -1).map((_, i) => ({
    x1: nx(i) + NODE_W, y1: ncy(i),
    x2: nx(i + 1),      y2: ncy(i + 1),
    cx: nx(i) + NODE_W + NODE_GAP / 2,
    from: i,
  }));

  const phaseDone = (mi: number) =>
    months[mi].tasks.filter((_, ti) => tasks[mi + '-' + ti] === 'done').length;
  const phasePct = (mi: number) =>
    months[mi].tasks.length ? phaseDone(mi) / months[mi].tasks.length : 0;
  const totalDone = months.reduce((a, m, mi) => a + phaseDone(mi), 0);
  const totalAll  = months.reduce((a, m) => a + m.tasks.length, 0);

  // — THEME TOKENS —
  const canvas    = isDark ? '#060910' : '#eef2f7';
  const dot       = isDark
    ? 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)'
    : 'radial-gradient(circle, rgba(0,0,0,0.10) 1px, transparent 1px)';
  const cardBg    = isDark ? 'rgba(14,17,28,0.97)'  : 'rgba(255,255,255,0.98)';
  const cardBord  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const labelCol  = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const titleCol  = isDark ? '#f1f5f9' : '#0f172a';
  const subCol    = isDark ? 'rgba(255,255,255,0.46)' : 'rgba(0,0,0,0.46)';
  const taskBgIdle   = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)';
  const taskBordIdle = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.07)';
  const ringTrack    = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)';
  const hbarBg       = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.06)';
  const topbarBg     = isDark ? 'rgba(6,9,16,0.92)'  : 'rgba(245,248,255,0.92)';
  const topbarBord   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: isDark ? 'rgba(0,0,4,0.88)' : 'rgba(200,210,230,0.7)', backdropFilter: 'blur(8px)' }}>

      {/* ─ TOP BAR ─ */}
      <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ background: topbarBg, backdropFilter: 'blur(16px)', borderBottom: '1px solid ' + topbarBord }}>

        {/* Logo */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
          <GitBranch size={14} className="text-white" />
        </div>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Diagramme de flux</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.22)' }}>
            {months.length} phases
          </span>
          <span className="hidden sm:block text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(16,185,129,0.10)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            {totalDone}/{totalAll} tâches
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:block text-xs" style={{ color: 'var(--text-muted)' }}>Cliquez sur une phase pour y accéder</span>

          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)', border: '1px solid ' + topbarBord }}
            title={isDark ? 'Passer en clair' : 'Passer en sombre'}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)', border: '1px solid ' + topbarBord }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ─ CANVAS ─ */}
      <div className="flex-1 overflow-auto"
        style={{ backgroundColor: canvas, backgroundImage: dot, backgroundSize: '28px 28px' }}>

        <div style={{ width: canvasW, minHeight: canvasH, position: 'relative', margin: '0 auto', padding: PAD }}>

          {/* Inject keyframes */}
          <style>{`
            @keyframes flowDash  { to { stroke-dashoffset: -26; } }
            @keyframes nodeGlow  { 0%,100%{ opacity:.5 } 50%{ opacity:1 } }
            @keyframes nodePulse { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.08) } }
            @keyframes fadeUp    { from{ opacity:0;transform:translateY(8px) } to{ opacity:1;transform:translateY(0) } }
          `}</style>

          {/* ─ SVG CONNECTORS ─ */}
          <svg width={canvasW} height={canvasH}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', left: 0, top: 0 }}>
            <defs>
              {paths.map((p, i) => {
                const ca = PHASE_COLORS[p.from % PHASE_COLORS.length];
                const cb = PHASE_COLORS[(p.from + 1) % PHASE_COLORS.length];
                return (
                  <linearGradient key={i} id={'g' + i} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor={ca.from} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={cb.from} stopOpacity="0.85" />
                  </linearGradient>
                );
              })}
              {/* Glow filter */}
              <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              </filter>
            </defs>

            {/* Glow track */}
            {paths.map((p, i) => (
              <path key={'gl-' + i}
                d={`M ${p.x1} ${p.y1} C ${p.cx} ${p.y1} ${p.cx} ${p.y2} ${p.x2} ${p.y2}`}
                fill="none"
                stroke={PHASE_COLORS[p.from % PHASE_COLORS.length].from}
                strokeWidth="10" strokeLinecap="round"
                filter="url(#blur4)"
                opacity={isDark ? 0.22 : 0.1}
              />
            ))}

            {/* Background track */}
            {paths.map((p, i) => (
              <path key={'bg-' + i}
                d={`M ${p.x1} ${p.y1} C ${p.cx} ${p.y1} ${p.cx} ${p.y2} ${p.x2} ${p.y2}`}
                fill="none" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="2.5" strokeLinecap="round"
              />
            ))}

            {/* Animated dashes */}
            {paths.map((p, i) => (
              <path key={'d-' + i}
                d={`M ${p.x1} ${p.y1} C ${p.cx} ${p.y1} ${p.cx} ${p.y2} ${p.x2} ${p.y2}`}
                fill="none" stroke={`url(#g${i})`}
                strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray="8 6"
                style={{ animation: 'flowDash 1.6s linear infinite', animationDelay: i * 0.3 + 's' }}
              />
            ))}

            {/* Output port dot */}
            {paths.map((p, i) => (
              <circle key={'dp-' + i} cx={p.x1} cy={p.y1} r={5}
                fill={PHASE_COLORS[p.from % PHASE_COLORS.length].from} stroke={isDark ? '#060910' : '#eef2f7'} strokeWidth={2} />
            ))}

            {/* Input port dot */}
            {paths.map((p, i) => (
              <circle key={'ip-' + i} cx={p.x2} cy={p.y2} r={5}
                fill={PHASE_COLORS[(p.from + 1) % PHASE_COLORS.length].from} stroke={isDark ? '#060910' : '#eef2f7'} strokeWidth={2} />
            ))}

            {/* Arrowhead */}
            {paths.map((p, i) => (
              <path key={'a-' + i}
                d={`M ${p.x2 + 1} ${p.y2} L ${p.x2 - 9} ${p.y2 - 5} L ${p.x2 - 9} ${p.y2 + 5} Z`}
                fill={PHASE_COLORS[(p.from + 1) % PHASE_COLORS.length].from}
              />
            ))}
          </svg>

          {/* ─ NODES ─ */}
          {nodes.map((node, i) => {
            const h   = heights[i];
            const x   = nx(i);
            const ny_ = PAD + (maxH - h) / 2;
            const col = PHASE_COLORS[i % PHASE_COLORS.length];
            const isTrig  = node.kind === 'trigger';
            const isFin   = node.kind === 'finish';
            const isPh    = node.kind === 'phase';
            const mi      = node.phaseIdx ?? -1;
            const pct     = isPh ? phasePct(mi) : (isFin ? (totalDone / Math.max(totalAll, 1)) : 0);
            const done    = isPh ? phaseDone(mi) : 0;
            const locked  = isPh && mi > 0 && !isPro;
            const circ    = 2 * Math.PI * 12;
            const borderHover = col.from + (isDark ? 'bb' : '88');

            return (
              <div key={i} style={{
                position: 'absolute',
                left: x, top: ny_,
                width: NODE_W, height: h,
                animation: 'fadeUp 0.35s ease both',
                animationDelay: i * 0.07 + 's',
              }}>

                {/* Glow halo — dark mode only */}
                {isDark && (
                  <div style={{
                    position: 'absolute', inset: -6, borderRadius: 22,
                    background: `rgba(${col.glow},0.22)`,
                    filter: 'blur(18px)',
                    animation: 'nodeGlow 4s ease-in-out infinite',
                    animationDelay: i * 0.6 + 's',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Card shell */}
                <div
                  onClick={() => { if (isPh && !locked) { onJumpTo(mi); onClose(); } }}
                  style={{
                    position: 'relative',
                    width: '100%', height: '100%',
                    borderRadius: 16,
                    background: cardBg,
                    border: '1px solid ' + cardBord,
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)'
                      : '0 4px 20px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.9)',
                    cursor: isPh && !locked ? 'pointer' : 'default',
                    overflow: 'hidden',
                    transition: 'border-color .18s, box-shadow .18s, transform .15s',
                  }}
                  onMouseEnter={e => {
                    if (!isPh || locked) return;
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = borderHover;
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = isDark
                      ? '0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px ' + borderHover
                      : '0 8px 28px rgba(0,0,0,0.13), 0 0 0 1px ' + borderHover;
                  }}
                  onMouseLeave={e => {
                    if (!isPh || locked) return;
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = cardBord;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = isDark
                      ? '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)'
                      : '0 4px 20px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.9)';
                  }}
                >
                  {/* Gradient accent bar (top) */}
                  <div style={{
                    height: 3, width: '100%',
                    background: locked
                      ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
                      : `linear-gradient(90deg, ${col.from}, ${col.to})`,
                  }} />

                  {/* ─ TRIGGER / FINISH ─ */}
                  {(isTrig || isFin) && (
                    <div className="flex flex-col items-center justify-center"
                      style={{ height: SPECIAL_H - 3, gap: 10, padding: '0 16px' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 13,
                        background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 16px rgba(${col.glow},0.4)`,
                        animation: 'nodePulse 4s ease-in-out infinite',
                        animationDelay: i * 0.5 + 's',
                      }}>
                        {isTrig ? <Zap size={18} color="white" /> : <Flag size={18} color="white" />}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: titleCol, letterSpacing: '-0.2px' }}>{node.title}</p>
                        <p style={{ fontSize: 11, marginTop: 3, color: subCol }}>{node.sub}</p>
                      </div>
                      {isFin && totalAll > 0 && (
                        <div style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                          background: totalDone === totalAll ? 'rgba(16,185,129,0.12)' : hbarBg,
                          color: totalDone === totalAll ? '#10b981' : 'var(--text-muted)',
                          border: '1px solid ' + (totalDone === totalAll ? 'rgba(16,185,129,0.25)' : taskBordIdle),
                        }}>
                          {totalDone}/{totalAll} tâches
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─ PHASE CARD ─ */}
                  {isPh && (
                    <div style={{ padding: '14px 16px 16px' }}>

                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        {/* Phase icon */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: locked ? (isDark ? '#1f2937' : '#e2e8f0') : `linear-gradient(135deg, ${col.from}, ${col.to})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: locked ? 'none' : `0 3px 12px rgba(${col.glow},0.38)`,
                        }}>
                          {locked
                            ? <Lock size={14} color={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'} />
                            : pct === 1
                              ? <CheckCircle size={15} color="white" />
                              : <span style={{ color: 'white', fontWeight: 900, fontSize: 13, letterSpacing: '-0.5px' }}>{mi + 1}</span>}
                        </div>

                        {/* Title */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: labelCol }}>
                              {isPh ? 'Mois ' + (mi + 1) : ''}
                            </span>
                            {locked && (
                              <span style={{
                                fontSize: 9, padding: '1px 7px', borderRadius: 99, fontWeight: 800,
                                background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
                                border: '1px solid rgba(245,158,11,0.28)',
                              }}>PRO</span>
                            )}
                            {!locked && pct === 1 && (
                              <span style={{
                                fontSize: 9, padding: '1px 7px', borderRadius: 99, fontWeight: 800,
                                background: 'rgba(16,185,129,0.12)', color: '#10b981',
                                border: '1px solid rgba(16,185,129,0.25)',
                              }}>✓ Complété</span>
                            )}
                          </div>
                          <p style={{
                            fontSize: 12, fontWeight: 700, lineHeight: 1.4,
                            color: locked ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : titleCol,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          }}>{node.title}</p>
                        </div>

                        {/* Progress ring */}
                        {!locked && (
                          <svg width={30} height={30} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
                            <circle cx={15} cy={15} r={12} fill="none" stroke={ringTrack} strokeWidth="2.5" />
                            <circle cx={15} cy={15} r={12} fill="none"
                              stroke={pct === 1 ? '#10b981' : col.from} strokeWidth="2.5"
                              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset .7s ease' }}
                            />
                          </svg>
                        )}
                      </div>

                      {/* Tasks */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {node.tasks.map((t, ti) => {
                          const key    = mi + '-' + ti;
                          const st     = (tasks[key] as TaskStatus) ?? 'idle';
                          const label  = t.split(' — ')[0];
                          const dotCol = st === 'done' ? '#10b981' : st === 'active' ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');
                          return (
                            <div key={ti} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '7px 10px', borderRadius: 9,
                              background: st === 'done'
                                ? 'rgba(16,185,129,0.07)'
                                : st === 'active'
                                  ? (isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.06)')
                                  : taskBgIdle,
                              border: '1px solid ' + (st === 'done'
                                ? 'rgba(16,185,129,0.18)'
                                : st === 'active'
                                  ? 'rgba(59,130,246,0.2)'
                                  : taskBordIdle),
                            }}>
                              <div style={{
                                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                background: dotCol,
                                boxShadow: st !== 'idle' ? '0 0 8px ' + dotCol : 'none',
                              }} />
                              <span style={{
                                fontSize: 11, fontWeight: 500, flex: 1,
                                color: st === 'done' ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)') : 'var(--text-secondary)',
                                textDecoration: st === 'done' ? 'line-through' : 'none',
                                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                              }}>{label}</span>
                              {st === 'active' && (
                                <span style={{
                                  fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                                  background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                                  border: '1px solid rgba(59,130,246,0.22)', flexShrink: 0,
                                }}>EN COURS</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress bar + CTA */}
                      {!locked && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: labelCol }}>
                              {done}/{node.tasks.length} complétées
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: pct === 1 ? '#10b981' : col.from }}>
                              {Math.round(pct * 100)}%
                            </span>
                          </div>
                          <div style={{ height: 4, borderRadius: 99, background: hbarBg, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              background: pct === 1
                                ? 'linear-gradient(90deg,#10b981,#06b6d4)'
                                : `linear-gradient(90deg,${col.from},${col.to})`,
                              width: Math.round(pct * 100) + '%',
                              transition: 'width .7s ease',
                              boxShadow: pct > 0 ? '0 0 8px ' + col.from + '88' : 'none',
                            }} />
                          </div>
                          {pct < 1 && (
                            <p style={{ fontSize: 10, marginTop: 7, color: col.from, display: 'flex', alignItems: 'center', gap: 3, opacity: 0.72 }}>
                              <span>Cliquez pour ouvrir</span>
                              <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 1 L7 4 L1 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Locked CTA */}
                      {locked && (
                        <div style={{
                          marginTop: 12, padding: '8px 10px', borderRadius: 10,
                          background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.05)',
                          border: '1px solid rgba(245,158,11,0.2)',
                          fontSize: 11, color: '#f59e0b', textAlign: 'center', fontWeight: 600,
                        }}>
                          🔒 Débloquer avec le plan Pro
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK VALUE META — implementation time + gain per task keyword matching
// ─────────────────────────────────────────────────────────────────────────────
interface TaskMeta { time: string; gain: string; automatable: boolean; scriptKey?: string; }

function getTaskMeta(title: string): TaskMeta {
  const t = title.toLowerCase();
  if (t.includes('cal.com') || t.includes('rendez-vous') || t.includes('prise de rdv'))
    return { time: '45 min', gain: '3-4h/sem récupérées', automatable: true, scriptKey: 'calcom' };
  if (t.includes('google business') || t.includes('fiche google'))
    return { time: '1h',    gain: '+2-5 appels/mois estimés', automatable: true, scriptKey: 'googlebusiness' };
  if (t.includes('zapier') || t.includes('make.com') || t.includes('automatisation'))
    return { time: '1h30',  gain: '5h/sem économisées', automatable: true, scriptKey: 'zapier' };
  if (t.includes('chatgpt') || t.includes('copilot') || t.includes('formation') || t.includes('former'))
    return { time: '2h',    gain: '3-5h/sem gagnées par personne', automatable: false };
  if (t.includes('devis') || t.includes('gabarit') || t.includes('modèle'))
    return { time: '2h',    gain: '45min économisées par devis', automatable: false };
  if (t.includes('crm') || t.includes('client') || t.includes('contact'))
    return { time: '2h',    gain: '0 client oublié · +15% conversion', automatable: true, scriptKey: 'crm' };
  if (t.includes('audit') || t.includes('analyse') || t.includes('diagnostic'))
    return { time: '1h',    gain: 'Identifies tes quick wins', automatable: false };
  if (t.includes('mailchimp') || t.includes('brevo') || t.includes('courriel') || t.includes('email'))
    return { time: '1h',    gain: '+30% taux de retour clients', automatable: true, scriptKey: 'email' };
  if (t.includes('notion') || t.includes('trello') || t.includes('asana') || t.includes('monday'))
    return { time: '1h30',  gain: '40% moins de temps en suivi', automatable: true, scriptKey: 'pm' };
  if (t.includes('quickbooks') || t.includes('comptab') || t.includes('factur'))
    return { time: '1h',    gain: '2h/sem sur la comptabilité', automatable: true, scriptKey: 'accounting' };
  if (t.includes('linkedin') || t.includes('réseaux') || t.includes('marketing'))
    return { time: '2h',    gain: '+visibilité en ligne estimée', automatable: false };
  if (t.includes('mesurer') || t.includes('kpi') || t.includes('rapport'))
    return { time: '1h',    gain: 'Décisions 2x plus rapides', automatable: false };
  return { time: '1-2h',  gain: 'Gain direct sur vos opérations', automatable: false };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [tasks, setTasks]           = useState<TaskState>({});
  const [expanded, setExpanded]     = useState<number | null>(0);
  const [showFlow, setShowFlow]     = useState(false);
  const [isPro] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('stratia_plan') === 'pro'
  );

  useEffect(() => {
    // Restore diagnostic from localStorage
    const saved = localStorage.getItem('stratia_diagnostic');
    if (saved) { try { setDiagnostic(JSON.parse(saved)); } catch { /**/ } }

    // Load tasks from DB (takes priority over localStorage)
    fetch('/api/user/tasks')
      .then(r => r.ok ? r.json() : null)
      .then((map: Record<string, string> | null) => {
        if (map && Object.keys(map).length > 0) {
          // DB returns uppercase IDLE/ACTIVE/DONE — convert to lowercase for local state
          const converted: TaskState = {};
          for (const [k, v] of Object.entries(map)) {
            converted[k] = v.toLowerCase() as TaskStatus;
          }
          setTasks(converted);
          localStorage.setItem('stratia_roadmap_progress', JSON.stringify(converted));
        } else {
          // Fallback to localStorage if DB has nothing yet
          const savedTasks = localStorage.getItem('stratia_roadmap_progress');
          if (savedTasks) { try { setTasks(JSON.parse(savedTasks)); } catch { /**/ } }
        }
      })
      .catch(() => {
        // DB unreachable — fall back to localStorage
        const savedTasks = localStorage.getItem('stratia_roadmap_progress');
        if (savedTasks) { try { setTasks(JSON.parse(savedTasks)); } catch { /**/ } }
      });
  }, []);

  function setTaskStatus(key: string, status: TaskStatus) {
    setTasks(prev => {
      const next = { ...prev, [key]: status };
      localStorage.setItem('stratia_roadmap_progress', JSON.stringify(next));
      // Persist to DB (status to uppercase for Prisma enum)
      fetch('/api/user/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: [{ taskKey: key, status: status.toUpperCase() }] }),
      }).catch(console.error);
      return next;
    });
  }

  if (!diagnostic) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Lightbulb size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            Votre roadmap sera personnalisée
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Complétez d&apos;abord le Diagnostic IA pour obtenir un plan
            d&apos;action adapté à votre secteur et vos objectifs.
          </p>
          <Link href="/diagnostic"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity shadow-md">
            Faire le diagnostic <ArrowRight size={15} />
          </Link>
        </div>
      </AppShell>
    );
  }

  const months = buildMonths(diagnostic);
  const totalTasks = months.reduce((a, m) => a + m.tasks.length, 0);
  const doneTasks = Object.values(tasks).filter(v => v === 'done').length;
  const activeTasks = Object.values(tasks).filter(v => v === 'active').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-3 py-6 sm:px-4 sm:py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Roadmap IA · {months.length} mois
          </p>
          <h1 className="text-xl font-black sm:text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Votre plan d&apos;action IA
          </h1>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {diagnostic.summary}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Score IA',    value: `${diagnostic.score}` },
              { label: 'Avancement',  value: `${progressPct}%` },
              { label: activeTasks > 0 ? 'En cours' : 'Terminées', value: activeTasks > 0 ? `${activeTasks}` : `${doneTasks}/${totalTasks}` },
            ].map(s => (
              <div key={s.label} className="text-center py-3 rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <p className="text-lg font-black sm:text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700"
              style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {doneTasks} terminée{doneTasks !== 1 ? 's' : ''} · {totalTasks} tâches au total
          </p>

          {/* Impact metrics from diagnostic */}
          {diagnostic.metrics && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: <Clock size={12} className="text-red-400" />, val: `${diagnostic.metrics.hoursLostPerWeek}h/sem`, lab: 'perdues actuellement', accent: '#ef4444' },
                { icon: <TrendingUp size={12} className="text-emerald-400" />, val: `${diagnostic.metrics.hoursGainedPerWeek}h/sem`, lab: 'à récupérer avec IA', accent: '#10b981' },
                { icon: <Flame size={12} className="text-orange-400" />, val: `${diagnostic.metrics.costOfInactionMonthly.toLocaleString('fr-CA')} $`, lab: 'coût inaction/mois', accent: '#f97316' },
                { icon: <DollarSign size={12} className="text-blue-400" />, val: `+${diagnostic.metrics.estimatedRoiMonthly.toLocaleString('fr-CA')} $`, lab: 'ROI mensuel estimé', accent: '#3b82f6' },
              ].map((tile, i) => (
                <div key={i} className="flex flex-col items-center text-center py-2.5 px-2 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1 mb-1">{tile.icon}</div>
                  <p className="text-sm font-black" style={{ color: tile.accent }}>{tile.val}</p>
                  <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{tile.lab}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flow Diagram Button */}
        <button
          onClick={() => setShowFlow(true)}
          className="w-full flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-2xl transition-all hover:border-blue-500/40 group"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(8,145,178,0.04))',
            border: '1px solid rgba(59,130,246,0.18)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <GitBranch size={15} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Diagramme de flux</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Visualisez toutes vos phases et connexions — style N8N
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {months.map((_, mi) => {
              const done = months[mi].tasks.filter((__, ti) => tasks[`${mi}-${ti}`] === 'done').length;
              const pct  = months[mi].tasks.length ? done / months[mi].tasks.length : 0;
              const col  = MONTH_GRADIENTS[mi % MONTH_GRADIENTS.length];
              return (
                <div key={mi} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: pct === 1 ? '#22c55e' : pct > 0 ? col.from : 'var(--border)',
                  transition: 'background .3s',
                }} />
              );
            })}
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} className="group-hover:text-blue-400 transition-colors ml-1" />
          </div>
        </button>

        {/* N8N Flow Modal */}
        {showFlow && (
          <FlowDiagram
            months={months}
            tasks={tasks}
            isPro={isPro}
            score={diagnostic.score}
            level={diagnostic.level}
            onClose={() => setShowFlow(false)}
            onJumpTo={(mi) => { setExpanded(mi); }}
          />
        )}

        {/* Months */}
        <div className="space-y-3 mb-8">
          {months.map((month, mi) => {
            const isLocked = mi > 0 && !isPro;
            const g = MONTH_GRADIENTS[mi % MONTH_GRADIENTS.length];
            const monthDone = month.tasks.filter((_, ti) => tasks[`${mi}-${ti}`] === 'done').length;
            const monthPct = Math.round((monthDone / month.tasks.length) * 100);
            const isOpen = expanded === mi;

            return (
              <div key={mi} className="rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${isOpen && !isLocked ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                }}>

                {/* Accordion toggle */}
                <button
                  className="w-full px-4 py-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.03]"
                  onClick={() => !isLocked && setExpanded(isOpen ? null : mi)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: isLocked ? '#374151' : `linear-gradient(135deg, ${g.from}, ${g.to})` }}>
                    {isLocked
                      ? <Lock size={16} className="opacity-60" />
                      : monthPct === 100
                        ? <CheckCircle size={17} />
                        : <span className="font-black text-sm">{mi + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        Mois {mi + 1}
                      </span>
                      {isLocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pro</span>
                      )}
                      {monthPct === 100 && !isLocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400">✓ Complété</span>
                      )}
                    </div>
                    <p className="font-bold text-sm leading-snug truncate"
                      style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {month.title}
                    </p>
                  </div>
                  {!isLocked && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{monthPct}%</span>
                      {isOpen ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} />
                               : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  )}
                </button>

                {/* Paywall */}
                {isLocked && (
                  <div className="mx-3 mb-3 rounded-xl p-3"
                    style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.18)' }}>
                    <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>Mois {mi + 1} verrouillé</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      Accédez aux {months.length - 1} mois suivants avec le plan Professionnel.
                    </p>
                    <Link href="/pricing"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #d97706, #ea580c)' }}>
                      <Crown size={12} /> Débloquer — 69$/mois
                    </Link>
                  </div>
                )}

                {/* Tasks */}
                {isOpen && !isLocked && (
                  <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold pt-3 pb-0.5" style={{ color: 'var(--text-muted)' }}>
                      {month.tasks.length} tâche{month.tasks.length > 1 ? 's' : ''} ce mois
                    </p>

                    {month.tasks.map((task, ti) => {
                      const key = `${mi}-${ti}`;
                      const status: TaskStatus = (tasks[key] as TaskStatus) ?? 'idle';
                      const [titlePart, ...rest] = task.split(' — ');
                      const descPart = rest.join(' — ');
                      const meta = getTaskMeta(titlePart);

                      // Build assistant URL with context
                      const assistantUrl = `/assistant?task=${encodeURIComponent(titlePart)}&desc=${encodeURIComponent(descPart)}&month=${mi + 1}&score=${diagnostic.score}&level=${encodeURIComponent(diagnostic.level)}`;

                      const borderColor = status === 'active'
                        ? 'rgba(59,130,246,0.25)' : status === 'done'
                        ? 'rgba(16,185,129,0.2)' : 'var(--border)';
                      const bgColor = status === 'active'
                        ? 'rgba(59,130,246,0.04)' : status === 'done'
                        ? 'rgba(16,185,129,0.03)' : 'var(--bg-elevated)';

                      return (
                        <div key={ti} className="rounded-xl transition-all"
                          style={{ background: bgColor, border: `1px solid ${borderColor}` }}>

                          {/* Task row */}
                          <div className="flex items-start gap-2.5 p-3">
                            <button className="mt-0.5 flex-shrink-0 active:scale-90 transition-transform"
                              onClick={() => status === 'done' && setTaskStatus(key, 'idle')}>
                              {status === 'done'
                                ? <CheckCircle size={18} className="text-emerald-400" />
                                : status === 'active'
                                  ? <Clock size={18} className="text-blue-400" />
                                  : <Circle size={18} style={{ color: 'var(--text-muted)' }} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold leading-snug"
                                style={{
                                  color: status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                                  textDecoration: status === 'done' ? 'line-through' : 'none',
                                }}>
                                {titlePart}
                              </p>
                              {descPart && (
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                  {descPart}
                                </p>
                              )}
                              {/* Value badges */}
                              {status !== 'done' && (
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                                    style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.18)' }}>
                                    <Clock size={9} /> À implémenter en ~{meta.time}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                                    style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.18)' }}>
                                    <TrendingUp size={9} /> Une fois fait : {meta.gain}
                                  </span>
                                </div>
                              )}
                            </div>
                            {status === 'active' && (
                              <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold whitespace-nowrap">
                                En cours
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          {status !== 'done' && (
                            <div className="px-3 pb-3 flex items-center gap-2 flex-wrap">
                              {status === 'idle' ? (
                                <button onClick={() => setTaskStatus(key, 'active')}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
                                  style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}>
                                  <PlayCircle size={12} /> Commencer
                                </button>
                              ) : (
                                <button onClick={() => setTaskStatus(key, 'done')}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors">
                                  <CheckCircle size={12} /> Terminer
                                </button>
                              )}
                              <Link href={assistantUrl}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                                <Bot size={11} /> Aide IA sur cette tâche
                              </Link>
                            </div>
                          )}

                          {status === 'done' && (
                            <div className="px-3 pb-2.5">
                              <button onClick={() => setTaskStatus(key, 'idle')}
                                className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>
                                Annuler la complétion
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Tools strip */}
                    {diagnostic.tools.length > 0 && (
                      <div className="rounded-xl p-3 flex flex-wrap items-center gap-2"
                        style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                        <Sparkles size={11} className="text-blue-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-blue-400">Outils :</span>
                        {diagnostic.tools.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            {t.canadian ? '🇨🇦 ' : ''}{t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/diagnostic"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            Refaire le diagnostic <ArrowRight size={13} />
          </Link>
          {!isPro && (
            <Link href="/pricing"
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold border"
              style={{ borderColor: 'rgba(234,179,8,0.3)', color: '#f59e0b', background: 'rgba(234,179,8,0.05)' }}>
              <Crown size={13} /> Débloquer tous les mois
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}