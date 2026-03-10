'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, Building2, ArrowRight, CheckCircle,
  Video, Sparkles, BookOpen, Award, Star, ChevronDown,
  Play, Zap, Users, TrendingUp, Clock, Moon, Sun,
  Brain, MessageCircle, Shield, BarChart3,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import NewsletterBanner from '@/components/NewsletterBanner';
import AIGuideWidget from '@/components/AIGuideWidget';

/* ─── Animation hook ─────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>{children}</div>
  );
}

/* ─── Counter animation ──────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const S = {
  primary: 'var(--primary)',
  accent: 'var(--accent)',
  base: 'var(--bg-base)',
  surface: 'var(--bg-surface)',
  elevated: 'var(--bg-elevated)',
  border: 'var(--border)',
  text: 'var(--text-primary)',
  muted: 'var(--text-secondary)',
};

/* ══════════════════════════════════════════════════════
   1. TOPNAV
══════════════════════════════════════════════════════ */
function Topnav() {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navText   = scrolled ? S.muted   : isDark ? 'rgba(255,255,255,0.78)' : '#1e293b';
  const logoText  = scrolled ? S.text    : isDark ? '#ffffff'                : '#0f172a';
  const btnBg     = scrolled ? S.elevated : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const btnBorder = scrolled ? '1px solid var(--border)' : isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.12)';
  const loginBg   = scrolled ? S.elevated : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const loginBorder = scrolled ? '1px solid var(--border)' : isDark ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(0,0,0,0.14)';

  const links = [
    { label: t('nav_formations_link'), href: '#formations' },
    { label: t('nav_integration_link'), href: '#integration' },
    { label: t('nav_temoignages'), href: '#temoignages' },
    { label: t('nav_how_it_works'), href: '#steps' },
    { label: t('nav_pricing'), href: '/pricing' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
      background: scrolled ? 'var(--nav-bg, color-mix(in srgb, var(--bg-surface) 90%, transparent))' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    }}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight" style={{ color: logoText }}>
            Strat<span style={{ color: '#059669' }}>IA</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ label, href }) => (
            href.startsWith('/') ? (
              <Link key={href} href={href} className="px-3 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-80"
                style={{ color: navText }}>{label}</Link>
            ) : (
              <a key={href} href={href} className="px-3 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-80"
                style={{ color: navText }}>{label}</a>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: btnBg, border: btnBorder }}>
            {isDark
              ? <Sun size={16} className="text-yellow-400" />
              : <Moon size={16} style={{ color: scrolled ? '#475569' : '#334155' }} />}
          </button>
          <Link href="/auth/login" className="hidden sm:flex px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ color: navText, border: loginBorder, background: loginBg }}>
            {t('nav_login')}
          </Link>
          <Link href="/auth/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
            {t('nav_start')}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════
   2. HERO
══════════════════════════════════════════════════════ */

function CyclingWord() {
  const { tf } = useLanguage();
  const words = tf<{ word: string; color: string }[]>('land_h1_cycling') ?? [
    { word: 'productives', color: '#34d399' },
    { word: 'innovantes',  color: '#22d3ee' },
  ];
  const CYCLING_WORDS = Array.isArray(words)
    ? words.map((w, i) => ({
        word: typeof w === 'string' ? w : w.word,
        color: typeof w === 'string'
          ? ['#34d399','#22d3ee','#a78bfa','#fbbf24'][i % 4]
          : w.color,
      }))
    : [{ word: 'productives', color: '#34d399' }];

  const [idx, setIdx]       = useState(0);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIdx(i => (i + 1) % CYCLING_WORDS.length); setFading(false); }, 380);
    }, 2800);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CYCLING_WORDS.length]);

  const { word, color } = CYCLING_WORDS[idx];
  return (
    <span style={{
      color, display: 'inline-block',
      opacity: fading ? 0 : 1,
      transform: fading ? 'translateY(10px)' : 'translateY(0)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      minWidth: '12ch', textAlign: 'center',
    }}>{word}</span>
  );
}

