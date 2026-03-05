import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYER')
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { id } = await params;
  const { status, notes } = await req.json();

  if (!['ACCEPTED', 'REFUSED'].includes(status))
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });

  const booking = await prisma.expertBooking.update({
    where: { id },
    data: {
      status,
      notes: notes ?? null,
      employerId: session.userId,
    },
  });

  return NextResponse.json(booking);
}
