import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(certificates);
  } catch (e) {
    console.error('GET /api/my/certificates', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
