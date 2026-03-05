'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Zap, Brain, Map, Bot, BookOpen, Users, Briefcase,
  CheckCircle, ArrowRight, TrendingUp, Clock, Award,
  Building2, ChevronDown, Star, Shield, Target,
  BarChart3, Lightbulb, Moon, Sun,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

/* ── Topnav ──────────────────────────────────────────────────────────────── */
function Topnav() {
  const { theme, toggle } = useTheme();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>StratIA</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Fonctionnalités', href: '#fonctionnalites' },
            { label: 'Diagnostic',     href: '#diagnostic' },
            { label: 'Témoignages',    href: '#temoignages' },
            { label: 'Tarifs',         href: '#tarifs' },
          ].map(({ label, href }) => (
            <a key={href} href={href}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            {theme === 'dark'
              ? <Sun size={16} className="text-yellow-500" />
              : <Moon size={16} className="text-blue-600" />}
          </button>
          <Link href="/auth/login"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--text-primary)', border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)' }}>
            Se connecter
          </Link>
          <Link href="/auth/register"
            className="px-3 sm:px-4 py-2 rounded-xl text-sm font-bold text-white whitespace-nowrap"
            style={{ background: 'var(--primary)' }}>
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ── 1. Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(ellipse, var(--primary), transparent 70%)' }} />
      </div>
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)', color: 'var(--primary)' }}>
          <Zap size={14} /> Implémentation IA pour toutes les entreprises
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
          Implémentez l&apos;IA dans{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            votre entreprise
          </span>
        </h1>
        <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Diagnostic personnalisé, roadmap 90 jours guidée par l’IA, assistant expert et bibliothèque de ressources — pour toute entreprise qui veut rester compétitive en 2026.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/diagnostic"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-white text-base shadow-lg"
            style={{ background: 'var(--primary)' }}>
            <Brain size={18} /> Faire mon diagnostic gratuit
          </Link>
          <Link href="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-base"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
            Se connecter <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { value: '300+',   label: 'Entreprises accompagnées' },
            { value: '12h',    label: 'Économisées / semaine' },
            { value: '4.9 ⭐', label: 'Note de satisfaction' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center p-4 rounded-2xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 2. Problème ─────────────────────────────────────────────────────────── */
function Probleme() {
  const pains = [
    { icon: '⏱️', title: 'Perte de temps énorme', desc: 'Les entrepreneurs passent 40% de leur temps sur des tâches répétitives qui pourraient être automatisées dès aujourd\'hui — facturation, suivis, rapports, emails.' },
    { icon: '📊', title: 'Décisions sans données', desc: 'Beaucoup de dirigeants prennent des décisions à l’instinct. L’ IA permet d’analyser rapidement les données et de guider les choix stratégiques.' },
    { icon: '🤯', title: 'Surcharge informationnelle', desc: 'Trop d’outils, trop d’options IA, pas de stratégie. Résultat : paralysie décisionnelle, essais sans résultats et adoption nulle.' },
    { icon: '📉', title: 'Décrochage concurrentiel', desc: 'Dans 18 mois, les entreprises sans stratégie IA auront un désavantage compétitif difficile à combler. C’est déjà visible dans plusieurs secteurs.' },
  ];
  return (
    <section id="probleme" className="py-24 px-6" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Le problème</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Combien d&apos;heures perdez-vous par semaine ?</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Quelle que soit votre industrie, les mêmes inefficacités se répètent. L’IA peut les éliminer en quelques semaines.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pains.map(({ icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl flex gap-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <span className="text-3xl flex-shrink-0">{icon}</span>
              <div>
                <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 3. Solution ─────────────────────────────────────────────────────────── */
function Solution() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>La solution</span>
          <h2 className="text-4xl font-black mt-2 mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Un seul portail.<br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Toute votre stratégie IA.
            </span>
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            StratIA n&apos;est pas un chatbot générique. C&apos;est un système structuré avec logique décisionnelle adapté à la réalité des entrepreneurs et gestionnaires de toutes industries.
          </p>
          {['Diagnostic de maturité IA en 5 minutes', 'Plan d\'action sur 90 jours personnalisé', 'Ressources exploitables, pas du blabla', 'Communauté d\'entrepreneurs qui partagent des cas réels'].map(x => (
            <div key={x} className="flex items-center gap-3 mb-3">
              <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <span className="text-base" style={{ color: 'var(--text-primary)' }}>{x}</span>
            </div>
          ))}
          <Link href="/diagnostic" className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white" style={{ background: 'var(--primary)' }}>
            Commencer maintenant <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Brain,    label: 'Diagnostic IA',    desc: 'Score maturité + plan d\'action',        color: '#3b82f6' },
            { icon: Map,      label: 'Roadmap 90j',      desc: 'Progression mensuelle structurée',       color: '#8b5cf6' },
            { icon: Bot,      label: 'Assistant guidé',  desc: 'Conseils concrets par scénario',         color: '#06b6d4' },
            { icon: BookOpen, label: 'Bibliothèque',     desc: 'Documents exploitables premium',         color: '#059669' },
            { icon: Briefcase,label: 'Portail Pro',      desc: 'Certifs, historique, conformité',        color: '#d97706' },
            { icon: Users,    label: 'Communauté',       desc: 'Cas réels entre entrepreneurs',          color: '#ec4899' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="p-4 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 4. Fonctionnalités détaillées ───────────────────────────────────────── */
function Features() {
  const features = [
    { icon: Brain,    title: 'Diagnostic stratégique intelligent', desc: 'Notre moteur décisionnel analyse votre profil, vos outils, vos défis et votre maturité IA pour produire un score, 3 priorités concrètes et un plan 90 jours personnalisé.', tags: ['Score 0–100', 'Top 3 priorités', 'Plan 90 jours', 'Risques identifiés'], gradient: 'from-blue-500 to-cyan-500', href: '/diagnostic' },
    { icon: Map,      title: 'Roadmap IA mensuelle', desc: 'Chaque mois, un mini plan actionnable avec checklist, vidéo explicative et conseils chatbot. Une progression logique : Fondations → Optimisation → Analyse prédictive.', tags: ['Checklist mensuelle', 'Vidéo explicative', 'Conseils chatbot', 'PDF téléchargeable'], gradient: 'from-purple-500 to-pink-500', href: '/roadmap' },
    { icon: Bot,      title: 'Assistant IA guidé', desc: 'Pas un chatbot libre. Un assistant à menu interactif avec des scénarios précis : perte de temps, soumissions, résistance d\'équipe. Réponses actionnables, pas génériques.', tags: ['6 scénarios prédéfinis', 'Conseils personnalisés', 'Basé sur votre profil', 'Réponses sectorielles'], gradient: 'from-cyan-500 to-teal-500', href: '/assistant' },
    { icon: BookOpen, title: 'Bibliothèque stratégique premium', desc: 'Des modèles, guides et templates directement exploitables. Politique IA, gestion des risques, adoption interne, calculateur ROI. Des outils, pas du contenu de blog.', tags: ['9+ ressources', 'Word / Excel / PDF', 'Politique IA', 'Calculateur ROI'], gradient: 'from-emerald-500 to-green-500', href: '/bibliotheque' },
    { icon: Briefcase,title: 'Portail professionnel', desc: 'Votre espace officiel : certifications, historique de formations, heures cumulées, rappels de conformité et profil entreprise. Un actif numérique durable.', tags: ['Certificats', 'Rappels conformité', 'Historique complet', 'Profil entreprise'], gradient: 'from-orange-500 to-yellow-500', href: '/portail' },
    { icon: Users,    title: 'Communauté fermée', desc: 'Discussions entre entrepreneurs vérifiés du secteur. Cas réels, retours d\'expérience concrets, solutions testées. 248+ membres actifs.', tags: ['Cas réels', 'Entrepreneurs vérifiés', 'Modérée & active', '248+ membres'], gradient: 'from-pink-500 to-rose-500', href: '/communaute' },
  ];
  return (
    <section id="fonctionnalites" className="py-24 px-6" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>6 modules puissants</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Tout ce dont vous avez besoin</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Chaque module est conçu pour un résultat concret, pas pour impressionner sur papier.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, tags, gradient, href }) => (
            <Link key={title} href={href}
              className="group p-6 rounded-2xl flex flex-col"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
              onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-md)'; el.style.transform = 'translateY(-2px)'; el.style.borderColor = 'var(--border-strong)'; }}
              onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-sm)'; el.style.transform = 'none'; el.style.borderColor = 'var(--border)'; }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-md`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-md"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                Explorer <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 5. Comment ça marche ────────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Simple & structuré</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Comment ça marche</h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Trois étapes pour transformer votre entreprise</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { n: 1, icon: Target,     title: 'Faites votre diagnostic',   desc: 'En 5 minutes, notre moteur analyse votre profil et génère un score de maturité IA avec des priorités concrètes.', color: '#3b82f6' },
            { n: 2, icon: Map,        title: 'Recevez votre roadmap',     desc: 'Un plan sur 90 jours adapté à votre score. Chaque mois : tâches, checklist, vidéo et conseils spécifiques.', color: '#8b5cf6' },
            { n: 3, icon: TrendingUp, title: 'Mesurez vos résultats',     desc: 'Suivez vos progrès, économisez du temps, gagnez plus de contrats. Résultats mesurables en moins de 30 jours.', color: '#059669' },
          ].map(({ n, icon: Icon, title, desc, color }) => (
            <div key={n} className="text-center">
              <div className="relative inline-flex">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: `color-mix(in srgb, ${color} 15%, var(--bg-elevated))`, border: `2px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
                  <Icon size={26} style={{ color }} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center"
                  style={{ background: color }}>{n}</div>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/diagnostic"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <Zap size={18} /> Démarrer maintenant — c&apos;est gratuit
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 6. Spotlight — Diagnostic ───────────────────────────────────────────── */
function SpotlightDiagnostic() {
  return (
    <section id="diagnostic" className="py-24 px-6" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Fonctionnalité phare</span>
          <h2 className="text-4xl font-black mt-2 mb-6" style={{ color: 'var(--text-primary)' }}>Le diagnostic qui change tout</h2>
          <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Ce n&apos;est pas un quiz générique. Notre moteur structuré avec logique décisionnelle analyse 4 dimensions de votre entreprise pour produire un diagnostic actionnable.
          </p>
          {[
            { label: 'Étape 1', desc: 'Profil : employés, projets, outils, budget' },
            { label: 'Étape 2', desc: 'Défis : les problèmes qui coûtent le plus' },
            { label: 'Étape 3', desc: 'Maturité IA et vitesse de décision' },
            { label: 'Résultat', desc: 'Score 0–100, top 3 priorités, plan 90j, risques' },
          ].map(({ label, desc }, i) => (
            <div key={i} className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: 'var(--primary)' }}>{i + 1}</div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          ))}
          <Link href="/diagnostic" className="mt-4 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white" style={{ background: 'var(--primary)' }}>
            <Brain size={16} /> Faire mon diagnostic
          </Link>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Exemple de résultats</p>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>72<span className="text-xl" style={{ color: 'var(--text-muted)' }}>/100</span></p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--primary)' }}>Niveau Intermédiaire</p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}>
              <Brain size={26} style={{ color: 'var(--primary)' }} />
            </div>
          </div>
          <div className="progress-bar mb-5">
            <div className="progress-fill" style={{ width: '72%' }} />
          </div>
          {[
            { label: 'Automatiser les soumissions', gain: '-60% temps' },
            { label: 'Standardiser les communications', gain: '-8h/sem' },
            { label: 'Former l\'équipe aux outils IA', gain: '+50% adoption' },
          ].map(({ label, gain }, i) => (
            <div key={i} className="flex items-center justify-between py-3"
              style={{ borderBottom: i < 2 ? '1px solid var(--border)' : undefined }}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--primary)' }}>{i + 1}</span>
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{label}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>{gain}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 7. Spotlight — Roadmap ──────────────────────────────────────────────── */
function SpotlightRoadmap() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          {[
            { month: 'Mois 1', title: 'Fondations & Communications',       pct: 100, status: 'Terminé',  color: '#059669' },
            { month: 'Mois 2', title: 'Optimisation des soumissions',       pct: 45,  status: 'En cours', color: '#3b82f6' },
            { month: 'Mois 3', title: 'Analyse prédictive & Décisions',     pct: 0,   status: 'À venir',  color: '#94a3b8' },
          ].map(({ month, title, pct, status, color }, i) => (
            <div key={month} className="p-5"
              style={{ background: i === 1 ? 'var(--bg-elevated)' : 'var(--bg-surface)', borderBottom: i < 2 ? '1px solid var(--border)' : undefined }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>{month}</span>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
                  {status}
                </span>
              </div>
              <div className="progress-bar mt-3">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, #06b6d4))` }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>Roadmap personnalisée</span>
          <h2 className="text-4xl font-black mt-2 mb-6" style={{ color: 'var(--text-primary)' }}>Un plan mensuel,<br />pas un vague conseil</h2>
          <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Chaque mois débloque un mini plan précis avec des tâches actionnables, une checklist, une vidéo et des conseils de votre assistant IA.
          </p>
          {[
            { mo: '1', title: 'Fondations',   desc: 'Automatiser, standardiser, centraliser' },
            { mo: '2', title: 'Optimisation', desc: 'Soumissions, assistants rédactionnels' },
            { mo: '3', title: 'Croissance',   desc: 'Analyse prédictive, décisions data-driven' },
          ].map(({ mo, title, desc }) => (
            <div key={mo} className="flex items-center gap-4 p-4 rounded-xl mb-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>M{mo}</div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. Résultats ────────────────────────────────────────────────────────── */
function Resultats() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Résultats mesurables</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Des chiffres réels, pas des promesses</h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Basé sur les retours de nos clients après 3 mois d&apos;utilisation</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Clock,    value: '12h',    label: 'économisées par semaine en moyenne',      color: '#3b82f6' },
            { icon: TrendingUp,value: '+37%',  label: 'de soumissions déposées par client',     color: '#8b5cf6' },
            { icon: Award,    value: '4.9/5',  label: 'note de satisfaction moyenne',           color: '#f59e0b' },
            { icon: Building2,value: '248+',   label: 'entrepreneurs actifs sur la plateforme', color: '#059669' },
            { icon: BarChart3, value: '2 800$',label: 'de valeur récupérée / mois en moyenne',  color: '#ec4899' },
            { icon: Shield,   value: '14j',    label: 'garantie satisfait ou remboursé',        color: '#06b6d4' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={value} className="p-6 rounded-2xl text-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <p className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 9. Témoignages ──────────────────────────────────────────────────────── */
function Temoignages() {
  return (
    <section id="temoignages" className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Témoignages</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Ce qu&apos;ils disent</h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Des entrepreneurs comme vous, des résultats mesurables</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Jean-Pierre Côté',   role: 'PME Construction · Sherbrooke',        avatar: 'JC', plan: 'Plan Avancé',  text: 'En 6 mois avec BatimatIA, j\'ai récupéré environ 2 800$/mois de valeur en temps économisé. Ce n\'est pas une dépense, c\'est un investissement. Le diagnostic initial était bluffant de précision.' },
            { name: 'Derek Tremblay',     role: 'Entrepreneur général · Québec',        avatar: 'DT', plan: 'Plan Pro',     text: 'Mes soumissions prennent maintenant 2h au lieu de 5–6h. La clé : un brief projet standard dans ChatGPT génère la section méthodologie en 10 minutes. La roadmap m\'a guidé pas à pas.' },
            { name: 'Sophie Gagnon',      role: 'Rénovatrice résidentielle · Laval',    avatar: 'SG', plan: 'Plan Pro',     text: 'Mon contremaître refusait l\'IA. J\'ai appliqué la méthode du champion interne recommandée par BatimatIA et en 3 semaines il suggérait lui-même de nouveaux outils. Incroyable.' },
          ].map(({ name, role, avatar, plan, text }) => (
            <div key={name} className="p-6 rounded-2xl flex flex-col"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} style={{ color: '#f59e0b' }} fill="#f59e0b" />)}
              </div>
              <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>&ldquo;{text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{role}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}>
                  {plan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 10. Pricing preview ─────────────────────────────────────────────────── */
function PricingPreview() {
  const plans = [
    { name: 'Essentiel',     price: 39,  features: ['Portail professionnel', 'Diagnostic IA', 'Assistant guidé', 'Bibliothèque (5 ressources)'],                              popular: false },
    { name: 'Professionnel', price: 79,  features: ['Tout Essentiel +', 'Bibliothèque complète', 'Roadmap 90 jours', 'Accès communauté'],                                    popular: true  },
    { name: 'Avancé',        price: 149, features: ['Tout Professionnel +', 'Sessions Q&A mensuelles', 'Analyse personnalisée avancée', 'Ressources Pro exclusives'],       popular: false },
  ];
  return (
    <section id="tarifs" className="py-24 px-6" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Tarifs transparents</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Choisissez votre plan</h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Sans engagement. Annulable. Garantie 14 jours.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ name, price, features, popular }) => (
            <div key={name} className="rounded-2xl p-6 relative"
              style={{ background: 'var(--bg-surface)', border: `2px solid ${popular ? 'var(--primary)' : 'var(--border)'}`, boxShadow: popular ? 'var(--shadow-lg)' : 'var(--shadow-sm)' }}>
              {popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white rounded-full"
                  style={{ background: 'var(--primary)' }}>Populaire</div>
              )}
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{name}</h3>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{price}$</span>
                <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>/mois</span>
              </div>
              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />{f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                style={popular
                  ? { background: 'var(--primary)', color: 'white' }
                  : { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Choisir {name}
              </Link>
            </div>
          ))}
        </div>
	<p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>Tous les plans incluent un diagnostic gratuit pour commencer</p>
      </div>
    </section>
  );
}

/* ── 11. Valeurs ─────────────────────────────────────────────────────────── */
function Valeurs() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Nos engagements</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Pourquoi BatimatIA ?</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Target,    title: 'Spécialisé construction', desc: 'Conçu pour la réalité des entrepreneurs québécois, pas pour tout le monde.', color: '#3b82f6' },
            { icon: Lightbulb, title: 'Actionnable',             desc: 'Chaque contenu doit produire un résultat mesurable en moins de 30 jours.', color: '#f59e0b' },
            { icon: Shield,    title: 'Données protégées',       desc: 'Hébergé au Canada. Aucune donnée partagée avec des modèles IA tiers.', color: '#059669' },
            { icon: Users,     title: 'Communauté réelle',       desc: 'Entrepreneurs vérifiés, cas réels. Pas de contenu généré artificiellement.', color: '#8b5cf6' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: `color-mix(in srgb, ${color} 15%, var(--bg-elevated))`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
                <Icon size={24} style={{ color }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 12. FAQ ─────────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: 'Faut-il des connaissances en IA pour utiliser BatimatIA ?', a: 'Absolument pas. BatimatIA est conçu pour des entrepreneurs, pas des techniciens. Si vous savez utiliser Excel et envoyer des emails, vous êtes prêt.' },
    { q: 'Le diagnostic est-il vraiment gratuit ?', a: 'Oui. Vous obtenez votre score de maturité IA, vos 3 priorités et votre plan 90 jours sans entrer de carte de crédit.' },
    { q: 'Combien de temps faut-il investir par semaine ?', a: 'La roadmap est conçue pour 2–4 heures par semaine d\'implémentation. L\'objectif : économiser 12h à partir du 2e mois.' },
    { q: 'L\'assistant IA remplace-t-il un consultant ?', a: 'Non — il complète votre réflexion. Pour les besoins complexes, le plan Avancé inclut des sessions individuelles avec un expert.' },
    { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement ni frais. Nous offrons aussi une garantie satisfait ou remboursé de 14 jours.' },
    { q: 'Mes données sont-elles sécurisées ?', a: 'Oui. Hébergées au Canada, cryptées, jamais partagées avec des modèles IA tiers. Conforme aux lois québécoises.' },
  ];
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>FAQ</span>
          <h2 className="text-4xl font-black mt-2 mb-4" style={{ color: 'var(--text-primary)' }}>Questions fréquentes</h2>
        </div>
        <div className="space-y-3">
          {items.map(({ q, a }, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <button className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-sm font-semibold pr-4" style={{ color: 'var(--text-primary)' }}>{q}</span>
                <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform 0.2s', transform: open === i ? 'rotate(180deg)' : 'none' }} />
              </button>
              {open === i && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-sm leading-relaxed pt-4" style={{ color: 'var(--text-secondary)' }}>{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 13. CTA Final ───────────────────────────────────────────────────────── */
function CtaFinal() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <div className="rounded-3xl p-12"
          style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, var(--bg-elevated)), color-mix(in srgb, var(--accent) 15%, var(--bg-elevated)))', border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Zap size={28} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Prêt à transformer votre entreprise ?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Commencez par le diagnostic gratuit. 5 minutes pour identifier vos plus grandes opportunités.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/diagnostic"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-xl"
              style={{ background: 'var(--primary)' }}>
              <Brain size={18} /> Faire mon diagnostic gratuit
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Voir le tableau de bord
            </Link>
          </div>
          <p className="text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            Aucune carte de crédit · Garantie 14 jours · Annulation en 1 clic
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-12 px-6" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>BatimatIA</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Portail Professionnel IA · Construction</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {[{ href: '/portail', label: 'Portail' }, { href: '/diagnostic', label: 'Diagnostic' }, { href: '/roadmap', label: 'Roadmap' }, { href: '/pricing', label: 'Tarifs' }].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</Link>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 BatimatIA · Montréal, Québec</p>
      </div>
    </footer>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-base)' }}>
      <Topnav />
      <Hero />
      <Probleme />
      <Solution />
      <Features />
      <HowItWorks />
      <SpotlightDiagnostic />
      <SpotlightRoadmap />
      <Resultats />
      <Temoignages />
      <PricingPreview />
      <Valeurs />
      <FAQ />
      <CtaFinal />
      <Footer />
    </div>
  );
}
