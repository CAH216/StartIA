import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, COOKIE_NAME, TTL } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Mettre à jour lastActiveAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const role = user.role as string;
    const redirect = role === 'ADMIN' ? '/admin'
      : role === 'EMPLOYER' ? '/employer'
        : role === 'FORMATEUR' ? '/formateur'
          : '/dashboard';

    const res = NextResponse.json({
      ok: true,
      redirect,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      // Activer secure seulement si COOKIE_SECURE=true dans .env (HTTPS production)
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: TTL,
      path: '/',
    });

    return res;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
