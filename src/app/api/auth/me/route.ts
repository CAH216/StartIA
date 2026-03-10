import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, fullName: true, companyName: true, role: true, plan: true, avatarUrl: true, isNewUser: true },
  });

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  // Réinitialiser isNewUser après la première lecture (one-shot)
  if (user.isNewUser) {
    await prisma.user.update({ where: { id: session.userId }, data: { isNewUser: false } });
  }

  return NextResponse.json(user);
}
