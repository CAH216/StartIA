'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Brain, Map, Bot, BookOpen,
  Users, CreditCard, Zap, ChevronRight, Sun, Moon, LogOut, FileText, GraduationCap, X, CalendarClock, ShieldAlert, Building2,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';

/* ─── Nav definitions ────────────────────────────────────────────────── */

// Regular user navigation
const userNavItems = [
  { href: '/dashboard',    label: 'Tableau de bord',  icon: LayoutDashboard },
  { href: '/documents',    label: 'Mes Certificats',  icon: FileText },
  { href: '/formations',   label: 'Formations',       icon: GraduationCap },
  { href: '/diagnostic',   label: 'Diagnostic IA',    icon: Brain },
  { href: '/roadmap',      label: 'Roadmap IA',       icon: Map },
  { href: '/assistant',    label: 'Assistant IA',     icon: Bot },
  { href: '/rendez-vous',  label: 'Session Expert',   icon: CalendarClock },
  { href: '/bibliotheque', label: 'Bibliothèque',     icon: BookOpen },
  { href: '/communaute',   label: 'Communauté',       icon: Users },
  { href: '/pricing',      label: 'Abonnements',      icon: CreditCard },
];

// Employer navigation
const employerNavItems = [
  { href: '/employer',     label: 'Espace Employer',  icon: Building2 },
  { href: '/bibliotheque', label: 'Bibliothèque',     icon: BookOpen },
  { href: '/communaute',   label: 'Communauté',       icon: Users },
  { href: '/formations',   label: 'Formations',       icon: GraduationCap },
];

// Admin navigation — dashboard only
const adminNavItems = [
  { href: '/admin',        label: 'Dashboard Admin',  icon: ShieldAlert },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type UserRole = 'USER' | 'EMPLOYER' | 'ADMIN' | null;

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname    = usePathname();
  const router      = useRouter();
  const { theme, toggle } = useTheme();
  const [role,      setRole]     = useState<UserRole>(() => {
    if (typeof window === 'undefined') return null;
    const r = localStorage.getItem('stratia_role');
    if (r === 'ADMIN' || r === 'EMPLOYER' || r === 'USER') return r as UserRole;
    if (r === 'admin') return 'ADMIN';
    if (r === 'employer') return 'EMPLOYER';
    return 'USER'; // default so navigation always renders
  });
  const [userEmail, setUserEmail] = useState('');
  const [userName,  setUserName]  = useState('');

  // Fetch session from JWT cookie
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.role) {
          setRole(data.role as UserRole);
          setUserEmail(data.email ?? '');
          setUserName(data.fullName ?? data.email ?? '');
        } else {
          // Fallback: legacy localStorage
          const lsRole = localStorage.getItem('stratia_role');
          if (lsRole === 'admin')    setRole('ADMIN');
          else if (lsRole === 'employer') setRole('EMPLOYER');
          else setRole('USER');
        }
      })
      .catch(() => setRole('USER'));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('stratia_role');
    localStorage.removeItem('btm_logged_in');
    router.push('/auth/login');
  }

  // Choose nav items based on role — default to userNavItems while loading
  const navItems =
    role === 'ADMIN'    ? adminNavItems :
    role === 'EMPLOYER' ? employerNavItems :
    userNavItems;

  const sectionLabel =
    role === 'ADMIN'    ? 'Administration' :
    role === 'EMPLOYER' ? 'Espace StratIA' :
    'Navigation';

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 flex flex-col z-30 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Logo */}
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>StratIA</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Implémentation IA</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          aria-label="Fermer le menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {/* Role badge for admin / employer */}
        {role === 'ADMIN' && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <ShieldAlert size={13} style={{ color: '#f87171' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f87171' }}>Super Admin</span>
          </div>
        )}
        {role === 'EMPLOYER' && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Building2 size={13} style={{ color: '#fbbf24' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fbbf24' }}>Employer StratIA</span>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wider px-3 py-2" style={{ color: 'var(--text-muted)' }}>
          {sectionLabel}
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const isAdminLink    = role === 'ADMIN'    && href === '/admin';
          const isEmployerLink = role === 'EMPLOYER' && href === '/employer';
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              style={!isActive && isAdminLink ? { color: '#f87171' } : undefined}
            >
              <Icon
                size={17}
                className="flex-shrink-0"
                style={isAdminLink ? { color: '#f87171' } : isEmployerLink ? { color: '#fbbf24' } : undefined}
              />
              <span>{label}</span>
              {isActive && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom area */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={toggle} className="sidebar-link w-full">
          {theme === 'dark'
            ? <Sun size={17} className="flex-shrink-0 text-yellow-500" />
            : <Moon size={17} className="flex-shrink-0 text-blue-500" />}
          <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full">
          <LogOut size={17} className="flex-shrink-0" />
          <span>Déconnexion</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: role === 'ADMIN'
                ? 'linear-gradient(135deg,#ef4444,#f97316)'
                : role === 'EMPLOYER'
                ? 'linear-gradient(135deg,#f59e0b,#f97316)'
                : 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
            }}>
            {(userName || userEmail || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {userName || 'Mon Compte'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {role === 'ADMIN' ? 'Administrateur' : role === 'EMPLOYER' ? 'Employer StratIA' : 'Client'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

