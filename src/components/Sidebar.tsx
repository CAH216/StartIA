'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, CalendarClock, FileText, CreditCard,
  Zap, ChevronRight, Sun, Moon, LogOut, ShieldAlert, Building2, Cpu,
  X, Video, Sparkles, Users, User as UserIcon, BookOpen, Plus,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';
import { LanguageSwitcher, useLanguage } from '@/contexts/LanguageContext';



/* ─── Type NavItem ────────────────────────────────────── */
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  /** true = actif seulement sur le chemin exact (pas les sous-pages) */
  exact?: boolean;
}

/* ─── Nav per role ────────────────────────────────────── */
const userNavItems: NavItem[] = [
  { href: '/dashboard',      label: 'Tableau de bord',   icon: LayoutDashboard },
  { href: '/mes-formations', label: 'Mes formations',     icon: BookOpen },
  { href: '/parcours',       label: 'Mon Parcours IA',    icon: Sparkles },
  { href: '/documents',      label: 'Mes Certificats',    icon: FileText },
  { href: '/formations',     label: 'Catalogue',          icon: GraduationCap },
  { href: '/rendez-vous',    label: 'Session Expert',     icon: CalendarClock },
  { href: '/abonnement',    label: 'Abonnements',        icon: CreditCard },
];

const employerNavItems: NavItem[] = [
  { href: '/employer',    label: 'Espace Employeur', icon: Building2 },
  { href: '/formations',  label: 'Formations',       icon: GraduationCap },
];

// FORMATEUR — "Mon Espace" exact: true pour ne pas rester actif sur les sous-pages
// "Sessions live" supprimé : le toggle pour créer une session live est déjà dans /formateur/creer
const formateurNavItems: NavItem[] = [
  { href: '/formateur',          label: 'Mon Espace',          icon: Video,         exact: true },
  { href: '/formateur/creer',    label: 'Créer une formation',  icon: Plus },
  { href: '/formateur/sessions', label: 'Mes Sessions',         icon: GraduationCap },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard Admin', icon: ShieldAlert },
];

const BOTTOM_COMMON_HREFS = ['/integration'];
const BOTTOM_ICONS = [Cpu];

interface SidebarProps { isOpen?: boolean; onClose?: () => void; }
type UserRole = 'USER' | 'EMPLOYER' | 'FORMATEUR' | 'ADMIN' | null;

