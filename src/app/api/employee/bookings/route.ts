/**
 * GET /api/employee/bookings
 * Retourne toutes les demandes d'audit visibles par cet employé.
 *
 * Logique : un employé voit les demandes PENDING pour les créneaux
 * où il est disponible ET les demandes ACCEPTED/REFUSED qui lui sont assignées.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYER')
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  // 1. Récupérer les créneaux disponibles de cet employé
  const mySchedule = await prisma.employeeAvailability.findMany({
    where: { employeeId: session.userId, active: true },
    select: { dayOfWeek: true, hour: true },
  });

  // Jours de la semaine disponibles (0=Lundi...)
  const mySlotKeys = new Set(mySchedule.map(s => `${s.dayOfWeek}-${s.hour}`));

  // 2. Demandes PENDING dont le créneau correspond à la dispo de cet employé
  const pendingBookings = await prisma.expertBooking.findMany({
    where: {
      status: 'PENDING',
      bookedDate: { not: null },
      bookedHour: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true, companyName: true } },
    },
  });

  // Filtrer : garder seulement les demandes où l'employé est disponible ce jour+heure
  const myPending = pendingBookings.filter(b => {
    if (!b.bookedDate || b.bookedHour == null) return false;
    const dow = (new Date(b.bookedDate).getDay() + 6) % 7; // JS getDay: 0=Dim, normaliser 0=Lun
    return mySlotKeys.has(`${dow}-${b.bookedHour}`);
  });

  // 3. Demandes déjà assignées à cet employé (ACCEPTED ou REFUSED)
  const myAssigned = await prisma.expertBooking.findMany({
    where: { employerId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true, companyName: true } },
    },
  });

  // Dédupliquer (un booking ACCEPTED est dans les deux listes potentiellement)
  const assignedIds = new Set(myAssigned.map(b => b.id));
  const combined = [
    ...myAssigned,
    ...myPending.filter(b => !assignedIds.has(b.id)),
  ];

  return NextResponse.json({ bookings: combined });
}
