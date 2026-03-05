import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const { topic, description, slot } = await req.json();
    if (!topic || !slot) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const booking = await prisma.expertBooking.create({
      data: {
        userId: session.userId,
        topic,
        description: description ?? null,
        slot,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    const err = e as Error;
    console.error('[sessions/book POST]', err);
    return NextResponse.json({ error: 'Erreur serveur lors de la réservation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const bookings = await prisma.expertBooking.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { employer: { select: { fullName: true, companyName: true } } },
  });

  return NextResponse.json(bookings);
}
