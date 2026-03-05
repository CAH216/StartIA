import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** GET — latest diagnostic for the current user */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const diag = await prisma.diagnostic.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(diag ?? null);
}

/** POST — save a new diagnostic result */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { score, level, summary, data } = await req.json();
  if (typeof score !== 'number' || !level) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const diag = await prisma.diagnostic.create({
    data: {
      userId: session.userId,
      score,
      level,
      summary: summary ?? null,
      data: data ?? undefined,
    },
  });

  return NextResponse.json(diag, { status: 201 });
}