/* ─── Lit le rôle depuis localStorage de façon synchrone ─ */
function getCachedRole(): UserRole {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem('stratia_role');
  if (v === 'ADMIN')     return 'ADMIN';
  if (v === 'EMPLOYER')  return 'EMPLOYER';
  if (v === 'FORMATEUR') return 'FORMATEUR';
  if (v === 'USER')      return 'USER';
  return null;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();


  // Initialisation SYNCHRONE depuis localStorage → pas de flash au chargement
  const [role,      setRole]      = useState<UserRole>(getCachedRole);
  const [userEmail, setUserEmail] = useState('');
  const [userName,  setUserName]  = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.role) {
          const r = data.role as UserRole;
          setRole(r);
          setUserEmail(data.email ?? '');
          setUserName(data.fullName ?? data.email ?? '');
          // Mettre en cache pour le prochain rendu
          localStorage.setItem('stratia_role', r ?? '');
        } else {
          const cached = getCachedRole();
          setRole(cached);
        }
      })
      .catch(() => {
        const cached = getCachedRole();
        setRole(cached ?? 'USER');
      });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('stratia_role');
    localStorage.removeItem('btm_logged_in');
    router.push('/auth/login');
  }

  /* ── isActive : exact ou startsWith selon le flag ─ */
  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  const navItems: NavItem[] =
    role === 'ADMIN'     ? [{ href: '/admin', label: t('nav_dashboard'), icon: ShieldAlert }] :
    role === 'EMPLOYER'  ? [
      { href: '/employer',   label: t('nav_dashboard'),     icon: Building2 },
      { href: '/formations', label: t('nav_catalogue'),     icon: GraduationCap },
    ] :
    role === 'FORMATEUR' ? [
      { href: '/formateur',          label: t('nav_mon_espace'),       icon: Video,         exact: true },
      { href: '/formateur/creer',    label: t('nav_creer_formation'),  icon: Plus },
      { href: '/formateur/sessions', label: t('nav_mes_sessions'),     icon: GraduationCap },
    ] : [
      { href: '/dashboard',      label: t('nav_dashboard'),       icon: LayoutDashboard },
      { href: '/mes-formations', label: t('nav_mes_formations'),  icon: BookOpen },
      { href: '/parcours',       label: t('nav_parcours'),        icon: Sparkles },
      { href: '/documents',      label: t('nav_certificats'),     icon: FileText },
      { href: '/formations',     label: t('nav_catalogue'),       icon: GraduationCap },
      { href: '/rendez-vous',    label: t('nav_session_expert'),  icon: CalendarClock },
      { href: '/abonnement',     label: t('nav_abonnements'),     icon: CreditCard },
    ];

  const bottomItems: NavItem[] = [
    { href: '/integration', label: t('nav_integration'), icon: Cpu },
  ];

  const roleLabel =
    role === 'ADMIN'     ? t('nav_dashboard') :
    role === 'EMPLOYER'  ? 'Espace StratIA' :
    role === 'FORMATEUR' ? 'Espace Formateur' :
    'Navigation';

  const roleBadge =
    role === 'ADMIN'     ? { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  color: '#f87171', icon: ShieldAlert, label: 'Super Admin'       } :
    role === 'EMPLOYER'  ? { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24', icon: Building2,   label: 'Employeur StratIA' } :
    role === 'FORMATEUR' ? { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', color: '#a78bfa', icon: Users,       label: 'Formateur'         } :
    null;

  const avatarGradient =
    role === 'ADMIN'     ? 'linear-gradient(135deg,#ef4444,#f97316)' :
    role === 'EMPLOYER'  ? 'linear-gradient(135deg,#f59e0b,#f97316)' :
    role === 'FORMATEUR' ? 'linear-gradient(135deg,#8b5cf6,#a78bfa)' :
    'linear-gradient(135deg,#2563eb,#06b6d4)';

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 flex flex-col z-30 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Logo */}
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>StratIA</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Formations & Intégration IA</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {/* Role badge */}
        {roleBadge && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl"
            style={{ background: roleBadge.bg, border: `1px solid ${roleBadge.border}` }}>
            <roleBadge.icon size={13} style={{ color: roleBadge.color }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: roleBadge.color }}>{roleBadge.label}</span>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wider px-3 py-2" style={{ color: 'var(--text-muted)' }}>
          {roleLabel}
        </p>

        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`} onClick={onClose}>
              <item.icon size={17} className="flex-shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom area */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
        {BOTTOM_ICONS ? null : null}
        {bottomItems.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`} onClick={onClose}>
              <item.icon size={17} className="flex-shrink-0" style={{ color: '#8b5cf6' }} />
              <span>{item.label}</span>
              {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          );
        })}

        <button onClick={toggle} className="sidebar-link w-full">
          {theme === 'dark'
            ? <Sun size={17} className="flex-shrink-0 text-yellow-500" />
            : <Moon size={17} className="flex-shrink-0 text-blue-500" />}
          <span>{theme === 'dark' ? t('theme_light') : t('theme_dark')}</span>
        </button>

        {/* Sélecteur de langue */}
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('langue')}</span>
          <LanguageSwitcher/>
        </div>
        <Link href="/profil" className="sidebar-link" onClick={onClose}>
          <UserIcon size={17} className="flex-shrink-0" />
          <span>{t('mon_profil')}</span>
        </Link>
        <button onClick={handleLogout} className="sidebar-link w-full">
          <LogOut size={17} className="flex-shrink-0" />
          <span>{t('logout')}</span>
        </button>

        {/* User chip → profil */}
        <Link href="/profil" onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl transition-opacity hover:opacity-80"
          style={{ background: 'var(--bg-elevated)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: avatarGradient }}>
            {(userName || userEmail || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{userName || 'Mon Compte'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {role === 'ADMIN' ? 'Administrateur' : role === 'EMPLOYER' ? 'Employeur StratIA' : role === 'FORMATEUR' ? 'Formateur' : 'Client'}
            </p>
          </div>
          <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
        </Link>
      </div>
    </aside>
  );
}
