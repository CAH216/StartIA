/**
 * POST /api/employee/bookings/[id]/respond
 * Body: { action: "accept" | "refuse", notes?: string }
 *
 * - accept → status=ACCEPTED, employerId=moi
 * - refuse → status=REFUSED, employerId=moi
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYER')
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { id } = await params;
  const { action, notes } = await req.json() as { action: 'accept' | 'refuse'; notes?: string };

  if (action !== 'accept' && action !== 'refuse')
    return NextResponse.json({ error: 'action doit être "accept" ou "refuse"' }, { status: 400 });

  const booking = await prisma.expertBooking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });

  if (booking.status !== 'PENDING')
    return NextResponse.json({ error: 'Cette demande a déjà été traitée' }, { status: 409 });

  const updated = await prisma.expertBooking.update({
    where: { id },
    data: {
      status:     action === 'accept' ? 'ACCEPTED' : 'REFUSED',
      employerId: session.userId,
      notes:      notes ?? null,
    },
  });

  return NextResponse.json({ booking: updated });
}