function Hero() {
  const { theme } = useTheme();
  const { t }     = useLanguage();
  const isDark     = theme === 'dark';

  const heroBg = isDark
    ? 'linear-gradient(150deg,#020d18 0%,#04201a 30%,#071a2e 60%,#020d18 100%)'
    : 'linear-gradient(150deg,#ecfdf5 0%,#f0fdf4 25%,#eff6ff 60%,#f0f9ff 100%)';

  const titleColor = isDark ? '#ffffff' : '#0f172a';
  const subColor   = isDark
    ? { background:'linear-gradient(135deg,#86efac,#67e8f9,#93c5fd)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }
    : { color:'#334155' };
  const btn2Bg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btn2Border = isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.12)';
  const btn2Color  = isDark ? 'rgba(255,255,255,0.8)' : '#1e293b';
  const statLabel  = isDark ? 'rgba(255,255,255,0.60)' : '#64748b';
  const scrollColor= isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  const orbeOp1 = isDark ? 0.22 : 0.10;
  const orbeOp2 = isDark ? 0.18 : 0.08;
  const orbeOp3 = isDark ? 0.12 : 0.06;

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-5 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: heroBg }}/>
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div style={{ position:'absolute', width:750, height:750, borderRadius:'50%', top:-200, left:-250, opacity: orbeOp1, background:'radial-gradient(circle,#10b981,transparent 65%)', animation:'blobFloat 9s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', width:550, height:550, borderRadius:'50%', bottom:-120, right:-150, opacity: orbeOp2, background:'radial-gradient(circle,#0891b2,transparent 65%)', animation:'blobFloat 12s ease-in-out 3s infinite reverse' }}/>
        <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', top:'35%', left:'50%', opacity: orbeOp3, background:'radial-gradient(circle,#6d28d9,transparent 65%)', animation:'blobFloat 7s ease-in-out 1.5s infinite' }}/>
        <div style={{ position:'absolute', inset:0, opacity: isDark ? 0.035 : 0.04, backgroundImage:'linear-gradient(rgba(0,0,0,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.4) 1px,transparent 1px)', backgroundSize:'56px 56px' }}/>
      </div>

      <div className="relative max-w-4xl mx-auto w-full text-center z-10">
        {/* H1 — taille forcée, vraiment grande sur mobile */}
        <h1
          className="font-black leading-[1.15] tracking-tight mb-5"
          style={{
            color: titleColor,
            fontSize: 'clamp(3rem, 12vw, 4.5rem)',
          }}
        >
          {t('land_h1_part1')}<br/>
          <CyclingWord /><br/>
          <span style={{
            background:'linear-gradient(135deg,#34d399 0%,#22d3ee 50%,#60a5fa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'
          }}>{t('land_h1_part2')}</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={subColor}>
          {t('land_h1_sub').split('\\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br/>}</span>
          ))}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link href="/auth/register"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-[1.04]" style={{ background:'linear-gradient(135deg,#059669,#0891b2)', boxShadow:'0 8px 32px rgba(16,185,129,0.35)' }}>
            <Zap size={17}/> {t('land_cta_primary')}
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
          {/* — Bouton démo visible sans connexion — */}
          <Link href="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all hover:scale-[1.02]"
            style={{ background: btn2Bg, border: btn2Border, color: btn2Color, backdropFilter:'blur(8px)' }}>
            <Play size={15}/> {t('cta_demo')}
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
          {[
            { value:200, suffix:'+', label: t('land_stat1') },
            { value:50,  suffix:'+', label: t('land_stat2') },
            { value:97,  suffix:'%', label: t('land_stat3') },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black" style={{
                background:'linear-gradient(135deg,#34d399,#22d3ee)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'
              }}>
                <Counter target={value} suffix={suffix}/>
              </p>
              <p className="text-xs mt-1" style={{ color: statLabel }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <a href="#problem" className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 hover:opacity-70 transition-opacity">
        <span className="text-xs" style={{ color: scrollColor }}>{t('land_scroll')}</span>
        <ChevronDown size={16} style={{ color: scrollColor, animation:'bounce 2s infinite' }}/>
      </a>

      <style>{`
        @keyframes blobFloat { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(18px,-18px)scale(1.04)} }
        @keyframes bounce    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
      `}</style>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   3. SOCIAL PROOF BAR
══════════════════════════════════════════════════════ */
function ProofBar() {
  const { t } = useLanguage();
  const items = ['Construction Dupont', 'TechServices Montréal', 'Industries Laval', 'RH Consilium', 'Agence NovaBuild', 'Groupe Élaïs'];
  return (
    <section style={{ background: S.elevated, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-5 py-6">
        <div className="flex items-center gap-8 flex-wrap justify-center">
          <p className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: S.muted }}>{t('proof_trust')}</p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {items.map((name) => (
              <span key={name} className="text-sm font-bold opacity-30 hover:opacity-70 transition-opacity" style={{ color: S.text }}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   4. PROBLEM
══════════════════════════════════════════════════════ */
function Problem() {
  const { t, lang } = useLanguage();
  const pains = lang === 'en' ? [
    { icon: Clock, title: 'Too much time on manual tasks', desc: 'Billing, tracking, reports, emails — hours lost every week that could be automated with AI.', color: '#ef4444' },
    { icon: TrendingUp, title: 'Competition is overtaking you', desc: 'Professionals and companies adopting AI now capture more clients, deliver faster, and cost less.', color: '#f59e0b' },
    { icon: Brain, title: "You don't know where to start", desc: 'Too many tools, too many promises. The result: paralysis and zero concrete implementation. We simplify every step.', color: '#8b5cf6' },
    { icon: Users, title: 'You advance alone, without a method', desc: 'Without adapted training and concrete support, even the best tool will remain unused — whether you are solo or in a team.', color: '#3b82f6' },
  ] : [
    { icon: Clock, title: 'Trop de temps sur des tâches manuelles', desc: "Facturation, suivis, rapports, e-mails — des heures perdues chaque semaine qui pourraient être automatisées grâce à l'intelligence artificielle.", color: '#ef4444' },
    { icon: TrendingUp, title: 'La concurrence vous dépasse', desc: "Les professionnels et entreprises qui adoptent l'IA maintenant captent plus de clients, livrent plus vite, et coûtent moins.", color: '#f59e0b' },
    { icon: Brain, title: 'Vous ne savez pas par où commencer', desc: "Trop d'outils, trop de promesses. Résultat : paralysie et zéro implémentation concrète. Nous simplifions chaque étape.", color: '#8b5cf6' },
    { icon: Users, title: 'Vous avancez seul, sans méthode', desc: "Sans formation adaptée et accompagnement concret, même le meilleur outil restera inutilisé — que vous soyez solo ou en équipe.", color: '#3b82f6' },
  ];
  return (
    <section id="problem" className="py-28 px-5" style={{ background: S.base }}>
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{t('prob_badge')}</span>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: S.text }}>{t('prob_h2')}</h2>
          <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: S.muted }}>{t('prob_sub')}</p>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pains.map(({ icon: Icon, title, desc, color }, i) => (
            <FadeUp key={title} delay={i * 100}>
              <div className="group p-6 rounded-2xl h-full transition-all hover:scale-[1.01]" style={{ background: S.surface, border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0" style={{ background: `color-mix(in srgb,${color} 12%,transparent)` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: S.text }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: S.muted }}>{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   5. SOLUTION
══════════════════════════════════════════════════════ */
function Solution() {
  const { t, lang } = useLanguage();
  const p1Features = lang === 'en'
    ? ['50+ expert courses with integrated player', 'AI-personalised path in 4 questions', 'Downloadable certificates at each step', 'Lifetime access · Continuous updates']
    : ['50+ formations expertes avec player intégré', 'Parcours personnalisé par IA en 4 questions', 'Certificats téléchargeables à chaque étape', 'Accès à vie · Mises à jour continues'];
  const p2Features = lang === 'en'
    ? ['On-site process analysis', 'Personalised implementation plan delivered', 'Team training and support', '30-day follow-up and adjustments']
    : ["Analyse de vos processus sur site", "Plan d'implémentation personnalisé livré", "Accompagnement et formation de votre équipe", "Suivi et ajustements sur 30 jours"];
  const chips = lang === 'en'
    ? [
        { icon: Sparkles, label: 'Personalised path', color: '#8b5cf6' },
        { icon: BookOpen, label: 'Resources & guides', color: '#059669' },
        { icon: Award, label: 'Certificates', color: '#f59e0b' },
        { icon: MessageCircle, label: '24/7 Chat', color: '#06b6d4' },
        { icon: Shield, label: 'Secure', color: '#3b82f6' },
      ]
    : [
        { icon: Sparkles, label: 'Parcours personnalisé', color: '#8b5cf6' },
        { icon: BookOpen, label: 'Ressources & guides', color: '#059669' },
        { icon: Award, label: 'Certificats', color: '#f59e0b' },
        { icon: MessageCircle, label: 'Chat 24h/7j', color: '#06b6d4' },
        { icon: Shield, label: 'Sécurisé', color: '#3b82f6' },
      ];
  return (
    <section id="formations" className="py-28 px-5" style={{ background: S.elevated }}>
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: 'color-mix(in srgb,#059669 10%,transparent)', color: '#059669', border: '1px solid color-mix(in srgb,#059669 22%,transparent)' }}>{t('sol_badge')}</span>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: S.text }}>
            {t('sol_h2a')}<br/>
            <span style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('sol_h2b')}</span>
          </h2>
          <p className="text-lg mt-4 max-w-xl mx-auto" style={{ color: S.muted }}>{t('sol_sub')}</p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeUp delay={100}>
            <div className="rounded-3xl p-8 h-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(5,150,105,0.07),rgba(8,145,178,0.04))', border: '1px solid rgba(5,150,105,0.18)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 6px 20px rgba(5,150,105,0.35)' }}>
                <Video size={22} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#059669' }}>{t('sol_p1_badge')}</span>
              <h3 className="text-2xl font-black mt-2 mb-3" style={{ color: S.text }}>{t('sol_p1_title')}</h3>
              <p className="text-base leading-relaxed mb-6" style={{ color: S.muted }}>{t('sol_p1_body')}</p>
              <ul className="space-y-2.5 mb-6">
                {p1Features.map(feat => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm" style={{ color: S.muted }}>
                    <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/formations" className="inline-flex items-center gap-2 font-bold text-sm" style={{ color: '#059669' }}>
                {t('sol_p1_cta')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={200}>
            <div className="rounded-3xl p-8 h-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.07),rgba(217,70,239,0.04))', border: '1px solid rgba(139,92,246,0.18)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg,#8b5cf6,#d946ef)', boxShadow: '0 6px 20px rgba(139,92,246,0.35)' }}>
                <Building2 size={22} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>{t('sol_p2_badge')}</span>
              <h3 className="text-2xl font-black mt-2 mb-3" style={{ color: S.text }}>{t('sol_p2_title')}</h3>
              <p className="text-base leading-relaxed mb-6" style={{ color: S.muted }}>{t('sol_p2_body')}</p>
              <ul className="space-y-2.5 mb-6">
                {p2Features.map(feat => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm" style={{ color: S.muted }}>
                    <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#8b5cf6' }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/integration" className="inline-flex items-center gap-2 font-bold text-sm" style={{ color: '#8b5cf6' }}>
                {t('sol_p2_cta')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={300} className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {chips.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: S.surface, border: '1px solid var(--border)' }}>
              <Icon size={15} style={{ color, flexShrink: 0 }} />
              <span className="text-xs font-semibold" style={{ color: S.text }}>{label}</span>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   6. HOW IT WORKS
══════════════════════════════════════════════════════ */
function HowItWorks() {
  const { t, lang } = useLanguage();
  const steps = lang === 'en' ? [
    { n: '01', icon: Sparkles, title: 'Create your account', desc: 'Sign up in seconds (or with Google), answer 4 quick questions. We immediately generate your personalised AI learning path.', color: '#059669' },
    { n: '02', icon: Play, title: 'Follow your courses', desc: 'Access expert videos from any device. Progress at your own pace, earn your certificates step by step.', color: '#8b5cf6' },
    { n: '03', icon: Building2, title: 'Take action', desc: 'Optionally, our team analyses your processes and delivers a concrete, measurable AI integration plan.', color: '#0891b2' },
  ] : [
    { n: '01', icon: Sparkles, title: 'Créez votre compte', desc: "Inscrivez-vous en secondes (ou avec Google), répondez à 4 questions rapides. Nous générons immédiatement votre parcours de formations personnalisé en intelligence artificielle.", color: '#059669' },
    { n: '02', icon: Play, title: 'Suivez vos formations', desc: "Accédez aux vidéos experts depuis n'importe quel appareil. Progressez à votre rythme, obtenez vos certificats étape par étape.", color: '#8b5cf6' },
    { n: '03', icon: Building2, title: "Passez à l'action", desc: "Optionnellement, notre équipe analyse vos processus et livre un plan d'intégration de l'IA concret et mesurable.", color: '#0891b2' },
  ];
  return (
    <section id="steps" className="py-28 px-5" style={{ background: S.base }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: 'color-mix(in srgb,#8b5cf6 10%,transparent)', color: '#8b5cf6', border: '1px solid color-mix(in srgb,#8b5cf6 22%,transparent)' }}>{t('how_badge')}</span>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: S.text }}>{t('how_h2')}</h2>
          <p className="text-lg mt-4" style={{ color: S.muted }}>{t('how_sub')}</p>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-[52px] left-1/3 right-1/3 h-px" style={{ background: 'linear-gradient(90deg,#059669,#8b5cf6)' }} />
          <div className="hidden md:block absolute top-[52px] left-2/3 right-0 h-px" style={{ background: 'linear-gradient(90deg,#8b5cf6,#0891b2)' }} />
          {steps.map(({ n, icon: Icon, title, desc, color }, i) => (
            <FadeUp key={title} delay={i * 150}>
              <div className="flex flex-col items-center text-center p-7 rounded-2xl" style={{ background: S.surface, border: '1px solid var(--border)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative" style={{ background: `color-mix(in srgb,${color} 12%,var(--bg-elevated))`, border: `2px solid color-mix(in srgb,${color} 30%,transparent)` }}>
                  <Icon size={24} style={{ color }} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-[10px] font-black flex items-center justify-center" style={{ background: color }}>{n.slice(1)}</span>
                </div>
                <h3 className="font-black text-base mb-2" style={{ color: S.text }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: S.muted }}>{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   7. INTEGRATION SPOTLIGHT
══════════════════════════════════════════════════════ */
function IntegrationSpotlight() {
  const { t, lang } = useLanguage();
  const phases = lang === 'en' ? [
    { label: 'Online request', desc: '4 simple steps: company, processes, budget, confirmation.', color: '#059669' },
    { label: 'Qualification call', desc: 'Our consultant contacts you within 48h to validate the scope.', color: '#8b5cf6' },
    { label: 'Site visit', desc: 'Analysis of your existing processes and information gathering.', color: '#0891b2' },
    { label: 'Report & plan delivered', desc: 'Personalised AI integration plan + team training.', color: '#f59e0b' },
  ] : [
    { label: 'Demande en ligne', desc: '4 étapes simples : entreprise, processus, budget, confirmation.', color: '#059669' },
    { label: 'Appel de qualification', desc: 'Notre consultant vous contacte sous 48h pour valider le périmètre.', color: '#8b5cf6' },
    { label: 'Visite sur site', desc: "Analyse de vos processus existants et collecte d'informations.", color: '#0891b2' },
    { label: 'Rapport & plan livré', desc: "Plan d'intégration IA personnalisé + formation de vos équipes.", color: '#f59e0b' },
  ];
  return (
    <section id="integration" className="py-28 px-5" style={{ background: S.elevated }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <FadeUp>
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ background: 'color-mix(in srgb,#8b5cf6 10%,transparent)', color: '#8b5cf6', border: '1px solid color-mix(in srgb,#8b5cf6 22%,transparent)' }}>{t('integ_badge')}</span>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-5" style={{ color: S.text }}>
            {t('integ_h2a')}<br/>
            <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('integ_h2b')}</span>
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: S.muted }}>{t('integ_body')}</p>
          <Link href="/integration" className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#0891b2)', boxShadow: '0 6px 20px rgba(139,92,246,0.3)' }}>
            {t('integ_cta')} <ArrowRight size={16} />
          </Link>
        </FadeUp>

        <FadeUp delay={150}>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 24px 60px rgba(139,92,246,0.18)' }}>
              <Image src="/integration-team.png" alt={t('integ_badge')} width={600} height={420} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl"
              style={{ background: S.surface, border: '1px solid var(--border)' }}>
              <div className="text-2xl">📈</div>
              <div>
                <p className="font-black text-lg" style={{ color: '#059669' }}>+48%</p>
                <p className="text-xs" style={{ color: S.muted }}>{t('integ_productivity')}</p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>

      <FadeUp delay={200} className="max-w-6xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.map(({ label, desc, color }, i) => (
          <div key={label} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: S.surface, border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-sm" style={{ background: color, minWidth: 36 }}>{i + 1}</div>
            <div>
              <p className="font-bold text-sm" style={{ color: S.text }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: S.muted }}>{desc}</p>
            </div>
          </div>
        ))}
      </FadeUp>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   8. TESTIMONIALS
══════════════════════════════════════════════════════ */
function Testimonials() {
  const { t, lang } = useLanguage();
  const testimonials = lang === 'en' ? [
    { name: 'Marie-Ève Tremblay', role: 'Operations Director · Industries Laval', quote: 'In 3 weeks, our team automated 60% of billing. The ROI was evident from the first month.', stars: 5, avatar: 'MT' },
    { name: 'Jean-Philippe Côté', role: 'CEO · Group Construction JP', quote: "The video courses are of exceptional quality. And the team that came to us transformed how we manage quotes.", stars: 5, avatar: 'JC' },
    { name: 'Sophie Beaudet', role: 'HR Manager · TechServices Mtl', quote: "The personalised AI path was perfectly adapted to our level. We weren't lost from the start — we really progressed.", stars: 5, avatar: 'SB' },
  ] : [
    { name: 'Marie-Ève Tremblay', role: 'Directrice Opérations · Industries Laval', quote: 'En 3 semaines, notre équipe a automatisé 60% de la facturation. Le ROI était évident dès le premier mois.', stars: 5, avatar: 'MT' },
    { name: 'Jean-Philippe Côté', role: 'PDG · Groupe Construction JP', quote: "Les formations vidéo sont d'une qualité exceptionnelle. Et l'équipe qui est venue chez nous a transformé notre façon de gérer les soumissions.", stars: 5, avatar: 'JC' },
    { name: 'Sophie Beaudet', role: 'RH Manager · TechServices Mtl', quote: "Le parcours IA personnalisé était parfaitement adapté à notre niveau. On n'était pas perdus dès le départ — on progressait vraiment.", stars: 5, avatar: 'SB' },
  ];
  const stats = lang === 'en' ? [
    { icon: BarChart3, value: '48%', label: 'Operational time reduction', color: '#059669' },
    { icon: TrendingUp, value: '3.2×', label: 'Average ROI at 6 months', color: '#059669' },
    { icon: Users, value: '200+', label: 'Companies supported', color: '#8b5cf6' },
    { icon: Award, value: '4.9/5', label: 'Satisfaction score', color: '#f59e0b' },
  ] : [
    { icon: BarChart3, value: '48%', label: 'Réduction temps opérationnel', color: '#059669' },
    { icon: TrendingUp, value: '3.2×', label: 'ROI moyen à 6 mois', color: '#059669' },
    { icon: Users, value: '200+', label: 'Entreprises accompagnées', color: '#8b5cf6' },
    { icon: Award, value: '4.9/5', label: 'Note de satisfaction', color: '#f59e0b' },
  ];
  return (
    <section id="temoignages" className="py-28 px-5" style={{ background: S.base }}>
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: 'color-mix(in srgb,#f59e0b 10%,transparent)', color: '#f59e0b', border: '1px solid color-mix(in srgb,#f59e0b 22%,transparent)' }}>{t('test_badge')}</span>
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: S.text }}>{t('test_h2')}</h2>
          <p className="text-lg mt-3" style={{ color: S.muted }}>{t('test_sub')}</p>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, quote, stars, avatar }, i) => (
            <FadeUp key={name} delay={i * 120}>
              <div className="flex flex-col p-6 rounded-2xl h-full" style={{ background: S.surface, border: '1px solid var(--border)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array(stars).fill(0).map((_, j) => <Star key={j} size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: S.muted }}>&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#059669,#8b5cf6)' }}>{avatar}</div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: S.text }}>{name}</p>
                    <p className="text-xs" style={{ color: S.muted }}>{role}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={200} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="p-5 rounded-2xl text-center" style={{ background: S.surface, border: '1px solid var(--border)' }}>
              <Icon size={18} className="mx-auto mb-2" style={{ color }} />
              <p className="text-2xl font-black" style={{ color: S.text }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: S.muted }}>{label}</p>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   9. FINAL CTA
══════════════════════════════════════════════════════ */
function CtaFinal() {
  const { t } = useLanguage();
  return (
    <section className="py-24 px-5 relative overflow-hidden" style={{ background: S.elevated }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'radial-gradient(ellipse at 60% 50%,#059669,transparent 60%)' }} />
      </div>
      <div className="max-w-3xl mx-auto text-center relative">
        <FadeUp>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ background: 'color-mix(in srgb,#059669 10%,transparent)', border: '1px solid color-mix(in srgb,#059669 20%,transparent)', color: '#059669' }}>
            <Zap size={12} /> {t('cta_badge')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-4" style={{ color: S.text }}>
            {t('cta_h2a')}<br/>
            <span style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('cta_h2b')}</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: S.muted }}>{t('cta_body')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base hover:opacity-90 hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)', boxShadow: '0 8px 32px rgba(5,150,105,0.4)' }}>
              <GraduationCap size={18} /> {t('cta_btn1')}
            </Link>
            <Link href="/integration" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base hover:scale-[1.02] transition-all" style={{ background: S.surface, border: '1px solid var(--border)', color: S.text }}>
              <Building2 size={18} style={{ color: '#8b5cf6' }} /> {t('cta_btn2')}
            </Link>
          </div>
          <p className="text-xs mt-6" style={{ color: S.muted }}>{t('cta_note')}</p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   10. FOOTER
