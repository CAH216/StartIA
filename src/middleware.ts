import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/auth/login', '/auth/register', '/auth/magic-link',
  '/login', '/', '/pricing', '/devenir-formateur',
  '/api/auth/login', '/api/auth/logout', '/api/auth/register',
  '/api/auth/google', '/api/auth/facebook',
  '/api/voice',
  '/demo',           // Mode guest — accès sans compte
  '/api/demo',
];

// Routes et le rôle minimum requis
const ROLE_RULES: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/admin/,            roles: ['ADMIN'] },
  { pattern: /^\/api\/admin/,       roles: ['ADMIN'] },
  { pattern: /^\/employer/,         roles: ['EMPLOYER', 'ADMIN'] },
  { pattern: /^\/api\/employer/,    roles: ['EMPLOYER', 'ADMIN'] },
  { pattern: /^\/formateur/,        roles: ['FORMATEUR', 'ADMIN'] },
  { pattern: /^\/api\/formateur/,   roles: ['FORMATEUR', 'ADMIN'] },
  { pattern: /^\/api\/user/,        roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  // — Dashboard & pages protégées CLIENT —
  { pattern: /^\/dashboard/,        roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/formations/,       roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/mes-formations/,   roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/parcours/,         roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/abonnement/,       roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/rendez-vous/,      roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/documents/,        roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/integration/,      roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/profil/,           roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/chatbot/,          roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/bibliotheque/,     roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/session-expert/,   roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  // — API CLIENT —
  { pattern: /^\/api\/integration/, roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/api\/auth\/me/,    roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/api\/my/,          roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
  { pattern: /^\/api\/profil/,      roles: ['USER', 'EMPLOYER', 'FORMATEUR', 'ADMIN'] },
];


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Laisser passer les assets + routes publiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return NextResponse.next();
  }

  // Vérifier la règle applicable
  const rule = ROLE_RULES.find(r => r.pattern.test(pathname));
  if (!rule) return NextResponse.next(); // route non protégée

  // Lire + vérifier le JWT
  const token = req.cookies.get('stratia_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/auth/login?from=${encodeURIComponent(pathname)}`, req.url));
  }

  const session = await verifyToken(token);
  if (!session) {
    const res = NextResponse.redirect(new URL('/auth/login', req.url));
    res.cookies.delete('stratia_token');
    return res;
  }

  // Vérifier le rôle
  if (!rule.roles.includes(session.role)) {
    // Rediriger vers le bon dashboard selon son rôle
    const home = session.role === 'ADMIN' ? '/admin'
      : session.role === 'EMPLOYER' ? '/employer'
        : session.role === 'FORMATEUR' ? '/formateur'
          : '/dashboard';
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Injecter l'info user dans les headers (lisible côté server components)
  const res = NextResponse.next();
  res.headers.set('x-user-id', session.userId);
  res.headers.set('x-user-role', session.role);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
