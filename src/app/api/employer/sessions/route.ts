import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYER')
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const bookings = await prisma.expertBooking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, fullName: true, email: true, companyName: true } },
    },
  });

  return NextResponse.json(bookings);
}