══════════════════════════════════════════════════════ */
function Footer() {
  const { t, lang } = useLanguage();
  const footerCols = lang === 'en' ? [
    { title: t('foot_platform'), links: [{ l: 'Courses', h: '/formations' }, { l: 'My AI Path', h: '/parcours' }, { l: 'Library', h: '/bibliotheque' }, { l: 'Pricing', h: '/pricing' }] },
    { title: t('foot_services'), links: [{ l: 'Integration', h: '/integration' }, { l: 'Expert Session', h: '/rendez-vous' }, { l: 'Certificates', h: '/documents' }] },
    { title: t('foot_account'), links: [{ l: 'Log in', h: '/auth/login' }, { l: 'Register', h: '/auth/register' }, { l: 'Dashboard', h: '/dashboard' }] },
  ] : [
    { title: t('foot_platform'), links: [{ l: 'Formations', h: '/formations' }, { l: 'Mon Parcours', h: '/parcours' }, { l: 'Bibliothèque', h: '/bibliotheque' }, { l: 'Tarifs', h: '/pricing' }] },
    { title: t('foot_services'), links: [{ l: 'Intégration', h: '/integration' }, { l: 'Session Expert', h: '/rendez-vous' }, { l: 'Certificats', h: '/documents' }] },
    { title: t('foot_account'), links: [{ l: 'Connexion', h: '/auth/login' }, { l: 'Inscription', h: '/auth/register' }, { l: 'Tableau de bord', h: '/dashboard' }] },
  ];
  return (
    <footer className="px-5 py-12" style={{ background: S.base, borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#0891b2)' }}>
                <Zap size={13} className="text-white" />
              </div>
              <span className="font-black" style={{ color: S.text }}>Strat<span style={{ color: '#059669' }}>IA</span></span>
            </div>
            <p className="text-sm" style={{ color: S.muted }}>{t('foot_tagline')}</p>
          </div>
          {footerCols.map(({ title, links }) => (
            <div key={title}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: S.muted }}>{title}</p>
              <ul className="space-y-2">
                {links.map(({ l, h }) => (
                  <li key={l}><Link href={h} className="text-sm hover:underline" style={{ color: S.muted }}>{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-6 flex-wrap gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: S.muted }}>{t('foot_copyright')}</p>
          <p className="text-xs" style={{ color: S.muted }}>{t('foot_made')}</p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div style={{ background: S.base }}>
      <Topnav />
      <Hero />
      <ProofBar />
      <Problem />
      <Solution />
      <HowItWorks />
      <IntegrationSpotlight />
      <Testimonials />
      <NewsletterBanner />
      <CtaFinal />
      <Footer />
      {/* Widget guide — apparaît après 3s, adapte son discours au niveau */}
      <AIGuideWidget />
    </div>
  );
}
