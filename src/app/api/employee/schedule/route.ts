/**
 * GET  /api/employee/schedule  → récupère son propre planning
 * PUT  /api/employee/schedule  → sauvegarde son planning (tableau de {dayOfWeek, hour, active})
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYER')
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const rows = await prisma.employeeAvailability.findMany({
    where: { employeeId: session.userId, active: true },
    select: { dayOfWeek: true, hour: true },
  });

  return NextResponse.json({ schedule: rows });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYER')
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { slots } = await req.json() as { slots: { dayOfWeek: number; hour: number }[] };
  if (!Array.isArray(slots)) return NextResponse.json({ error: 'slots[] requis' }, { status: 400 });

  // Supprimer tout l'ancien planning et réinsérer
  await prisma.employeeAvailability.deleteMany({ where: { employeeId: session.userId } });

  if (slots.length > 0) {
    await prisma.employeeAvailability.createMany({
      data: slots.map(s => ({
        employeeId: session.userId,
        dayOfWeek: s.dayOfWeek,
        hour: s.hour,
        active: true,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ ok: true, saved: slots.length });
}
